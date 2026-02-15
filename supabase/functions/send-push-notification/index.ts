import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

// ---- Base64URL helpers ----
function base64UrlToUint8Array(b64url: string): Uint8Array {
  const b64 = b64url.replace(/-/g, '+').replace(/_/g, '/');
  const padding = '='.repeat((4 - b64.length % 4) % 4);
  const binary = atob(b64 + padding);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

function uint8ArrayToBase64Url(arr: Uint8Array): string {
  let binary = '';
  for (const byte of arr) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

function concat(...arrays: Uint8Array[]): Uint8Array {
  const len = arrays.reduce((acc, a) => acc + a.length, 0);
  const result = new Uint8Array(len);
  let offset = 0;
  for (const a of arrays) { result.set(a, offset); offset += a.length; }
  return result;
}

// ---- HKDF (RFC 5869) ----
async function hkdf(salt: Uint8Array, ikm: Uint8Array, info: Uint8Array, length: number): Promise<Uint8Array> {
  const key = await crypto.subtle.importKey('raw', ikm, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const prk = new Uint8Array(await crypto.subtle.sign('HMAC', 
    await crypto.subtle.importKey('raw', salt.length ? salt : new Uint8Array(32), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']),
    ikm
  ));
  const prkKey = await crypto.subtle.importKey('raw', prk, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const infoWithCounter = concat(info, new Uint8Array([1]));
  const okm = new Uint8Array(await crypto.subtle.sign('HMAC', prkKey, infoWithCounter));
  return okm.slice(0, length);
}

function createInfo(type: string, clientPublicKey: Uint8Array, serverPublicKey: Uint8Array): Uint8Array {
  const encoder = new TextEncoder();
  const typeBytes = encoder.encode(type);
  // "Content-Encoding: <type>\0" + "P-256\0" + len(recipient) + recipient + len(sender) + sender
  const header = encoder.encode('Content-Encoding: ');
  const zero = new Uint8Array([0]);
  const p256 = encoder.encode('P-256');
  const clientLen = new Uint8Array(2);
  clientLen[0] = 0; clientLen[1] = clientPublicKey.length;
  const serverLen = new Uint8Array(2);
  serverLen[0] = 0; serverLen[1] = serverPublicKey.length;
  return concat(header, typeBytes, zero, p256, zero, clientLen, clientPublicKey, serverLen, serverPublicKey);
}

// ---- Web Push Encryption (aes128gcm, RFC 8291) ----
async function encryptPayload(
  clientPublicKeyB64: string,
  clientAuthB64: string,
  payload: Uint8Array
): Promise<{ encrypted: Uint8Array; serverPublicKey: Uint8Array }> {
  const clientPublicKeyBytes = base64UrlToUint8Array(clientPublicKeyB64);
  const clientAuth = base64UrlToUint8Array(clientAuthB64);

  // Generate ephemeral ECDH key pair
  const serverKeys = await crypto.subtle.generateKey({ name: 'ECDH', namedCurve: 'P-256' }, true, ['deriveBits']);
  const serverPublicKey = new Uint8Array(await crypto.subtle.exportKey('raw', serverKeys.publicKey));

  // Import client public key
  const clientKey = await crypto.subtle.importKey('raw', clientPublicKeyBytes, { name: 'ECDH', namedCurve: 'P-256' }, false, []);

  // ECDH shared secret
  const sharedSecret = new Uint8Array(await crypto.subtle.deriveBits(
    { name: 'ECDH', public: clientKey }, serverKeys.privateKey, 256
  ));

  // Generate 16-byte salt
  const salt = crypto.getRandomValues(new Uint8Array(16));

  // IKM = HKDF(auth, sharedSecret, "WebPush: info" || 0x00 || clientPublic || serverPublic, 32)
  const encoder = new TextEncoder();
  const authInfo = concat(
    encoder.encode('WebPush: info\0'),
    clientPublicKeyBytes,
    serverPublicKey
  );
  const ikm = await hkdf(clientAuth, sharedSecret, authInfo, 32);

  // CEK = HKDF(salt, ikm, "Content-Encoding: aes128gcm" || 0x00, 16)
  const cekInfo = concat(encoder.encode('Content-Encoding: aes128gcm'), new Uint8Array([0]));
  const contentEncryptionKey = await hkdf(salt, ikm, cekInfo, 16);

  // Nonce = HKDF(salt, ikm, "Content-Encoding: nonce" || 0x00, 12)
  const nonceInfo = concat(encoder.encode('Content-Encoding: nonce'), new Uint8Array([0]));
  const nonce = await hkdf(salt, ikm, nonceInfo, 12);

  // Pad payload: add delimiter byte 0x02 (last record)
  const paddedPayload = concat(payload, new Uint8Array([2]));

  // AES-128-GCM encrypt
  const aesKey = await crypto.subtle.importKey('raw', contentEncryptionKey, { name: 'AES-GCM' }, false, ['encrypt']);
  const ciphertext = new Uint8Array(await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv: nonce },
    aesKey,
    paddedPayload
  ));

  // Build aes128gcm header: salt(16) + rs(4) + idlen(1) + keyid(65) + ciphertext
  const rs = new Uint8Array(4);
  const recordSize = 4096;
  rs[0] = (recordSize >> 24) & 0xff;
  rs[1] = (recordSize >> 16) & 0xff;
  rs[2] = (recordSize >> 8) & 0xff;
  rs[3] = recordSize & 0xff;
  const idlen = new Uint8Array([serverPublicKey.length]);

  const encrypted = concat(salt, rs, idlen, serverPublicKey, ciphertext);

  return { encrypted, serverPublicKey };
}

// ---- VAPID JWT ----
async function importVapidKeys() {
  const publicKeyB64 = Deno.env.get('VAPID_PUBLIC_KEY')!;
  const privateKeyB64 = Deno.env.get('VAPID_PRIVATE_KEY')!;
  const publicKeyRaw = base64UrlToUint8Array(publicKeyB64);

  const jwk = {
    kty: 'EC', crv: 'P-256',
    d: privateKeyB64,
    x: uint8ArrayToBase64Url(publicKeyRaw.slice(1, 33)),
    y: uint8ArrayToBase64Url(publicKeyRaw.slice(33, 65)),
  };

  const privateKey = await crypto.subtle.importKey('jwk', jwk, { name: 'ECDSA', namedCurve: 'P-256' }, false, ['sign']);
  return { publicKeyRaw, privateKey };
}

async function createVapidJWT(audience: string, subject: string, privateKey: CryptoKey): Promise<string> {
  const encoder = new TextEncoder();
  const header = uint8ArrayToBase64Url(encoder.encode(JSON.stringify({ typ: 'JWT', alg: 'ES256' })));
  const now = Math.floor(Date.now() / 1000);
  const payload = uint8ArrayToBase64Url(encoder.encode(JSON.stringify({ aud: audience, exp: now + 12 * 3600, sub: subject })));
  const unsigned = `${header}.${payload}`;

  const sig = new Uint8Array(await crypto.subtle.sign({ name: 'ECDSA', hash: 'SHA-256' }, privateKey, encoder.encode(unsigned)));
  
  // Ensure raw r||s (64 bytes)
  let rawSig: Uint8Array;
  if (sig.length === 64) {
    rawSig = sig;
  } else {
    // DER → raw
    let offset = 2;
    const rLen = sig[offset + 1]; offset += 2;
    const rBytes = sig.slice(offset, offset + rLen); offset += rLen;
    const sLen = sig[offset + 1]; offset += 2;
    const sBytes = sig.slice(offset, offset + sLen);
    rawSig = new Uint8Array(64);
    const r = rBytes.length > 32 ? rBytes.slice(rBytes.length - 32) : rBytes;
    const s = sBytes.length > 32 ? sBytes.slice(sBytes.length - 32) : sBytes;
    rawSig.set(r, 32 - r.length);
    rawSig.set(s, 64 - s.length);
  }

  return `${unsigned}.${uint8ArrayToBase64Url(rawSig)}`;
}

// ---- Main handler ----
Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { user_id, title, body, data } = await req.json();

    if (!user_id || !title) {
      return new Response(JSON.stringify({ error: 'user_id and title are required' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseAdmin = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);

    const { data: subscriptions, error } = await supabaseAdmin
      .from('push_subscriptions')
      .select('*')
      .eq('user_id', user_id);

    if (error) throw error;
    if (!subscriptions?.length) {
      return new Response(JSON.stringify({ message: 'No subscriptions', sent: 0 }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const vapidSubject = Deno.env.get('VAPID_SUBJECT') || 'mailto:comandaapp1@gmail.com';
    const { publicKeyRaw, privateKey } = await importVapidKeys();
    const vapidKeyB64 = uint8ArrayToBase64Url(publicKeyRaw);
    console.log('VAPID public key being used:', vapidKeyB64);
    console.log('VAPID public key length:', publicKeyRaw.length);
    const payloadText = JSON.stringify({ title, body, data });
    const payloadBytes = new TextEncoder().encode(payloadText);

    let sent = 0;
    const errors: string[] = [];

    for (const sub of subscriptions) {
      try {
        // Encrypt payload
        const { encrypted } = await encryptPayload(sub.p256dh, sub.auth, payloadBytes);

        // VAPID auth
        const url = new URL(sub.endpoint);
        const audience = `${url.protocol}//${url.hostname}`;
        const jwt = await createVapidJWT(audience, vapidSubject, privateKey);
        const vapidKeyB64 = uint8ArrayToBase64Url(publicKeyRaw);

        const response = await fetch(sub.endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/octet-stream',
            'Content-Encoding': 'aes128gcm',
            'TTL': '86400',
            'Authorization': `vapid t=${jwt}, k=${vapidKeyB64}`,
          },
          body: encrypted,
        });

        if (response.status === 201 || response.status === 200) {
          sent++;
        } else if (response.status === 404 || response.status === 410) {
          await supabaseAdmin.from('push_subscriptions').delete().eq('id', sub.id);
          errors.push(`Removed expired subscription ${sub.id}`);
        } else {
          const text = await response.text();
          errors.push(`${sub.id}: ${response.status} ${text}`);
          console.error(`Push failed for ${sub.id}: ${response.status} ${text}`);
        }
      } catch (e) {
        errors.push(`${sub.id}: ${e.message}`);
        console.error(`Push error for ${sub.id}:`, e);
      }
    }

    return new Response(JSON.stringify({ sent, total: subscriptions.length, errors }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Push notification error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
