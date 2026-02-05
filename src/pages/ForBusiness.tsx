import { Link } from 'react-router-dom';
import { Store, TrendingUp, Users, Smartphone, ArrowRight, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Logo } from '@/components/Logo';

const benefits = [
  {
    icon: Store,
    title: 'Sua loja online',
    description: 'Crie sua loja virtual em minutos e comece a vender para milhares de clientes.',
  },
  {
    icon: TrendingUp,
    title: 'Aumente suas vendas',
    description: 'Alcance mais clientes e aumente seu faturamento com nossa plataforma.',
  },
  {
    icon: Users,
    title: 'Gestão simplificada',
    description: 'Gerencie pedidos, produtos e clientes em um só lugar.',
  },
  {
    icon: Smartphone,
    title: 'App para clientes',
    description: 'Seus clientes podem fazer pedidos facilmente pelo celular.',
  },
];

const features = [
  'Cadastro gratuito',
  'Sem taxa de adesão',
  'Suporte dedicado',
  'Pagamento na hora',
  'Relatórios completos',
  'Promoções e cupons',
];

export default function ForBusiness() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-header border-b border-primary/20">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/">
            <Logo size="sm" />
          </Link>
          <Link to="/auth">
            <Button variant="secondary" size="sm">
              Entrar
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary/10 via-background to-accent/5 py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <span className="text-overline text-primary mb-4 block">Para Empresas</span>
            <h1 className="text-display mb-6">
              Venda mais com o <span className="text-primary">Comanda</span>
            </h1>
            <p className="text-body text-muted-foreground mb-8 max-w-xl mx-auto">
              Cadastre sua empresa e alcance milhares de clientes. 
              Gerencie pedidos, produtos e entregas em uma única plataforma.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/store/register">
                <Button size="lg" className="w-full sm:w-auto gap-2">
                  Cadastrar minha empresa
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <Link to="/auth">
                <Button variant="outline" size="lg" className="w-full sm:w-auto">
                  Já tenho conta
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 md:py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-headline mb-4">Por que escolher o Comanda?</h2>
            <p className="text-body-sm text-muted-foreground max-w-lg mx-auto">
              Tudo o que você precisa para levar seu negócio ao próximo nível.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((benefit) => (
              <Card key={benefit.title} className="border-0 shadow-md hover:shadow-lg transition-shadow">
                <CardContent className="p-6 text-center">
                  <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <benefit.icon className="w-7 h-7 text-primary" />
                  </div>
                  <h3 className="text-title mb-2">{benefit.title}</h3>
                  <p className="text-body-sm text-muted-foreground">{benefit.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features List */}
      <section className="py-16 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-10">
              <h2 className="text-headline mb-4">O que está incluso</h2>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {features.map((feature) => (
                <div key={feature} className="flex items-center gap-3 p-3">
                  <CheckCircle className="w-5 h-5 text-success flex-shrink-0" />
                  <span className="text-body-sm font-medium">{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-headline mb-4">Pronto para começar?</h2>
            <p className="text-body text-muted-foreground mb-8">
              Cadastre sua empresa agora e comece a receber pedidos hoje mesmo.
            </p>
            <Link to="/store/register">
              <Button size="lg" className="gap-2">
                Começar agora
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-caption">
            © {new Date().getFullYear()} Comanda. Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
}
