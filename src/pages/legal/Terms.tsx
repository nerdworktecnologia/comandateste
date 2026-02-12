import { Link } from 'react-router-dom';
import { ArrowLeft, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/Logo';

export default function Terms() {
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
            <FileText className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Termos de Uso</h1>
            <p className="text-sm text-muted-foreground">Última atualização: {new Date().toLocaleDateString('pt-BR')}</p>
          </div>
        </div>

        <div className="prose prose-sm max-w-none space-y-6 text-foreground">
          <Section title="1. Aceitação dos Termos">
            <p className="text-muted-foreground">Ao acessar ou utilizar a plataforma Comanda, você concorda com estes Termos de Uso. Se não concordar com alguma condição, não utilize a plataforma.</p>
          </Section>

          <Section title="2. Descrição do Serviço">
            <p className="text-muted-foreground">A Comanda é uma plataforma de marketplace que conecta consumidores a estabelecimentos comerciais (supermercados, farmácias, cosméticos, bebidas, pet shops e restaurantes), facilitando pedidos e entregas.</p>
          </Section>

          <Section title="3. Cadastro e Conta">
            <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
              <li>Você deve ter pelo menos 18 anos para criar uma conta</li>
              <li>As informações fornecidas devem ser verdadeiras e atualizadas</li>
              <li>Você é responsável pela segurança de sua conta e senha</li>
              <li>Cada pessoa pode manter apenas uma conta ativa</li>
            </ul>
          </Section>

          <Section title="4. Pedidos e Pagamentos">
            <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
              <li>Os preços são definidos pelos estabelecimentos parceiros</li>
              <li>A taxa de entrega varia conforme o estabelecimento e distância</li>
              <li>Os pagamentos são processados por gateways de pagamento seguros</li>
              <li>Pedidos podem ser cancelados conforme política de cancelamento</li>
            </ul>
          </Section>

          <Section title="5. Entregas">
            <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
              <li>Os tempos de entrega são estimativas e podem variar</li>
              <li>O endereço de entrega deve ser completo e acessível</li>
              <li>O cliente deve estar disponível para receber o pedido</li>
            </ul>
          </Section>

          <Section title="6. Produtos próximos à validade">
            <p className="text-muted-foreground">A Comanda oferece produtos próximos à data de validade com descontos especiais. Estes produtos são seguros para consumo dentro do prazo indicado. O consumidor é informado sobre a data de validade antes da compra.</p>
          </Section>

          <Section title="7. Farmácias e medicamentos">
            <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
              <li>Medicamentos que exigem receita médica só são vendidos mediante apresentação de prescrição válida</li>
              <li>A Comanda não se responsabiliza pelo uso inadequado de medicamentos</li>
              <li>Consulte sempre um profissional de saúde antes de usar qualquer medicamento</li>
              <li>As farmácias parceiras são responsáveis pelo cumprimento das normas da ANVISA</li>
            </ul>
          </Section>

          <Section title="8. Responsabilidades do Usuário">
            <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
              <li>Não utilizar a plataforma para fins ilícitos</li>
              <li>Não criar contas falsas ou fornecer informações falsas</li>
              <li>Tratar entregadores e funcionários com respeito</li>
              <li>Reportar problemas com pedidos em até 24 horas</li>
            </ul>
          </Section>

          <Section title="9. Propriedade Intelectual">
            <p className="text-muted-foreground">Todo o conteúdo da plataforma Comanda, incluindo marca, logotipos, design e software, são de propriedade da Comanda ou de seus licenciadores e protegidos pelas leis de propriedade intelectual.</p>
          </Section>

          <Section title="10. Limitação de Responsabilidade">
            <p className="text-muted-foreground">A Comanda atua como intermediária entre consumidores e estabelecimentos. Não nos responsabilizamos por produtos defeituosos, atrasos causados por terceiros ou indisponibilidade temporária da plataforma.</p>
          </Section>

          <Section title="11. Alterações nos Termos">
            <p className="text-muted-foreground">Reservamo-nos o direito de alterar estes termos a qualquer momento. Alterações significativas serão comunicadas por e-mail ou notificação na plataforma.</p>
          </Section>

          <Section title="12. Foro">
            <p className="text-muted-foreground">Estes termos são regidos pelas leis brasileiras. Qualquer disputa será resolvida no foro da comarca da sede da Comanda.</p>
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
