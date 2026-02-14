import { useEffect, useState } from 'react';

interface SplashScreenProps {
  onFinish: () => void;
  duration?: number;
}

export function SplashScreen({ onFinish, duration = 3500 }: SplashScreenProps) {
  const [phase, setPhase] = useState<'enter' | 'visible' | 'exit'>('enter');

  useEffect(() => {
    const enterTimer = setTimeout(() => setPhase('visible'), 100);
    const exitTimer = setTimeout(() => setPhase('exit'), duration - 600);
    const finishTimer = setTimeout(onFinish, duration);

    return () => {
      clearTimeout(enterTimer);
      clearTimeout(exitTimer);
      clearTimeout(finishTimer);
    };
  }, [duration, onFinish]);

  return (
    <div
      className={`fixed inset-0 z-[100] bg-primary flex flex-col items-center justify-center transition-opacity duration-500 ${
        phase === 'exit' ? 'opacity-0' : 'opacity-100'
      }`}
    >
      {/* Decorative rings */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
        <div className={`w-[300px] h-[300px] rounded-full border border-primary-foreground/10 transition-all duration-[1500ms] ease-out ${
          phase !== 'enter' ? 'scale-100 opacity-100' : 'scale-50 opacity-0'
        }`} />
        <div className={`absolute w-[450px] h-[450px] rounded-full border border-primary-foreground/5 transition-all duration-[2000ms] ease-out delay-200 ${
          phase !== 'enter' ? 'scale-100 opacity-100' : 'scale-50 opacity-0'
        }`} />
        <div className={`absolute w-[600px] h-[600px] rounded-full border border-primary-foreground/[0.03] transition-all duration-[2500ms] ease-out delay-300 ${
          phase !== 'enter' ? 'scale-100 opacity-100' : 'scale-50 opacity-0'
        }`} />
      </div>

      <div className="flex flex-col items-center gap-6 relative z-10">
        {/* Logo */}
        <div className={`transition-all duration-700 ease-out ${
          phase !== 'enter' ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-75 translate-y-4'
        }`}>
          <img
            src="/logo.png"
            alt="Comanda"
            className="h-28 w-auto drop-shadow-2xl"
          />
        </div>

        {/* App Name */}
        <h1 className={`text-3xl font-bold text-primary-foreground tracking-widest uppercase transition-all duration-700 delay-300 ease-out ${
          phase !== 'enter' ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'
        }`}>
          Comanda
        </h1>

        {/* Tagline */}
        <p className={`text-sm text-primary-foreground/60 tracking-wide transition-all duration-700 delay-500 ease-out ${
          phase !== 'enter' ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'
        }`}>
          Tudo que você precisa, num toque
        </p>

        {/* Loading bar */}
        <div className={`w-32 h-0.5 bg-primary-foreground/20 rounded-full overflow-hidden mt-4 transition-opacity duration-500 delay-700 ${
          phase !== 'enter' ? 'opacity-100' : 'opacity-0'
        }`}>
          <div
            className="h-full bg-primary-foreground/80 rounded-full"
            style={{
              animation: `loadBar ${duration - 1000}ms ease-in-out forwards`,
            }}
          />
        </div>
      </div>

      <style>{`
        @keyframes loadBar {
          0% { width: 0%; }
          60% { width: 70%; }
          100% { width: 100%; }
        }
      `}</style>
    </div>
  );
}
