-- Create coupons table
CREATE TABLE public.coupons (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  description TEXT,
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value NUMERIC NOT NULL CHECK (discount_value > 0),
  min_order_value NUMERIC DEFAULT 0,
  max_discount NUMERIC,
  usage_limit INTEGER,
  usage_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  valid_from TIMESTAMP WITH TIME ZONE DEFAULT now(),
  valid_until TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(store_id, code)
);

-- Enable RLS
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;

-- Anyone can view active coupons from approved stores (for validation)
CREATE POLICY "Anyone can view active coupons"
  ON public.coupons
  FOR SELECT
  USING (
    is_active = true 
    AND (valid_until IS NULL OR valid_until > now())
    AND is_store_approved(store_id)
  );

-- Store staff can manage their coupons
CREATE POLICY "Store staff can manage coupons"
  ON public.coupons
  FOR ALL
  USING (is_store_staff(auth.uid(), store_id) OR is_admin(auth.uid()));

-- Create updated_at trigger
CREATE TRIGGER update_coupons_updated_at
  BEFORE UPDATE ON public.coupons
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Add coupon_id to orders table
ALTER TABLE public.orders 
  ADD COLUMN coupon_id UUID REFERENCES public.coupons(id),
  ADD COLUMN coupon_code TEXT,
  ADD COLUMN coupon_discount NUMERIC DEFAULT 0;