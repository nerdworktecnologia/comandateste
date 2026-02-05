import { useState } from 'react';
import { Tag, X, Loader2, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { Coupon } from '@/types';

interface CouponInputProps {
  storeId: string;
  subtotal: number;
  appliedCoupon: Coupon | null;
  onApply: (coupon: Coupon, discount: number) => void;
  onRemove: () => void;
}

export function CouponInput({ storeId, subtotal, appliedCoupon, onApply, onRemove }: CouponInputProps) {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);

  const validateCoupon = async () => {
    if (!code.trim()) {
      toast.error('Digite o código do cupom');
      return;
    }

    setLoading(true);

    try {
      const { data: coupon, error } = await supabase
        .from('coupons')
        .select('*')
        .eq('store_id', storeId)
        .eq('code', code.toUpperCase().trim())
        .eq('is_active', true)
        .maybeSingle();

      if (error) throw error;

      if (!coupon) {
        toast.error('Cupom inválido ou expirado');
        setLoading(false);
        return;
      }

      // Check if coupon is valid
      const now = new Date();
      const validFrom = new Date(coupon.valid_from);
      const validUntil = coupon.valid_until ? new Date(coupon.valid_until) : null;

      if (now < validFrom) {
        toast.error('Este cupom ainda não está válido');
        setLoading(false);
        return;
      }

      if (validUntil && now > validUntil) {
        toast.error('Este cupom expirou');
        setLoading(false);
        return;
      }

      // Check usage limit
      if (coupon.usage_limit && coupon.usage_count >= coupon.usage_limit) {
        toast.error('Este cupom atingiu o limite de uso');
        setLoading(false);
        return;
      }

      // Check minimum order value
      if (coupon.min_order_value && subtotal < coupon.min_order_value) {
        toast.error(`Pedido mínimo de R$ ${coupon.min_order_value.toFixed(2)} para usar este cupom`);
        setLoading(false);
        return;
      }

      // Calculate discount
      let discount = 0;
      if (coupon.discount_type === 'percentage') {
        discount = subtotal * (coupon.discount_value / 100);
        if (coupon.max_discount && discount > coupon.max_discount) {
          discount = coupon.max_discount;
        }
      } else {
        discount = coupon.discount_value;
      }

      // Ensure discount doesn't exceed subtotal
      discount = Math.min(discount, subtotal);

      onApply(coupon as Coupon, discount);
      toast.success('Cupom aplicado com sucesso!');
      setCode('');
    } catch (err) {
      console.error('Error validating coupon:', err);
      toast.error('Erro ao validar cupom');
    } finally {
      setLoading(false);
    }
  };

  if (appliedCoupon) {
    return (
      <div className="flex items-center justify-between p-3 bg-accent/10 rounded-lg border border-accent">
        <div className="flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-accent" />
          <div>
            <p className="font-medium text-sm">{appliedCoupon.code}</p>
            <p className="text-xs text-muted-foreground">
              {appliedCoupon.discount_type === 'percentage'
                ? `${appliedCoupon.discount_value}% de desconto`
                : `R$ ${appliedCoupon.discount_value.toFixed(2)} de desconto`}
            </p>
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={onRemove}>
          <X className="w-4 h-4" />
        </Button>
      </div>
    );
  }

  return (
    <div className="flex gap-2">
      <div className="relative flex-1">
        <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Código do cupom"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          className="pl-10"
          onKeyDown={(e) => e.key === 'Enter' && validateCoupon()}
        />
      </div>
      <Button 
        variant="outline" 
        onClick={validateCoupon}
        disabled={loading || !code.trim()}
      >
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Aplicar'}
      </Button>
    </div>
  );
}
