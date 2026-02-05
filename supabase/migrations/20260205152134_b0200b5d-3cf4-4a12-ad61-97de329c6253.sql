-- Enum para roles de usuário
CREATE TYPE public.app_role AS ENUM ('customer', 'company_owner', 'company_staff', 'delivery_driver', 'admin');

-- Enum para status da empresa
CREATE TYPE public.company_status AS ENUM ('pending', 'approved', 'rejected', 'suspended');

-- Enum para status do pedido
CREATE TYPE public.order_status AS ENUM ('pending', 'confirmed', 'preparing', 'ready', 'picked_up', 'delivering', 'delivered', 'cancelled');

-- Enum para tipo de categoria
CREATE TYPE public.category_type AS ENUM ('supermarket', 'pharmacy', 'cosmetics', 'drinks', 'petshop', 'restaurant', 'other');

-- Tabela de roles do usuário (separada do profiles para segurança)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL DEFAULT 'customer',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

-- Tabela de perfis
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  full_name TEXT,
  cpf TEXT UNIQUE,
  phone TEXT,
  avatar_url TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  zip_code TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Categorias de lojas/produtos
CREATE TABLE public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  icon TEXT,
  category_type category_type NOT NULL DEFAULT 'other',
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Lojas/Empresas
CREATE TABLE public.stores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  logo_url TEXT,
  banner_url TEXT,
  phone TEXT,
  email TEXT,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  zip_code TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  category_id UUID REFERENCES public.categories(id),
  status company_status NOT NULL DEFAULT 'pending',
  is_featured BOOLEAN NOT NULL DEFAULT false,
  is_open BOOLEAN NOT NULL DEFAULT true,
  opening_hours JSONB,
  delivery_fee DECIMAL(10, 2) DEFAULT 0,
  min_order_value DECIMAL(10, 2) DEFAULT 0,
  avg_delivery_time INTEGER DEFAULT 30,
  rating DECIMAL(3, 2) DEFAULT 0,
  total_reviews INTEGER DEFAULT 0,
  contract_accepted BOOLEAN DEFAULT false,
  contract_accepted_at TIMESTAMP WITH TIME ZONE,
  approved_by UUID REFERENCES auth.users(id),
  approved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Funcionários da loja
