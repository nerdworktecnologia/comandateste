import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './AuthContext';
import { toast } from 'sonner';
import type { Product, CartItem } from '@/types';

interface CartContextType {
  items: (CartItem & { product: Product })[];
  loading: boolean;
  addItem: (product: Product, quantity?: number) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  totalItems: number;
  subtotal: number;
  currentStoreId: string | null;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [items, setItems] = useState<(CartItem & { product: Product })[]>([]);
  const [loading, setLoading] = useState(false);
  const [cartId, setCartId] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchCart();
    } else {
      setItems([]);
      setCartId(null);
    }
  }, [user]);

  const fetchCart = async () => {
    if (!user) return;

    setLoading(true);

    // Get or create cart
    let { data: cart } = await supabase
      .from('carts')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle();

    if (!cart) {
      const { data: newCart, error } = await supabase
        .from('carts')
        .insert({ user_id: user.id })
        .select('id')
        .single();

      if (error) {
        console.error('Error creating cart:', error);
        setLoading(false);
        return;
      }
      cart = newCart;
    }

    setCartId(cart.id);

    // Fetch cart items with products
    const { data: cartItems, error: itemsError } = await supabase
      .from('cart_items')
      .select(`
        *,
        product:products(*)
      `)
      .eq('cart_id', cart.id);

    if (itemsError) {
      console.error('Error fetching cart items:', itemsError);
    } else {
      setItems((cartItems || []).filter(item => item.product) as (CartItem & { product: Product })[]);
    }

    setLoading(false);
  };

  const addItem = async (product: Product, quantity = 1) => {
    if (!user) {
      toast.error('Faça login para adicionar ao carrinho');
      return;
    }

    if (!cartId) {
      await fetchCart();
      return;
    }

    // Check if adding from different store
    if (items.length > 0 && items[0].product.store_id !== product.store_id) {
      toast.error('Você só pode adicionar produtos de uma loja por vez. Limpe o carrinho primeiro.');
      return;
    }

    // Check stock availability
    if (product.stock_quantity !== null && product.stock_quantity !== undefined) {
      const existingItem = items.find(item => item.product_id === product.id);
      const currentQty = existingItem ? existingItem.quantity : 0;
      const requestedTotal = currentQty + quantity;

      if (requestedTotal > product.stock_quantity) {
        if (product.stock_quantity === 0) {
          toast.error('Produto sem estoque');
        } else {
          toast.error(`Estoque disponível: ${product.stock_quantity} unidade(s). Você já tem ${currentQty} no carrinho.`);
        }
        return;
      }
    }

    // Check if item already exists
    const existingItem = items.find(item => item.product_id === product.id);

    if (existingItem) {
      await updateQuantity(existingItem.id, existingItem.quantity + quantity);
      return;
    }

    const { data, error } = await supabase
      .from('cart_items')
      .insert({
        cart_id: cartId,
        product_id: product.id,
        quantity
      })
      .select(`
        *,
        product:products(*)
      `)
      .single();

    if (error) {
      console.error('Error adding item:', error);
      toast.error('Erro ao adicionar ao carrinho');
      return;
    }

    setItems([...items, data as CartItem & { product: Product }]);
    toast.success('Adicionado ao carrinho');
  };

  const updateQuantity = async (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      await removeItem(itemId);
      return;
    }

    // Stock validation on quantity update
    const item = items.find(i => i.id === itemId);
    if (item && item.product.stock_quantity !== null && item.product.stock_quantity !== undefined) {
      if (quantity > item.product.stock_quantity) {
        toast.error(`Estoque máximo: ${item.product.stock_quantity} unidade(s)`);
        return;
      }
    }

    const { error } = await supabase
      .from('cart_items')
      .update({ quantity })
      .eq('id', itemId);

    if (error) {
      console.error('Error updating quantity:', error);
      toast.error('Erro ao atualizar quantidade');
      return;
    }

    setItems(items.map(item => 
      item.id === itemId ? { ...item, quantity } : item
    ));
  };

  const removeItem = async (itemId: string) => {
    const { error } = await supabase
      .from('cart_items')
      .delete()
      .eq('id', itemId);

    if (error) {
      console.error('Error removing item:', error);
      toast.error('Erro ao remover item');
      return;
    }

    setItems(items.filter(item => item.id !== itemId));
    toast.success('Item removido');
  };

  const clearCart = async () => {
    if (!cartId) return;

    const { error } = await supabase
      .from('cart_items')
      .delete()
      .eq('cart_id', cartId);

    if (error) {
      console.error('Error clearing cart:', error);
      toast.error('Erro ao limpar carrinho');
      return;
    }

    setItems([]);
  };

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  const currentStoreId = items.length > 0 ? items[0].product.store_id : null;

  return (
    <CartContext.Provider value={{
      items,
      loading,
      addItem,
      updateQuantity,
      removeItem,
      clearCart,
      totalItems,
      subtotal,
      currentStoreId
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
