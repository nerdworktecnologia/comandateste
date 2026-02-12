import { Link } from 'react-router-dom';
import { ArrowLeft, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/Logo';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 bg-card/80 backdrop-blur-lg border-b border-border">
        <div className="container mx-auto px-4 py-3 flex items-center gap-4">
          <Link to="/">
            <Button variant="ghost" size="icon"><ArrowLeft className="w-5 h-5" /></Button>
          </Link>
          <Logo size="sm" />
        </div>
      </header>

      <main className="container mx-auto px-4 py-10 max-w-3xl">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
            <Shield className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Política de Privacidade</h1>
            <p className="text-sm text-muted-foreground">Última atualização: {new Date().toLocaleDateString('pt-BR')}</p>
          </div>
        </div>

        <div className="prose prose-sm max-w-none space-y-6 text-foreground">
          <Section title="1. Informações que coletamos">
            <p>A Comanda coleta as seguintes informações pessoais quando você utiliza nossa plataforma:</p>
            <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
              <li>Nome completo, CPF, endereço de e-mail e telefone</li>
              <li>Endereço de entrega (rua, cidade, estado, CEP)</li>
              <li>Dados de navegação e preferências de uso</li>
              <li>Informações de pagamento (processadas por terceiros seguros)</li>
              <li>Histórico de pedidos e avaliações</li>
            </ul>
          </Section>

          <Section title="2. Como utilizamos seus dados">
            <p>Utilizamos suas informações para:</p>
            <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
              <li>Processar e entregar seus pedidos</li>
              <li>Personalizar sua experiência na plataforma</li>
              <li>Comunicar sobre status de pedidos e promoções</li>
              <li>Melhorar nossos serviços e segurança</li>
              <li>Cumprir obrigações legais e regulatórias</li>
            </ul>
          </Section>

          <Section title="3. Compartilhamento de dados">
            <p>Seus dados podem ser compartilhados com:</p>
            <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
              <li>Estabelecimentos parceiros para processamento de pedidos</li>
              <li>Entregadores para realização da entrega</li>
              <li>Processadores de pagamento para transações financeiras</li>
              <li>Autoridades competentes quando exigido por lei</li>
            </ul>
            <p className="text-muted-foreground">Nunca vendemos seus dados pessoais a terceiros.</p>
          </Section>

          <Section title="4. Segurança dos dados">
            <p className="text-muted-foreground">Adotamos medidas de segurança técnicas e organizacionais para proteger seus dados contra acesso não autorizado, perda ou destruição, incluindo criptografia, controle de acesso e monitoramento contínuo.</p>
          </Section>

          <Section title="5. Seus direitos (LGPD)">
            <p>Conforme a Lei Geral de Proteção de Dados (Lei nº 13.709/2018), você tem direito a:</p>
            <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
              <li>Acessar seus dados pessoais</li>
              <li>Corrigir dados incompletos ou desatualizados</li>
              <li>Solicitar a exclusão de seus dados</li>
              <li>Revogar o consentimento a qualquer momento</li>
              <li>Solicitar a portabilidade dos dados</li>
            </ul>
          </Section>

          <Section title="6. Cookies e tecnologias">
            <p className="text-muted-foreground">Utilizamos cookies e tecnologias similares para melhorar sua experiência, analisar o tráfego e personalizar conteúdo. Você pode gerenciar suas preferências de cookies nas configurações do navegador.</p>
          </Section>

          <Section title="7. Retenção de dados">
            <p className="text-muted-foreground">Seus dados são armazenados pelo tempo necessário para cumprir as finalidades descritas nesta política ou conforme exigido por lei. Após esse período, os dados são anonimizados ou excluídos de forma segura.</p>
          </Section>

          <Section title="8. Contato">
            <p className="text-muted-foreground">Para dúvidas sobre esta política ou exercer seus direitos, entre em contato pelo e-mail: <span className="text-primary font-medium">privacidade@comanda.app</span></p>
          </Section>
        </div>
      </main>

      <footer className="border-t py-6 mt-12">
        <div className="container mx-auto px-4 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} Comanda. Todos os direitos reservados.
        </div>
      </footer>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <h2 className="text-lg font-semibold text-foreground">{title}</h2>
      <div className="text-sm leading-relaxed">{children}</div>
    </div>
  );
}
