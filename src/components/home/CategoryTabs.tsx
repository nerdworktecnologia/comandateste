import { ShoppingCart, Pill, Sparkles, GlassWater, Dog, UtensilsCrossed } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { CategoryType } from '@/types';

interface CategoryTabsProps {
  activeCategory: CategoryType | 'all';
  onCategoryChange: (category: CategoryType | 'all') => void;
}

const categories: { type: CategoryType | 'all'; label: string; icon: React.ReactNode }[] = [
  { type: 'all', label: 'Todos', icon: <ShoppingCart className="w-5 h-5" /> },
  { type: 'supermarket', label: 'Supermercado', icon: <ShoppingCart className="w-5 h-5" /> },
  { type: 'pharmacy', label: 'Farmácia', icon: <Pill className="w-5 h-5" /> },
  { type: 'cosmetics', label: 'Cosméticos', icon: <Sparkles className="w-5 h-5" /> },
  { type: 'drinks', label: 'Bebidas', icon: <GlassWater className="w-5 h-5" /> },
  { type: 'petshop', label: 'Pet Shop', icon: <Dog className="w-5 h-5" /> },
  { type: 'restaurant', label: 'Restaurante', icon: <UtensilsCrossed className="w-5 h-5" /> },
];

export function CategoryTabs({ activeCategory, onCategoryChange }: CategoryTabsProps) {
  return (
    <div className="w-full overflow-x-auto hide-scrollbar">
      <div className="flex gap-2 pb-2 min-w-max">
        {categories.map((category) => (
          <button
            key={category.type}
            onClick={() => onCategoryChange(category.type)}
            className={cn(
              'flex flex-col items-center gap-1 px-4 py-3 rounded-xl transition-all min-w-[80px]',
              activeCategory === category.type
                ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/25'
                : 'bg-card hover:bg-muted text-muted-foreground'
            )}
          >
            {category.icon}
            <span className="text-xs font-medium whitespace-nowrap">{category.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
