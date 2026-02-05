import { Star, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import type { Store } from '@/types';

interface StoreCardProps {
  store: Store;
  onClick?: () => void;
}

export function StoreCard({ store, onClick }: StoreCardProps) {
  return (
    <Card 
      className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow group border-border"
      onClick={onClick}
    >
      <div className="relative h-32 bg-muted">
        {store.banner_url ? (
          <img 
            src={store.banner_url} 
            alt={store.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary/20 to-accent/20" />
        )}
        
        {store.is_featured && (
          <Badge className="absolute top-2 left-2 bg-primary text-primary-foreground">
            Destaque
          </Badge>
        )}
        
        {!store.is_open && (
          <div className="absolute inset-0 bg-foreground/50 flex items-center justify-center">
            <Badge variant="secondary">Fechado</Badge>
          </div>
        )}
        
        {/* Logo */}
        <div className="absolute -bottom-6 left-4">
          <div className="w-14 h-14 rounded-xl bg-card shadow-lg border-2 border-border overflow-hidden">
            {store.logo_url ? (
              <img src={store.logo_url} alt={store.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-lg">{store.name[0]}</span>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <CardContent className="pt-8 pb-4 px-4">
        <h3 className="font-semibold text-foreground truncate">{store.name}</h3>
        <p className="text-sm text-muted-foreground truncate mt-1">
          {store.description || store.category?.name || 'Delivery'}
        </p>
        
        <div className="flex items-center gap-4 mt-3 text-sm">
          <div className="flex items-center gap-1 text-primary">
            <Star className="w-4 h-4 fill-current" />
            <span className="font-medium">{store.rating.toFixed(1)}</span>
          </div>
          
          <div className="flex items-center gap-1 text-muted-foreground">
            <Clock className="w-4 h-4" />
            <span>{store.avg_delivery_time} min</span>
          </div>
          
          {store.delivery_fee > 0 ? (
            <span className="text-muted-foreground">
              R$ {store.delivery_fee.toFixed(2)}
            </span>
          ) : (
            <span className="text-accent font-medium">Grátis</span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
