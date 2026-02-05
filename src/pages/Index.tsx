import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { HeroSlider } from '@/components/home/HeroSlider';
import { CategoryTabs } from '@/components/home/CategoryTabs';
import { StoreCard } from '@/components/home/StoreCard';
import { ProductCard } from '@/components/home/ProductCard';
import { BusinessBanner } from '@/components/home/BusinessBanner';
import { ChevronRight, Flame, Clock, Star, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/integrations/supabase/client';
import type { CategoryType, Store, Product } from '@/types';

const Index = () => {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState<CategoryType | 'all'>('all');
  const [loading, setLoading] = useState(true);
  const [stores, setStores] = useState<Store[]>([]);
  const [featuredStores, setFeaturedStores] = useState<Store[]>([]);
  const [topRatedStores, setTopRatedStores] = useState<Store[]>([]);
  const [nearExpiryProducts, setNearExpiryProducts] = useState<Product[]>([]);
  const [bestSellers, setBestSellers] = useState<Product[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch all approved stores
      const { data: storesData } = await supabase
        .from('stores')
        .select('*')
        .eq('status', 'approved')
        .order('rating', { ascending: false });

      const allStores = (storesData || []) as Store[];
      setStores(allStores);
      
      // Featured stores (is_featured = true, sorted by rating)
      setFeaturedStores(allStores.filter(s => s.is_featured).slice(0, 6));
      
      // Top rated stores (rating >= 4.0, sorted by rating)
      setTopRatedStores(allStores.filter(s => (s.rating || 0) >= 4.0).slice(0, 6));

      // Fetch near expiry products (within 7 days)
      const sevenDaysFromNow = new Date();
      sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);
      
      const { data: expiryProducts } = await supabase
        .from('products')
        .select('*')
        .eq('is_available', true)
        .not('expiry_date', 'is', null)
        .lte('expiry_date', sevenDaysFromNow.toISOString().split('T')[0])
        .gte('expiry_date', new Date().toISOString().split('T')[0])
        .order('expiry_date', { ascending: true })
        .limit(8);

      setNearExpiryProducts((expiryProducts || []) as Product[]);

      // Fetch best sellers
      const { data: bestSellersData } = await supabase
        .from('products')
        .select('*')
        .eq('is_available', true)
        .order('sales_count', { ascending: false })
        .limit(8);

      setBestSellers((bestSellersData || []) as Product[]);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const StoreSkeletons = () => (
    <>
      {[1, 2, 3].map((i) => (
        <div key={i} className="rounded-lg border bg-card overflow-hidden">
          <Skeleton className="h-32 w-full" />
          <div className="p-4 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
            <div className="flex gap-4 mt-3">
              <Skeleton className="h-4 w-12" />
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-14" />
            </div>
          </div>
        </div>
      ))}
    </>
  );

  const ProductSkeletons = () => (
    <>
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="rounded-lg border bg-card overflow-hidden">
          <Skeleton className="h-32 w-full" />
          <div className="p-3 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        </div>
      ))}
    </>
  );

  return (
    <div className="container mx-auto px-4 py-4 space-y-6">
      {/* Hero Slider */}
      <HeroSlider />

      {/* Category Tabs */}
      <section>
        <CategoryTabs 
          activeCategory={activeCategory} 
          onCategoryChange={setActiveCategory} 
        />
      </section>

      {/* Near Expiry Products - Special Deals */}
      {(loading || nearExpiryProducts.length > 0) && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-secondary" />
              <h2 className="text-lg font-semibold">Próximo da Validade</h2>
            </div>
            <Button variant="ghost" size="sm" className="text-primary">
              Ver todos <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {loading ? <ProductSkeletons /> : nearExpiryProducts.map((product) => (
              <ProductCard 
                key={product.id} 
                product={product}
              />
            ))}
          </div>
        </section>
      )}

      {/* Best Sellers */}
      {(loading || bestSellers.length > 0) && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Flame className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-semibold">Mais Vendidos</h2>
            </div>
            <Button variant="ghost" size="sm" className="text-primary">
              Ver todos <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {loading ? <ProductSkeletons /> : bestSellers.map((product) => (
              <ProductCard 
                key={product.id} 
                product={product}
              />
            ))}
          </div>
        </section>
      )}

      {/* Top Rated Stores */}
      {(loading || topRatedStores.length > 0) && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-accent" />
              <h2 className="text-lg font-semibold">Mais Bem Avaliadas</h2>
            </div>
            <Button variant="ghost" size="sm" className="text-primary">
              Ver todas <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {loading ? <StoreSkeletons /> : topRatedStores.map((store) => (
              <StoreCard 
                key={store.id} 
                store={store}
              />
            ))}
          </div>
        </section>
      )}

      {/* Featured Stores */}
      {(loading || featuredStores.length > 0) && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Star className="w-5 h-5 text-secondary" />
              <h2 className="text-lg font-semibold">Lojas em Destaque</h2>
            </div>
            <Button variant="ghost" size="sm" className="text-primary">
              Ver todas <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {loading ? <StoreSkeletons /> : featuredStores.map((store) => (
              <StoreCard 
                key={store.id} 
                store={store}
              />
            ))}
          </div>
        </section>
      )}

      {/* All Stores */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Todas as Lojas</h2>
          <Button variant="ghost" size="sm" className="text-primary">
            Ver todas <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {loading ? <StoreSkeletons /> : stores.map((store) => (
            <StoreCard 
              key={store.id} 
              store={store}
            />
          ))}
          {!loading && stores.length === 0 && (
            <div className="col-span-full text-center py-8 text-muted-foreground">
              Nenhuma loja disponível no momento
            </div>
          )}
        </div>
      </section>

      {/* Business Banner */}
      <section>
        <BusinessBanner />
      </section>
    </div>
  );
};

export default Index;
