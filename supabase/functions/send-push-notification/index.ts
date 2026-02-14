import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

function base64UrlToUint8Array(base64Url: string): Uint8Array {
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  const padding = '='.repeat((4 - base64.length % 4) % 4);
  const binary = atob(base64 + padding);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

function uint8ArrayToBase64Url(arr: Uint8Array): string {
  let binary = '';
  for (const byte of arr) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

async function importVapidKeys() {
  const publicKeyBase64Url = Deno.env.get('VAPID_PUBLIC_KEY')!;
  const privateKeyBase64Url = Deno.env.get('VAPID_PRIVATE_KEY')!;

  const publicKeyRaw = base64UrlToUint8Array(publicKeyBase64Url);
  
  // Import private key from raw d value (32 bytes)
  const privateKeyBytes = base64UrlToUint8Array(privateKeyBase64Url);
  
  const jwk = {
    kty: 'EC',
    crv: 'P-256',
    d: privateKeyBase64Url,
    x: uint8ArrayToBase64Url(publicKeyRaw.slice(1, 33)),
    y: uint8ArrayToBase64Url(publicKeyRaw.slice(33, 65)),
  };

  const privateKey = await crypto.subtle.importKey(
    'jwk', jwk, { name: 'ECDSA', namedCurve: 'P-256' }, false, ['sign']
  );

  return { publicKeyRaw, privateKey };
}

async function createJWT(audience: string, subject: string, privateKey: CryptoKey): Promise<string> {
  const header = { typ: 'JWT', alg: 'ES256' };
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    aud: audience,
    exp: now + 12 * 3600,
    sub: subject,
  };

  const encoder = new TextEncoder();
  const headerB64 = uint8ArrayToBase64Url(encoder.encode(JSON.stringify(header)));
  const payloadB64 = uint8ArrayToBase64Url(encoder.encode(JSON.stringify(payload)));
  const unsignedToken = `${headerB64}.${payloadB64}`;

  const signature = await crypto.subtle.sign(
    { name: 'ECDSA', hash: 'SHA-256' },
    privateKey,
    encoder.encode(unsignedToken)
  );

  // Convert DER signature to raw r||s format
  const sigArray = new Uint8Array(signature);
  let r: Uint8Array, s: Uint8Array;
  
  if (sigArray.length === 64) {
    r = sigArray.slice(0, 32);
    s = sigArray.slice(32, 64);
  } else {
    // DER format
    let offset = 2;
    const rLen = sigArray[offset + 1];
    offset += 2;
    const rBytes = sigArray.slice(offset, offset + rLen);
    r = rBytes.length > 32 ? rBytes.slice(rBytes.length - 32) : rBytes;
    offset += rLen;
    const sLen = sigArray[offset + 1];
    offset += 2;
    const sBytes = sigArray.slice(offset, offset + sLen);
    s = sBytes.length > 32 ? sBytes.slice(sBytes.length - 32) : sBytes;
  }

  const rawSig = new Uint8Array(64);
  rawSig.set(r.length < 32 ? new Uint8Array([...new Array(32 - r.length).fill(0), ...r]) : r, 0);
  rawSig.set(s.length < 32 ? new Uint8Array([...new Array(32 - s.length).fill(0), ...s]) : s, 32);

  const sigB64 = uint8ArrayToBase64Url(rawSig);
  return `${unsignedToken}.${sigB64}`;
}

async function sendPushToSubscription(
  subscription: { endpoint: string; p256dh: string; auth: string },
  payload: string,
  vapidPrivateKey: CryptoKey,
  vapidPublicKeyRaw: Uint8Array,
  vapidSubject: string
) {
  const url = new URL(subscription.endpoint);
  const audience = `${url.protocol}//${url.hostname}`;

  const jwt = await createJWT(audience, vapidSubject, vapidPrivateKey);
  const vapidPublicKeyB64 = uint8ArrayToBase64Url(vapidPublicKeyRaw);

  const response = await fetch(subscription.endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/octet-stream',
      'TTL': '86400',
      'Authorization': `vapid t=${jwt}, k=${vapidPublicKeyB64}`,
    },
    body: new TextEncoder().encode(payload),
  });

  return response;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { user_id, title, body, data } = await req.json();

    if (!user_id || !title) {
      return new Response(
        JSON.stringify({ error: 'user_id and title are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Get all subscriptions for the user
    const { data: subscriptions, error } = await supabaseAdmin
      .from('push_subscriptions')
      .select('*')
      .eq('user_id', user_id);

    if (error) throw error;

    if (!subscriptions || subscriptions.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No subscriptions found for user', sent: 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const vapidSubject = Deno.env.get('VAPID_SUBJECT') || 'mailto:comandaapp1@gmail.com';
    const { publicKeyRaw, privateKey } = await importVapidKeys();

    const payload = JSON.stringify({ title, body, data });
    let sent = 0;
    const errors: string[] = [];

    for (const sub of subscriptions) {
      try {
        const response = await sendPushToSubscription(
          { endpoint: sub.endpoint, p256dh: sub.p256dh, auth: sub.auth },
          payload,
          privateKey,
          publicKeyRaw,
          vapidSubject
        );

        if (response.status === 201 || response.status === 200) {
          sent++;
        } else if (response.status === 404 || response.status === 410) {
          // Subscription expired, remove it
          await supabaseAdmin.from('push_subscriptions').delete().eq('id', sub.id);
          errors.push(`Removed expired subscription ${sub.id}`);
        } else {
          const text = await response.text();
          errors.push(`Failed to send to ${sub.id}: ${response.status} ${text}`);
        }
      } catch (e) {
        errors.push(`Error sending to ${sub.id}: ${e.message}`);
      }
    }

    return new Response(
      JSON.stringify({ sent, total: subscriptions.length, errors }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Push notification error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
