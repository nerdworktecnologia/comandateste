import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, Package, ClipboardList, Settings, 
  Plus, Clock, Star, DollarSign,
  ChevronRight, Store, LogOut, TrendingUp, ShoppingCart
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Logo } from '@/components/Logo';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useOrderNotifications } from '@/hooks/useOrderNotifications';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, Legend
} from 'recharts';
import type { Store as StoreType, Order } from '@/types';

interface DashboardStats {
  ordersToday: number;
  revenueToday: number;
  ordersWeek: number;
  revenueWeek: number;
  ordersMonth: number;
  revenueMonth: number;
  productsCount: number;
  pendingOrders: number;
}

interface ChartData {
  date: string;
  pedidos: number;
  faturamento: number;
}

interface StatusData {
  name: string;
  value: number;
  color: string;
}

const STATUS_COLORS: Record<string, string> = {
  pending: '#eab308',
  confirmed: '#3b82f6',
  preparing: '#f97316',
  ready: '#22c55e',
  picked_up: '#a855f7',
  delivering: '#6366f1',
  delivered: '#16a34a',
  cancelled: '#ef4444',
};

const STATUS_LABELS: Record<string, string> = {
  pending: 'Pendente',
  confirmed: 'Confirmado',
  preparing: 'Preparando',
  ready: 'Pronto',
  picked_up: 'Retirado',
  delivering: 'Em entrega',
  delivered: 'Entregue',
  cancelled: 'Cancelado',
};

