import { useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface DeleteUserDialogProps {
  userId: string | null;
  userName: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDeleted: () => void;
}

export function DeleteUserDialog({ userId, userName, open, onOpenChange, onDeleted }: DeleteUserDialogProps) {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!userId) return;
    setLoading(true);

    const { data, error } = await supabase.functions.invoke('admin-users', {
      body: { action: 'delete', user_id: userId },
    });

    if (error || data?.error) {
      toast.error(data?.error || 'Erro ao excluir usuário');
      setLoading(false);
      return;
    }

    toast.success('Usuário excluído com sucesso');
    setLoading(false);
    onOpenChange(false);
    onDeleted();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="w-5 h-5" />
            Excluir Usuário
          </DialogTitle>
          <DialogDescription>
            Tem certeza que deseja excluir o usuário <strong>{userName || 'selecionado'}</strong>? 
            Esta ação é irreversível e todos os dados serão perdidos.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button variant="destructive" onClick={handleDelete} disabled={loading}>
            {loading ? 'Excluindo...' : 'Excluir Usuário'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
