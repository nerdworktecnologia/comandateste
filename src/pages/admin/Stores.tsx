import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Store, Search, Filter, Eye, CheckCircle, XCircle, Ban, RotateCcw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { Store as StoreType, CompanyStatus } from '@/types';

const statusConfig: Record<CompanyStatus, { label: string; color: string }> = {
  pending: { label: 'Pendente', color: 'bg-yellow-500/20 text-yellow-700' },
  approved: { label: 'Aprovada', color: 'bg-green-500/20 text-green-700' },
  rejected: { label: 'Rejeitada', color: 'bg-red-500/20 text-red-700' },
  suspended: { label: 'Suspensa', color: 'bg-gray-500/20 text-gray-700' },
};

export default function AdminStores() {
  const navigate = useNavigate();
  const { user, isAdmin, loading: authLoading } = useAuth();
  const [stores, setStores] = useState<StoreType[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedStore, setSelectedStore] = useState<StoreType | null>(null);

  useEffect(() => {
    if (authLoading) return;
    
    if (!user || !isAdmin) {
      navigate('/');
      return;
    }

    fetchStores();
  }, [user, isAdmin, authLoading, navigate]);

  const fetchStores = async () => {
    const { data, error } = await supabase
      .from('stores')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching stores:', error);
    } else {
      setStores((data || []) as StoreType[]);
    }

    setLoading(false);
  };

  const updateStoreStatus = async (storeId: string, status: CompanyStatus) => {
    const updateData: Record<string, unknown> = { status };
    
    if (status === 'approved') {
      updateData.approved_at = new Date().toISOString();
      updateData.approved_by = user?.id;
    }

    const { error } = await supabase
      .from('stores')
      .update(updateData)
      .eq('id', storeId);

    if (error) {
      toast.error('Erro ao atualizar status');
    } else {
      toast.success(`Status atualizado para: ${statusConfig[status].label}`);
      fetchStores();
      setSelectedStore(null);
    }
  };

  const filteredStores = stores.filter(store => {
    const matchesSearch = store.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          store.city.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || store.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

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
        <header className="sticky top-0 z-40 bg-card border-b border-border px-4 lg:px-6 py-4">
          <div>
            <h1 className="text-xl font-semibold">Gestão de Empresas</h1>
            <p className="text-sm text-muted-foreground">
              Aprove, rejeite ou suspenda empresas na plataforma
            </p>
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
                    placeholder="Buscar por nome ou cidade..."
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

          {/* Stores Table */}
          <Card>
            <CardHeader>
              <CardTitle>Empresas ({filteredStores.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {filteredStores.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Store className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Nenhuma empresa encontrada</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Empresa</TableHead>
                      <TableHead>Cidade</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Cadastro</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredStores.map((store) => (
                      <TableRow key={store.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            {store.logo_url ? (
                              <img 
                                src={store.logo_url} 
                                alt={store.name} 
                                className="w-10 h-10 rounded-lg object-cover"
                              />
                            ) : (
                              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                                <Store className="w-5 h-5 text-primary" />
                              </div>
                            )}
                            <div>
                              <p className="font-medium">{store.name}</p>
                              <p className="text-xs text-muted-foreground">{store.email}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {store.city}, {store.state}
                        </TableCell>
                        <TableCell>
                          <Badge className={statusConfig[store.status].color}>
                            {statusConfig[store.status].label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {new Date(store.created_at).toLocaleDateString('pt-BR')}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedStore(store)}
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            Ver
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Store Details Dialog */}
      <Dialog open={!!selectedStore} onOpenChange={() => setSelectedStore(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalhes da Empresa</DialogTitle>
            <DialogDescription>
              Visualize e gerencie as informações da empresa
            </DialogDescription>
          </DialogHeader>

          {selectedStore && (
            <div className="space-y-6">
              {/* Header */}
              <div className="flex items-center gap-4">
                {selectedStore.logo_url ? (
                  <img 
                    src={selectedStore.logo_url} 
                    alt={selectedStore.name} 
                    className="w-16 h-16 rounded-lg object-cover"
                  />
                ) : (
                  <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Store className="w-8 h-8 text-primary" />
                  </div>
                )}
                <div>
                  <h3 className="text-xl font-semibold">{selectedStore.name}</h3>
                  <Badge className={statusConfig[selectedStore.status].color}>
                    {statusConfig[selectedStore.status].label}
                  </Badge>
                </div>
              </div>

              {/* Details */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Email</p>
                  <p className="font-medium">{selectedStore.email || '-'}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Telefone</p>
                  <p className="font-medium">{selectedStore.phone || '-'}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-muted-foreground">Endereço</p>
                  <p className="font-medium">
                    {selectedStore.address}, {selectedStore.city} - {selectedStore.state}
                    {selectedStore.zip_code && `, CEP: ${selectedStore.zip_code}`}
                  </p>
                </div>
                <div className="col-span-2">
                  <p className="text-muted-foreground">Descrição</p>
                  <p className="font-medium">{selectedStore.description || '-'}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Taxa de entrega</p>
                  <p className="font-medium">R$ {selectedStore.delivery_fee.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Pedido mínimo</p>
                  <p className="font-medium">R$ {selectedStore.min_order_value.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Contrato aceito</p>
                  <p className="font-medium">{selectedStore.contract_accepted ? 'Sim' : 'Não'}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Cadastrado em</p>
                  <p className="font-medium">
                    {new Date(selectedStore.created_at).toLocaleString('pt-BR')}
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-wrap gap-2 pt-4 border-t">
                {selectedStore.status === 'pending' && (
                  <>
                    <Button onClick={() => updateStoreStatus(selectedStore.id, 'approved')}>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Aprovar
                    </Button>
                    <Button 
                      variant="destructive"
                      onClick={() => updateStoreStatus(selectedStore.id, 'rejected')}
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Rejeitar
                    </Button>
                  </>
                )}
                {selectedStore.status === 'approved' && (
                  <Button 
                    variant="destructive"
                    onClick={() => updateStoreStatus(selectedStore.id, 'suspended')}
                  >
                    <Ban className="w-4 h-4 mr-2" />
                    Suspender
                  </Button>
                )}
                {(selectedStore.status === 'rejected' || selectedStore.status === 'suspended') && (
                  <Button onClick={() => updateStoreStatus(selectedStore.id, 'approved')}>
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Reativar
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
