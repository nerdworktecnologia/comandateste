import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Store, Users, ClipboardList, TrendingUp, Clock, CheckCircle, XCircle, DollarSign, ShoppingBag, BarChart3 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { format, subDays, subMonths, startOfDay, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { Store as StoreType } from '@/types';

type Period = '7d' | '30d' | '3m';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { user, isAdmin, loading: authLoading } = useAuth();
  const [stats, setStats] = useState({
    totalStores: 0,
    pendingStores: 0,
    approvedStores: 0,
    totalOrders: 0,
    totalUsers: 0,
    totalRevenue: 0,
    todayOrders: 0,
    todayRevenue: 0,
  });
  const [pendingStores, setPendingStores] = useState<StoreType[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<Period>('30d');

  useEffect(() => {
    if (authLoading) return;
    if (!user) { navigate('/auth'); return; }
    if (!isAdmin) { navigate('/'); return; }
    fetchDashboardData();
  }, [user, isAdmin, authLoading, navigate]);

  const fetchDashboardData = async () => {
    const threeMonthsAgo = subMonths(new Date(), 3).toISOString();
    const todayStart = startOfDay(new Date()).toISOString();

    const [
      { count: totalStores },
      { count: pendingCount },
      { count: approvedCount },
      { count: totalOrders },
      { count: totalUsers },
      { data: recentOrders },
      { data: todayData },
      { data: pending },
    ] = await Promise.all([
      supabase.from('stores').select('*', { count: 'exact', head: true }),
      supabase.from('stores').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
      supabase.from('stores').select('*', { count: 'exact', head: true }).eq('status', 'approved'),
      supabase.from('orders').select('*', { count: 'exact', head: true }),
      supabase.from('profiles').select('*', { count: 'exact', head: true }),
      supabase.from('orders').select('id, total, status, created_at').gte('created_at', threeMonthsAgo).order('created_at', { ascending: true }),
      supabase.from('orders').select('total').gte('created_at', todayStart).neq('status', 'cancelled'),
      supabase.from('stores').select('*').eq('status', 'pending').order('created_at', { ascending: false }).limit(5),
    ]);

    const todayRevenue = (todayData || []).reduce((sum, o) => sum + Number(o.total), 0);
    const totalRevenue = (recentOrders || []).filter(o => o.status !== 'cancelled').reduce((sum, o) => sum + Number(o.total), 0);

    setStats({
      totalStores: totalStores || 0,
      pendingStores: pendingCount || 0,
      approvedStores: approvedCount || 0,
      totalOrders: totalOrders || 0,
      totalUsers: totalUsers || 0,
      totalRevenue,
      todayOrders: (todayData || []).length,
      todayRevenue,
    });

    setOrders(recentOrders || []);
    if (pending) setPendingStores(pending as StoreType[]);
    setLoading(false);
  };

  const periodStart = useMemo(() => {
    if (period === '7d') return subDays(new Date(), 7);
    if (period === '30d') return subDays(new Date(), 30);
    return subMonths(new Date(), 3);
  }, [period]);

  const filteredOrders = useMemo(() => 
    orders.filter(o => new Date(o.created_at) >= periodStart),
  [orders, periodStart]);

  const revenueChartData = useMemo(() => {
    const groupByWeek = period === '3m';
    const map = new Map<string, { revenue: number; orders: number }>();

    filteredOrders.forEach(order => {
      if (order.status === 'cancelled') return;
      const date = parseISO(order.created_at);
      let key: string;
      if (groupByWeek) {
        const weekStart = subDays(date, date.getDay());
        key = format(weekStart, 'dd/MM');
      } else {
        key = format(date, 'dd/MM');
      }
      const existing = map.get(key) || { revenue: 0, orders: 0 };
      map.set(key, { revenue: existing.revenue + Number(order.total), orders: existing.orders + 1 });
    });

    return Array.from(map.entries()).map(([date, data]) => ({
      date,
      receita: Number(data.revenue.toFixed(2)),
      pedidos: data.orders,
    }));
  }, [filteredOrders, period]);

  const statusDistribution = useMemo(() => {
    const counts: Record<string, number> = {};
    filteredOrders.forEach(o => {
      counts[o.status] = (counts[o.status] || 0) + 1;
    });
    const labels: Record<string, string> = {
      pending: 'Pendente', confirmed: 'Confirmado', preparing: 'Preparando',
      ready: 'Pronto', picked_up: 'Retirado', delivering: 'Em entrega',
      delivered: 'Entregue', cancelled: 'Cancelado',
    };
    return Object.entries(counts).map(([status, count]) => ({
      name: labels[status] || status, value: count, status,
    }));
  }, [filteredOrders]);

  const PIE_COLORS = [
    'hsl(var(--primary))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))',
    'hsl(var(--chart-4))', 'hsl(var(--chart-5))', 'hsl(var(--muted-foreground))',
    'hsl(142 76% 36%)', 'hsl(0 84% 60%)',
  ];

  const handleApproveStore = async (storeId: string) => {
    const { error } = await supabase
      .from('stores')
      .update({ status: 'approved', approved_at: new Date().toISOString(), approved_by: user?.id })
      .eq('id', storeId);
    if (!error) fetchDashboardData();
  };

  const handleRejectStore = async (storeId: string) => {
    const { error } = await supabase.from('stores').update({ status: 'rejected' }).eq('id', storeId);
    if (!error) fetchDashboardData();
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <AdminSidebar />
      <main className="lg:ml-64">
        <header className="sticky top-0 z-40 bg-card border-b border-border px-4 lg:px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold">Dashboard</h1>
            <p className="text-sm text-muted-foreground">Visão geral da plataforma</p>
          </div>
          <Select value={period} onValueChange={(v) => setPeriod(v as Period)}>
            <SelectTrigger className="w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Últimos 7 dias</SelectItem>
              <SelectItem value="30d">Últimos 30 dias</SelectItem>
              <SelectItem value="3m">Últimos 3 meses</SelectItem>
            </SelectContent>
          </Select>
        </header>

        <div className="p-4 lg:p-6 space-y-6">
          {/* Stats */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { label: 'Receita Total', value: `R$ ${stats.totalRevenue.toFixed(2)}`, icon: DollarSign, color: 'text-primary', bg: 'bg-primary/10' },
              { label: 'Pedidos Hoje', value: stats.todayOrders, icon: ShoppingBag, color: 'text-accent-foreground', bg: 'bg-accent/10' },
              { label: 'Receita Hoje', value: `R$ ${stats.todayRevenue.toFixed(2)}`, icon: TrendingUp, color: 'text-primary', bg: 'bg-primary/10' },
              { label: 'Aguardando Aprovação', value: stats.pendingStores, icon: Clock, color: 'text-muted-foreground', bg: 'bg-muted' },
            ].map((item) => (
              <Card key={item.label}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">{item.label}</p>
                      <p className="text-2xl font-bold">{item.value}</p>
                    </div>
                    <div className={`w-10 h-10 ${item.bg} rounded-full flex items-center justify-center`}>
                      <item.icon className={`w-5 h-5 ${item.color}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Secondary stats row */}
          <div className="grid gap-4 sm:grid-cols-4">
            {[
              { label: 'Empresas', value: stats.totalStores, icon: Store },
              { label: 'Aprovadas', value: stats.approvedStores, icon: CheckCircle },
              { label: 'Total Pedidos', value: stats.totalOrders, icon: ClipboardList },
              { label: 'Usuários', value: stats.totalUsers, icon: Users },
            ].map(item => (
              <Card key={item.label}>
                <CardContent className="pt-4 pb-4">
                  <div className="flex items-center gap-3">
                    <item.icon className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-lg font-bold">{item.value}</p>
                      <p className="text-xs text-muted-foreground">{item.label}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Charts */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Revenue Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Receita
                </CardTitle>
              </CardHeader>
              <CardContent>
                {revenueChartData.length === 0 ? (
                  <div className="h-[250px] flex items-center justify-center text-muted-foreground">
                    <div className="text-center">
                      <BarChart3 className="w-10 h-10 mx-auto mb-2 opacity-40" />
                      <p className="text-sm">Sem dados no período</p>
                    </div>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={250}>
                    <AreaChart data={revenueChartData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                      <XAxis dataKey="date" className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                      <YAxis className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} tickFormatter={(v) => `R$${v}`} />
                      <Tooltip
                        contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }}
                        labelStyle={{ color: 'hsl(var(--foreground))' }}
                        formatter={(value: number) => [`R$ ${value.toFixed(2)}`, 'Receita']}
                      />
                      <Area type="monotone" dataKey="receita" stroke="hsl(var(--primary))" fill="hsl(var(--primary) / 0.2)" strokeWidth={2} />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            {/* Orders Volume Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <ShoppingBag className="w-4 h-4" />
                  Volume de Pedidos
                </CardTitle>
              </CardHeader>
              <CardContent>
                {revenueChartData.length === 0 ? (
                  <div className="h-[250px] flex items-center justify-center text-muted-foreground">
                    <div className="text-center">
                      <BarChart3 className="w-10 h-10 mx-auto mb-2 opacity-40" />
                      <p className="text-sm">Sem dados no período</p>
                    </div>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={revenueChartData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                      <XAxis dataKey="date" className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                      <YAxis className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                      <Tooltip
                        contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }}
                        labelStyle={{ color: 'hsl(var(--foreground))' }}
                      />
                      <Bar dataKey="pedidos" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            {/* Status Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Distribuição por Status</CardTitle>
              </CardHeader>
              <CardContent>
                {statusDistribution.length === 0 ? (
                  <div className="h-[250px] flex items-center justify-center text-muted-foreground text-sm">
                    Sem pedidos no período
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie data={statusDistribution} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={90} paddingAngle={2}>
                        {statusDistribution.map((_, i) => (
                          <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            {/* Top Stats Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Resumo do Período</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { label: 'Total de pedidos', value: filteredOrders.length },
                    { label: 'Pedidos entregues', value: filteredOrders.filter(o => o.status === 'delivered').length },
                    { label: 'Pedidos cancelados', value: filteredOrders.filter(o => o.status === 'cancelled').length },
                    { label: 'Receita (excl. cancelados)', value: `R$ ${filteredOrders.filter(o => o.status !== 'cancelled').reduce((s, o) => s + Number(o.total), 0).toFixed(2)}` },
                    { label: 'Ticket médio', value: (() => {
                      const valid = filteredOrders.filter(o => o.status !== 'cancelled');
                      return valid.length ? `R$ ${(valid.reduce((s, o) => s + Number(o.total), 0) / valid.length).toFixed(2)}` : 'R$ 0.00';
                    })() },
                  ].map(item => (
                    <div key={item.label} className="flex justify-between items-center py-2 border-b border-border last:border-0">
                      <span className="text-sm text-muted-foreground">{item.label}</span>
                      <span className="font-semibold">{item.value}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Pending Stores */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Empresas Pendentes</CardTitle>
                <CardDescription>Empresas aguardando aprovação para operar na plataforma</CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={() => navigate('/admin/stores')}>Ver todas</Button>
            </CardHeader>
            <CardContent>
              {pendingStores.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <CheckCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Nenhuma empresa pendente de aprovação</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {pendingStores.map((store) => (
                    <div key={store.id} className="flex items-center justify-between p-4 bg-muted rounded-lg">
                      <div className="flex items-center gap-4">
                        {store.logo_url ? (
                          <img src={store.logo_url} alt={store.name} className="w-12 h-12 rounded-lg object-cover" />
                        ) : (
                          <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                            <Store className="w-6 h-6 text-primary" />
                          </div>
                        )}
                        <div>
                          <p className="font-medium">{store.name}</p>
                          <p className="text-sm text-muted-foreground">{store.city}, {store.state}</p>
                          <p className="text-xs text-muted-foreground">
                            Cadastrado em {new Date(store.created_at).toLocaleDateString('pt-BR')}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" className="text-destructive" onClick={() => handleRejectStore(store.id)}>
                          <XCircle className="w-4 h-4 mr-1" /> Rejeitar
                        </Button>
                        <Button size="sm" onClick={() => handleApproveStore(store.id)}>
                          <CheckCircle className="w-4 h-4 mr-1" /> Aprovar
                        </Button>
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
