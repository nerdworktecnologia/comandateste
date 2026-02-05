import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Database } from '@/integrations/supabase/types';

type Order = Database['public']['Tables']['orders']['Row'];

interface UseOrderNotificationsOptions {
  storeId?: string;
  enabled?: boolean;
}

export function useOrderNotifications({ storeId, enabled = true }: UseOrderNotificationsOptions) {
  const { toast } = useToast();
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (!enabled || !storeId) return;

    // Create audio element for notification sound
    audioRef.current = new Audio('/notification.mp3');
    audioRef.current.volume = 0.5;

    const channel = supabase
      .channel(`orders-${storeId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'orders',
          filter: `store_id=eq.${storeId}`,
        },
        (payload) => {
          const newOrder = payload.new as Order;
          console.log('New order received:', newOrder);

          // Play notification sound
          audioRef.current?.play().catch(err => {
            console.log('Could not play notification sound:', err);
          });

          // Show toast notification
          toast({
            title: '🔔 Novo Pedido!',
            description: `Pedido #${newOrder.order_number} recebido - ${formatCurrency(newOrder.total)}`,
            duration: 10000,
          });
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'orders',
          filter: `store_id=eq.${storeId}`,
        },
        (payload) => {
          const updatedOrder = payload.new as Order;
          const oldOrder = payload.old as Partial<Order>;
          
          // Only notify on status changes
          if (oldOrder.status !== updatedOrder.status) {
            console.log('Order status updated:', updatedOrder.order_number, updatedOrder.status);
            
            if (updatedOrder.status === 'cancelled') {
              toast({
                title: '❌ Pedido Cancelado',
                description: `Pedido #${updatedOrder.order_number} foi cancelado`,
                variant: 'destructive',
                duration: 8000,
              });
            }
          }
        }
      )
      .subscribe((status) => {
        console.log('Order notifications subscription status:', status);
      });

    return () => {
      console.log('Unsubscribing from order notifications');
      supabase.removeChannel(channel);
    };
  }, [storeId, enabled, toast]);
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}
