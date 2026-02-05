import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { HeroSlider } from '@/components/home/HeroSlider';
import { CategoryTabs } from '@/components/home/CategoryTabs';
import { StoreCard } from '@/components/home/StoreCard';
import { ProductCard } from '@/components/home/ProductCard';
import { BusinessBanner } from '@/components/home/BusinessBanner';
import { ChevronRight, Flame, Clock, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { CategoryType, Store, Product } from '@/types';

// Mock data - será substituído por dados reais do Supabase
const mockStores: Store[] = [
  {
    id: '1',
    owner_id: null,
    name: 'Supermercado Extra',
    slug: 'supermercado-extra',
    description: 'O melhor do mercado com os melhores preços',
    logo_url: null,
    banner_url: null,
    phone: '(11) 99999-9999',
    email: 'contato@extra.com',
    address: 'Av. Paulista, 1000',
    city: 'São Paulo',
    state: 'SP',
    zip_code: '01310-100',
    latitude: null,
    longitude: null,
    category_id: null,
    status: 'approved',
    is_featured: true,
    is_open: true,
    opening_hours: null,
    delivery_fee: 5.99,
    min_order_value: 20,
    avg_delivery_time: 45,
    rating: 4.5,
    total_reviews: 234,
    contract_accepted: true,
    contract_accepted_at: null,
    approved_by: null,
    approved_at: null,
    created_at: '',
    updated_at: '',
  },
  {
    id: '2',
    owner_id: null,
    name: 'Farmácia Saúde',
    slug: 'farmacia-saude',
    description: 'Medicamentos e produtos de higiene',
    logo_url: null,
    banner_url: null,
    phone: '(11) 88888-8888',
    email: 'contato@farmaciasaude.com',
    address: 'Rua Augusta, 500',
    city: 'São Paulo',
    state: 'SP',
    zip_code: '01304-000',
    latitude: null,
    longitude: null,
    category_id: null,
    status: 'approved',
    is_featured: false,
    is_open: true,
    opening_hours: null,
    delivery_fee: 0,
    min_order_value: 15,
    avg_delivery_time: 30,
    rating: 4.8,
    total_reviews: 567,
    contract_accepted: true,
    contract_accepted_at: null,
    approved_by: null,
    approved_at: null,
    created_at: '',
    updated_at: '',
  },
  {
    id: '3',
    owner_id: null,
    name: 'Pet Shop Amigos',
    slug: 'pet-shop-amigos',
    description: 'Tudo para seu pet',
    logo_url: null,
    banner_url: null,
    phone: '(11) 77777-7777',
    email: 'contato@petshopamigos.com',
    address: 'Rua Oscar Freire, 200',
    city: 'São Paulo',
    state: 'SP',
    zip_code: '01426-000',
    latitude: null,
    longitude: null,
    category_id: null,
    status: 'approved',
    is_featured: true,
    is_open: false,
    opening_hours: null,
    delivery_fee: 8.99,
    min_order_value: 30,
    avg_delivery_time: 60,
    rating: 4.2,
    total_reviews: 89,
    contract_accepted: true,
    contract_accepted_at: null,
    approved_by: null,
    approved_at: null,
    created_at: '',
    updated_at: '',
  },
];

const mockProducts: Product[] = [
  {
    id: '1',
    store_id: '1',
    category_id: null,
    name: 'Arroz Integral 1kg',
    description: 'Arroz integral de alta qualidade',
    price: 8.99,
    original_price: 12.99,
    discount_percent: 31,
    image_url: null,
    sku: null,
    stock_quantity: 50,
    is_available: true,
    expiry_date: '2026-02-10',
    requires_prescription: false,
    pharmaceutical_warning: null,
    sales_count: 150,
    created_at: '',
    updated_at: '',
  },
  {
    id: '2',
    store_id: '1',
    category_id: null,
    name: 'Leite Integral 1L',
    description: 'Leite integral pasteurizado',
    price: 4.49,
    original_price: 5.99,
    discount_percent: 25,
    image_url: null,
    sku: null,
    stock_quantity: 100,
    is_available: true,
    expiry_date: '2026-02-08',
    requires_prescription: false,
    pharmaceutical_warning: null,
    sales_count: 320,
    created_at: '',
    updated_at: '',
  },
  {
    id: '3',
    store_id: '2',
    category_id: null,
    name: 'Dipirona 500mg',
    description: 'Analgésico e antitérmico',
    price: 12.90,
    original_price: 18.90,
    discount_percent: 32,
    image_url: null,
    sku: null,
    stock_quantity: 200,
    is_available: true,
    expiry_date: '2026-02-12',
    requires_prescription: false,
    pharmaceutical_warning: 'Este medicamento é contraindicado para menores de 3 meses de idade.',
    sales_count: 89,
    created_at: '',
    updated_at: '',
  },
  {
    id: '4',
    store_id: '1',
    category_id: null,
    name: 'Iogurte Natural 170g',
    description: 'Iogurte natural sem açúcar',
    price: 2.99,
    original_price: 4.50,
    discount_percent: 34,
    image_url: null,
    sku: null,
    stock_quantity: 30,
    is_available: true,
    expiry_date: '2026-02-06',
    requires_prescription: false,
    pharmaceutical_warning: null,
    sales_count: 210,
    created_at: '',
    updated_at: '',
  },
];

const Index = () => {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState<CategoryType | 'all'>('all');

  const featuredStores = mockStores.filter(s => s.is_featured);
  const nearExpiryProducts = mockProducts.filter(p => {
    if (!p.expiry_date) return false;
    const expiry = new Date(p.expiry_date);
    const today = new Date();
    const diffDays = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return diffDays <= 7 && diffDays > 0;
  });
  const bestSellers = [...mockProducts].sort((a, b) => b.sales_count - a.sales_count).slice(0, 4);

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
          {nearExpiryProducts.map((product) => (
            <ProductCard 
              key={product.id} 
              product={product}
            />
          ))}
        </div>
      </section>

      {/* Best Sellers */}
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
          {bestSellers.map((product) => (
            <ProductCard 
              key={product.id} 
              product={product}
            />
          ))}
        </div>
      </section>

      {/* Featured Stores */}
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
          {featuredStores.map((store) => (
            <StoreCard 
              key={store.id} 
              store={store}
            />
          ))}
        </div>
      </section>

      {/* All Stores */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Todas as Lojas</h2>
          <Button variant="ghost" size="sm" className="text-primary">
            Ver todas <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {mockStores.map((store) => (
            <StoreCard 
              key={store.id} 
              store={store}
            />
          ))}
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
