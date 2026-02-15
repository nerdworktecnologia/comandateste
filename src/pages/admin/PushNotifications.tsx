import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Send, Users, Megaphone } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export default function AdminPushNotifications() {
  const navigate = useNavigate();
  const { user, isAdmin, loading: authLoading } = useAuth();
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [target, setTarget] = useState('all');
  const [sending, setSending] = useState(false);
  const [stats, setStats] = useState({ totalSubscriptions: 0, uniqueUsers: 0 });
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    const { count: totalSubs } = await (supabase as any)
      .from('push_subscriptions')
      .select('*', { count: 'exact', head: true });

    const { data: uniqueData } = await (supabase as any)
      .from('push_subscriptions')
      .select('user_id');

    const uniqueUsers = uniqueData ? new Set(uniqueData.map((d: any) => d.user_id)).size : 0;

    setStats({
      totalSubscriptions: totalSubs || 0,
      uniqueUsers,
    });
  };

  const handleSendPush = async () => {
    if (!title.trim()) {
      toast({ title: 'Título obrigatório', variant: 'destructive' });
      return;
    }

    setSending(true);
    try {
      // Get target user IDs
      let userIds: string[] = [];

      if (target === 'all') {
        const { data } = await (supabase as any)
          .from('push_subscriptions')
          .select('user_id');
        userIds = [...new Set((data || []).map((d: any) => d.user_id))] as string[];
      } else if (target === 'store_owners') {
        const { data } = await supabase
          .from('user_roles')
          .select('user_id')
          .eq('role', 'company_owner');
        userIds = (data || []).map(d => d.user_id);
      } else if (target === 'drivers') {
        const { data } = await supabase
          .from('user_roles')
          .select('user_id')
          .eq('role', 'delivery_driver');
        userIds = (data || []).map(d => d.user_id);
      }

      let totalSent = 0;
      const errors: string[] = [];

      for (const userId of userIds) {
        const { data, error } = await supabase.functions.invoke('send-push-notification', {
          body: { user_id: userId, title, body },
        });

        if (error) {
          errors.push(`Erro para ${userId}: ${error.message}`);
        } else {
          totalSent += data?.sent || 0;
        }
      }

      toast({
        title: 'Push enviado!',
        description: `Enviado para ${totalSent} dispositivo(s) de ${userIds.length} usuário(s).${errors.length ? ` ${errors.length} erro(s).` : ''}`,
      });

      setTitle('');
      setBody('');
    } catch (err: any) {
      toast({ title: 'Erro ao enviar', description: err.message, variant: 'destructive' });
    } finally {
      setSending(false);
    }
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
          <h1 className="text-xl font-semibold">Notificações Push</h1>
          <p className="text-sm text-muted-foreground">Envie notificações push para os usuários</p>
        </header>

        <div className="p-4 lg:p-6 space-y-6">
          {/* Stats */}
          <div className="grid gap-4 sm:grid-cols-2">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Dispositivos Registrados</p>
                    <p className="text-2xl font-bold">{stats.totalSubscriptions}</p>
                  </div>
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <Bell className="w-5 h-5 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Usuários com Push</p>
                    <p className="text-2xl font-bold">{stats.uniqueUsers}</p>
                  </div>
                  <div className="w-10 h-10 bg-secondary/10 rounded-full flex items-center justify-center">
                    <Users className="w-5 h-5 text-secondary-foreground" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Send Push Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Megaphone className="w-5 h-5" />
                Enviar Notificação
              </CardTitle>
              <CardDescription>
                Envie uma notificação push para os usuários da plataforma
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Público-alvo</label>
                <Select value={target} onValueChange={setTarget}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os usuários</SelectItem>
                    <SelectItem value="store_owners">Donos de lojas</SelectItem>
                    <SelectItem value="drivers">Entregadores</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block">Título *</label>
                <Input
                  placeholder="Ex: Novidade no Comanda!"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block">Mensagem</label>
                <Textarea
                  placeholder="Ex: Confira as novas funcionalidades..."
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  rows={3}
                />
              </div>

              <Button
                onClick={handleSendPush}
                disabled={sending || !title.trim()}
                className="w-full"
              >
                <Send className="w-4 h-4 mr-2" />
                {sending ? 'Enviando...' : 'Enviar Notificação'}
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
