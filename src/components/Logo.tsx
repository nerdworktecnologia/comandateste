import { ShoppingBag } from 'lucide-react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
}

export function Logo({ size = 'md', showText = true }: LogoProps) {
  const sizes = {
    sm: { icon: 'w-6 h-6', text: 'text-lg' },
    md: { icon: 'w-8 h-8', text: 'text-2xl' },
    lg: { icon: 'w-12 h-12', text: 'text-4xl' }
  };

  return (
    <div className="flex items-center gap-2">
      <div className="relative">
        <div className="bg-gradient-to-br from-primary to-secondary rounded-xl p-2 shadow-lg">
          <ShoppingBag className={`${sizes[size].icon} text-white`} />
        </div>
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-accent rounded-full border-2 border-white" />
      </div>
      {showText && (
        <span className={`${sizes[size].text} font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent`}>
          Comanda
        </span>
      )}
    </div>
  );
}