CREATE TABLE public.store_staff (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID REFERENCES public.stores(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role TEXT DEFAULT 'staff',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (store_id, user_id)
);

-- Produtos (sem coluna gerada - usaremos função SQL)
CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID REFERENCES public.stores(id) ON DELETE CASCADE NOT NULL,
  category_id UUID REFERENCES public.categories(id),
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  original_price DECIMAL(10, 2),
  discount_percent INTEGER DEFAULT 0,
  image_url TEXT,
  sku TEXT,
  stock_quantity INTEGER DEFAULT 0,
  is_available BOOLEAN NOT NULL DEFAULT true,
  expiry_date DATE,
  requires_prescription BOOLEAN DEFAULT false,
  pharmaceutical_warning TEXT,
  sales_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Carrinho
CREATE TABLE public.carts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Itens do carrinho
CREATE TABLE public.cart_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cart_id UUID REFERENCES public.carts(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (cart_id, product_id)
);

-- Pedidos
CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number TEXT NOT NULL UNIQUE,
  customer_id UUID REFERENCES auth.users(id) ON DELETE SET NULL NOT NULL,
  store_id UUID REFERENCES public.stores(id) ON DELETE SET NULL NOT NULL,
  driver_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  status order_status NOT NULL DEFAULT 'pending',
  subtotal DECIMAL(10, 2) NOT NULL,
  delivery_fee DECIMAL(10, 2) DEFAULT 0,
  discount DECIMAL(10, 2) DEFAULT 0,
  total DECIMAL(10, 2) NOT NULL,
  delivery_address TEXT NOT NULL,
  delivery_city TEXT NOT NULL,
  delivery_state TEXT NOT NULL,
  delivery_zip TEXT,
  delivery_notes TEXT,
  payment_method TEXT,
  payment_status TEXT DEFAULT 'pending',
  estimated_delivery_time TIMESTAMP WITH TIME ZONE,
  confirmed_at TIMESTAMP WITH TIME ZONE,
  preparing_at TIMESTAMP WITH TIME ZONE,
  ready_at TIMESTAMP WITH TIME ZONE,
  picked_up_at TIMESTAMP WITH TIME ZONE,
  delivered_at TIMESTAMP WITH TIME ZONE,
  cancelled_at TIMESTAMP WITH TIME ZONE,
  cancellation_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Itens do pedido
CREATE TABLE public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL,
  product_image TEXT,
  quantity INTEGER NOT NULL,
  unit_price DECIMAL(10, 2) NOT NULL,
  total_price DECIMAL(10, 2) NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Avaliações
CREATE TABLE public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL UNIQUE,
  customer_id UUID REFERENCES auth.users(id) ON DELETE SET NULL NOT NULL,
  store_id UUID REFERENCES public.stores(id) ON DELETE CASCADE NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  store_reply TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Entregadores
CREATE TABLE public.delivery_drivers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  vehicle_type TEXT,
  license_plate TEXT,
  is_available BOOLEAN DEFAULT true,
  is_active BOOLEAN DEFAULT true,
  current_latitude DECIMAL(10, 8),
  current_longitude DECIMAL(11, 8),
  total_deliveries INTEGER DEFAULT 0,
  rating DECIMAL(3, 2) DEFAULT 5.0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- ============================================
-- FUNÇÕES HELPER PARA RLS (SECURITY DEFINER)
-- ============================================

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

CREATE OR REPLACE FUNCTION public.is_admin(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.has_role(_user_id, 'admin')
$$;

CREATE OR REPLACE FUNCTION public.is_store_owner(_user_id UUID, _store_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.stores
    WHERE id = _store_id AND owner_id = _user_id
  )
$$;

CREATE OR REPLACE FUNCTION public.is_store_staff(_user_id UUID, _store_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.store_staff
    WHERE store_id = _store_id AND user_id = _user_id AND is_active = true
  ) OR public.is_store_owner(_user_id, _store_id)
$$;

CREATE OR REPLACE FUNCTION public.is_store_approved(_store_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.stores
    WHERE id = _store_id AND status = 'approved'
  )
$$;

-- Função para verificar se produto está próximo da validade
CREATE OR REPLACE FUNCTION public.is_near_expiry(_expiry_date DATE)
RETURNS BOOLEAN
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT _expiry_date IS NOT NULL AND _expiry_date <= CURRENT_DATE + INTERVAL '7 days'
$$;

-- ============================================
-- HABILITAR RLS
-- ============================================

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.carts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.delivery_drivers ENABLE ROW LEVEL SECURITY;

-- ============================================
-- POLÍTICAS RLS
-- ============================================

-- USER ROLES
CREATE POLICY "Users can view own roles" ON public.user_roles
  FOR SELECT USING (user_id = auth.uid() OR public.is_admin(auth.uid()));

CREATE POLICY "Only admins can manage roles" ON public.user_roles
  FOR ALL USING (public.is_admin(auth.uid()));

-- PROFILES
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (user_id = auth.uid() OR public.is_admin(auth.uid()));

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- CATEGORIES
CREATE POLICY "Anyone can view active categories" ON public.categories
  FOR SELECT USING (is_active = true OR public.is_admin(auth.uid()));

CREATE POLICY "Only admins can manage categories" ON public.categories
  FOR ALL USING (public.is_admin(auth.uid()));

-- STORES
CREATE POLICY "Anyone can view approved stores" ON public.stores
  FOR SELECT USING (
    status = 'approved' 
    OR owner_id = auth.uid() 
    OR public.is_admin(auth.uid())
    OR public.is_store_staff(auth.uid(), id)
  );

CREATE POLICY "Owners can update their stores" ON public.stores
  FOR UPDATE USING (owner_id = auth.uid() OR public.is_admin(auth.uid()));

CREATE POLICY "Authenticated users can create stores" ON public.stores
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL AND owner_id = auth.uid());

-- STORE STAFF
CREATE POLICY "Staff can view their assignments" ON public.store_staff
  FOR SELECT USING (
    user_id = auth.uid() 
    OR public.is_store_owner(auth.uid(), store_id)
    OR public.is_admin(auth.uid())
  );

CREATE POLICY "Store owners can manage staff" ON public.store_staff
  FOR ALL USING (public.is_store_owner(auth.uid(), store_id) OR public.is_admin(auth.uid()));

-- PRODUCTS
CREATE POLICY "Anyone can view available products from approved stores" ON public.products
  FOR SELECT USING (
    (is_available = true AND public.is_store_approved(store_id))
    OR public.is_store_staff(auth.uid(), store_id)
    OR public.is_admin(auth.uid())
  );

CREATE POLICY "Store staff can manage products" ON public.products
  FOR ALL USING (public.is_store_staff(auth.uid(), store_id) OR public.is_admin(auth.uid()));

-- CARTS
CREATE POLICY "Users can manage own cart" ON public.carts
  FOR ALL USING (user_id = auth.uid());

-- CART ITEMS
CREATE POLICY "Users can manage own cart items" ON public.cart_items
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.carts WHERE id = cart_id AND user_id = auth.uid())
  );

