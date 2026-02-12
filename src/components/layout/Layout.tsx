import { Outlet, Link } from 'react-router-dom';
import { Header } from './Header';
import { BottomNav } from './BottomNav';
import { Logo } from '@/components/Logo';

export function Layout() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="pb-20 md:pb-8 flex-1">
        <Outlet />
      </main>
      <footer className="hidden md:block bg-muted/50 border-t border-border pb-4 pt-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <Logo size="sm" />
              <p className="text-xs text-muted-foreground mt-2">Seu marketplace de entregas rápidas.</p>
            </div>
            <div>
              <h4 className="text-sm font-semibold mb-3">Navegação</h4>
              <nav className="space-y-2 text-sm text-muted-foreground">
                <Link to="/" className="block hover:text-foreground transition-colors">Início</Link>
                <Link to="/orders" className="block hover:text-foreground transition-colors">Meus Pedidos</Link>
                <Link to="/profile" className="block hover:text-foreground transition-colors">Meu Perfil</Link>
              </nav>
            </div>
            <div>
              <h4 className="text-sm font-semibold mb-3">Para Empresas</h4>
              <nav className="space-y-2 text-sm text-muted-foreground">
                <Link to="/for-business" className="block hover:text-foreground transition-colors">Seja Parceiro</Link>
                <Link to="/for-drivers" className="block hover:text-foreground transition-colors">Seja Entregador</Link>
              </nav>
            </div>
            <div>
              <h4 className="text-sm font-semibold mb-3">Legal</h4>
              <nav className="space-y-2 text-sm text-muted-foreground">
                <Link to="/privacy" className="block hover:text-foreground transition-colors">Política de Privacidade</Link>
                <Link to="/terms" className="block hover:text-foreground transition-colors">Termos de Uso</Link>
                <Link to="/partner-contract" className="block hover:text-foreground transition-colors">Contrato de Parceria</Link>
              </nav>
            </div>
          </div>
          <div className="border-t border-border mt-6 pt-4 text-center text-xs text-muted-foreground">
            © {new Date().getFullYear()} Comanda. Todos os direitos reservados.
          </div>
        </div>
      </footer>
      <BottomNav />
    </div>
  );
}
