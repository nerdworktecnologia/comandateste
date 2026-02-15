import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

const VAPID_PUBLIC_KEY = 'BGo41YgZmAeul8DB79wHHHeCVo5fe_rwNsyLGE1kkF-AhOS810IFjt6IYITQpbYS7rgw_olOxMDs8kAyUCkv0mY';

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

    const autoSubscribe = async () => {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js');
        await navigator.serviceWorker.ready;

        let subscription = await (registration as any).pushManager.getSubscription();

        // If there's an existing subscription, unsubscribe and re-subscribe
        // to ensure it uses the current VAPID key
        if (subscription) {
          // Check if already saved in DB
          const json = subscription.toJSON();
          const { data: existing } = await (supabase as any)
            .from('push_subscriptions')
            .select('id')
            .eq('endpoint', json.endpoint)
            .eq('user_id', user.id)
            .maybeSingle();

          if (existing) {
            console.log('Push subscription already synced');
            return;
          }

          // Subscription exists in browser but not in DB — re-register
          await subscription.unsubscribe();
          subscription = null;
        }

        // Ask for permission if not already granted
        if (Notification.permission === 'default') {
          const permission = await Notification.requestPermission();
          if (permission !== 'granted') return;
        }

        // Subscribe with current VAPID key
        subscription = await (registration as any).pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
        });

        const json = subscription.toJSON();

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

    const timer = setTimeout(autoSubscribe, 2000);
    return () => clearTimeout(timer);
  }, [user]);

  return null;
}
