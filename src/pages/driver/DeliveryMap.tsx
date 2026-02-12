import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  Truck, Package, Navigation, DollarSign, MapPin, 
  LogOut, Menu, X, Locate, Clock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
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

export default function DeliveryMap() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, signOut, isDriver } = useAuth();
  const [activeOrders, setActiveOrders] = useState<any[]>([]);
  const [currentPosition, setCurrentPosition] = useState<{ lat: number; lng: number } | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (!user) { navigate('/auth'); return; }
    if (!isDriver) { navigate('/'); return; }
    fetchActiveOrders();
    getCurrentLocation();
  }, [user, isDriver]);

  const fetchActiveOrders = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('orders')
      .select('*, store:stores(name, address, city, latitude, longitude)')
      .eq('driver_id', user.id)
      .in('status', ['picked_up', 'delivering'])
      .order('created_at', { ascending: false });
    setActiveOrders(data || []);
  };

  const getCurrentLocation = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.watchPosition(
        (position) => {
          const pos = { lat: position.coords.latitude, lng: position.coords.longitude };
          setCurrentPosition(pos);
          // Update driver position in database
          if (user) {
            supabase
              .from('delivery_drivers')
              .update({ current_latitude: pos.lat, current_longitude: pos.lng })
              .eq('user_id', user.id)
              .then();
          }
        },
        () => toast.error('Não foi possível obter sua localização'),
        { enableHighAccuracy: true, timeout: 10000 }
      );
    }
  };

  const openNavigation = (address: string) => {
    const encoded = encodeURIComponent(address);
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${encoded}`, '_blank');
  };

  const handleLogout = async () => { await signOut(); navigate('/'); };

  return (
    <div className="min-h-screen bg-background flex flex-col">
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

      <main className="flex-1 container mx-auto px-4 py-6 max-w-4xl space-y-6">
        {/* Location status */}
        <Card className="border-primary/20">
          <CardContent className="p-4 flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${currentPosition ? 'bg-green-100' : 'bg-muted'}`}>
              <Locate className={`w-5 h-5 ${currentPosition ? 'text-green-600' : 'text-muted-foreground'}`} />
            </div>
            <div className="flex-1">
              <p className="font-medium text-sm">
                {currentPosition ? 'Localização ativa' : 'Buscando localização...'}
              </p>
              {currentPosition && (
                <p className="text-xs text-muted-foreground">
                  {currentPosition.lat.toFixed(4)}, {currentPosition.lng.toFixed(4)}
                </p>
              )}
            </div>
            <Button size="sm" variant="outline" onClick={getCurrentLocation}>
              Atualizar
            </Button>
          </CardContent>
        </Card>

        {/* Active deliveries with navigation */}
        <section>
          <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <Navigation className="w-5 h-5 text-primary" />
            Entregas Ativas — Navegação
          </h2>
          {activeOrders.length === 0 ? (
            <Card><CardContent className="p-8 text-center text-muted-foreground">
              <Navigation className="w-10 h-10 mx-auto mb-2 opacity-30" />
              Nenhuma entrega ativa para navegar
            </CardContent></Card>
          ) : (
            <div className="space-y-3">
              {activeOrders.map(order => (
                <Card key={order.id}>
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-semibold">#{order.order_number}</p>
                        <p className="text-sm text-muted-foreground">{order.store?.name}</p>
                      </div>
                      <Badge variant={order.status === 'delivering' ? 'default' : 'secondary'}>
                        {order.status === 'delivering' ? 'Em entrega' : 'Retirado'}
                      </Badge>
                    </div>

                    {/* Pickup location */}
                    <div className="bg-muted/50 rounded-lg p-3 space-y-2">
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Retirada</p>
                      <div className="flex items-center justify-between">
                        <p className="text-sm flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-primary" />
                          {order.store?.address}, {order.store?.city}
                        </p>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => openNavigation(`${order.store?.address}, ${order.store?.city}`)}
                          className="gap-1"
                        >
                          <Navigation className="w-3 h-3" /> Ir
                        </Button>
                      </div>
                    </div>

                    {/* Delivery location */}
                    <div className="bg-primary/5 rounded-lg p-3 space-y-2">
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Entrega</p>
                      <div className="flex items-center justify-between">
                        <p className="text-sm flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-destructive" />
                          {order.delivery_address}, {order.delivery_city}
                        </p>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => openNavigation(`${order.delivery_address}, ${order.delivery_city}`)}
                          className="gap-1"
                        >
                          <Navigation className="w-3 h-3" /> Ir
                        </Button>
                      </div>
                    </div>

                    {order.delivery_notes && (
                      <p className="text-xs text-muted-foreground bg-muted/30 p-2 rounded">
                        <Clock className="w-3 h-3 inline mr-1" />
                        Obs: {order.delivery_notes}
                      </p>
                    )}
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
