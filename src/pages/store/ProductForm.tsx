import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, Package, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Logo } from '@/components/Logo';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { Store, Product } from '@/types';

const productSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  description: z.string().optional(),
  price: z.string().min(1, 'Preço obrigatório'),
  original_price: z.string().optional(),
  stock_quantity: z.string().optional(),
  expiry_date: z.string().optional(),
  requires_prescription: z.boolean().optional(),
  pharmaceutical_warning: z.string().optional(),
  is_available: z.boolean().optional(),
});

type ProductForm = z.infer<typeof productSchema>;

export default function ProductForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useAuth();
  const [store, setStore] = useState<Store | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const isEditing = !!id;

  const form = useForm<ProductForm>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      is_available: true,
      requires_prescription: false,
    }
  });

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }

    fetchData();
  }, [user, navigate, id]);

  const fetchData = async () => {
    if (!user) return;

    // Fetch store
    const { data: storeData } = await supabase
      .from('stores')
      .select('*')
      .eq('owner_id', user.id)
      .maybeSingle();

    if (!storeData) {
      navigate('/store/register');
      return;
    }

    setStore(storeData as Store);

    // If editing, fetch product
    if (id) {
      const { data: productData } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .eq('store_id', storeData.id)
        .maybeSingle();

      if (productData) {
        const product = productData as Product;
        form.reset({
          name: product.name,
          description: product.description || '',
          price: product.price.toString(),
          original_price: product.original_price?.toString() || '',
          stock_quantity: product.stock_quantity.toString(),
          expiry_date: product.expiry_date || '',
          requires_prescription: product.requires_prescription,
          pharmaceutical_warning: product.pharmaceutical_warning || '',
          is_available: product.is_available,
        });
      }
    }

    setLoading(false);
  };

  const handleSubmit = async (data: ProductForm) => {
    if (!store) return;

    setSaving(true);

    const productData = {
      store_id: store.id,
      name: data.name,
      description: data.description || null,
      price: parseFloat(data.price),
      original_price: data.original_price ? parseFloat(data.original_price) : null,
      discount_percent: data.original_price 
        ? Math.round((1 - parseFloat(data.price) / parseFloat(data.original_price)) * 100)
        : 0,
      stock_quantity: parseInt(data.stock_quantity || '0'),
      expiry_date: data.expiry_date || null,
      requires_prescription: data.requires_prescription || false,
      pharmaceutical_warning: data.pharmaceutical_warning || null,
      is_available: data.is_available ?? true,
    };

    let error;

    if (isEditing) {
      const result = await supabase
        .from('products')
        .update(productData)
        .eq('id', id);
      error = result.error;
    } else {
      const result = await supabase
        .from('products')
        .insert(productData);
      error = result.error;
    }

    setSaving(false);

    if (error) {
      console.error('Error saving product:', error);
      toast.error('Erro ao salvar produto');
      return;
    }

    toast.success(isEditing ? 'Produto atualizado!' : 'Produto criado!');
    navigate('/store/products');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 bg-card border-b border-border">
        <div className="container mx-auto px-4 py-3 flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/store/products')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <Logo size="sm" />
          <span className="text-muted-foreground">/</span>
          <span className="font-medium">{isEditing ? 'Editar Produto' : 'Novo Produto'}</span>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="w-5 h-5 text-primary" />
              {isEditing ? 'Editar Produto' : 'Novo Produto'}
            </CardTitle>
          </CardHeader>

          <CardContent>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
              {/* Image Upload Placeholder */}
              <div className="space-y-2">
                <Label>Imagem do Produto</Label>
                <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                  <Upload className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">
                    Arraste uma imagem ou clique para selecionar
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    PNG, JPG até 5MB
                  </p>
                </div>
              </div>

              {/* Basic Info */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome do Produto *</Label>
                  <Input
                    id="name"
                    placeholder="Ex: Arroz Integral 1kg"
                    {...form.register('name')}
                  />
                  {form.formState.errors.name && (
                    <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Descrição</Label>
                  <Textarea
                    id="description"
                    placeholder="Descreva o produto..."
                    rows={3}
                    {...form.register('description')}
                  />
                </div>
              </div>

              {/* Pricing */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="price">Preço de Venda (R$) *</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    {...form.register('price')}
                  />
                  {form.formState.errors.price && (
                    <p className="text-sm text-destructive">{form.formState.errors.price.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="original_price">Preço Original (R$)</Label>
                  <Input
                    id="original_price"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    {...form.register('original_price')}
                  />
                  <p className="text-xs text-muted-foreground">Para mostrar desconto</p>
                </div>
              </div>

              {/* Stock & Expiry */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="stock_quantity">Quantidade em Estoque</Label>
                  <Input
                    id="stock_quantity"
                    type="number"
                    placeholder="0"
                    {...form.register('stock_quantity')}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="expiry_date">Data de Validade</Label>
                  <Input
                    id="expiry_date"
                    type="date"
                    {...form.register('expiry_date')}
                  />
                </div>
              </div>

              {/* Pharmacy specific */}
              <div className="space-y-4 p-4 bg-muted rounded-lg">
                <h4 className="font-medium">Configurações de Farmácia</h4>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="requires_prescription">Requer Receita Médica</Label>
                    <p className="text-sm text-muted-foreground">
                      Marque se o produto necessita de prescrição
                    </p>
                  </div>
                  <Switch
                    id="requires_prescription"
                    checked={form.watch('requires_prescription')}
                    onCheckedChange={(checked) => form.setValue('requires_prescription', checked)}
                  />
                </div>

                {form.watch('requires_prescription') && (
                  <div className="space-y-2">
                    <Label htmlFor="pharmaceutical_warning">Aviso Farmacêutico</Label>
                    <Textarea
                      id="pharmaceutical_warning"
                      placeholder="Ex: Este medicamento é contraindicado para..."
                      rows={2}
                      {...form.register('pharmaceutical_warning')}
                    />
                  </div>
                )}
              </div>

              {/* Availability */}
              <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                <div>
                  <Label htmlFor="is_available">Disponível para Venda</Label>
                  <p className="text-sm text-muted-foreground">
                    Produto visível para os clientes
                  </p>
                </div>
                <Switch
                  id="is_available"
                  checked={form.watch('is_available')}
                  onCheckedChange={(checked) => form.setValue('is_available', checked)}
                />
              </div>

              {/* Actions */}
              <div className="flex gap-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => navigate('/store/products')}
                >
                  Cancelar
                </Button>
                <Button 
                  type="submit" 
                  className="flex-1"
                  disabled={saving}
                >
                  {saving ? 'Salvando...' : (isEditing ? 'Atualizar' : 'Criar Produto')}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
