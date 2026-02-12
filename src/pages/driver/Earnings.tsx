import { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  Truck, Package, Navigation, DollarSign, 
  LogOut, Menu, X, TrendingUp, Calendar, BarChart3
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Logo } from '@/components/Logo';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { startOfWeek, endOfWeek, startOfMonth, endOfMonth, format, subDays, isWithinInterval } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const navItems = [
  { to: '/driver/dashboard', icon: Package, label: 'Entregas' },
  { to: '/driver/map', icon: Navigation, label: 'Mapa' },
  { to: '/driver/earnings', icon: DollarSign, label: 'Ganhos' },
];

type Period = '7d' | '30d' | '3m';

export default function DriverEarnings() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, signOut, isDriver } = useAuth();
  const [deliveredOrders, setDeliveredOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<Period>('7d');
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (!user) { navigate('/auth'); return; }
    if (!isDriver) { navigate('/'); return; }
    fetchDeliveredOrders();
  }, [user, isDriver]);

  const fetchDeliveredOrders = async () => {
    if (!user) return;
    setLoading(true);
    const { data } = await supabase
      .from('orders')
      .select('id, order_number, delivery_fee, delivered_at, total, store:stores(name)')
      .eq('driver_id', user.id)
      .eq('status', 'delivered')
      .order('delivered_at', { ascending: false });
    setDeliveredOrders(data || []);
    setLoading(false);
  };

  const periodDays = period === '7d' ? 7 : period === '30d' ? 30 : 90;
  const startDate = subDays(new Date(), periodDays);

  const filteredOrders = useMemo(() => 
    deliveredOrders.filter(o => o.delivered_at && new Date(o.delivered_at) >= startDate),
    [deliveredOrders, startDate]
  );

  const totalEarnings = filteredOrders.reduce((sum, o) => sum + Number(o.delivery_fee || 0), 0);
  const totalDeliveries = filteredOrders.length;
  const avgPerDelivery = totalDeliveries > 0 ? totalEarnings / totalDeliveries : 0;

  // Chart data
  const chartData = useMemo(() => {
    const days: Record<string, { date: string; ganhos: number; entregas: number }> = {};
    for (let i = periodDays - 1; i >= 0; i--) {
      const d = subDays(new Date(), i);
      const key = format(d, 'dd/MM');
      days[key] = { date: key, ganhos: 0, entregas: 0 };
    }
    filteredOrders.forEach(o => {
      const key = format(new Date(o.delivered_at), 'dd/MM');
      if (days[key]) {
        days[key].ganhos += Number(o.delivery_fee || 0);
        days[key].entregas += 1;
      }
    });
    const entries = Object.values(days);
    // Group by week for larger periods
    if (periodDays > 14) {
      const grouped: typeof entries = [];
      for (let i = 0; i < entries.length; i += 7) {
        const chunk = entries.slice(i, i + 7);
        grouped.push({
          date: chunk[0].date,
          ganhos: chunk.reduce((s, c) => s + c.ganhos, 0),
          entregas: chunk.reduce((s, c) => s + c.entregas, 0),
        });
      }
      return grouped;
    }
    return entries;
  }, [filteredOrders, periodDays]);

  // Today / this week / this month
  const now = new Date();
  const todayStr = format(now, 'dd/MM');
  const todayEarnings = deliveredOrders
    .filter(o => o.delivered_at && format(new Date(o.delivered_at), 'yyyy-MM-dd') === format(now, 'yyyy-MM-dd'))
    .reduce((s, o) => s + Number(o.delivery_fee || 0), 0);

  const weekStart = startOfWeek(now, { locale: ptBR });
  const weekEnd = endOfWeek(now, { locale: ptBR });
  const weekEarnings = deliveredOrders
    .filter(o => o.delivered_at && isWithinInterval(new Date(o.delivered_at), { start: weekStart, end: weekEnd }))
    .reduce((s, o) => s + Number(o.delivery_fee || 0), 0);

  const handleLogout = async () => { await signOut(); navigate('/'); };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-secondary text-secondary-foreground border-b border-border">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => setMenuOpen(!menuOpen)} className="lg:hidden">
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <Link to="/driver/dashboard" className="flex items-center gap-2">
              <Truck className="w-5 h-5 text-primary" />
              <Logo size="sm" />
            </Link>
          </div>
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map(item => {
              const Icon = item.icon;
              const active = location.pathname === item.to;
              return (
                <Link key={item.to} to={item.to}>
                  <Button variant={active ? 'default' : 'ghost'} size="sm" className="gap-2">
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </Button>
                </Link>
              );
            })}
          </nav>
          <Button variant="ghost" size="sm" onClick={handleLogout} className="gap-2">
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Sair</span>
          </Button>
        </div>
        {menuOpen && (
          <div className="lg:hidden border-t border-border/20 px-4 py-2 space-y-1">
            {navItems.map(item => {
              const Icon = item.icon;
              const active = location.pathname === item.to;
              return (
                <Link key={item.to} to={item.to} onClick={() => setMenuOpen(false)}>
                  <Button variant={active ? 'default' : 'ghost'} size="sm" className="w-full justify-start gap-2">
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </Button>
                </Link>
              );
            })}
          </div>
        )}
      </header>

      <main className="container mx-auto px-4 py-6 max-w-4xl space-y-6">
        {/* Summary */}
        <div className="grid grid-cols-3 gap-3">
          <Card className="border-primary/20">
            <CardContent className="p-4 text-center">
              <DollarSign className="w-6 h-6 mx-auto mb-1 text-primary" />
              <div className="text-lg font-bold">R$ {todayEarnings.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">Hoje</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Calendar className="w-6 h-6 mx-auto mb-1 text-accent" />
              <div className="text-lg font-bold">R$ {weekEarnings.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">Esta semana</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <TrendingUp className="w-6 h-6 mx-auto mb-1 text-success" />
              <div className="text-lg font-bold">R$ {avgPerDelivery.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">Média/entrega</p>
            </CardContent>
          </Card>
        </div>

        {/* Period filter */}
        <div className="flex gap-2">
          {([['7d', '7 dias'], ['30d', '30 dias'], ['3m', '3 meses']] as [Period, string][]).map(([key, label]) => (
            <Button key={key} size="sm" variant={period === key ? 'default' : 'outline'} onClick={() => setPeriod(key)}>
              {label}
            </Button>
          ))}
        </div>

        {/* Earnings chart */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-primary" />
              Ganhos — R$ {totalEarnings.toFixed(2)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                  <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                  <Tooltip formatter={(v: number) => `R$ ${v.toFixed(2)}`} />
                  <Area type="monotone" dataKey="ganhos" stroke="hsl(var(--primary))" fill="hsl(var(--primary) / 0.2)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-center text-muted-foreground py-8">Sem dados no período</p>
            )}
          </CardContent>
        </Card>

        {/* Deliveries chart */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-accent" />
              Entregas — {totalDeliveries} no período
            </CardTitle>
          </CardHeader>
          <CardContent>
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                  <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                  <Tooltip />
                  <Bar dataKey="entregas" fill="hsl(var(--accent))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-center text-muted-foreground py-8">Sem dados no período</p>
            )}
          </CardContent>
        </Card>

        {/* Recent deliveries */}
        <section>
          <h2 className="text-lg font-semibold mb-3">Entregas Recentes</h2>
          {filteredOrders.length === 0 ? (
            <Card><CardContent className="p-8 text-center text-muted-foreground">
              Nenhuma entrega no período selecionado
            </CardContent></Card>
          ) : (
            <div className="space-y-2">
              {filteredOrders.slice(0, 15).map(order => (
                <Card key={order.id}>
                  <CardContent className="p-3 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">#{order.order_number}</p>
                      <p className="text-xs text-muted-foreground">
                        {order.store?.name} • {order.delivered_at ? format(new Date(order.delivered_at), "dd/MM 'às' HH:mm", { locale: ptBR }) : '-'}
                      </p>
                    </div>
                    <span className="text-sm font-semibold text-primary">R$ {Number(order.delivery_fee || 0).toFixed(2)}</span>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