-- ORDERS
CREATE POLICY "Users can view own orders" ON public.orders
  FOR SELECT USING (
    customer_id = auth.uid()
    OR driver_id = auth.uid()
    OR public.is_store_staff(auth.uid(), store_id)
    OR public.is_admin(auth.uid())
  );

CREATE POLICY "Users can create own orders" ON public.orders
  FOR INSERT WITH CHECK (customer_id = auth.uid());

CREATE POLICY "Authorized users can update orders" ON public.orders
  FOR UPDATE USING (
    customer_id = auth.uid()
    OR driver_id = auth.uid()
    OR public.is_store_staff(auth.uid(), store_id)
    OR public.is_admin(auth.uid())
  );

-- ORDER ITEMS
CREATE POLICY "Users can view order items" ON public.order_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.orders 
      WHERE id = order_id 
      AND (customer_id = auth.uid() OR driver_id = auth.uid() OR public.is_store_staff(auth.uid(), store_id) OR public.is_admin(auth.uid()))
    )
  );

CREATE POLICY "Users can insert order items" ON public.order_items
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.orders WHERE id = order_id AND customer_id = auth.uid())
  );

-- REVIEWS
CREATE POLICY "Anyone can view reviews" ON public.reviews
  FOR SELECT USING (true);

CREATE POLICY "Customers can create reviews for delivered orders" ON public.reviews
  FOR INSERT WITH CHECK (
    customer_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.orders 
      WHERE id = order_id AND customer_id = auth.uid() AND status = 'delivered'
    )
  );

CREATE POLICY "Customers can update own reviews" ON public.reviews
  FOR UPDATE USING (customer_id = auth.uid());

-- DELIVERY DRIVERS
CREATE POLICY "Drivers can view and update own profile" ON public.delivery_drivers
  FOR ALL USING (user_id = auth.uid() OR public.is_admin(auth.uid()));

-- ============================================
-- TRIGGERS
-- ============================================

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_stores_updated_at BEFORE UPDATE ON public.stores
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_carts_updated_at BEFORE UPDATE ON public.carts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_delivery_drivers_updated_at BEFORE UPDATE ON public.delivery_drivers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger para criar perfil automaticamente
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name');
  
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'customer');
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Trigger para gerar número do pedido
CREATE OR REPLACE FUNCTION public.generate_order_number()
RETURNS TRIGGER AS $$
BEGIN
  NEW.order_number = 'CMD' || TO_CHAR(now(), 'YYYYMMDD') || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER set_order_number BEFORE INSERT ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.generate_order_number();