import { Store, TrendingUp, Users, Smartphone, Zap, Shield, BarChart3, Package, Settings } from 'lucide-react';
import { LandingHeader } from '@/components/landing/LandingHeader';
import { LandingHero } from '@/components/landing/LandingHero';
import { LandingBenefits } from '@/components/landing/LandingBenefits';
import { LandingSteps } from '@/components/landing/LandingSteps';
import { LandingFeatures } from '@/components/landing/LandingFeatures';
import { LandingTestimonials } from '@/components/landing/LandingTestimonials';
import { LandingFAQ } from '@/components/landing/LandingFAQ';
import { LandingCTA } from '@/components/landing/LandingCTA';
import { LandingFooter } from '@/components/landing/LandingFooter';

const benefits = [
  { icon: Store, title: 'Sua loja online', description: 'Crie sua loja virtual em minutos e comece a vender para milhares de clientes.' },
  { icon: TrendingUp, title: 'Aumente suas vendas', description: 'Alcance mais clientes e aumente seu faturamento com nossa plataforma.' },
  { icon: Users, title: 'Gestão simplificada', description: 'Gerencie pedidos, produtos e clientes em um só lugar.' },
  { icon: Smartphone, title: 'App para clientes', description: 'Seus clientes fazem pedidos facilmente pelo celular.' },
];

const steps = [
  { step: '1', title: 'Cadastre-se', desc: 'Preencha os dados da sua empresa e envie para aprovação.' },
  { step: '2', title: 'Configure sua loja', desc: 'Adicione produtos, preços e configure entregas.' },
  { step: '3', title: 'Comece a vender', desc: 'Receba pedidos e gerencie tudo pelo painel.' },
];

const features = [
  { icon: Package, label: 'Gestão de produtos' },
  { icon: BarChart3, label: 'Dashboard de vendas' },
  { icon: Settings, label: 'Configurações da loja' },
  { icon: TrendingUp, label: 'Relatórios financeiros' },
  { icon: Users, label: 'Gestão de cupons' },
  { icon: Shield, label: 'Suporte dedicado' },
];

const testimonials = [
  { name: 'Mercado Bom Preço', city: 'São Paulo', text: 'Nossas vendas aumentaram 40% no primeiro mês. A plataforma é simples e os pedidos chegam em tempo real.', rating: 5 },
  { name: 'Farmácia Saúde+', city: 'Curitiba', text: 'Gestão de produtos e pedidos muito prática. O suporte é excelente e sempre nos ajuda rápido.', rating: 5 },
  { name: 'Pet Shop Patinha', city: 'Salvador', text: 'Conseguimos alcançar clientes que nem sabiam que existíamos. O dashboard de vendas é incrível.', rating: 4 },
];

const faqs = [
  { q: 'Quanto custa para cadastrar minha empresa?', a: 'O cadastro é gratuito. Cobramos apenas uma pequena comissão sobre cada pedido realizado.' },
  { q: 'Quanto tempo leva para ser aprovado?', a: 'A análise do cadastro leva em média 24 a 48 horas úteis. Você será notificado por e-mail assim que for aprovado.' },
  { q: 'Posso vender qualquer tipo de produto?', a: 'Sim! Aceitamos supermercados, farmácias, pet shops, restaurantes, cosméticos e muito mais.' },
  { q: 'Como funciona a entrega dos pedidos?', a: 'Você pode usar nossos entregadores parceiros ou realizar entregas próprias. A escolha é sua.' },
  { q: 'Tenho acesso a relatórios de vendas?', a: 'Sim, o painel oferece dashboard completo com vendas, pedidos, avaliações e relatórios financeiros.' },
  { q: 'Posso criar cupons de desconto?', a: 'Sim! Você pode criar cupons personalizados com desconto fixo ou percentual para atrair mais clientes.' },
];

const stats = [
  { value: '1000+', label: 'Empresas cadastradas' },
  { value: '50K+', label: 'Pedidos por mês' },
  { value: '4.8', label: 'Avaliação média' },
];

export default function EmpresasLanding() {
  return (
    <div className="min-h-screen bg-background">
      <LandingHeader registerLink="/store/register" registerLabel="Cadastrar" registerIcon={Zap} />
      <LandingHero
        badge="Para Empresas"
        badgeIcon={Store}
        title={<>Venda mais com o <span className="text-primary">Comanda</span></>}
        subtitle="Cadastre sua empresa e alcance milhares de clientes. Gerencie pedidos, produtos e entregas em uma única plataforma."
        primaryCta={{ label: 'Cadastrar minha empresa', link: '/store/register' }}
        secondaryCta={{ label: 'Já tenho conta', link: '/store/dashboard' }}
        stats={stats}
      />
      <LandingBenefits title="Por que escolher o Comanda?" subtitle="Tudo o que você precisa para levar seu negócio ao próximo nível." items={benefits} />
      <LandingSteps title="Como funciona" steps={steps} />
      <LandingFeatures title="Seu painel de controle" subtitle="Ferramentas completas para gerenciar seu negócio." items={features} />
      <LandingTestimonials title="O que nossos parceiros dizem" subtitle="Empresas que já cresceram com o Comanda." items={testimonials} />
      <LandingFAQ title="Perguntas frequentes" subtitle="Tire suas dúvidas sobre vender no Comanda." faqs={faqs} />
      <LandingCTA icon={Shield} title="Pronto para começar?" subtitle="Cadastre sua empresa agora e comece a receber pedidos hoje mesmo." buttonLabel="Começar agora" link="/store/register" />
      <LandingFooter />
    </div>
  );
}