export default function StoreDashboard() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [store, setStore] = useState<StoreType | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    ordersToday: 0,
    revenueToday: 0,
    ordersWeek: 0,
    revenueWeek: 0,
    ordersMonth: 0,
    revenueMonth: 0,
    productsCount: 0,
    pendingOrders: 0,
  });
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [statusData, setStatusData] = useState<StatusData[]>([]);

  useOrderNotifications({ 
    storeId: store?.id, 
    enabled: !!store && store.status === 'approved' 
  });

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
      await Promise.all([
        fetchOrders(storeData.id),
        fetchStats(storeData.id),
        fetchChartData(storeData.id),
      ]);
    }

    setLoading(false);
  };

  const fetchOrders = async (storeId: string) => {
    const { data: ordersData } = await supabase
      .from('orders')
      .select('*')
      .eq('store_id', storeId)
      .order('created_at', { ascending: false })
      .limit(5);

    if (ordersData) {
      setOrders(ordersData as Order[]);
    }
  };

  const fetchStats = async (storeId: string) => {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
    const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay())).toISOString();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

    // Get all orders for this store
    const { data: allOrders } = await supabase
      .from('orders')
      .select('total, status, created_at')
      .eq('store_id', storeId);

    // Get products count
    const { count: productsCount } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .eq('store_id', storeId);

    if (allOrders) {
      const ordersArray = allOrders as { total: number; status: string; created_at: string }[];
      
      // Calculate stats
      const ordersToday = ordersArray.filter(o => o.created_at >= startOfToday && o.status !== 'cancelled');
      const ordersWeek = ordersArray.filter(o => o.created_at >= startOfWeek && o.status !== 'cancelled');
      const ordersMonth = ordersArray.filter(o => o.created_at >= startOfMonth && o.status !== 'cancelled');
      const pendingOrders = ordersArray.filter(o => o.status === 'pending').length;

      // Calculate status distribution
      const statusCounts: Record<string, number> = {};
      ordersArray.forEach(o => {
        statusCounts[o.status] = (statusCounts[o.status] || 0) + 1;
      });

      const statusChartData: StatusData[] = Object.entries(statusCounts).map(([status, count]) => ({
        name: STATUS_LABELS[status] || status,
        value: count,
        color: STATUS_COLORS[status] || '#888888',
      }));

      setStatusData(statusChartData);

      setStats({
        ordersToday: ordersToday.length,
        revenueToday: ordersToday.reduce((sum, o) => sum + o.total, 0),
        ordersWeek: ordersWeek.length,
        revenueWeek: ordersWeek.reduce((sum, o) => sum + o.total, 0),
        ordersMonth: ordersMonth.length,
        revenueMonth: ordersMonth.reduce((sum, o) => sum + o.total, 0),
        productsCount: productsCount || 0,
        pendingOrders,
      });
    }
  };

  const fetchChartData = async (storeId: string) => {
    // Get orders from the last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const { data: recentOrders } = await supabase
      .from('orders')
      .select('total, created_at, status')
      .eq('store_id', storeId)
      .gte('created_at', sevenDaysAgo.toISOString())
      .neq('status', 'cancelled');

    if (recentOrders) {
      // Group by date
      const dailyData: Record<string, { pedidos: number; faturamento: number }> = {};
      
      // Initialize all days
      for (let i = 0; i < 7; i++) {
        const date = new Date();
        date.setDate(date.getDate() - (6 - i));
        const dateStr = date.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit' });
        dailyData[dateStr] = { pedidos: 0, faturamento: 0 };
      }

      // Fill with actual data
      recentOrders.forEach(order => {
        const date = new Date(order.created_at);
        const dateStr = date.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit' });
        if (dailyData[dateStr]) {
          dailyData[dateStr].pedidos += 1;
          dailyData[dateStr].faturamento += order.total;
        }
      });

      const chartArray = Object.entries(dailyData).map(([date, data]) => ({
        date,
        ...data,
      }));

      setChartData(chartArray);
    }
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
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
                <Link to={`/loja/${store.slug}`} target="_blank">
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

          {/* Stats Cards */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Pedidos Hoje</p>
                    <p className="text-2xl font-bold">{stats.ordersToday}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {stats.ordersWeek} esta semana
                    </p>
                  </div>
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <ShoppingCart className="w-5 h-5 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Faturamento Hoje</p>
                    <p className="text-2xl font-bold">{formatCurrency(stats.revenueToday)}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatCurrency(stats.revenueWeek)} esta semana
                    </p>
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
                    <p className="text-2xl font-bold">{(store.rating || 0).toFixed(1)}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {store.total_reviews || 0} avaliações
                    </p>
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
                    <p className="text-2xl font-bold">{stats.productsCount}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {stats.pendingOrders} pedidos pendentes
                    </p>
                  </div>
                  <div className="w-10 h-10 bg-secondary/10 rounded-full flex items-center justify-center">
                    <Package className="w-5 h-5 text-secondary-foreground" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Revenue Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Faturamento - Últimos 7 dias
                </CardTitle>
              </CardHeader>
              <CardContent>
                {chartData.some(d => d.faturamento > 0) ? (
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={chartData}>
                        <defs>
                          <linearGradient id="colorFaturamento" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis 
                          dataKey="date" 
                          tick={{ fontSize: 12 }} 
                          tickLine={false}
                          className="text-muted-foreground"
                        />
                        <YAxis 
                          tick={{ fontSize: 12 }} 
                          tickLine={false}
                          tickFormatter={(value) => `R$${value}`}
                          className="text-muted-foreground"
                        />
                        <Tooltip 
                          formatter={(value: number) => [formatCurrency(value), 'Faturamento']}
                          contentStyle={{ 
                            backgroundColor: 'hsl(var(--card))', 
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '8px',
                          }}
                        />
                        <Area 
                          type="monotone" 
                          dataKey="faturamento" 
                          stroke="hsl(var(--primary))" 
                          fillOpacity={1} 
                          fill="url(#colorFaturamento)" 
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="h-64 flex flex-col items-center justify-center text-muted-foreground">
                    <DollarSign className="w-12 h-12 mb-4 opacity-50" />
                    <p className="font-medium">Nenhuma venda registrada</p>
                    <p className="text-sm">Os dados aparecerão aqui quando você tiver pedidos</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Orders Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ClipboardList className="w-5 h-5" />
                  Pedidos - Últimos 7 dias
                </CardTitle>
              </CardHeader>
              <CardContent>
                {chartData.some(d => d.pedidos > 0) ? (
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis 
                          dataKey="date" 
                          tick={{ fontSize: 12 }} 
                          tickLine={false}
                          className="text-muted-foreground"
                        />
                        <YAxis 
                          tick={{ fontSize: 12 }} 
                          tickLine={false}
                          className="text-muted-foreground"
                        />
                        <Tooltip 
                          formatter={(value: number) => [value, 'Pedidos']}
                          contentStyle={{ 
                            backgroundColor: 'hsl(var(--card))', 
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '8px',
                          }}
                        />
                        <Bar 
                          dataKey="pedidos" 
                          fill="hsl(var(--accent))" 
                          radius={[4, 4, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="h-64 flex flex-col items-center justify-center text-muted-foreground">
                    <ShoppingCart className="w-12 h-12 mb-4 opacity-50" />
                    <p className="font-medium">Nenhum pedido ainda</p>
                    <p className="text-sm">Seus pedidos aparecerão aqui</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Status Distribution & Monthly Stats */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Status Pie Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Distribuição de Status</CardTitle>
                <CardDescription>Status dos pedidos realizados</CardDescription>
              </CardHeader>
              <CardContent>
                {statusData.length > 0 ? (
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={statusData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {statusData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip 
                          formatter={(value: number) => [value, 'Pedidos']}
                          contentStyle={{ 
                            backgroundColor: 'hsl(var(--card))', 
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '8px',
                          }}
                        />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="h-64 flex items-center justify-center text-muted-foreground">
                    Nenhum pedido para exibir
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Monthly Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Resumo do Mês</CardTitle>
                <CardDescription>Métricas do mês atual</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <ShoppingCart className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Total de Pedidos</p>
                      <p className="text-lg font-bold">{stats.ordersMonth}</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-accent/10 rounded-full flex items-center justify-center">
                      <DollarSign className="w-5 h-5 text-accent" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Faturamento Total</p>
                      <p className="text-lg font-bold">{formatCurrency(stats.revenueMonth)}</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-secondary/10 rounded-full flex items-center justify-center">
                      <TrendingUp className="w-5 h-5 text-secondary-foreground" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Ticket Médio</p>
                      <p className="text-lg font-bold">
                        {stats.ordersMonth > 0 
                          ? formatCurrency(stats.revenueMonth / stats.ordersMonth) 
                          : formatCurrency(0)
                        }
                      </p>
                    </div>
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
                        <p className="font-medium">{formatCurrency(order.total)}</p>
                        <Badge 
                          style={{ backgroundColor: STATUS_COLORS[order.status] + '20', color: STATUS_COLORS[order.status] }}
                        >
                          {STATUS_LABELS[order.status] || order.status}
                        </Badge>
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
