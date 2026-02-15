import { useEffect, useRef } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

export function AdminGuard() {
  const navigate = useNavigate();
  const { user, isAdmin, loading } = useAuth();
  const toastShown = useRef(false);

  useEffect(() => {
    if (loading) return;

    if (!user) {
      if (!toastShown.current) {
        toastShown.current = true;
        toast.error('Acesso negado', {
          description: 'Você precisa estar logado para acessar esta área.',
        });
      }
      navigate('/auth', { replace: true });
      return;
    }

    if (!isAdmin) {
      if (!toastShown.current) {
        toastShown.current = true;
        toast.error('Acesso restrito', {
          description: 'Você não tem permissão para acessar o painel administrativo.',
        });
      }
      navigate('/', { replace: true });
    }
  }, [user, isAdmin, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user || !isAdmin) return null;

  return <Outlet />;
}
