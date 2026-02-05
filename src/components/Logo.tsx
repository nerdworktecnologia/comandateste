import { ShoppingBag } from 'lucide-react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
}

export function Logo({ size = 'md', showText = true }: LogoProps) {
  const sizes = {
    sm: { icon: 'w-6 h-6', text: 'text-lg', container: 'p-1.5' },
    md: { icon: 'w-8 h-8', text: 'text-2xl', container: 'p-2' },
    lg: { icon: 'w-12 h-12', text: 'text-4xl', container: 'p-3' }
  };

  return (
    <div className="flex items-center gap-2">
      <div className="relative">
        <div className={`bg-primary rounded-xl ${sizes[size].container} shadow-lg`}>
          <ShoppingBag className={`${sizes[size].icon} text-primary-foreground`} />
        </div>
      </div>
      {showText && (
        <span className={`${sizes[size].text} font-bold text-foreground`}>
          Comanda
        </span>
      )}
    </div>
  );
}
