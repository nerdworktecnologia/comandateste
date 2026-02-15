import { useState, useEffect, useCallback } from 'react';
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

export function useNotificationToggle() {
  const { user } = useAuth();
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    setIsSupported('serviceWorker' in navigator && 'PushManager' in window);
  }, []);

  // Check current subscription status
  useEffect(() => {
    if (!user || !isSupported) return;

    const checkSubscription = async () => {
      try {
        const registration = await navigator.serviceWorker.getRegistration('/sw.js');
        if (registration) {
          const sub = await (registration as any).pushManager.getSubscription();
          setIsSubscribed(!!sub);
        }
      } catch {
        setIsSubscribed(false);
      }
    };

    checkSubscription();
  }, [user, isSupported]);

  const subscribe = useCallback(async () => {
    if (!user || isLoading) return;
    setIsLoading(true);
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      await navigator.serviceWorker.ready;

      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        setIsLoading(false);
        return;
      }

      const subscription = await (registration as any).pushManager.subscribe({
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

      setIsSubscribed(true);
    } catch (err) {
      console.error('Failed to subscribe:', err);
    } finally {
      setIsLoading(false);
    }
  }, [user, isLoading]);

  const unsubscribe = useCallback(async () => {
    if (!user || isLoading) return;
    setIsLoading(true);
    try {
      const registration = await navigator.serviceWorker.getRegistration('/sw.js');
      if (registration) {
        const sub = await (registration as any).pushManager.getSubscription();
        if (sub) {
          await sub.unsubscribe();
          await (supabase as any).from('push_subscriptions').delete().eq('endpoint', sub.endpoint);
        }
      }
      setIsSubscribed(false);
    } catch (err) {
      console.error('Failed to unsubscribe:', err);
    } finally {
      setIsLoading(false);
    }
  }, [user, isLoading]);

  const toggle = useCallback(() => {
    if (isSubscribed) {
      unsubscribe();
    } else {
      subscribe();
    }
  }, [isSubscribed, subscribe, unsubscribe]);

  return { isSubscribed, isLoading, isSupported, toggle };
}
