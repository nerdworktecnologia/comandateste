import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Database } from '@/integrations/supabase/types';
import { Plus, Pencil, Trash2, GripVertical, Search } from 'lucide-react';
import { ExportButton } from '@/components/admin/ExportButton';
import { Card, CardContent } from '@/components/ui/card';
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
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';


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

interface SortableRowProps {
  cat: any;
  onEdit: (cat: any) => void;
  onDelete: (id: string) => void;
  onToggle: (id: string, active: boolean) => void;
  isDragging?: boolean;
}

function SortableRow({ cat, onEdit, onDelete, onToggle }: SortableRowProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: cat.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <tr ref={setNodeRef} style={style} className="border-b hover:bg-muted/30">
      <td className="p-3">
        <button {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing p-1 rounded hover:bg-muted">
          <GripVertical className="w-4 h-4 text-muted-foreground" />
        </button>
      </td>
      <td className="p-3 text-muted-foreground text-xs">{cat.sort_order}</td>
      <td className="p-3 text-lg">{cat.icon || '📁'}</td>
      <td className="p-3 font-medium">{cat.name}</td>
      <td className="p-3">
        <Badge variant="secondary">{categoryTypeLabels[cat.category_type] || cat.category_type}</Badge>
      </td>
      <td className="p-3 font-mono text-xs text-muted-foreground hidden sm:table-cell">{cat.slug}</td>
      <td className="p-3">
        <Switch checked={cat.is_active} onCheckedChange={() => onToggle(cat.id, cat.is_active)} />
      </td>
      <td className="p-3">
        <div className="flex gap-1">
          <Button size="sm" variant="ghost" onClick={() => onEdit(cat)}>
            <Pencil className="w-4 h-4" />
          </Button>
          <Button size="sm" variant="ghost" className="text-destructive" onClick={() => onDelete(cat.id)}>
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </td>
    </tr>
  );
}

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

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    const { data } = await supabase
      .from('categories')
      .select('*')
      .order('sort_order', { ascending: true });
    if (data) setCategories(data);
    setLoading(false);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = categories.findIndex(c => c.id === active.id);
    const newIndex = categories.findIndex(c => c.id === over.id);
    const reordered = arrayMove(categories, oldIndex, newIndex);

    // Optimistic update
    setCategories(reordered);

    // Persist new sort_order values
    const updates = reordered.map((cat, i) => 
      supabase.from('categories').update({ sort_order: i }).eq('id', cat.id)
    );
    await Promise.all(updates);
    
    // Refresh to get accurate data
    fetchCategories();
    toast({ title: 'Ordem atualizada!' });
  };

  const openNew = () => {
    setEditingId(null);
    setForm({ ...defaultForm, sort_order: categories.length });
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
      if (error) toast({ title: 'Erro ao atualizar', description: error.message, variant: 'destructive' });
      else toast({ title: 'Categoria atualizada!' });
    } else {
      const { error } = await supabase.from('categories').insert(payload);
      if (error) toast({ title: 'Erro ao criar', description: error.message, variant: 'destructive' });
      else toast({ title: 'Categoria criada!' });
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
    if (error) toast({ title: 'Erro ao excluir', description: error.message, variant: 'destructive' });
    else { toast({ title: 'Categoria excluída' }); fetchCategories(); }
  };

  const isSearching = searchTerm.trim().length > 0;
  const filtered = categories.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (categoryTypeLabels[c.category_type] || '').toLowerCase().includes(searchTerm.toLowerCase())
  );
  const displayList = isSearching ? filtered : categories;

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
            <p className="text-sm text-muted-foreground">Arraste para reordenar • Gerenciar categorias</p>
          </div>
          <div className="flex items-center gap-2">
            <ExportButton
              title="Categorias"
              subtitle="Relatório de categorias da plataforma"
              filename="categorias-comanda"
              columns={[
                { header: 'Ordem', key: 'order', width: 10 },
                { header: 'Ícone', key: 'icon', width: 8 },
                { header: 'Nome', key: 'name', width: 22 },
                { header: 'Tipo', key: 'type', width: 16 },
                { header: 'Slug', key: 'slug', width: 20 },
                { header: 'Ativa', key: 'active', width: 10 },
              ]}
              data={displayList.map(c => ({
                order: c.sort_order,
                icon: c.icon || '📁',
                name: c.name,
                type: categoryTypeLabels[c.category_type] || c.category_type,
                slug: c.slug,
                active: c.is_active ? 'Sim' : 'Não',
              }))}
            />
            <Button onClick={openNew}>
              <Plus className="w-4 h-4 mr-2" /> Nova Categoria
            </Button>
          </div>
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
                      <th className="p-3 w-10"></th>
                      <th className="text-left p-3 font-medium w-16">#</th>
                      <th className="text-left p-3 font-medium">Ícone</th>
                      <th className="text-left p-3 font-medium">Nome</th>
                      <th className="text-left p-3 font-medium">Tipo</th>
                      <th className="text-left p-3 font-medium hidden sm:table-cell">Slug</th>
                      <th className="text-left p-3 font-medium">Ativa</th>
                      <th className="text-left p-3 font-medium">Ações</th>
                    </tr>
                  </thead>
                  <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                    <SortableContext items={displayList.map(c => c.id)} strategy={verticalListSortingStrategy}>
                      <tbody>
                        {displayList.map(cat => (
                          <SortableRow
                            key={cat.id}
                            cat={cat}
                            onEdit={openEdit}
                            onDelete={handleDelete}
                            onToggle={handleToggleActive}
                          />
                        ))}
                        {displayList.length === 0 && (
                          <tr>
                            <td colSpan={8} className="p-8 text-center text-muted-foreground">
                              Nenhuma categoria encontrada
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </SortableContext>
                  </DndContext>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>

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
                    onChange={(e) => setForm({ ...form, name: e.target.value, slug: generateSlug(e.target.value) })}
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
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {Object.entries(categoryTypeLabels).map(([key, label]) => (
                        <SelectItem key={key} value={key}>{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Ícone (emoji)</Label>
                  <Input value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })} placeholder="🛒" />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Descrição</Label>
                <Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Descrição opcional" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Ordem</Label>
                  <Input type="number" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: Number(e.target.value) })} />
                </div>
                <div className="flex items-center gap-3 pt-6">
                  <Switch checked={form.is_active} onCheckedChange={(v) => setForm({ ...form, is_active: v })} />
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
