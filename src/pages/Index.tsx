import { useState, useEffect, useCallback, useMemo } from 'react';
import { HeroSlider } from '@/components/home/HeroSlider';
import { CategoryTabs } from '@/components/home/CategoryTabs';
import { StoreCard } from '@/components/home/StoreCard';
import { ProductCard } from '@/components/home/ProductCard';
import { BusinessBanner } from '@/components/home/BusinessBanner';
import { ChevronRight, Flame, Clock, Star, TrendingUp, Store as StoreIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/integrations/supabase/client';
import type { CategoryType, Store, Product } from '@/types';

const Index = () => {
  const [activeCategory, setActiveCategory] = useState<CategoryType | 'all'>('all');
  const [loading, setLoading] = useState(true);
  const [stores, setStores] = useState<Store[]>([]);
  const [nearExpiryProducts, setNearExpiryProducts] = useState<Product[]>([]);
  const [bestSellers, setBestSellers] = useState<Product[]>([]);

  const featuredStores = useMemo(() => stores.filter(s => s.is_featured).slice(0, 6), [stores]);
  const topRatedStores = useMemo(() => stores.filter(s => (s.rating || 0) >= 4.0).slice(0, 6), [stores]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      // Fetch categories first (needed for filtering)
      const { data: categoriesData } = await supabase
        .from('categories')
        .select('id, category_type')
        .eq('is_active', true);

      const categoryMap = new Map<string, string>();
      (categoriesData || []).forEach((cat: { id: string; category_type: string }) => {
        categoryMap.set(cat.id, cat.category_type);
      });

      // Build category filter
      const categoryIds = activeCategory !== 'all'
        ? Array.from(categoryMap.entries()).filter(([_, type]) => type === activeCategory).map(([id]) => id)
        : null;

      // Run all three queries in parallel
      let storesQuery = supabase.from('stores').select('*').eq('status', 'approved').order('rating', { ascending: false });
      if (categoryIds?.length) storesQuery = storesQuery.in('category_id', categoryIds);

      const today = new Date().toISOString().split('T')[0];
      const sevenDays = new Date();
      sevenDays.setDate(sevenDays.getDate() + 7);
      let expiryQuery = supabase.from('products').select('*').eq('is_available', true).not('expiry_date', 'is', null).lte('expiry_date', sevenDays.toISOString().split('T')[0]).gte('expiry_date', today).order('expiry_date', { ascending: true }).limit(8);
      if (categoryIds?.length) expiryQuery = expiryQuery.in('category_id', categoryIds);

      let bestQuery = supabase.from('products').select('*').eq('is_available', true).order('sales_count', { ascending: false }).limit(8);
      if (categoryIds?.length) bestQuery = bestQuery.in('category_id', categoryIds);

      const [storesRes, expiryRes, bestRes] = await Promise.all([storesQuery, expiryQuery, bestQuery]);

      setStores((storesRes.data || []) as Store[]);
      setNearExpiryProducts((expiryRes.data || []) as Product[]);
      setBestSellers((bestRes.data || []) as Product[]);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  }, [activeCategory]);

  useEffect(() => { fetchData(); }, [fetchData]);

  return (
    <div className="space-y-0 pb-20 md:pb-0">
      <div className="container mx-auto px-4 pt-4">
        <HeroSlider />
      </div>

      <div className="container mx-auto px-4 py-4">
        <CategoryTabs activeCategory={activeCategory} onCategoryChange={setActiveCategory} />
      </div>

      {/* Products */}
      <div className="bg-background">
        {(loading || nearExpiryProducts.length > 0) && (
          <section className="container mx-auto px-4 py-6 animate-fade-in">
            <SectionHeader icon={Clock} iconColor="text-accent" title="Próximo da Validade" subtitle="Descontos especiais" />
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 md:gap-4">
              {loading ? <ProductSkeletons /> : nearExpiryProducts.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          </section>
        )}

        {(loading || bestSellers.length > 0) && (
          <section className="container mx-auto px-4 py-6 animate-fade-in" style={{ animationDelay: '0.1s', opacity: 0 }}>
            <SectionHeader icon={Flame} iconColor="text-primary" title="Mais Vendidos" subtitle="Os favoritos dos clientes" />
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 md:gap-4">
              {loading ? <ProductSkeletons /> : bestSellers.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          </section>
        )}
      </div>

      <div className="h-2 bg-muted/50" />

      {/* Stores */}
      <div className="bg-background">
        {(loading || featuredStores.length > 0) && (
          <section className="container mx-auto px-4 py-6 animate-fade-in" style={{ animationDelay: '0.15s', opacity: 0 }}>
            <SectionHeader icon={Star} iconColor="text-primary" title="Lojas em Destaque" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {loading ? <StoreSkeletons /> : featuredStores.map((s) => <StoreCard key={s.id} store={s} />)}
            </div>
          </section>
        )}

        {(loading || topRatedStores.length > 0) && (
          <section className="container mx-auto px-4 py-6 animate-fade-in" style={{ animationDelay: '0.2s', opacity: 0 }}>
            <SectionHeader icon={TrendingUp} iconColor="text-accent" title="Mais Bem Avaliadas" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {loading ? <StoreSkeletons /> : topRatedStores.map((s) => <StoreCard key={s.id} store={s} />)}
            </div>
          </section>
        )}

        <section className="container mx-auto px-4 py-6 animate-fade-in" style={{ animationDelay: '0.25s', opacity: 0 }}>
          <SectionHeader icon={StoreIcon} iconColor="text-muted-foreground" title="Todas as Lojas" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {loading ? <StoreSkeletons /> : stores.length > 0 ? stores.map((s) => <StoreCard key={s.id} store={s} />) : (
              <div className="col-span-full text-center py-12 text-muted-foreground">
                <StoreIcon className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>Nenhuma loja disponível no momento</p>
              </div>
            )}
          </div>
        </section>
      </div>

      <div className="h-2 bg-muted/50" />

      <div className="container mx-auto px-4 py-8">
        <BusinessBanner />
      </div>
    </div>
  );
};

function SectionHeader({ icon: Icon, iconColor, title, subtitle }: { icon: React.ElementType; iconColor: string; title: string; subtitle?: string }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
          <Icon className={`w-4.5 h-4.5 ${iconColor}`} />
        </div>
        <div>
          <h2 className="text-base font-semibold leading-tight">{title}</h2>
          {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
        </div>
      </div>
      <Button variant="ghost" size="sm" className="text-primary text-xs gap-1">
        Ver todos <ChevronRight className="w-3.5 h-3.5" />
      </Button>
    </div>
  );
}

function StoreSkeletons() {
  return (
    <>
      {[1, 2, 3].map((i) => (
        <div key={i} className="rounded-xl border bg-card overflow-hidden">
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
}

function ProductSkeletons() {
  return (
    <>
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="rounded-xl border bg-card overflow-hidden">
          <Skeleton className="h-32 w-full" />
          <div className="p-3 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        </div>
      ))}
    </>
  );
}

export default Index;
