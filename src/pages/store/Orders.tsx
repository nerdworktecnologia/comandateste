import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, Package, ClipboardList, Settings, 
  LogOut, Search, Filter, Eye, Clock, CheckCircle,
  XCircle, Truck, ChefHat
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Logo } from '@/components/Logo';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useOrderNotifications } from '@/hooks/useOrderNotifications';
import type { Store, Order, OrderItem, OrderStatus } from '@/types';

const statusConfig: Record<OrderStatus, { label: string; color: string; icon: React.ElementType }> = {
  pending: { label: 'Pendente', color: 'bg-yellow-500/20 text-yellow-700', icon: Clock },
  confirmed: { label: 'Confirmado', color: 'bg-blue-500/20 text-blue-700', icon: CheckCircle },
  preparing: { label: 'Preparando', color: 'bg-orange-500/20 text-orange-700', icon: ChefHat },
  ready: { label: 'Pronto', color: 'bg-green-500/20 text-green-700', icon: Package },
  picked_up: { label: 'Retirado', color: 'bg-purple-500/20 text-purple-700', icon: Truck },
  delivering: { label: 'Em entrega', color: 'bg-indigo-500/20 text-indigo-700', icon: Truck },
  delivered: { label: 'Entregue', color: 'bg-green-600/20 text-green-800', icon: CheckCircle },
  cancelled: { label: 'Cancelado', color: 'bg-red-500/20 text-red-700', icon: XCircle },
};

const statusFlow: OrderStatus[] = ['pending', 'confirmed', 'preparing', 'ready', 'picked_up', 'delivering', 'delivered'];

