import { Plus, Clock, AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import type { Product } from '@/types';

interface ProductCardProps {
  product: Product;
  onAddToCart?: () => void;
}

function isNearExpiry(expiryDate: string | null): boolean {
  if (!expiryDate) return false;
  const expiry = new Date(expiryDate);
  const today = new Date();
  const diffTime = expiry.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays <= 7 && diffDays > 0;
}

function daysUntilExpiry(expiryDate: string): number {
  const expiry = new Date(expiryDate);
  const today = new Date();
  const diffTime = expiry.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

export function ProductCard({ product, onAddToCart }: ProductCardProps) {
  const nearExpiry = isNearExpiry(product.expiry_date);
  const hasDiscount = product.discount_percent > 0 || (product.original_price && product.original_price > product.price);
  
  return (
    <Card className="overflow-hidden group">
      <div className="relative aspect-square bg-muted">
        {product.image_url ? (
          <img 
            src={product.image_url} 
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-muted to-muted-foreground/10 flex items-center justify-center">
            <span className="text-4xl">📦</span>
          </div>
        )}
        
        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {hasDiscount && (
            <Badge className="bg-primary text-primary-foreground">
              -{product.discount_percent || Math.round((1 - product.price / (product.original_price || product.price)) * 100)}%
            </Badge>
          )}
          
          {nearExpiry && product.expiry_date && (
            <Badge className="bg-amber-500 text-white flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {daysUntilExpiry(product.expiry_date)}d
            </Badge>
          )}
        </div>
        
        {product.requires_prescription && (
          <Badge className="absolute top-2 right-2 bg-destructive">
            <AlertTriangle className="w-3 h-3 mr-1" />
            Receita
          </Badge>
        )}
        
        {!product.is_available && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <Badge variant="secondary">Indisponível</Badge>
          </div>
        )}
      </div>
      
      <CardContent className="p-3">
        <h3 className="font-medium text-sm text-foreground line-clamp-2 min-h-[2.5rem]">
          {product.name}
        </h3>
        
        {product.store && (
          <p className="text-xs text-muted-foreground mt-1 truncate">
            {product.store.name}
          </p>
        )}
        
        <div className="flex items-center justify-between mt-2">
          <div className="flex flex-col">
            {product.original_price && product.original_price > product.price && (
              <span className="text-xs text-muted-foreground line-through">
                R$ {product.original_price.toFixed(2)}
              </span>
            )}
            <span className="font-bold text-primary">
              R$ {product.price.toFixed(2)}
            </span>
          </div>
          
          {product.is_available && (
            <Button
              size="icon"
              className="rounded-full w-8 h-8 bg-primary hover:bg-primary/90"
              onClick={(e) => {
                e.stopPropagation();
                onAddToCart?.();
              }}
            >
              <Plus className="w-4 h-4" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
