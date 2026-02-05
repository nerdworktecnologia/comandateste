import { useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useNotificationSound } from '@/hooks/useNotificationSound';
import { Database } from '@/integrations/supabase/types';

type Order = Database['public']['Tables']['orders']['Row'];

interface UseOrderNotificationsOptions {
  storeId?: string;
  enabled?: boolean;
}

export function useOrderNotifications({ storeId, enabled = true }: UseOrderNotificationsOptions) {
  const { toast } = useToast();
  const { playSound } = useNotificationSound();

  const handleNewOrder = useCallback((newOrder: Order) => {
    console.log('New order received:', newOrder);

    // Play notification sound
    playSound();

    // Show toast notification
    toast({
      title: '🔔 Novo Pedido!',
      description: `Pedido #${newOrder.order_number} recebido - ${formatCurrency(newOrder.total)}`,
      duration: 10000,
    });
  }, [playSound, toast]);

  const handleOrderUpdate = useCallback((updatedOrder: Order, oldOrder: Partial<Order>) => {
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
  }, [toast]);

  useEffect(() => {
    if (!enabled || !storeId) return;

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
          handleNewOrder(payload.new as Order);
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
          handleOrderUpdate(payload.new as Order, payload.old as Partial<Order>);
        }
      )
      .subscribe((status) => {
        console.log('Order notifications subscription status:', status);
      });

    return () => {
      console.log('Unsubscribing from order notifications');
      supabase.removeChannel(channel);
    };
  }, [storeId, enabled, handleNewOrder, handleOrderUpdate]);
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}
