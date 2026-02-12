import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Store, TrendingUp, Users, Smartphone, ArrowRight, 
  CheckCircle, Zap, Shield, BarChart3, Package, Settings, Star, Quote, HelpCircle
} from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
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
    description: 'Seus clientes fazem pedidos facilmente pelo celular.',
  },
];

const features = [
  { icon: Package, label: 'Gestão de produtos' },
  { icon: BarChart3, label: 'Dashboard de vendas' },
  { icon: Settings, label: 'Configurações da loja' },
  { icon: TrendingUp, label: 'Relatórios financeiros' },
  { icon: Users, label: 'Gestão de cupons' },
  { icon: Shield, label: 'Suporte dedicado' },
];

const stats = [
  { value: '1000+', label: 'Empresas cadastradas' },
  { value: '50K+', label: 'Pedidos por mês' },
  { value: '4.8', label: 'Avaliação média' },
];

const businessFaqs = [
  { q: 'Quanto custa para cadastrar minha empresa?', a: 'O cadastro é gratuito. Cobramos apenas uma pequena comissão sobre cada pedido realizado.' },
  { q: 'Quanto tempo leva para ser aprovado?', a: 'A análise do cadastro leva em média 24 a 48 horas úteis. Você será notificado por e-mail assim que for aprovado.' },
  { q: 'Posso vender qualquer tipo de produto?', a: 'Sim! Aceitamos supermercados, farmácias, pet shops, restaurantes, cosméticos e muito mais.' },
  { q: 'Como funciona a entrega dos pedidos?', a: 'Você pode usar nossos entregadores parceiros ou realizar entregas próprias. A escolha é sua.' },
  { q: 'Tenho acesso a relatórios de vendas?', a: 'Sim, o painel oferece dashboard completo com vendas, pedidos, avaliações e relatórios financeiros.' },
  { q: 'Posso criar cupons de desconto?', a: 'Sim! Você pode criar cupons personalizados com desconto fixo ou percentual para atrair mais clientes.' },
];

const businessFaqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: businessFaqs.map((faq) => ({
    '@type': 'Question',
    name: faq.q,
    acceptedAnswer: { '@type': 'Answer', text: faq.a },
  })),
};

