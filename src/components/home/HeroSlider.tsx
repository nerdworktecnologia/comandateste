import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { SlideContent } from '@/types';

const slides: SlideContent[] = [
  {
    id: 1,
    title: '30% dos alimentos são desperdiçados',
    description: 'Cerca de 30% dos alimentos são desperdiçados pelos supermercados, farmácias e cosméticos.',
    bgColor: 'bg-gradient-to-br from-primary to-primary/80'
  },
  {
    id: 2,
    title: 'Nós viemos para mudar isso',
    description: 'Conectando você a produtos de qualidade com preços reduzidos.',
    bgColor: 'bg-gradient-to-br from-secondary to-secondary/80'
  },
  {
    id: 3,
    title: 'Economize e ajude o planeta',
    description: 'Com o app Comanda você pode comprar produtos perto da validade com preço abaixo do mercado e ajudar a reduzir o desperdício.',
    bgColor: 'bg-gradient-to-br from-accent to-accent/80'
  }
];

export function HeroSlider() {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  return (
    <div className="relative w-full h-48 md:h-64 rounded-2xl overflow-hidden">
      <div 
        className="flex transition-transform duration-500 ease-out h-full"
        style={{ transform: `translateX(-${currentSlide * 100}%)` }}
      >
        {slides.map((slide) => (
          <div
            key={slide.id}
            className={`min-w-full h-full ${slide.bgColor} flex items-center justify-center px-6 md:px-12`}
          >
            <div className="text-center text-white max-w-2xl">
              <h2 className="text-xl md:text-3xl font-bold mb-2">{slide.title}</h2>
              <p className="text-sm md:text-base opacity-90">{slide.description}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Arrows */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white rounded-full"
        onClick={prevSlide}
      >
        <ChevronLeft className="w-5 h-5" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white rounded-full"
        onClick={nextSlide}
      >
        <ChevronRight className="w-5 h-5" />
      </Button>

      {/* Dots */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-2 h-2 rounded-full transition-all ${
              index === currentSlide 
                ? 'bg-white w-6' 
                : 'bg-white/50 hover:bg-white/75'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
