import { Link } from 'react-router-dom';
import { ArrowLeft, Handshake } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/Logo';

export default function PartnerContract() {
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
            <Handshake className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Contrato de Parceria</h1>
            <p className="text-sm text-muted-foreground">Última atualização: {new Date().toLocaleDateString('pt-BR')}</p>
          </div>
        </div>

        <div className="prose prose-sm max-w-none space-y-6 text-foreground">
          <Section title="1. Objeto do Contrato">
            <p className="text-muted-foreground">Este contrato estabelece as condições para a parceria entre o estabelecimento comercial ("Parceiro") e a plataforma Comanda ("Plataforma"), visando a comercialização de produtos por meio do marketplace digital.</p>
          </Section>

          <Section title="2. Obrigações da Plataforma">
            <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
              <li>Disponibilizar a plataforma tecnológica para cadastro e venda de produtos</li>
              <li>Processar pedidos e pagamentos de forma segura</li>
              <li>Fornecer painel de gestão para acompanhamento de vendas e pedidos</li>
              <li>Disponibilizar suporte técnico para o parceiro</li>
              <li>Promover a visibilidade do estabelecimento na plataforma</li>
            </ul>
          </Section>

          <Section title="3. Obrigações do Parceiro">
            <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
              <li>Manter os dados do estabelecimento e produtos atualizados</li>
              <li>Garantir a qualidade e disponibilidade dos produtos anunciados</li>
              <li>Preparar os pedidos no prazo informado</li>
              <li>Cumprir as normas sanitárias e regulatórias aplicáveis</li>
              <li>Responder a avaliações e reclamações dos clientes</li>
              <li>Manter documentação e licenças de funcionamento em dia</li>
            </ul>
          </Section>

          <Section title="4. Modelo de Cobrança">
            <div className="bg-muted/50 rounded-xl p-4 border border-border/50 space-y-3">
              <div>
                <h4 className="font-semibold text-sm text-foreground">Fase Inicial (até R$ 2.000 em vendas)</h4>
                <p className="text-muted-foreground">Sem mensalidade. O parceiro paga apenas a taxa por produto vendido mais a taxa de entrega aplicável.</p>
              </div>
              <div className="border-t border-border/50 pt-3">
                <h4 className="font-semibold text-sm text-foreground">Após R$ 2.000 em vendas acumuladas</h4>
                <p className="text-muted-foreground">Mensalidade fixa de <span className="font-bold text-foreground">R$ 150,00</span>, mantendo as taxas por produto vendido e taxa de entrega.</p>
              </div>
              <div className="border-t border-border/50 pt-3">
                <h4 className="font-semibold text-sm text-foreground">Taxas por transação</h4>
                <p className="text-muted-foreground">Cada venda inclui o valor do produto + taxa de serviço da plataforma + taxa de entrega (quando aplicável). Os valores exatos das taxas são informados no painel do parceiro.</p>
              </div>
            </div>
          </Section>

          <Section title="5. Pagamentos ao Parceiro">
            <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
              <li>Os repasses são realizados conforme ciclo de pagamento acordado</li>
              <li>Descontos de taxas são aplicados automaticamente nos repasses</li>
              <li>Relatórios detalhados estão disponíveis no painel do parceiro</li>
            </ul>
          </Section>

          <Section title="6. Farmácias — Termo de Responsabilidade">
            <div className="bg-destructive/5 rounded-xl p-4 border border-destructive/20 space-y-2">
              <p className="text-muted-foreground">Farmácias parceiras devem observar obrigações adicionais:</p>
              <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                <li>Medicamentos tarjados só podem ser vendidos com prescrição médica válida</li>
                <li>É obrigatório exibir avisos farmacêuticos nos produtos aplicáveis</li>
                <li>A farmácia é integralmente responsável pela dispensação correta de medicamentos</li>
                <li>Produtos controlados devem seguir rigorosamente a legislação da ANVISA e CRF</li>
                <li>Manter farmacêutico responsável durante todo o horário de funcionamento</li>
              </ul>
            </div>
          </Section>

          <Section title="7. Produtos Próximos à Validade">
            <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
              <li>Produtos próximos à validade devem ter a data claramente informada</li>
              <li>O desconto mínimo para produtos nesta categoria é de 20%</li>
              <li>Produtos vencidos devem ser removidos imediatamente da plataforma</li>
              <li>O parceiro é responsável pela atualização das datas de validade</li>
            </ul>
          </Section>

          <Section title="8. Vigência e Rescisão">
            <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
              <li>O contrato tem vigência indeterminada</li>
              <li>Qualquer parte pode rescindir com aviso prévio de 30 dias</li>
              <li>A Comanda pode suspender o parceiro por violação dos termos</li>
              <li>Pedidos em andamento serão processados até a conclusão</li>
            </ul>
          </Section>

          <Section title="9. Propriedade Intelectual">
            <p className="text-muted-foreground">O parceiro concede à Comanda o direito de usar sua marca, logo e imagens dos produtos para fins de divulgação na plataforma.</p>
          </Section>

          <Section title="10. Confidencialidade">
            <p className="text-muted-foreground">Ambas as partes se comprometem a manter sigilo sobre informações comerciais, dados de clientes e métricas de negócio compartilhadas durante a parceria.</p>
          </Section>

          <Section title="11. Foro">
            <p className="text-muted-foreground">Este contrato é regido pelas leis brasileiras. Eventuais disputas serão resolvidas no foro da comarca da sede da Comanda.</p>
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
