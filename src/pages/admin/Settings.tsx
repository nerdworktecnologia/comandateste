import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Settings, Shield, Database, Bell } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export default function AdminSettings() {
  const navigate = useNavigate();
  const { user, isAdmin, loading: authLoading } = useAuth();
  const [platformStats, setPlatformStats] = useState({
    stores: 0,
    products: 0,
    orders: 0,
    users: 0,
    pushSubs: 0,
  });

  useEffect(() => {
    if (authLoading) return;
    if (!user) { navigate('/auth'); return; }
    if (!isAdmin) { navigate('/'); return; }
    fetchPlatformStats();
  }, [user, isAdmin, authLoading, navigate]);

  const fetchPlatformStats = async () => {
    const [stores, products, orders, users, pushSubs] = await Promise.all([
      supabase.from('stores').select('*', { count: 'exact', head: true }),
      supabase.from('products').select('*', { count: 'exact', head: true }),
      supabase.from('orders').select('*', { count: 'exact', head: true }),
      supabase.from('profiles').select('*', { count: 'exact', head: true }),
      (supabase as any).from('push_subscriptions').select('*', { count: 'exact', head: true }),
    ]);

    setPlatformStats({
      stores: stores.count || 0,
      products: products.count || 0,
      orders: orders.count || 0,
      users: users.count || 0,
      pushSubs: pushSubs.count || 0,
    });
  };

  if (authLoading) {
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
          <h1 className="text-xl font-semibold">Configurações</h1>
          <p className="text-sm text-muted-foreground">Configurações gerais da plataforma</p>
        </header>

        <div className="p-4 lg:p-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="w-5 h-5" />
                Visão Geral da Plataforma
              </CardTitle>
              <CardDescription>Resumo dos dados cadastrados</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {[
                  { label: 'Empresas', value: platformStats.stores },
                  { label: 'Produtos', value: platformStats.products },
                  { label: 'Pedidos', value: platformStats.orders },
                  { label: 'Usuários', value: platformStats.users },
                  { label: 'Push Subs', value: platformStats.pushSubs },
                ].map(stat => (
                  <div key={stat.label} className="text-center p-4 bg-muted/50 rounded-lg">
                    <p className="text-2xl font-bold">{stat.value}</p>
                    <p className="text-xs text-muted-foreground">{stat.label}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Informações do Sistema
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">Autenticação</span>
                <Badge variant="secondary">Email + Google OAuth</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Push Notifications</span>
                <Badge variant="secondary">Web Push (VAPID)</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Banco de Dados</span>
                <Badge variant="secondary">Lovable Cloud</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">RLS (Row Level Security)</span>
                <Badge className="bg-green-100 text-green-800">Ativo</Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
