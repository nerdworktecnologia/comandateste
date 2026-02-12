import { Link } from 'react-router-dom';
import { Store, ArrowRight, Truck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';

export default function Header() {
  return null;
}

export function BusinessBanner() {
  const { user } = useAuth();
  
  return (
    <div className="space-y-4">
      {/* For Business */}
      <Card className="bg-gradient-to-br from-secondary to-secondary/80 border-0 overflow-hidden relative group">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full -translate-y-1/2 translate-x-1/2" />
        <CardContent className="flex flex-col sm:flex-row items-center justify-between gap-4 py-6 relative">
          <div className="flex items-center gap-4 text-secondary-foreground">
            <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
              <Store className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-lg">Quer vender no Comanda?</h3>
              <p className="text-sm opacity-80">Cadastre sua empresa e comece a vender hoje</p>
            </div>
          </div>
          <Button asChild className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2 shadow-lg">
            <Link to={user ? "/store/dashboard" : "/store/register"}>
              {user ? "Acessar Painel" : "Cadastrar Empresa"}
              <ArrowRight className="w-4 h-4" />
            </Link>
          </Button>
        </CardContent>
      </Card>

      {/* For Drivers */}
      <Card className="bg-gradient-to-br from-primary/10 to-accent/5 border border-primary/20 overflow-hidden relative group">
        <CardContent className="flex flex-col sm:flex-row items-center justify-between gap-4 py-5 relative">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary/15 flex items-center justify-center">
              <Truck className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold">Seja um entregador</h3>
              <p className="text-sm text-muted-foreground">Ganhe dinheiro fazendo entregas</p>
            </div>
          </div>
          <Button asChild variant="outline" className="gap-2 border-primary/30 hover:bg-primary/10">
            <Link to="/driver/register">
              Saiba mais
              <ArrowRight className="w-4 h-4" />
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
