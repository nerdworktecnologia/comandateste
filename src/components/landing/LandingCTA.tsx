import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { LucideIcon } from 'lucide-react';

interface LandingCTAProps {
  icon: LucideIcon;
  title: string;
  subtitle: string;
  buttonLabel: string;
  link: string;
}

export function LandingCTA({ icon: Icon, title, subtitle, buttonLabel, link }: LandingCTAProps) {
  return (
    <section className="py-20 md:py-28">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto text-center">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
            <Icon className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-4">{title}</h2>
          <p className="text-muted-foreground mb-8 max-w-md mx-auto">{subtitle}</p>
          <Link to={link}>
            <Button size="lg" className="gap-2 shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all duration-300">
              {buttonLabel}
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
