import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  Truck, Package, Clock, CheckCircle, MapPin, DollarSign, 
  BarChart3, Navigation, ArrowLeft, LogOut, Menu, X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Logo } from '@/components/Logo';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const navItems = [
  { to: '/driver/dashboard', icon: Package, label: 'Entregas' },
  { to: '/driver/map', icon: Navigation, label: 'Mapa' },
  { to: '/driver/earnings', icon: DollarSign, label: 'Ganhos' },
];

export default function DriverDashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, signOut, isDriver } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [driverData, setDriverData] = useState<any>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (!user) { navigate('/auth'); return; }
    if (!isDriver) { navigate('/'); toast.error('Acesso restrito a entregadores'); return; }
    fetchDriverData();
    fetchOrders();

    // Real-time subscription for new available orders
    const channel = supabase
      .channel('driver-orders')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'orders',
        },
        (payload) => {
          const updated = payload.new as any;
          // Notify when an order becomes ready for pickup
          if (updated.status === 'ready' && !updated.driver_id) {
            toast.info(`🚚 Novo pedido disponível: #${updated.order_number}`, {
              duration: 8000,
              action: {
                label: 'Ver',
                onClick: () => window.scrollTo({ top: 0, behavior: 'smooth' }),
              },
            });
            // Play notification sound
            try {
              const audio = new Audio('/sounds/notification-chime.mp3');
              audio.volume = 0.5;
              audio.play().catch(() => {});
            } catch {}
          }
          fetchOrders();
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'orders',
        },
        () => fetchOrders()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, isDriver]);

  const fetchDriverData = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('delivery_drivers')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();
    setDriverData(data);
  };

  const fetchOrders = async () => {
    if (!user) return;
    setLoading(true);
    // Get orders assigned to this driver or ready for pickup
    const { data } = await supabase
      .from('orders')
      .select('*, store:stores(name, address, city)')
      .or(`driver_id.eq.${user.id},and(status.eq.ready,driver_id.is.null)`)
      .order('created_at', { ascending: false })
      .limit(50);
    setOrders(data || []);
    setLoading(false);
  };

  const acceptOrder = async (orderId: string) => {
    if (!user) return;
    const { error } = await supabase
      .from('orders')
      .update({ driver_id: user.id, status: 'picked_up', picked_up_at: new Date().toISOString() })
      .eq('id', orderId)
      .eq('status', 'ready');
    if (error) { toast.error('Erro ao aceitar entrega'); return; }
    toast.success('Entrega aceita!');
    fetchOrders();
  };

  const updateDeliveryStatus = async (orderId: string, status: string) => {
    const updateData: any = { status };
    if (status === 'delivering') updateData.picked_up_at = new Date().toISOString();
    if (status === 'delivered') updateData.delivered_at = new Date().toISOString();
    
    const { error } = await supabase
      .from('orders')
      .update(updateData)
      .eq('id', orderId);
    if (error) { toast.error('Erro ao atualizar status'); return; }
    toast.success('Status atualizado!');
    fetchOrders();
  };

  const availableOrders = orders.filter(o => o.status === 'ready' && !o.driver_id);
  const myActiveOrders = orders.filter(o => o.driver_id === user?.id && ['picked_up', 'delivering'].includes(o.status));
  const myCompletedOrders = orders.filter(o => o.driver_id === user?.id && o.status === 'delivered');

  const statusBadge = (status: string) => {
    const map: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
      ready: { label: 'Pronto p/ retirada', variant: 'default' },
      picked_up: { label: 'Retirado', variant: 'secondary' },
      delivering: { label: 'Em entrega', variant: 'outline' },
      delivered: { label: 'Entregue', variant: 'secondary' },
    };
    const config = map[status] || { label: status, variant: 'outline' as const };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

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
        {/* Mobile nav */}
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
        {/* Summary cards */}
        <div className="grid grid-cols-3 gap-3">
          <Card>
            <CardContent className="p-4 text-center">
              <Package className="w-6 h-6 mx-auto mb-1 text-primary" />
              <div className="text-2xl font-bold">{availableOrders.length}</div>
              <p className="text-xs text-muted-foreground">Disponíveis</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Clock className="w-6 h-6 mx-auto mb-1 text-accent" />
              <div className="text-2xl font-bold">{myActiveOrders.length}</div>
              <p className="text-xs text-muted-foreground">Em andamento</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <CheckCircle className="w-6 h-6 mx-auto mb-1 text-success" />
              <div className="text-2xl font-bold">{myCompletedOrders.length}</div>
              <p className="text-xs text-muted-foreground">Concluídas</p>
            </CardContent>
          </Card>
        </div>

        {/* Available orders */}
        <section>
          <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <Package className="w-5 h-5 text-primary" />
            Entregas Disponíveis
          </h2>
          {availableOrders.length === 0 ? (
            <Card><CardContent className="p-8 text-center text-muted-foreground">
              <Package className="w-10 h-10 mx-auto mb-2 opacity-30" />
              Nenhuma entrega disponível no momento
            </CardContent></Card>
          ) : (
            <div className="space-y-3">
              {availableOrders.map(order => (
                <Card key={order.id} className="border-primary/20">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-semibold">#{order.order_number}</p>
                        <p className="text-sm text-muted-foreground">{order.store?.name}</p>
                      </div>
                      {statusBadge(order.status)}
                    </div>
                    <div className="text-sm text-muted-foreground mb-3 space-y-1">
                      <p className="flex items-center gap-1"><MapPin className="w-3 h-3" /> Retirada: {order.store?.address}</p>
                      <p className="flex items-center gap-1"><Navigation className="w-3 h-3" /> Entrega: {order.delivery_address}, {order.delivery_city}</p>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-primary">R$ {Number(order.delivery_fee || 0).toFixed(2)}</span>
                      <Button size="sm" onClick={() => acceptOrder(order.id)}>Aceitar entrega</Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>

        {/* My active orders */}
        {myActiveOrders.length > 0 && (
          <section>
            <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <Clock className="w-5 h-5 text-accent" />
              Minhas Entregas Ativas
            </h2>
            <div className="space-y-3">
              {myActiveOrders.map(order => (
                <Card key={order.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-semibold">#{order.order_number}</p>
                        <p className="text-sm text-muted-foreground">{order.store?.name}</p>
                      </div>
                      {statusBadge(order.status)}
                    </div>
                    <p className="text-sm text-muted-foreground mb-3 flex items-center gap-1">
                      <Navigation className="w-3 h-3" /> {order.delivery_address}, {order.delivery_city}
                    </p>
                    <div className="flex gap-2">
                      {order.status === 'picked_up' && (
                        <Button size="sm" onClick={() => updateDeliveryStatus(order.id, 'delivering')}>
                          Iniciar entrega
                        </Button>
                      )}
                      {order.status === 'delivering' && (
                        <Button size="sm" onClick={() => updateDeliveryStatus(order.id, 'delivered')}>
                          Confirmar entrega
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}

        {/* History */}
        <section>
          <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-success" />
            Histórico de Entregas
          </h2>
          {myCompletedOrders.length === 0 ? (
            <Card><CardContent className="p-8 text-center text-muted-foreground">
              <BarChart3 className="w-10 h-10 mx-auto mb-2 opacity-30" />
              Nenhuma entrega concluída ainda
            </CardContent></Card>
          ) : (
            <div className="space-y-2">
              {myCompletedOrders.slice(0, 10).map(order => (
                <Card key={order.id}>
                  <CardContent className="p-3 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">#{order.order_number}</p>
                      <p className="text-xs text-muted-foreground">{order.store?.name} • {new Date(order.delivered_at).toLocaleDateString('pt-BR')}</p>
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
