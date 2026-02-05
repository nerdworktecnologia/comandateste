import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Star, Clock, MapPin, Phone, Search, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useCart } from '@/contexts/CartContext';
import { toast } from 'sonner';
import type { Store, Product, Category } from '@/types';

export default function StorePage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const [store, setStore] = useState<Store | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    if (slug) {
      fetchStoreData();
    }
  }, [slug]);

  const fetchStoreData = async () => {
    // Fetch store by slug
    const { data: storeData, error: storeError } = await supabase
      .from('stores')
      .select('*')
      .eq('slug', slug)
      .eq('status', 'approved')
      .single();

    if (storeError || !storeData) {
      navigate('/');
      return;
    }

    setStore(storeData as Store);

    // Fetch products
    const { data: productsData } = await supabase
      .from('products')
      .select('*')
      .eq('store_id', storeData.id)
      .eq('is_available', true)
      .order('name');

    if (productsData) {
      setProducts(productsData as Product[]);

      // Get unique category IDs and fetch categories
      const categoryIds = [...new Set(productsData.map(p => p.category_id).filter(Boolean))];
      if (categoryIds.length > 0) {
        const { data: categoriesData } = await supabase
          .from('categories')
          .select('*')
          .in('id', categoryIds);
        
        if (categoriesData) {
          setCategories(categoriesData as Category[]);
        }
      }
    }

    setLoading(false);
  };

  const handleAddToCart = async (product: Product) => {
    await addItem(product);
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category_id === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!store) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header with Banner */}
      <div className="relative">
        {store.banner_url ? (
          <div className="h-48 md:h-64">
            <img
              src={store.banner_url}
              alt={store.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
          </div>
        ) : (
          <div className="h-48 md:h-64 bg-gradient-to-br from-primary/20 to-secondary/20" />
        )}

        <Button
          variant="ghost"
          size="icon"
          className="absolute top-4 left-4 bg-background/80 backdrop-blur"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
      </div>

      {/* Store Info */}
      <div className="container mx-auto px-4 -mt-16 relative z-10">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              {store.logo_url ? (
                <img
                  src={store.logo_url}
                  alt={store.name}
                  className="w-20 h-20 rounded-xl object-cover border-4 border-background shadow-lg"
                />
              ) : (
                <div className="w-20 h-20 rounded-xl bg-primary/10 border-4 border-background shadow-lg flex items-center justify-center">
                  <span className="text-2xl font-bold text-primary">{store.name[0]}</span>
                </div>
              )}
              
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <div>
                    <h1 className="text-xl font-bold">{store.name}</h1>
                    {store.description && (
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                        {store.description}
                      </p>
                    )}
                  </div>
                  <Badge variant={store.is_open ? 'default' : 'secondary'}>
                    {store.is_open ? 'Aberto' : 'Fechado'}
                  </Badge>
                </div>

                <div className="flex flex-wrap items-center gap-4 mt-3 text-sm">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-primary text-primary" />
                    <span className="font-medium">{store.rating.toFixed(1)}</span>
                    <span className="text-muted-foreground">({store.total_reviews})</span>
                  </div>
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    <span>{store.avg_delivery_time} min</span>
                  </div>
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <MapPin className="w-4 h-4" />
                    <span className="truncate">{store.city}</span>
                  </div>
                </div>

                <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
                  <span>Taxa: <strong className="text-foreground">R$ {store.delivery_fee.toFixed(2)}</strong></span>
                  <span>Mínimo: <strong className="text-foreground">R$ {store.min_order_value.toFixed(2)}</strong></span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Search and Categories */}
        <div className="mt-6 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar produtos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {categories.length > 0 && (
            <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
              <TabsList className="w-full justify-start overflow-x-auto">
                <TabsTrigger value="all">Todos</TabsTrigger>
                {categories.map((category) => (
                  <TabsTrigger key={category.id} value={category.id}>
                    {category.name}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          )}
        </div>

        {/* Products Grid */}
        <div className="mt-6">
          {filteredProducts.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p>Nenhum produto encontrado</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredProducts.map((product) => (
                <Card key={product.id} className="overflow-hidden">
                  <div className="flex">
                    <div className="flex-1 p-4">
                      <h3 className="font-medium line-clamp-2">{product.name}</h3>
                      {product.description && (
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                          {product.description}
                        </p>
                      )}
                      <div className="mt-3 flex items-center gap-2">
                        {product.original_price && product.original_price > product.price && (
                          <span className="text-sm text-muted-foreground line-through">
                            R$ {product.original_price.toFixed(2)}
                          </span>
                        )}
                        <span className="font-bold text-primary">
                          R$ {product.price.toFixed(2)}
                        </span>
                      </div>
                    </div>
                    <div className="relative w-28 h-28 flex-shrink-0">
                      {product.image_url ? (
                        <img
                          src={product.image_url}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-muted flex items-center justify-center">
                          <span className="text-2xl">📦</span>
                        </div>
                      )}
                      <Button
                        size="icon"
                        className="absolute -bottom-2 -right-2 rounded-full w-8 h-8 shadow-lg"
                        onClick={() => handleAddToCart(product)}
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Store Contact */}
        {store.phone && (
          <Card className="mt-6">
            <CardContent className="py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Contato</p>
                    <p className="text-sm text-muted-foreground">{store.phone}</p>
                  </div>
                </div>
                <Button variant="outline" asChild>
                  <a href={`tel:${store.phone}`}>Ligar</a>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
