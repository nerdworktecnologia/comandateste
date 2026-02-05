import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Store, Package, X, Loader2 } from 'lucide-react';
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
import { supabase } from '@/integrations/supabase/client';

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
  } | null;
}

export function GlobalSearch() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [stores, setStores] = useState<SearchStore[]>([]);
  const [products, setProducts] = useState<SearchProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

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

  // Debounced search
  useEffect(() => {
    if (!query.trim()) {
      setStores([]);
      setProducts([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        // Search stores
        const { data: storesData } = await supabase
          .from('stores')
          .select('id, name, slug, description, is_open, rating, category_id')
          .eq('status', 'approved')
          .ilike('name', `%${query}%`)
          .limit(5);

        // Search products
        const { data: productsData } = await supabase
          .from('products')
          .select(`
            id, name, price, original_price, discount_percent, image_url, store_id,
            stores!inner(name, slug)
          `)
          .eq('is_available', true)
          .ilike('name', `%${query}%`)
          .limit(8);

        setStores(storesData || []);
        setProducts(productsData || []);
      } catch (error) {
        console.error('Search error:', error);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  const handleStoreSelect = useCallback((slug: string) => {
    setOpen(false);
    setQuery('');
    navigate(`/loja/${slug}`);
  }, [navigate]);

  const handleProductSelect = useCallback((storeSlug: string) => {
    setOpen(false);
    setQuery('');
    navigate(`/loja/${storeSlug}`);
  }, [navigate]);

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
        <CommandList>
          {loading && (
            <div className="flex items-center justify-center py-6">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          )}

          {!loading && !query && (
            <CommandEmpty>
              <div className="text-center py-6">
                <Search className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                <p className="text-sm text-muted-foreground">
                  Digite para buscar produtos e lojas
                </p>
              </div>
            </CommandEmpty>
          )}

          {!loading && query && stores.length === 0 && products.length === 0 && (
            <CommandEmpty>
              <div className="text-center py-6">
                <p className="text-sm text-muted-foreground">
                  Nenhum resultado encontrado para "{query}"
                </p>
              </div>
            </CommandEmpty>
          )}

          {stores.length > 0 && (
            <CommandGroup heading="Lojas">
              {stores.map((store) => (
                <CommandItem
                  key={store.id}
                  value={store.name}
                  onSelect={() => handleStoreSelect(store.slug)}
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
                  onSelect={() => product.stores && handleProductSelect(product.stores.slug)}
                  className="cursor-pointer"
                >
                  <Package className="mr-2 h-4 w-4 text-secondary" />
                  <div className="flex-1">
                    <div className="font-medium">{product.name}</div>
                    {product.stores && (
                      <p className="text-xs text-muted-foreground">
                        {product.stores.name}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-primary">
                      {formatPrice(product.price)}
                    </div>
                    {product.discount_percent && product.discount_percent > 0 && (
                      <div className="text-[10px] text-muted-foreground line-through">
                        {formatPrice(product.original_price || product.price)}
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