export default function EmpresasLanding() {
  useEffect(() => {
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.text = JSON.stringify(businessFaqJsonLd);
    document.head.appendChild(script);
    return () => { document.head.removeChild(script); };
  }, []);

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
            <Link to="/store/register">
              <Button size="sm" className="gap-1.5">
                <Zap className="w-3.5 h-3.5" />
                Cadastrar
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden py-20 md:py-32">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/8 via-transparent to-accent/5" />
        <div className="absolute top-20 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-accent/5 rounded-full blur-3xl" />
        
        <div className="container mx-auto px-4 relative">
          <div className="max-w-3xl mx-auto text-center">
            <span className="inline-flex items-center gap-2 text-xs uppercase tracking-widest font-semibold text-primary bg-primary/10 px-4 py-2 rounded-full mb-6 animate-fade-in">
              <Store className="w-3.5 h-3.5" />
              Para Empresas
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tighter leading-none mb-6 animate-fade-in-up" style={{ animationDelay: '0.1s', opacity: 0 }}>
              Venda mais com o{' '}
              <span className="text-primary">Comanda</span>
            </h1>
            <p className="text-lg text-muted-foreground mb-10 max-w-xl mx-auto animate-fade-in-up" style={{ animationDelay: '0.2s', opacity: 0 }}>
              Cadastre sua empresa e alcance milhares de clientes. 
              Gerencie pedidos, produtos e entregas em uma única plataforma.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up" style={{ animationDelay: '0.3s', opacity: 0 }}>
              <Link to="/store/register">
                <Button size="lg" className="w-full sm:w-auto gap-2 shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all duration-300">
                  Cadastrar minha empresa
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <Link to="/store/dashboard">
                <Button variant="outline" size="lg" className="w-full sm:w-auto hover:bg-muted/50 transition-colors">
                  Já tenho conta
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
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-4">Por que escolher o Comanda?</h2>
            <p className="text-muted-foreground max-w-lg mx-auto">
              Tudo o que você precisa para levar seu negócio ao próximo nível.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((benefit, index) => (
              <motion.div
                key={benefit.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.5, delay: index * 0.1, ease: 'easeOut' }}
              >
                <Card className="group border border-border/50 shadow-sm hover:shadow-xl hover:border-primary/20 hover:-translate-y-1 transition-all duration-300 h-full">
                  <CardContent className="p-6 text-center">
                    <div className="w-14 h-14 rounded-2xl bg-primary/10 group-hover:bg-primary/20 flex items-center justify-center mx-auto mb-4 transition-colors duration-300">
                      <benefit.icon className="w-7 h-7 text-primary" />
                    </div>
                    <h3 className="font-semibold text-lg mb-2">{benefit.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{benefit.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
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
              { step: '1', title: 'Cadastre-se', desc: 'Preencha os dados da sua empresa e envie para aprovação.' },
              { step: '2', title: 'Configure sua loja', desc: 'Adicione produtos, preços e configure entregas.' },
              { step: '3', title: 'Comece a vender', desc: 'Receba pedidos e gerencie tudo pelo painel.' },
            ].map((item, index) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.4, delay: index * 0.15, ease: 'easeOut' }}
                className="text-center"
              >
                <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground font-bold text-lg flex items-center justify-center mx-auto mb-4">
                  {item.step}
                </div>
                <h3 className="font-semibold mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Panel features */}
      <section className="py-16 md:py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-4">Seu painel de controle</h2>
              <p className="text-muted-foreground">Ferramentas completas para gerenciar seu negócio.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {features.map((feature) => (
                <div 
                  key={feature.label} 
                  className="flex items-center gap-3 p-4 rounded-xl bg-card border border-border/50 hover:border-primary/20 transition-colors duration-200"
                >
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <feature.icon className="w-4 h-4 text-primary" />
                  </div>
                  <span className="text-sm font-medium">{feature.label}</span>
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
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-4">O que nossos parceiros dizem</h2>
            <p className="text-muted-foreground">Empresas que já cresceram com o Comanda.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {[
              { name: 'Mercado Bom Preço', city: 'São Paulo', text: 'Nossas vendas aumentaram 40% no primeiro mês. A plataforma é simples e os pedidos chegam em tempo real.', rating: 5 },
              { name: 'Farmácia Saúde+', city: 'Curitiba', text: 'Gestão de produtos e pedidos muito prática. O suporte é excelente e sempre nos ajuda rápido.', rating: 5 },
              { name: 'Pet Shop Patinha', city: 'Salvador', text: 'Conseguimos alcançar clientes que nem sabiam que existíamos. O dashboard de vendas é incrível.', rating: 4 },
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

      {/* FAQ */}
      <section className="py-16 md:py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-12">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <HelpCircle className="w-6 h-6 text-primary" />
              </div>
              <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-4">Perguntas frequentes</h2>
              <p className="text-muted-foreground">Tire suas dúvidas sobre vender no Comanda.</p>
            </div>
            <Accordion type="single" collapsible className="space-y-3">
              {businessFaqs.map((faq, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-30px' }}
                  transition={{ duration: 0.4, delay: index * 0.08, ease: 'easeOut' }}
                >
                  <AccordionItem value={`faq-${index}`} className="border border-border/50 rounded-xl px-5 data-[state=open]:border-primary/20 transition-colors">
                    <AccordionTrigger className="text-sm font-medium text-left hover:no-underline py-4">
                      {faq.q}
                    </AccordionTrigger>
                    <AccordionContent className="text-sm text-muted-foreground pb-4">
                      {faq.a}
                    </AccordionContent>
                  </AccordionItem>
                </motion.div>
              ))}
            </Accordion>
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
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-4">Pronto para começar?</h2>
            <p className="text-muted-foreground mb-8 max-w-md mx-auto">
              Cadastre sua empresa agora e comece a receber pedidos hoje mesmo.
            </p>
            <Link to="/store/register">
              <Button size="lg" className="gap-2 shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all duration-300">
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
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} Comanda. Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
}
