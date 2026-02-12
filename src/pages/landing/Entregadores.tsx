import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Truck, ArrowRight, CheckCircle, Zap, Shield, 
  DollarSign, Clock, MapPin, Smartphone, BarChart3, Star, Quote
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Logo } from '@/components/Logo';

const benefits = [
  {
    icon: DollarSign,
    title: 'Ganhos flexíveis',
    description: 'Trabalhe quando quiser e ganhe por cada entrega realizada.',
  },
  {
    icon: Smartphone,
    title: 'App intuitivo',
    description: 'Receba pedidos, navegue e gerencie entregas na palma da mão.',
  },
  {
    icon: Clock,
    title: 'Pagamento rápido',
    description: 'Receba seus ganhos semanalmente direto na sua conta.',
  },
  {
    icon: MapPin,
    title: 'Navegação integrada',
    description: 'Rotas otimizadas com navegação direto no Google Maps.',
  },
];

const features = [
  'Entregas na sua região',
  'Sem taxa de cadastro',
  'Suporte 24/7',
  'Dashboard de ganhos',
  'Histórico completo',
  'Mapa em tempo real',
];

const stats = [
  { value: '500+', label: 'Entregadores ativos' },
  { value: 'R$ 150', label: 'Média diária' },
  { value: '4.9', label: 'Avaliação média' },
];

export default function EntregadoresLanding() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card/80 backdrop-blur-lg border-b border-border">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/">
            <Logo size="sm" />
          </Link>
          <div className="flex items-center gap-3">
            <Link to="/auth">
              <Button variant="ghost" size="sm">Entrar</Button>
            </Link>
            <Link to="/driver/register">
              <Button size="sm" className="gap-1.5">
                <Truck className="w-3.5 h-3.5" />
                Cadastrar
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden py-20 md:py-32">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/8 via-transparent to-accent/5" />
        <div className="absolute top-20 left-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-72 h-72 bg-accent/5 rounded-full blur-3xl" />
        
        <div className="container mx-auto px-4 relative">
          <div className="max-w-3xl mx-auto text-center">
            <span className="inline-flex items-center gap-2 text-xs uppercase tracking-widest font-semibold text-primary bg-primary/10 px-4 py-2 rounded-full mb-6 animate-fade-in">
              <Truck className="w-3.5 h-3.5" />
              Para Entregadores
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tighter leading-none mb-6 animate-fade-in-up" style={{ animationDelay: '0.1s', opacity: 0 }}>
              Entregue e ganhe com o{' '}
              <span className="text-primary">Comanda</span>
            </h1>
            <p className="text-lg text-muted-foreground mb-10 max-w-xl mx-auto animate-fade-in-up" style={{ animationDelay: '0.2s', opacity: 0 }}>
              Cadastre-se como entregador e comece a ganhar dinheiro fazendo entregas 
              no seu tempo. Flexibilidade total e ganhos competitivos.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up" style={{ animationDelay: '0.3s', opacity: 0 }}>
              <Link to="/driver/register">
                <Button size="lg" className="w-full sm:w-auto gap-2 shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all duration-300">
                  Quero ser entregador
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <Link to="/driver/dashboard">
                <Button variant="outline" size="lg" className="w-full sm:w-auto hover:bg-muted/50 transition-colors">
                  Já sou entregador
                </Button>
              </Link>
            </div>
          </div>

          {/* Stats */}
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

      {/* Benefits */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-14">
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-4">Vantagens de ser entregador</h2>
            <p className="text-muted-foreground max-w-lg mx-auto">
              Tudo para você entregar com tranquilidade e ganhar mais.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((benefit) => (
              <Card 
                key={benefit.title} 
                className="group border border-border/50 shadow-sm hover:shadow-xl hover:border-primary/20 hover:-translate-y-1 transition-all duration-300"
              >
                <CardContent className="p-6 text-center">
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 group-hover:bg-primary/20 flex items-center justify-center mx-auto mb-4 transition-colors duration-300">
                    <benefit.icon className="w-7 h-7 text-primary" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">{benefit.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{benefit.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 md:py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-4">Como funciona</h2>
          </div>
          <div className="max-w-3xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: '1', title: 'Cadastre-se', desc: 'Preencha seus dados e aguarde a aprovação.' },
              { step: '2', title: 'Receba pedidos', desc: 'Aceite entregas disponíveis na sua região.' },
              { step: '3', title: 'Ganhe dinheiro', desc: 'Entregue e receba por cada entrega concluída.' },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground font-bold text-lg flex items-center justify-center mx-auto mb-4">
                  {item.step}
                </div>
                <h3 className="font-semibold mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features list */}
      <section className="py-16 md:py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-4">O que você terá acesso</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {features.map((feature) => (
                <div 
                  key={feature} 
                  className="flex items-center gap-3 p-4 rounded-xl bg-card border border-border/50 hover:border-primary/20 transition-colors duration-200"
                >
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="w-4 h-4 text-primary" />
                  </div>
                  <span className="text-sm font-medium">{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 md:py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-4">O que nossos entregadores dizem</h2>
            <p className="text-muted-foreground">Histórias reais de quem já entrega com a gente.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {[
              { name: 'Carlos S.', city: 'São Paulo', text: 'Consigo fazer meus horários e ganhar bem. O app é muito fácil de usar e os pedidos aparecem rápido.', rating: 5 },
              { name: 'Ana L.', city: 'Rio de Janeiro', text: 'O melhor é a flexibilidade. Trabalho quando quero e o pagamento cai certinho toda semana.', rating: 5 },
              { name: 'Pedro M.', city: 'Belo Horizonte', text: 'A navegação integrada facilita muito. Não preciso trocar de app pra encontrar os endereços.', rating: 4 },
            ].map((t, index) => (
              <motion.div
                key={t.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.5, delay: index * 0.15, ease: 'easeOut' }}
              >
                <Card className="border border-border/50 hover:shadow-lg transition-shadow duration-300 h-full">
                  <CardContent className="p-6">
                    <Quote className="w-8 h-8 text-primary/20 mb-3" />
                    <p className="text-sm text-muted-foreground mb-4 leading-relaxed italic">"{t.text}"</p>
                    <div className="flex items-center gap-1 mb-2">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className={`w-3.5 h-3.5 ${i < t.rating ? 'text-primary fill-primary' : 'text-muted-foreground/30'}`} />
                      ))}
                    </div>
                    <p className="text-sm font-semibold">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.city}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 md:py-28">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
              <Shield className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-4">Comece a entregar hoje!</h2>
            <p className="text-muted-foreground mb-8 max-w-md mx-auto">
              Cadastre-se agora e comece a ganhar dinheiro com entregas na sua cidade.
            </p>
            <Link to="/driver/register">
              <Button size="lg" className="gap-2 shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all duration-300">
                Cadastrar agora
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} Comanda. Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
}
