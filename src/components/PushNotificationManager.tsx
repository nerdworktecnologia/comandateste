import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

const VAPID_PUBLIC_KEY = 'BInxD3LVo8gnsqbL3ORr-gJEUeAUvM47KDp2M5H1DWZQo_ggaivCn_ajJ5B0AbaPFpCU4SUNsf4gazyhxbpLwUc';

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

/**
 * Auto-subscribes user to push notifications when they log in.
 * Should be rendered once at the app level.
 */
export function PushNotificationManager() {
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) return;
    if (Notification.permission === 'denied') return;

    // Only auto-prompt if not already subscribed
    const autoSubscribe = async () => {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js');
        await navigator.serviceWorker.ready;

        const existing = await (registration as any).pushManager.getSubscription();
        if (existing) return; // Already subscribed

        // Ask for permission
        const permission = await Notification.requestPermission();
        if (permission !== 'granted') return;

        const subscription = await (registration as any).pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
        });

        const json = subscription.toJSON();

        const { supabase } = await import('@/integrations/supabase/client');
        await (supabase as any).from('push_subscriptions').upsert(
          {
            user_id: user.id,
            endpoint: json.endpoint,
            p256dh: json.keys.p256dh,
            auth: json.keys.auth,
          },
          { onConflict: 'endpoint' }
        );

        console.log('Auto-subscribed to push notifications');
      } catch (err) {
        console.log('Push auto-subscribe skipped:', err);
      }
    };

    // Delay to not block initial render
    const timer = setTimeout(autoSubscribe, 3000);
    return () => clearTimeout(timer);
  }, [user]);

  return null;
}
