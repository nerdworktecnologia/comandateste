import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, Package, ClipboardList, Settings, 
  Plus, TrendingUp, Clock, Star, DollarSign,
  ChevronRight, Store, Users, LogOut
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Logo } from '@/components/Logo';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { Store as StoreType, Order } from '@/types';

export default function StoreDashboard() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [store, setStore] = useState<StoreType | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }

    fetchStoreData();
  }, [user, navigate]);

  const fetchStoreData = async () => {
    if (!user) return;

    const { data: storeData, error: storeError } = await supabase
      .from('stores')
      .select('*')
      .eq('owner_id', user.id)
      .maybeSingle();

    if (storeError) {
      console.error('Error fetching store:', storeError);
    }

    if (storeData) {
      setStore(storeData as StoreType);

      // Fetch recent orders
      const { data: ordersData } = await supabase
        .from('orders')
        .select('*')
        .eq('store_id', storeData.id)
        .order('created_at', { ascending: false })
        .limit(5);

      if (ordersData) {
        setOrders(ordersData as Order[]);
      }
    }

    setLoading(false);
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!store) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center">
          <CardHeader>
            <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <Store className="w-8 h-8 text-primary" />
            </div>
            <CardTitle>Você ainda não tem uma loja</CardTitle>
            <CardDescription>
              Cadastre sua empresa para começar a vender no Comanda
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button asChild className="w-full" size="lg">
              <Link to="/store/register">
                <Plus className="w-4 h-4 mr-2" />
                Cadastrar Empresa
              </Link>
            </Button>
            <Button variant="outline" className="w-full" onClick={() => navigate('/')}>
              Voltar para Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const statusColor = {
    pending: 'bg-secondary text-secondary-foreground',
    approved: 'bg-accent text-accent-foreground',
    rejected: 'bg-destructive text-destructive-foreground',
    suspended: 'bg-muted text-muted-foreground',
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar for desktop */}
      <aside className="fixed left-0 top-0 bottom-0 w-64 bg-secondary text-secondary-foreground hidden lg:flex flex-col">
        <div className="p-4 border-b border-secondary-foreground/10">
          <Logo size="sm" />
        </div>

        <nav className="flex-1 p-4 space-y-1">
          <Link
            to="/store/dashboard"
            className="flex items-center gap-3 px-4 py-3 rounded-lg bg-primary text-primary-foreground"
          >
            <LayoutDashboard className="w-5 h-5" />
            Dashboard
          </Link>
          <Link
            to="/store/products"
            className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-secondary-foreground/10 transition-colors"
          >
            <Package className="w-5 h-5" />
            Produtos
          </Link>
          <Link
            to="/store/orders"
            className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-secondary-foreground/10 transition-colors"
          >
            <ClipboardList className="w-5 h-5" />
            Pedidos
          </Link>
          <Link
            to="/store/settings"
            className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-secondary-foreground/10 transition-colors"
          >
            <Settings className="w-5 h-5" />
            Configurações
          </Link>
        </nav>

        <div className="p-4 border-t border-secondary-foreground/10">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-secondary-foreground/10 transition-colors w-full text-left"
          >
            <LogOut className="w-5 h-5" />
            Sair
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="lg:ml-64">
        {/* Header */}
        <header className="sticky top-0 z-40 bg-card border-b border-border px-4 lg:px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold">{store.name}</h1>
              <Badge className={statusColor[store.status]}>
                {store.status === 'pending' && 'Aguardando aprovação'}
                {store.status === 'approved' && 'Aprovada'}
                {store.status === 'rejected' && 'Rejeitada'}
                {store.status === 'suspended' && 'Suspensa'}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" asChild>
                <Link to={`/store/${store.slug}`} target="_blank">
                  Ver loja
                </Link>
              </Button>
            </div>
          </div>
        </header>

        <div className="p-4 lg:p-6 space-y-6">
          {store.status === 'pending' && (
            <Card className="border-primary bg-primary/5">
              <CardContent className="flex items-center gap-4 py-4">
                <Clock className="w-8 h-8 text-primary" />
                <div>
                  <h3 className="font-semibold">Aguardando aprovação</h3>
                  <p className="text-sm text-muted-foreground">
                    Sua empresa está em análise. Você receberá uma notificação quando for aprovada.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Stats */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Pedidos Hoje</p>
                    <p className="text-2xl font-bold">0</p>
                  </div>
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <ClipboardList className="w-5 h-5 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Faturamento Hoje</p>
                    <p className="text-2xl font-bold">R$ 0,00</p>
                  </div>
                  <div className="w-10 h-10 bg-accent/10 rounded-full flex items-center justify-center">
                    <DollarSign className="w-5 h-5 text-accent" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Avaliação</p>
                    <p className="text-2xl font-bold">{store.rating.toFixed(1)}</p>
                  </div>
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <Star className="w-5 h-5 text-primary fill-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Produtos</p>
                    <p className="text-2xl font-bold">0</p>
                  </div>
                  <div className="w-10 h-10 bg-secondary/10 rounded-full flex items-center justify-center">
                    <Package className="w-5 h-5 text-secondary-foreground" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate('/store/products/new')}>
              <CardContent className="flex items-center gap-4 py-6">
                <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                  <Plus className="w-6 h-6 text-primary-foreground" />
                </div>
                <div>
                  <h3 className="font-semibold">Adicionar Produto</h3>
                  <p className="text-sm text-muted-foreground">Cadastre novos produtos</p>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground ml-auto" />
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate('/store/orders')}>
              <CardContent className="flex items-center gap-4 py-6">
                <div className="w-12 h-12 bg-accent rounded-full flex items-center justify-center">
                  <ClipboardList className="w-6 h-6 text-accent-foreground" />
                </div>
                <div>
                  <h3 className="font-semibold">Ver Pedidos</h3>
                  <p className="text-sm text-muted-foreground">Gerencie seus pedidos</p>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground ml-auto" />
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate('/store/settings')}>
              <CardContent className="flex items-center gap-4 py-6">
                <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center">
                  <Settings className="w-6 h-6 text-muted-foreground" />
                </div>
                <div>
                  <h3 className="font-semibold">Configurações</h3>
                  <p className="text-sm text-muted-foreground">Edite sua loja</p>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground ml-auto" />
              </CardContent>
            </Card>
          </div>

          {/* Recent Orders */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Pedidos Recentes</CardTitle>
                <CardDescription>Últimos pedidos da sua loja</CardDescription>
              </div>
              <Button variant="outline" size="sm" asChild>
                <Link to="/store/orders">Ver todos</Link>
              </Button>
            </CardHeader>
            <CardContent>
              {orders.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <ClipboardList className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Nenhum pedido ainda</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map((order) => (
                    <div key={order.id} className="flex items-center justify-between p-4 bg-muted rounded-lg">
                      <div>
                        <p className="font-medium">Pedido #{order.order_number}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(order.created_at).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">R$ {order.total.toFixed(2)}</p>
                        <Badge variant="outline">{order.status}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
