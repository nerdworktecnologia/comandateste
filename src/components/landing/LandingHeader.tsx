import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/Logo';
import type { LucideIcon } from 'lucide-react';

interface LandingHeaderProps {
  registerLink: string;
  registerLabel: string;
  registerIcon: LucideIcon;
}

export function LandingHeader({ registerLink, registerLabel, registerIcon: Icon }: LandingHeaderProps) {
  return (
    <header className="sticky top-0 z-50 bg-card/80 backdrop-blur-lg border-b border-border">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/">
          <Logo size="sm" />
        </Link>
        <div className="flex items-center gap-3">
          <Link to="/auth">
            <Button variant="ghost" size="sm">Entrar</Button>
          </Link>
          <Link to={registerLink}>
            <Button size="sm" className="gap-1.5">
              <Icon className="w-3.5 h-3.5" />
              {registerLabel}
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
