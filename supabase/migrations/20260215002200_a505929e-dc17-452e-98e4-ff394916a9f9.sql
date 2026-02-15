
-- Fix function search path for is_near_expiry
CREATE OR REPLACE FUNCTION public.is_near_expiry(_expiry_date date)
 RETURNS boolean
 LANGUAGE sql
 IMMUTABLE
 SET search_path = public
AS $$
  SELECT _expiry_date IS NOT NULL AND _expiry_date <= CURRENT_DATE + INTERVAL '7 days'
$$;

-- Fix function search path for generate_order_number
CREATE OR REPLACE FUNCTION public.generate_order_number()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path = 'public'
AS $function$
BEGIN
  NEW.order_number = 'CMD' || TO_CHAR(now(), 'YYYYMMDD') || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
  RETURN NEW;
END;
$function$;
