import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { LucideIcon } from 'lucide-react';

interface Stat {
  value: string;
  label: string;
}

interface LandingHeroProps {
  badge: string;
  badgeIcon: LucideIcon;
  title: React.ReactNode;
  subtitle: string;
  primaryCta: { label: string; link: string };
  secondaryCta: { label: string; link: string };
  stats: Stat[];
}

export function LandingHero({ badge, badgeIcon: BadgeIcon, title, subtitle, primaryCta, secondaryCta, stats }: LandingHeroProps) {
  return (
    <section className="relative overflow-hidden py-20 md:py-32">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/8 via-transparent to-accent/5" />
      <div className="absolute top-20 left-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-0 w-72 h-72 bg-accent/5 rounded-full blur-3xl" />

      <div className="container mx-auto px-4 relative">
        <div className="max-w-3xl mx-auto text-center">
          <span className="inline-flex items-center gap-2 text-xs uppercase tracking-widest font-semibold text-primary bg-primary/10 px-4 py-2 rounded-full mb-6 animate-fade-in">
            <BadgeIcon className="w-3.5 h-3.5" />
            {badge}
          </span>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tighter leading-none mb-6 animate-fade-in-up" style={{ animationDelay: '0.1s', opacity: 0 }}>
            {title}
          </h1>
          <p className="text-lg text-muted-foreground mb-10 max-w-xl mx-auto animate-fade-in-up" style={{ animationDelay: '0.2s', opacity: 0 }}>
            {subtitle}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up" style={{ animationDelay: '0.3s', opacity: 0 }}>
            <Link to={primaryCta.link}>
              <Button size="lg" className="w-full sm:w-auto gap-2 shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all duration-300">
                {primaryCta.label}
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link to={secondaryCta.link}>
              <Button variant="outline" size="lg" className="w-full sm:w-auto hover:bg-muted/50 transition-colors">
                {secondaryCta.label}
              </Button>
            </Link>
          </div>
        </div>

        <div className="flex justify-center gap-8 md:gap-16 mt-16 animate-fade-in-up" style={{ animationDelay: '0.4s', opacity: 0 }}>
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-2xl md:text-3xl font-bold text-primary">{stat.value}</div>
              <div className="text-xs text-muted-foreground mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