export default function StoreOrders() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [store, setStore] = useState<Store | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  // Enable real-time notifications for new orders
  useOrderNotifications({ 
    storeId: store?.id, 
    enabled: !!store && store.status === 'approved' 
  });

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    fetchStoreAndOrders();
  }, [user, navigate]);

  const fetchStoreAndOrders = async () => {
    if (!user) return;

    const { data: storeData, error: storeError } = await supabase
      .from('stores')
      .select('*')
      .eq('owner_id', user.id)
      .maybeSingle();

    if (storeError || !storeData) {
      navigate('/store/dashboard');
      return;
    }

    setStore(storeData as Store);

    const { data: ordersData, error: ordersError } = await supabase
      .from('orders')
      .select('*')
      .eq('store_id', storeData.id)
      .order('created_at', { ascending: false });

    if (ordersError) {
      console.error('Error fetching orders:', ordersError);
      toast.error('Erro ao carregar pedidos');
    } else {
      setOrders((ordersData || []) as Order[]);
    }

    setLoading(false);
  };

  const fetchOrderItems = async (orderId: string) => {
    const { data, error } = await supabase
      .from('order_items')
      .select('*')
      .eq('order_id', orderId);

    if (error) {
      console.error('Error fetching order items:', error);
      return;
    }

    setOrderItems((data || []) as OrderItem[]);
  };

  const handleViewOrder = async (order: Order) => {
    setSelectedOrder(order);
    await fetchOrderItems(order.id);
  };

  const handleUpdateStatus = async (newStatus: OrderStatus) => {
    if (!selectedOrder) return;

    setUpdatingStatus(true);

    const updateData: Record<string, unknown> = { status: newStatus };
    
    // Add timestamp for specific status changes
    const now = new Date().toISOString();
    if (newStatus === 'confirmed') updateData.confirmed_at = now;
    if (newStatus === 'preparing') updateData.preparing_at = now;
    if (newStatus === 'ready') updateData.ready_at = now;
    if (newStatus === 'picked_up') updateData.picked_up_at = now;
    if (newStatus === 'delivered') updateData.delivered_at = now;
    if (newStatus === 'cancelled') updateData.cancelled_at = now;

    const { error } = await supabase
      .from('orders')
      .update(updateData)
      .eq('id', selectedOrder.id);

    if (error) {
      console.error('Error updating order:', error);
      toast.error('Erro ao atualizar pedido');
    } else {
      toast.success(`Pedido atualizado para: ${statusConfig[newStatus].label}`);
      setSelectedOrder({ ...selectedOrder, status: newStatus });
      setOrders(orders.map(o => o.id === selectedOrder.id ? { ...o, status: newStatus } : o));
    }

    setUpdatingStatus(false);
  };

  const getNextStatus = (currentStatus: OrderStatus): OrderStatus | null => {
    const currentIndex = statusFlow.indexOf(currentStatus);
    if (currentIndex === -1 || currentIndex >= statusFlow.length - 1) return null;
    return statusFlow[currentIndex + 1];
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.order_number.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

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
            className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-secondary-foreground/10 transition-colors"
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
            className="flex items-center gap-3 px-4 py-3 rounded-lg bg-primary text-primary-foreground"
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
        <header className="sticky top-0 z-40 bg-card border-b border-border px-4 lg:px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold">Pedidos</h1>
              <p className="text-sm text-muted-foreground">
                Gerencie os pedidos da sua loja
              </p>
            </div>
          </div>
        </header>

        <div className="p-4 lg:p-6 space-y-6">
          {/* Filters */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por número do pedido..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full sm:w-48">
                    <Filter className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="Filtrar por status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os status</SelectItem>
                    {Object.entries(statusConfig).map(([key, config]) => (
                      <SelectItem key={key} value={key}>{config.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Orders Table */}
          <Card>
            <CardHeader>
              <CardTitle>Lista de Pedidos ({filteredOrders.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {filteredOrders.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <ClipboardList className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Nenhum pedido encontrado</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Pedido</TableHead>
                      <TableHead>Data</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredOrders.map((order) => {
                      const StatusIcon = statusConfig[order.status].icon;
                      return (
                        <TableRow key={order.id}>
                          <TableCell className="font-medium">
                            #{order.order_number}
                          </TableCell>
                          <TableCell>
                            {new Date(order.created_at).toLocaleDateString('pt-BR', {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </TableCell>
                          <TableCell>
                            <Badge className={statusConfig[order.status].color}>
                              <StatusIcon className="w-3 h-3 mr-1" />
                              {statusConfig[order.status].label}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            R$ {order.total.toFixed(2)}
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleViewOrder(order)}
                            >
                              <Eye className="w-4 h-4 mr-1" />
                              Ver
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Order Details Dialog */}
      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Pedido #{selectedOrder?.order_number}
            </DialogTitle>
          </DialogHeader>

          {selectedOrder && (
            <div className="space-y-6">
              {/* Status */}
              <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                <div className="flex items-center gap-3">
                  {(() => {
                    const StatusIcon = statusConfig[selectedOrder.status].icon;
                    return <StatusIcon className="w-6 h-6" />;
                  })()}
                  <div>
                    <p className="font-medium">Status atual</p>
                    <Badge className={statusConfig[selectedOrder.status].color}>
                      {statusConfig[selectedOrder.status].label}
                    </Badge>
                  </div>
                </div>

                {selectedOrder.status !== 'delivered' && selectedOrder.status !== 'cancelled' && (
                  <div className="flex gap-2">
                    {getNextStatus(selectedOrder.status) && (
                      <Button
                        onClick={() => handleUpdateStatus(getNextStatus(selectedOrder.status)!)}
                        disabled={updatingStatus}
                      >
                        Avançar para: {statusConfig[getNextStatus(selectedOrder.status)!].label}
                      </Button>
                    )}
                    <Button
                      variant="destructive"
                      onClick={() => handleUpdateStatus('cancelled')}
                      disabled={updatingStatus}
                    >
                      Cancelar
                    </Button>
                  </div>
                )}
              </div>

              {/* Delivery Info */}
              <div>
                <h4 className="font-semibold mb-2">Endereço de Entrega</h4>
                <div className="p-4 bg-muted rounded-lg text-sm">
                  <p>{selectedOrder.delivery_address}</p>
                  <p>{selectedOrder.delivery_city} - {selectedOrder.delivery_state}</p>
                  {selectedOrder.delivery_zip && <p>CEP: {selectedOrder.delivery_zip}</p>}
                  {selectedOrder.delivery_notes && (
                    <p className="mt-2 text-muted-foreground">
                      Obs: {selectedOrder.delivery_notes}
                    </p>
                  )}
                </div>
              </div>

              {/* Order Items */}
              <div>
                <h4 className="font-semibold mb-2">Itens do Pedido</h4>
                <div className="space-y-2">
                  {orderItems.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <div className="flex items-center gap-3">
                        {item.product_image && (
                          <img
                            src={item.product_image}
                            alt={item.product_name}
                            className="w-12 h-12 object-cover rounded"
                          />
                        )}
                        <div>
                          <p className="font-medium">{item.product_name}</p>
                          <p className="text-sm text-muted-foreground">
                            {item.quantity}x R$ {item.unit_price.toFixed(2)}
                          </p>
                        </div>
                      </div>
                      <p className="font-medium">R$ {item.total_price.toFixed(2)}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Totals */}
              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Subtotal</span>
                  <span>R$ {selectedOrder.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Taxa de entrega</span>
                  <span>R$ {selectedOrder.delivery_fee.toFixed(2)}</span>
                </div>
                {selectedOrder.discount > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Desconto</span>
                    <span>- R$ {selectedOrder.discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-lg pt-2 border-t">
                  <span>Total</span>
                  <span>R$ {selectedOrder.total.toFixed(2)}</span>
                </div>
              </div>

              {/* Timestamps */}
              <div className="text-xs text-muted-foreground space-y-1">
                <p>Criado em: {new Date(selectedOrder.created_at).toLocaleString('pt-BR')}</p>
                {selectedOrder.confirmed_at && (
                  <p>Confirmado em: {new Date(selectedOrder.confirmed_at).toLocaleString('pt-BR')}</p>
                )}
                {selectedOrder.preparing_at && (
                  <p>Preparação iniciada em: {new Date(selectedOrder.preparing_at).toLocaleString('pt-BR')}</p>
                )}
                {selectedOrder.ready_at && (
                  <p>Pronto em: {new Date(selectedOrder.ready_at).toLocaleString('pt-BR')}</p>
                )}
                {selectedOrder.delivered_at && (
                  <p>Entregue em: {new Date(selectedOrder.delivered_at).toLocaleString('pt-BR')}</p>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
