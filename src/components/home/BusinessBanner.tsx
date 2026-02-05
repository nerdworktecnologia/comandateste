import { Link } from 'react-router-dom';
import { ShoppingBag, Store, Truck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Logo } from '@/components/Logo';
import { useAuth } from '@/contexts/AuthContext';

export default function Header() {
  return null;
}

// Component to add to Home for business access
export function BusinessBanner() {
  const { user } = useAuth();
  
  return (
    <Card className="bg-gradient-to-r from-secondary to-secondary/80 border-0">
      <CardContent className="flex flex-col sm:flex-row items-center justify-between gap-4 py-6">
        <div className="flex items-center gap-4 text-secondary-foreground">
          <Store className="w-10 h-10" />
          <div>
            <h3 className="font-bold text-lg">Quer vender no Comanda?</h3>
            <p className="text-sm opacity-90">Cadastre sua empresa e comece a vender hoje</p>
          </div>
        </div>
        <Button asChild variant="secondary" className="bg-primary text-primary-foreground hover:bg-primary/90">
          <Link to={user ? "/store/dashboard" : "/store/register"}>
            {user ? "Acessar Painel" : "Cadastrar Empresa"}
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
