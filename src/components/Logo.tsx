interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
}

export function Logo({ size = 'md', showText = true }: LogoProps) {
  const sizes = {
    sm: { img: 'h-10', text: 'text-lg' },
    md: { img: 'h-12', text: 'text-2xl' },
    lg: { img: 'h-16', text: 'text-4xl' }
  };

  return (
    <div className="flex items-center gap-2">
      <img 
        src="/logo.png" 
        alt="Comanda" 
        className={`${sizes[size].img} w-auto`}
      />
      {showText && (
        <span className={`${sizes[size].text} font-bold text-foreground hidden md:block`}>
          Comanda
        </span>
      )}
    </div>
  );
}
