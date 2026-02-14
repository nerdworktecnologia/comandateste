import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Database } from '@/integrations/supabase/types';
import { Plus, Pencil, Trash2, GripVertical, Search } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

const categoryTypeLabels: Record<string, string> = {
  supermarket: 'Supermercado',
  pharmacy: 'Farmácia',
  cosmetics: 'Cosméticos',
  drinks: 'Bebidas',
  petshop: 'Pet Shop',
  restaurant: 'Restaurante',
  other: 'Outro',
};

const defaultForm = {
  name: '',
  slug: '',
  description: '',
  icon: '',
  category_type: 'other' as Database['public']['Enums']['category_type'],
  is_active: true,
  sort_order: 0,
};

export default function AdminCategories() {
  const navigate = useNavigate();
  const { user, isAdmin, loading: authLoading } = useAuth();
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(defaultForm);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!user) { navigate('/auth'); return; }
    if (!isAdmin) { navigate('/'); return; }
    fetchCategories();
  }, [user, isAdmin, authLoading, navigate]);

  const fetchCategories = async () => {
    const { data } = await supabase
      .from('categories')
      .select('*')
      .order('sort_order', { ascending: true });
    if (data) setCategories(data);
    setLoading(false);
  };

  const openNew = () => {
    setEditingId(null);
    setForm(defaultForm);
    setDialogOpen(true);
  };

  const openEdit = (cat: any) => {
    setEditingId(cat.id);
    setForm({
      name: cat.name,
      slug: cat.slug,
      description: cat.description || '',
      icon: cat.icon || '',
      category_type: cat.category_type,
      is_active: cat.is_active,
      sort_order: cat.sort_order || 0,
    });
    setDialogOpen(true);
  };

  const generateSlug = (name: string) =>
    name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

  const handleSave = async () => {
    if (!form.name.trim()) {
      toast({ title: 'Nome obrigatório', variant: 'destructive' });
      return;
    }

    setSaving(true);
    const slug = form.slug.trim() || generateSlug(form.name);
    const payload = { ...form, slug };

    if (editingId) {
      const { error } = await supabase.from('categories').update(payload).eq('id', editingId);
      if (error) {
        toast({ title: 'Erro ao atualizar', description: error.message, variant: 'destructive' });
      } else {
        toast({ title: 'Categoria atualizada!' });
      }
    } else {
      const { error } = await supabase.from('categories').insert(payload);
      if (error) {
        toast({ title: 'Erro ao criar', description: error.message, variant: 'destructive' });
      } else {
        toast({ title: 'Categoria criada!' });
      }
    }

    setSaving(false);
    setDialogOpen(false);
    fetchCategories();
  };

  const handleToggleActive = async (id: string, currentState: boolean) => {
    await supabase.from('categories').update({ is_active: !currentState }).eq('id', id);
    fetchCategories();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta categoria?')) return;
    const { error } = await supabase.from('categories').delete().eq('id', id);
    if (error) {
      toast({ title: 'Erro ao excluir', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Categoria excluída' });
      fetchCategories();
    }
  };

  const filtered = categories.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (categoryTypeLabels[c.category_type] || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

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
            <h1 className="text-xl font-semibold">Categorias</h1>
            <p className="text-sm text-muted-foreground">Gerenciar categorias da plataforma</p>
          </div>
          <Button onClick={openNew}>
            <Plus className="w-4 h-4 mr-2" /> Nova Categoria
          </Button>
        </header>

        <div className="p-4 lg:p-6 space-y-4">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar categorias..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="text-left p-3 font-medium">Ordem</th>
                      <th className="text-left p-3 font-medium">Ícone</th>
                      <th className="text-left p-3 font-medium">Nome</th>
                      <th className="text-left p-3 font-medium">Tipo</th>
                      <th className="text-left p-3 font-medium">Slug</th>
                      <th className="text-left p-3 font-medium">Ativa</th>
                      <th className="text-left p-3 font-medium">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map(cat => (
                      <tr key={cat.id} className="border-b hover:bg-muted/30">
                        <td className="p-3 text-muted-foreground">{cat.sort_order}</td>
                        <td className="p-3 text-lg">{cat.icon || '📁'}</td>
                        <td className="p-3 font-medium">{cat.name}</td>
                        <td className="p-3">
                          <Badge variant="secondary">{categoryTypeLabels[cat.category_type] || cat.category_type}</Badge>
                        </td>
                        <td className="p-3 font-mono text-xs text-muted-foreground">{cat.slug}</td>
                        <td className="p-3">
                          <Switch
                            checked={cat.is_active}
                            onCheckedChange={() => handleToggleActive(cat.id, cat.is_active)}
                          />
                        </td>
                        <td className="p-3">
                          <div className="flex gap-1">
                            <Button size="sm" variant="ghost" onClick={() => openEdit(cat)}>
                              <Pencil className="w-4 h-4" />
                            </Button>
                            <Button size="sm" variant="ghost" className="text-destructive" onClick={() => handleDelete(cat.id)}>
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {filtered.length === 0 && (
                      <tr>
                        <td colSpan={7} className="p-8 text-center text-muted-foreground">
                          Nenhuma categoria encontrada
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Dialog criar/editar */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingId ? 'Editar Categoria' : 'Nova Categoria'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Nome *</Label>
                  <Input
                    value={form.name}
                    onChange={(e) => {
                      setForm({ ...form, name: e.target.value, slug: generateSlug(e.target.value) });
                    }}
                    placeholder="Ex: Supermercados"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Slug</Label>
                  <Input
                    value={form.slug}
                    onChange={(e) => setForm({ ...form, slug: e.target.value })}
                    placeholder="auto-gerado"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Tipo</Label>
                  <Select value={form.category_type} onValueChange={(v) => setForm({ ...form, category_type: v as Database['public']['Enums']['category_type'] })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(categoryTypeLabels).map(([key, label]) => (
                        <SelectItem key={key} value={key}>{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Ícone (emoji)</Label>
                  <Input
                    value={form.icon}
                    onChange={(e) => setForm({ ...form, icon: e.target.value })}
                    placeholder="🛒"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Descrição</Label>
                <Input
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Descrição opcional"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Ordem</Label>
                  <Input
                    type="number"
                    value={form.sort_order}
                    onChange={(e) => setForm({ ...form, sort_order: Number(e.target.value) })}
                  />
                </div>
                <div className="flex items-center gap-3 pt-6">
                  <Switch
                    checked={form.is_active}
                    onCheckedChange={(v) => setForm({ ...form, is_active: v })}
                  />
                  <Label>Ativa</Label>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
              <Button onClick={handleSave} disabled={saving}>
                {saving ? 'Salvando...' : editingId ? 'Atualizar' : 'Criar'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}
