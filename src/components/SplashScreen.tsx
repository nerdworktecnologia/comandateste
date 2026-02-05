import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';

interface SplashScreenProps {
  onFinish: () => void;
  duration?: number;
}

export function SplashScreen({ onFinish, duration = 2000 }: SplashScreenProps) {
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const fadeTimer = setTimeout(() => {
      setFadeOut(true);
    }, duration - 300);

    const finishTimer = setTimeout(() => {
      onFinish();
    }, duration);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(finishTimer);
    };
  }, [duration, onFinish]);

  return (
    <div 
      className={`fixed inset-0 z-[100] bg-primary flex flex-col items-center justify-center transition-opacity duration-300 ${
        fadeOut ? 'opacity-0' : 'opacity-100'
      }`}
    >
      <div className="flex flex-col items-center gap-8">
        {/* Logo */}
        <div className="animate-pulse">
          <img 
            src="/logo.png" 
            alt="Comanda" 
            className="h-24 w-auto drop-shadow-lg"
          />
        </div>
        
        {/* App Name */}
        <h1 className="text-3xl font-bold text-primary-foreground tracking-wide">
          Comanda
        </h1>

        {/* Loading indicator */}
        <div className="flex flex-col items-center gap-2 mt-4">
          <Loader2 className="w-8 h-8 text-primary-foreground animate-spin" />
          <span className="text-sm text-primary-foreground/80">Carregando...</span>
        </div>
      </div>
    </div>
  );
}
