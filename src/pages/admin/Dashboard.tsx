import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Store, Users, ClipboardList, TrendingUp, Clock, CheckCircle, XCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import type { Store as StoreType } from '@/types';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { user, isAdmin, loading: authLoading } = useAuth();
  const [stats, setStats] = useState({
    totalStores: 0,
    pendingStores: 0,
    approvedStores: 0,
    totalOrders: 0,
    totalUsers: 0,
  });
  const [pendingStores, setPendingStores] = useState<StoreType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    
    if (!user) {
      navigate('/auth');
      return;
    }

    if (!isAdmin) {
      navigate('/');
      return;
    }

    fetchDashboardData();
  }, [user, isAdmin, authLoading, navigate]);

  const fetchDashboardData = async () => {
    // Fetch store counts
    const { count: totalStores } = await supabase
      .from('stores')
      .select('*', { count: 'exact', head: true });

    const { count: pendingCount } = await supabase
      .from('stores')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending');

    const { count: approvedCount } = await supabase
      .from('stores')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'approved');

    // Fetch order count
    const { count: totalOrders } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true });

    // Fetch user count
    const { count: totalUsers } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true });

    setStats({
      totalStores: totalStores || 0,
      pendingStores: pendingCount || 0,
      approvedStores: approvedCount || 0,
      totalOrders: totalOrders || 0,
      totalUsers: totalUsers || 0,
    });

    // Fetch pending stores
    const { data: pending } = await supabase
      .from('stores')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: false })
      .limit(5);

    if (pending) {
      setPendingStores(pending as StoreType[]);
    }

    setLoading(false);
  };

  const handleApproveStore = async (storeId: string) => {
    const { error } = await supabase
      .from('stores')
      .update({ 
        status: 'approved', 
        approved_at: new Date().toISOString(),
        approved_by: user?.id 
      })
      .eq('id', storeId);

    if (!error) {
      fetchDashboardData();
    }
  };

  const handleRejectStore = async (storeId: string) => {
    const { error } = await supabase
      .from('stores')
      .update({ status: 'rejected' })
      .eq('id', storeId);

    if (!error) {
      fetchDashboardData();
    }
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
        <header className="sticky top-0 z-40 bg-card border-b border-border px-4 lg:px-6 py-4">
          <div>
            <h1 className="text-xl font-semibold">Dashboard</h1>
            <p className="text-sm text-muted-foreground">
              Visão geral da plataforma
            </p>
          </div>
        </header>

        <div className="p-4 lg:p-6 space-y-6">
          {/* Stats */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Empresas</p>
                    <p className="text-2xl font-bold">{stats.totalStores}</p>
                  </div>
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <Store className="w-5 h-5 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Aguardando Aprovação</p>
                    <p className="text-2xl font-bold">{stats.pendingStores}</p>
                  </div>
                  <div className="w-10 h-10 bg-yellow-500/10 rounded-full flex items-center justify-center">
                    <Clock className="w-5 h-5 text-yellow-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Pedidos</p>
                    <p className="text-2xl font-bold">{stats.totalOrders}</p>
                  </div>
                  <div className="w-10 h-10 bg-accent/10 rounded-full flex items-center justify-center">
                    <ClipboardList className="w-5 h-5 text-accent-foreground" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Usuários</p>
                    <p className="text-2xl font-bold">{stats.totalUsers}</p>
                  </div>
                  <div className="w-10 h-10 bg-secondary/10 rounded-full flex items-center justify-center">
                    <Users className="w-5 h-5 text-secondary-foreground" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Pending Stores */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Empresas Pendentes</CardTitle>
                <CardDescription>
                  Empresas aguardando aprovação para operar na plataforma
                </CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={() => navigate('/admin/stores')}>
                Ver todas
              </Button>
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
                          <img 
                            src={store.logo_url} 
                            alt={store.name} 
                            className="w-12 h-12 rounded-lg object-cover"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                            <Store className="w-6 h-6 text-primary" />
                          </div>
                        )}
                        <div>
                          <p className="font-medium">{store.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {store.city}, {store.state}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Cadastrado em {new Date(store.created_at).toLocaleDateString('pt-BR')}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-destructive"
                          onClick={() => handleRejectStore(store.id)}
                        >
                          <XCircle className="w-4 h-4 mr-1" />
                          Rejeitar
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleApproveStore(store.id)}
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Aprovar
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
