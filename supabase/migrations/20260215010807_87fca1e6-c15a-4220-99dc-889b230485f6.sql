
-- Create a function that will be called by a trigger when order status changes
-- It will use pg_net to call the send-push-notification edge function
CREATE OR REPLACE FUNCTION public.notify_order_status_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  _title text;
  _body text;
  _customer_id uuid;
  _order_number text;
BEGIN
  -- Only fire on status changes
  IF OLD.status = NEW.status THEN
    RETURN NEW;
  END IF;

  _customer_id := NEW.customer_id;
  _order_number := NEW.order_number;

  -- Build notification message based on new status
  CASE NEW.status
    WHEN 'confirmed' THEN
      _title := 'Pedido Confirmado! ✅';
      _body := 'Seu pedido #' || _order_number || ' foi aceito pela loja.';
    WHEN 'preparing' THEN
      _title := 'Preparando seu pedido 👨‍🍳';
      _body := 'Seu pedido #' || _order_number || ' está sendo preparado.';
    WHEN 'ready' THEN
      _title := 'Pedido Pronto! 📦';
      _body := 'Seu pedido #' || _order_number || ' está pronto e aguardando retirada.';
    WHEN 'picked_up' THEN
      _title := 'Saiu para entrega! 🚗';
      _body := 'Seu pedido #' || _order_number || ' saiu para entrega.';
    WHEN 'delivering' THEN
      _title := 'Em rota de entrega! 🛵';
      _body := 'Seu pedido #' || _order_number || ' está a caminho.';
    WHEN 'delivered' THEN
      _title := 'Pedido Entregue! 🎉';
      _body := 'Seu pedido #' || _order_number || ' foi entregue. Bom apetite!';
    WHEN 'cancelled' THEN
      _title := 'Pedido Cancelado ❌';
      _body := 'Seu pedido #' || _order_number || ' foi cancelado.';
    ELSE
      RETURN NEW;
  END CASE;

  -- Call the edge function via pg_net
  PERFORM net.http_post(
    url := current_setting('app.settings.supabase_url', true) || '/functions/v1/send-push-notification',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key', true)
    ),
    body := jsonb_build_object(
      'user_id', _customer_id::text,
      'title', _title,
      'body', _body,
      'data', jsonb_build_object('order_id', NEW.id::text, 'status', NEW.status)
    )
  );

  RETURN NEW;
END;
$$;

-- Create the trigger
DROP TRIGGER IF EXISTS on_order_status_change ON public.orders;
CREATE TRIGGER on_order_status_change
  AFTER UPDATE ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_order_status_change();
