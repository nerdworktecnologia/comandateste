import { Bike, DollarSign, Smartphone, Clock, MapPin, Shield, Car } from 'lucide-react';
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
  { icon: DollarSign, title: 'Ganhos flexíveis', description: 'Trabalhe quando quiser e ganhe por cada entrega realizada.' },
  { icon: Smartphone, title: 'App intuitivo', description: 'Receba pedidos, navegue e gerencie entregas na palma da mão.' },
  { icon: Clock, title: 'Pagamento rápido', description: 'Receba seus ganhos semanalmente direto na sua conta.' },
  { icon: MapPin, title: 'Navegação integrada', description: 'Rotas otimizadas com navegação direto no Google Maps.' },
];

const steps = [
  { step: '1', title: 'Cadastre-se', desc: 'Preencha seus dados e aguarde a aprovação.' },
  { step: '2', title: 'Receba pedidos', desc: 'Aceite entregas disponíveis na sua região.' },
  { step: '3', title: 'Ganhe dinheiro', desc: 'Entregue e receba por cada entrega concluída.' },
];

const features = ['Entregas na sua região', 'Sem taxa de cadastro', 'Suporte 24/7', 'Dashboard de ganhos', 'Histórico completo', 'Mapa em tempo real'];

const testimonials = [
  { name: 'Carlos S.', city: 'São Paulo', text: 'Consigo fazer meus horários e ganhar bem. O app é muito fácil de usar e os pedidos aparecem rápido.', rating: 5 },
  { name: 'Ana L.', city: 'Rio de Janeiro', text: 'O melhor é a flexibilidade. Trabalho quando quero e o pagamento cai certinho toda semana.', rating: 5 },
  { name: 'Pedro M.', city: 'Belo Horizonte', text: 'A navegação integrada facilita muito. Não preciso trocar de app pra encontrar os endereços.', rating: 4 },
];

const faqs = [
  { q: 'Preciso ter um veículo próprio?', a: 'Sim, você pode usar moto, bicicleta ou carro. Basta informar o tipo de veículo no cadastro.' },
  { q: 'Como recebo meus ganhos?', a: 'Os pagamentos são feitos semanalmente via transferência bancária direto na conta cadastrada.' },
  { q: 'Existe taxa de cadastro?', a: 'Não! O cadastro é totalmente gratuito. Você só precisa preencher seus dados e aguardar a aprovação.' },
  { q: 'Posso escolher os horários que trabalho?', a: 'Sim, você tem total flexibilidade. Trabalhe quando e onde quiser, sem horários fixos.' },
  { q: 'Quanto tempo leva a aprovação?', a: 'A análise do cadastro leva em média 24 a 48 horas úteis. Você será notificado assim que for aprovado.' },
  { q: 'Preciso ter experiência com entregas?', a: 'Não é necessário ter experiência prévia. O app é intuitivo e oferece suporte completo para novos entregadores.' },
];

const stats = [
  { value: '500+', label: 'Entregadores ativos' },
  { value: 'R$ 150', label: 'Média diária' },
  { value: '4.9', label: 'Avaliação média' },
];

export default function EntregadoresLanding() {
  return (
    <div className="min-h-screen bg-background">
      <LandingHeader registerLink="/driver/register" registerLabel="Cadastrar" registerIcon={Bike} />
      <LandingHero
        badge="Para Entregadores"
        badgeIcon={Bike}
        title={<>Entregue e ganhe com o <span className="text-primary">Comanda</span></>}
        subtitle="Cadastre-se como entregador e comece a ganhar dinheiro fazendo entregas no seu tempo. Flexibilidade total e ganhos competitivos."
        primaryCta={{ label: 'Quero ser entregador', link: '/driver/register' }}
        secondaryCta={{ label: 'Já sou entregador', link: '/driver/dashboard' }}
        stats={stats}
      />
      <LandingBenefits title="Vantagens de ser entregador" subtitle="Tudo para você entregar com tranquilidade e ganhar mais." items={benefits} />
      <LandingSteps title="Como funciona" steps={steps} />
      <LandingFeatures title="O que você terá acesso" items={features} />
      <LandingTestimonials title="O que nossos entregadores dizem" subtitle="Histórias reais de quem já entrega com a gente." items={testimonials} />
      <LandingFAQ title="Perguntas frequentes" subtitle="Tire suas dúvidas sobre ser entregador no Comanda." faqs={faqs} />
      <LandingCTA icon={Shield} title="Comece a entregar hoje!" subtitle="Cadastre-se agora e comece a ganhar dinheiro com entregas na sua cidade." buttonLabel="Cadastrar agora" link="/driver/register" />
      <LandingFooter />
    </div>
  );
}
