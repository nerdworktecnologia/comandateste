import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Store, Package, Loader2, X, SlidersHorizontal, Clock, Trash2 } from 'lucide-react';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface SearchStore {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  is_open: boolean;
  rating: number | null;
  category_id: string | null;
}

interface SearchProduct {
  id: string;
  name: string;
  price: number;
  original_price: number | null;
  discount_percent: number | null;
  image_url: string | null;
  store_id: string;
  stores: {
    name: string;
    slug: string;
    is_open: boolean;
  } | null;
}

interface Category {
  id: string;
  name: string;
  slug: string;
  category_type: string;
}

interface SearchHistoryItem {
  id: string;
  query: string;
  result_type: string | null;
  result_name: string | null;
  created_at: string;
}

const PRICE_RANGES = [
  { label: 'Todos', min: 0, max: Infinity },
  { label: 'Até R$ 20', min: 0, max: 20 },
  { label: 'R$ 20 - R$ 50', min: 20, max: 50 },
  { label: 'R$ 50 - R$ 100', min: 50, max: 100 },
  { label: 'Acima de R$ 100', min: 100, max: Infinity },
];

export function GlobalSearch() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [stores, setStores] = useState<SearchStore[]>([]);
  const [products, setProducts] = useState<SearchProduct[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchHistory, setSearchHistory] = useState<SearchHistoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  // Filters state
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 500]);
  const [onlyOpenStores, setOnlyOpenStores] = useState(false);
  const [onlyWithDiscount, setOnlyWithDiscount] = useState(false);

  const hasActiveFilters = selectedCategory || onlyOpenStores || onlyWithDiscount || priceRange[0] > 0 || priceRange[1] < 500;

  // Load categories and search history on open
  useEffect(() => {
    if (open) {
      if (categories.length === 0) {
        supabase
          .from('categories')
          .select('id, name, slug, category_type')
          .eq('is_active', true)
          .order('sort_order')
          .then(({ data }) => {
            if (data) setCategories(data);
          });
      }
      
      // Load search history for logged-in users
      if (user) {
        supabase
          .from('search_history')
          .select('id, query, result_type, result_name, created_at')
          .order('created_at', { ascending: false })
          .limit(10)
          .then(({ data }) => {
            if (data) setSearchHistory(data);
          });
      }
    }
  }, [open, categories.length, user]);

  // Toggle with keyboard shortcut
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  // Debounced search with filters
  useEffect(() => {
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        // Build stores query
        let storesQuery = supabase
          .from('stores')
          .select('id, name, slug, description, is_open, rating, category_id')
          .eq('status', 'approved');

        if (query.trim()) {
          storesQuery = storesQuery.ilike('name', `%${query}%`);
        }
        if (onlyOpenStores) {
          storesQuery = storesQuery.eq('is_open', true);
        }
        if (selectedCategory) {
          storesQuery = storesQuery.eq('category_id', selectedCategory);
        }

        // Build products query
        let productsQuery = supabase
          .from('products')
          .select(`
            id, name, price, original_price, discount_percent, image_url, store_id,
            stores!inner(name, slug, is_open)
          `)
          .eq('is_available', true);

        if (query.trim()) {
          productsQuery = productsQuery.ilike('name', `%${query}%`);
        }
        if (priceRange[0] > 0) {
          productsQuery = productsQuery.gte('price', priceRange[0]);
        }
        if (priceRange[1] < 500) {
          productsQuery = productsQuery.lte('price', priceRange[1]);
        }
        if (onlyWithDiscount) {
          productsQuery = productsQuery.gt('discount_percent', 0);
        }

        const [storesResult, productsResult] = await Promise.all([
          storesQuery.limit(5),
          productsQuery.limit(12),
        ]);

        let filteredStores = storesResult.data || [];
        let filteredProducts = productsResult.data || [];

        // Client-side filter for open stores on products
        if (onlyOpenStores) {
          filteredProducts = filteredProducts.filter(p => p.stores?.is_open);
        }

        setStores(filteredStores);
        setProducts(filteredProducts);
      } catch (error) {
        console.error('Search error:', error);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query, selectedCategory, priceRange, onlyOpenStores, onlyWithDiscount]);

  const saveToHistory = useCallback(async (searchQuery: string, resultType: string, resultId: string, resultName: string) => {
    if (!user || !searchQuery.trim()) return;
    
    try {
      await supabase.from('search_history').insert({
        user_id: user.id,
        query: searchQuery.trim(),
        result_type: resultType,
        result_id: resultId,
        result_name: resultName,
      });
    } catch (error) {
      console.error('Error saving search history:', error);
    }
  }, [user]);

  const handleStoreSelect = useCallback(async (store: SearchStore) => {
    await saveToHistory(query, 'store', store.id, store.name);
    setOpen(false);
    setQuery('');
    navigate(`/loja/${store.slug}`);
  }, [navigate, query, saveToHistory]);

  const handleProductSelect = useCallback(async (product: SearchProduct) => {
    if (!product.stores) return;
    await saveToHistory(query, 'product', product.id, product.name);
    setOpen(false);
    setQuery('');
    navigate(`/loja/${product.stores.slug}`);
  }, [navigate, query, saveToHistory]);

  const handleHistorySelect = useCallback((item: SearchHistoryItem) => {
    setQuery(item.query);
  }, []);

  const clearHistory = useCallback(async () => {
    if (!user) return;
    try {
      await supabase.from('search_history').delete().eq('user_id', user.id);
      setSearchHistory([]);
    } catch (error) {
      console.error('Error clearing history:', error);
    }
  }, [user]);

  const removeHistoryItem = useCallback(async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await supabase.from('search_history').delete().eq('id', id);
      setSearchHistory(prev => prev.filter(item => item.id !== id));
    } catch (error) {
      console.error('Error removing history item:', error);
    }
  }, []);

  const clearFilters = () => {
    setSelectedCategory(null);
    setPriceRange([0, 500]);
    setOnlyOpenStores(false);
    setOnlyWithDiscount(false);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(price);
  };

  return (
    <>
      <Button
        variant="outline"
        onClick={() => setOpen(true)}
        className="w-full justify-start text-muted-foreground bg-muted border-0 hover:bg-muted/80"
      >
        <Search className="mr-2 h-4 w-4" />
        <span className="flex-1 text-left">Buscar produtos, lojas...</span>
        <kbd className="hidden md:inline-flex pointer-events-none h-5 select-none items-center gap-1 rounded border bg-background px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
          <span className="text-xs">⌘</span>K
        </kbd>
      </Button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput 
          placeholder="Buscar produtos, lojas ou categorias..." 
          value={query}
          onValueChange={setQuery}
        />
        
        {/* Filters Section */}
        <div className="border-b px-3 py-2">
          <Collapsible open={filtersOpen} onOpenChange={setFiltersOpen}>
            <div className="flex items-center justify-between">
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-2">
                  <SlidersHorizontal className="h-4 w-4" />
                  Filtros
                  {hasActiveFilters && (
                    <Badge variant="secondary" className="ml-1 h-5 px-1.5">
                      {[selectedCategory, onlyOpenStores, onlyWithDiscount, priceRange[0] > 0 || priceRange[1] < 500].filter(Boolean).length}
                    </Badge>
                  )}
                </Button>
              </CollapsibleTrigger>
              {hasActiveFilters && (
                <Button variant="ghost" size="sm" onClick={clearFilters} className="text-muted-foreground">
                  <X className="h-4 w-4 mr-1" />
                  Limpar
                </Button>
              )}
            </div>

            <CollapsibleContent className="pt-3 space-y-4">
              {/* Categories */}
              <div className="space-y-2">
                <Label className="text-xs font-medium text-muted-foreground">Categoria</Label>
                <div className="flex flex-wrap gap-1.5">
                  <Badge
                    variant={selectedCategory === null ? 'default' : 'outline'}
                    className="cursor-pointer"
                    onClick={() => setSelectedCategory(null)}
                  >
                    Todas
                  </Badge>
                  {categories.map((cat) => (
                    <Badge
                      key={cat.id}
                      variant={selectedCategory === cat.id ? 'default' : 'outline'}
                      className="cursor-pointer"
                      onClick={() => setSelectedCategory(cat.id)}
                    >
                      {cat.name}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-medium text-muted-foreground">Faixa de Preço</Label>
                  <span className="text-xs text-muted-foreground">
                    {formatPrice(priceRange[0])} - {priceRange[1] >= 500 ? 'R$ 500+' : formatPrice(priceRange[1])}
                  </span>
                </div>
                <Slider
                  value={priceRange}
                  onValueChange={(value) => setPriceRange(value as [number, number])}
                  min={0}
                  max={500}
                  step={10}
                  className="py-2"
                />
              </div>

              {/* Toggle Filters */}
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-2">
                  <Switch
                    id="open-stores"
                    checked={onlyOpenStores}
                    onCheckedChange={setOnlyOpenStores}
                  />
                  <Label htmlFor="open-stores" className="text-sm cursor-pointer">
                    Apenas lojas abertas
                  </Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    id="with-discount"
                    checked={onlyWithDiscount}
                    onCheckedChange={setOnlyWithDiscount}
                  />
                  <Label htmlFor="with-discount" className="text-sm cursor-pointer">
                    Com desconto
                  </Label>
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>
        </div>

        <CommandList>
          {loading && (
            <div className="flex items-center justify-center py-6">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          )}

          {!loading && !query && !hasActiveFilters && searchHistory.length === 0 && (
            <CommandEmpty>
              <div className="text-center py-6">
                <Search className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                <p className="text-sm text-muted-foreground">
                  Digite para buscar ou use os filtros
                </p>
              </div>
            </CommandEmpty>
          )}

          {/* Search History */}
          {!loading && !query && !hasActiveFilters && searchHistory.length > 0 && (
            <CommandGroup heading={
              <div className="flex items-center justify-between">
                <span>Buscas recentes</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearHistory}
                  className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground"
                >
                  <Trash2 className="h-3 w-3 mr-1" />
                  Limpar
                </Button>
              </div>
            }>
              {searchHistory.map((item) => (
                <CommandItem
                  key={item.id}
                  value={item.query}
                  onSelect={() => handleHistorySelect(item)}
                  className="cursor-pointer group"
                >
                  <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                  <div className="flex-1">
                    <span>{item.query}</span>
                    {item.result_name && (
                      <span className="text-xs text-muted-foreground ml-2">
                        → {item.result_name}
                      </span>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => removeHistoryItem(item.id, e)}
                    className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </CommandItem>
              ))}
            </CommandGroup>
          )}

          {!loading && (query || hasActiveFilters) && stores.length === 0 && products.length === 0 && (
            <CommandEmpty>
              <div className="text-center py-6">
                <p className="text-sm text-muted-foreground">
                  Nenhum resultado encontrado
                </p>
                {hasActiveFilters && (
                  <Button variant="link" size="sm" onClick={clearFilters} className="mt-2">
                    Limpar filtros
                  </Button>
                )}
              </div>
            </CommandEmpty>
          )}

          {stores.length > 0 && (
            <CommandGroup heading="Lojas">
              {stores.map((store) => (
                <CommandItem
                  key={store.id}
                  value={store.name}
                  onSelect={() => handleStoreSelect(store)}
                  className="cursor-pointer"
                >
                  <Store className="mr-2 h-4 w-4 text-primary" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{store.name}</span>
                      <Badge 
                        variant={store.is_open ? 'default' : 'secondary'}
                        className="text-[10px] h-5"
                      >
                        {store.is_open ? 'Aberto' : 'Fechado'}
                      </Badge>
                    </div>
                    {store.description && (
                      <p className="text-xs text-muted-foreground truncate max-w-[300px]">
                        {store.description}
                      </p>
                    )}
                  </div>
                  {store.rating && (
                    <span className="text-xs text-muted-foreground">
                      ⭐ {store.rating.toFixed(1)}
                    </span>
                  )}
                </CommandItem>
              ))}
            </CommandGroup>
          )}

          {stores.length > 0 && products.length > 0 && <CommandSeparator />}

          {products.length > 0 && (
            <CommandGroup heading="Produtos">
              {products.map((product) => (
                <CommandItem
                  key={product.id}
                  value={product.name}
                  onSelect={() => handleProductSelect(product)}
                  className="cursor-pointer"
                >
                  <Package className="mr-2 h-4 w-4 text-secondary" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{product.name}</span>
                      {product.discount_percent && product.discount_percent > 0 && (
                        <Badge variant="destructive" className="text-[10px] h-5">
                          -{product.discount_percent}%
                        </Badge>
                      )}
                    </div>
                    {product.stores && (
                      <p className="text-xs text-muted-foreground">
                        {product.stores.name}
                        {!product.stores.is_open && ' • Fechado'}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-primary">
                      {formatPrice(product.price)}
                    </div>
                    {product.discount_percent && product.discount_percent > 0 && product.original_price && (
                      <div className="text-[10px] text-muted-foreground line-through">
                        {formatPrice(product.original_price)}
                      </div>
                    )}
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          )}
        </CommandList>
      </CommandDialog>
    </>
  );
}
