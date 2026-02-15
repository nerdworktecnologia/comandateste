import { MapPin, Menu, Download, Shield } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Logo } from '@/components/Logo';
import { useAuth } from '@/contexts/AuthContext';
import { CartDrawer } from '@/components/cart/CartDrawer';
import { GlobalSearch } from '@/components/search/GlobalSearch';
import { useInstallPrompt } from '@/hooks/useInstallPrompt';

export function Header() {
  const { user, profile, isAdmin } = useAuth();
  const navigate = useNavigate();
  const { canInstall, isIOS, showNativePrompt, install } = useInstallPrompt();

  return (
    <header className="sticky top-0 z-40 bg-header border-b border-primary/20">
      <div className="container mx-auto px-4 py-3">
        {/* Top Row */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden text-header-text hover:bg-white/20">
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-72">
                <div className="py-4">
                  <Logo size="md" />
                  <nav className="mt-8 space-y-2">
                    <Link to="/" className="block py-2 px-4 rounded-lg hover:bg-muted">
                      Início
                    </Link>
                    <Link to="/search" className="block py-2 px-4 rounded-lg hover:bg-muted">
                      Buscar
                    </Link>
                    <Link to="/orders" className="block py-2 px-4 rounded-lg hover:bg-muted">
                      Meus Pedidos
                    </Link>
                    <Link to="/profile" className="block py-2 px-4 rounded-lg hover:bg-muted">
                      Meu Perfil
                    </Link>
                    <hr className="my-4" />
                    <Link to="/for-business" className="block py-2 px-4 rounded-lg hover:bg-muted text-primary">
                      Para Empresas
                    </Link>
                    <Link to="/for-drivers" className="block py-2 px-4 rounded-lg hover:bg-muted text-secondary">
                      Seja Entregador
                    </Link>
                    <hr className="my-4" />
                    <p className="px-4 text-xs text-muted-foreground font-medium uppercase tracking-wider mb-1">Legal</p>
                    <Link to="/privacy" className="block py-2 px-4 rounded-lg hover:bg-muted text-sm text-muted-foreground">
                      Política de Privacidade
                    </Link>
                    <Link to="/terms" className="block py-2 px-4 rounded-lg hover:bg-muted text-sm text-muted-foreground">
                      Termos de Uso
                    </Link>
                    <Link to="/partner-contract" className="block py-2 px-4 rounded-lg hover:bg-muted text-sm text-muted-foreground">
                      Contrato de Parceria
                    </Link>
                  </nav>
                </div>
              </SheetContent>
            </Sheet>
            
            <Link to="/">
              <Logo size="sm" showText={false} />
            </Link>
          </div>

          {/* Location */}
          <button 
            onClick={() => navigate(user ? '/profile' : '/auth')}
            className="hidden md:flex items-center gap-2 text-sm hover:bg-white/20 px-3 py-2 rounded-lg transition-colors"
          >
            <MapPin className="w-4 h-4 text-header-text" />
            <span className="text-header-text/80">Entregar em</span>
            <span className="font-medium truncate max-w-[150px] text-header-text">
              {profile?.address ? `${profile.address}${profile.city ? `, ${profile.city}` : ''}` : 'Definir endereço'}
            </span>
          </button>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {isAdmin && (
              <Link to="/admin">
                <Button
                  size="sm"
                  variant="outline"
                  className="hidden sm:flex gap-1.5 border-header-text/30 text-header-text hover:bg-white/20 text-xs"
                >
                  <Shield className="w-3.5 h-3.5" />
                  Admin
                </Button>
              </Link>
            )}
            {canInstall && (
              showNativePrompt ? (
                <Button
                  onClick={install}
                  size="sm"
                  variant="outline"
                  className="hidden sm:flex gap-1.5 border-header-text/30 text-header-text hover:bg-white/20 text-xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  Instalar
                </Button>
              ) : isIOS ? (
                <Link to="/install">
                  <Button
                    size="sm"
                    variant="outline"
                    className="hidden sm:flex gap-1.5 border-header-text/30 text-header-text hover:bg-white/20 text-xs"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Instalar
                  </Button>
                </Link>
              ) : null
            )}
            <CartDrawer />

            {user ? (
              <Link to="/profile">
                <Button variant="ghost" size="icon" className="hover:bg-white/20">
                  <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                    <span className="text-header-text font-medium text-sm">
                      {profile?.full_name?.[0] || user.email?.[0]?.toUpperCase() || 'U'}
                    </span>
                  </div>
                </Button>
              </Link>
            ) : (
              <Link to="/auth">
                <Button size="sm" className="bg-secondary hover:bg-secondary/90 text-secondary-foreground">
                  Entrar
                </Button>
              </Link>
            )}
          </div>
        </div>

        {/* Search Bar */}
        <div className="mt-3">
          <GlobalSearch />
        </div>
      </div>
    </header>
  );
}
