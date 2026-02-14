import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Download, Share, Smartphone, X } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function InstallPromptModal() {
  const [open, setOpen] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    const dismissed = localStorage.getItem('installPromptDismissed');
    const standalone = window.matchMedia('(display-mode: standalone)').matches
      || (navigator as any).standalone === true;
    setIsStandalone(standalone);

    if (dismissed || standalone) return;

    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(isIOSDevice);

    // Listen for successful install via browser
    const onInstalled = () => {
      localStorage.setItem('installPromptDismissed', 'true');
      setOpen(false);
      setIsStandalone(true);
    };
    window.addEventListener('appinstalled', onInstalled);

    // In preview/iframe where beforeinstallprompt won't fire, show as generic prompt after delay
    const fallbackTimer = setTimeout(() => {
      if (!isIOSDevice) {
        setOpen(true);
      }
    }, 3000);

    if (isIOSDevice) {
      const timer = setTimeout(() => setOpen(true), 2000);
      return () => {
        clearTimeout(timer);
        clearTimeout(fallbackTimer);
        window.removeEventListener('appinstalled', onInstalled);
      };
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      clearTimeout(fallbackTimer);
      setTimeout(() => setOpen(true), 1500);
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
      window.removeEventListener('appinstalled', onInstalled);
      clearTimeout(fallbackTimer);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      localStorage.setItem('installPromptDismissed', 'true');
    }
    setDeferredPrompt(null);
    setOpen(false);
  };

  const handleDismiss = () => {
    localStorage.setItem('installPromptDismissed', 'true');
    setOpen(false);
  };

  if (isStandalone) return null;

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) handleDismiss(); }}>
      <DialogContent className="sm:max-w-md mx-4 rounded-2xl border-none shadow-2xl bg-gradient-to-br from-primary/5 via-background to-accent/5">
        <DialogHeader className="text-center space-y-4 pt-2">
          <div className="mx-auto w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center shadow-lg">
            <img src="/pwa-192x192.png" alt="Comanda" className="w-14 h-14 rounded-xl" />
          </div>
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-orange-500 bg-clip-text text-transparent">
            {isIOS ? 'Adicione o Comanda!' : 'Instale o Comanda!'}
          </DialogTitle>
          <DialogDescription className="text-base leading-relaxed text-muted-foreground px-2">
            {isIOS
              ? 'Tenha o Comanda sempre à mão! Adicione à sua tela inicial e acesse seus pedidos, lojas favoritas e promoções com um toque.'
              : 'Peça suas comidas favoritas com um toque! Instale o Comanda e tenha acesso rápido a lojas, pedidos e promoções exclusivas.'
            }
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-3 py-4">
          {[
            { icon: '⚡', title: 'Ultra rápido', desc: 'Abre instantâneo' },
            { icon: '🔔', title: 'Notificações', desc: 'Fique por dentro' },
          ].map((item) => (
            <div key={item.title} className="flex flex-col items-center gap-1 p-3 rounded-xl bg-muted/50">
              <span className="text-2xl">{item.icon}</span>
              <span className="text-xs font-semibold text-foreground">{item.title}</span>
              <span className="text-[10px] text-muted-foreground">{item.desc}</span>
            </div>
          ))}
        </div>

        {isIOS ? (
          <div className="space-y-3 px-2 pb-2">
            <div className="flex items-start gap-3 p-3 rounded-xl bg-muted/30">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <Share className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium">Toque em <strong>Compartilhar</strong></p>
                <p className="text-xs text-muted-foreground">O ícone de quadrado com seta ↑ na barra do Safari</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-xl bg-muted/30">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <Smartphone className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium">Toque em <strong>"Tela de Início"</strong></p>
                <p className="text-xs text-muted-foreground">Role para baixo e selecione "Adicionar à Tela de Início"</p>
              </div>
            </div>
            <Button onClick={handleDismiss} variant="outline" className="w-full rounded-xl h-12">
              Entendi, obrigado!
            </Button>
          </div>
        ) : deferredPrompt ? (
          <div className="space-y-3 pb-2">
            <Button onClick={handleInstall} className="w-full h-14 text-lg rounded-xl gap-3 shadow-lg">
              <Download className="w-5 h-5" />
              Instalar Agora — É Grátis!
            </Button>
            <Button onClick={handleDismiss} variant="ghost" className="w-full text-muted-foreground text-sm">
              Agora não
            </Button>
          </div>
        ) : (
          <div className="space-y-3 px-2 pb-2">
            <p className="text-sm text-center text-muted-foreground">
              Abra o <strong>menu do navegador</strong> (⋮) e toque em <strong>"Instalar aplicativo"</strong>
            </p>
            <Button onClick={handleDismiss} variant="outline" className="w-full rounded-xl h-12">
              Entendi!
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
