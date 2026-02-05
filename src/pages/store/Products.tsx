import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Plus, Search, Edit, Trash2, 
  Package, MoreVertical, Clock, Eye, EyeOff
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Logo } from '@/components/Logo';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { Product, Store } from '@/types';

export default function StoreProducts() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [store, setStore] = useState<Store | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteProduct, setDeleteProduct] = useState<Product | null>(null);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }

    fetchData();
  }, [user, navigate]);

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

    // Fetch products
    const { data: productsData } = await supabase
      .from('products')
      .select('*')
      .eq('store_id', storeData.id)
      .order('created_at', { ascending: false });

    if (productsData) {
      setProducts(productsData as Product[]);
    }

    setLoading(false);
  };

  const handleToggleAvailability = async (product: Product) => {
    const { error } = await supabase
      .from('products')
      .update({ is_available: !product.is_available })
      .eq('id', product.id);

    if (error) {
      toast.error('Erro ao atualizar produto');
      return;
    }

    setProducts(products.map(p => 
      p.id === product.id ? { ...p, is_available: !p.is_available } : p
    ));
    toast.success(product.is_available ? 'Produto desativado' : 'Produto ativado');
  };

  const handleDelete = async () => {
    if (!deleteProduct) return;

    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', deleteProduct.id);

    if (error) {
      toast.error('Erro ao excluir produto');
      return;
    }

    setProducts(products.filter(p => p.id !== deleteProduct.id));
    setDeleteProduct(null);
    toast.success('Produto excluído');
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
          <Button variant="ghost" size="icon" onClick={() => navigate('/store/dashboard')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <Logo size="sm" />
          <span className="text-muted-foreground">/</span>
          <span className="font-medium">Produtos</span>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar produtos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button asChild>
            <Link to="/store/products/new">
              <Plus className="w-4 h-4 mr-2" />
              Novo Produto
            </Link>
          </Button>
        </div>

        {/* Products Grid */}
        {filteredProducts.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Package className="w-16 h-16 text-muted-foreground/50 mb-4" />
              <h3 className="font-semibold text-lg mb-2">Nenhum produto cadastrado</h3>
              <p className="text-muted-foreground text-center mb-4">
                Adicione seus primeiros produtos para começar a vender
              </p>
              <Button asChild>
                <Link to="/store/products/new">
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar Produto
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredProducts.map((product) => (
              <Card key={product.id} className={!product.is_available ? 'opacity-60' : ''}>
                <div className="relative aspect-square bg-muted">
                  {product.image_url ? (
                    <img 
                      src={product.image_url} 
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package className="w-12 h-12 text-muted-foreground/50" />
                    </div>
                  )}

                  {/* Badges */}
                  <div className="absolute top-2 left-2 flex flex-col gap-1">
                    {!product.is_available && (
                      <Badge variant="secondary">Indisponível</Badge>
                    )}
                    {product.expiry_date && (
                      <Badge className="bg-secondary text-secondary-foreground">
                        <Clock className="w-3 h-3 mr-1" />
                        {new Date(product.expiry_date).toLocaleDateString('pt-BR')}
                      </Badge>
                    )}
                  </div>

                  {/* Actions */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button 
                        variant="secondary" 
                        size="icon" 
                        className="absolute top-2 right-2 h-8 w-8"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => navigate(`/store/products/${product.id}/edit`)}>
                        <Edit className="w-4 h-4 mr-2" />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleToggleAvailability(product)}>
                        {product.is_available ? (
                          <>
                            <EyeOff className="w-4 h-4 mr-2" />
                            Desativar
                          </>
                        ) : (
                          <>
                            <Eye className="w-4 h-4 mr-2" />
                            Ativar
                          </>
                        )}
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        className="text-destructive"
                        onClick={() => setDeleteProduct(product)}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Excluir
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <CardContent className="p-4">
                  <h3 className="font-medium truncate">{product.name}</h3>
                  <div className="flex items-center justify-between mt-2">
                    <div>
                      {product.original_price && product.original_price > product.price && (
                        <span className="text-xs text-muted-foreground line-through block">
                          R$ {product.original_price.toFixed(2)}
                        </span>
                      )}
                      <span className="font-bold text-primary">
                        R$ {product.price.toFixed(2)}
                      </span>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      Estoque: {product.stock_quantity}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteProduct} onOpenChange={() => setDeleteProduct(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir produto?</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir "{deleteProduct?.name}"? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
