import { CheckCircle } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface FeatureItem {
  icon?: LucideIcon;
  label: string;
}

interface LandingFeaturesProps {
  title: string;
  subtitle?: string;
  items: (string | FeatureItem)[];
}

export function LandingFeatures({ title, subtitle, items }: LandingFeaturesProps) {
  return (
    <section className="py-16 md:py-20">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-4">{title}</h2>
            {subtitle && <p className="text-muted-foreground">{subtitle}</p>}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {items.map((item) => {
              const label = typeof item === 'string' ? item : item.label;
              const Icon = typeof item === 'string' ? CheckCircle : (item.icon || CheckCircle);
              return (
                <div
                  key={label}
                  className="flex items-center gap-3 p-4 rounded-xl bg-card border border-border/50 hover:border-primary/20 transition-colors duration-200"
                >
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-4 h-4 text-primary" />
                  </div>
                  <span className="text-sm font-medium">{label}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
