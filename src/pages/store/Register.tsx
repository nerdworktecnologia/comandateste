import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  Building2, MapPin, Phone, Clock, ArrowLeft, 
  CheckCircle, Store, TrendingUp, Users, Headphones, Shield,
  Rocket
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Logo } from '@/components/Logo';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const storeSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  description: z.string().optional(),
  category_type: z.string().min(1, 'Selecione uma categoria'),
  phone: z.string().min(10, 'Telefone inválido'),
  email: z.string().email('Email inválido'),
  address: z.string().min(5, 'Endereço obrigatório'),
  city: z.string().min(2, 'Cidade obrigatória'),
  state: z.string().min(2, 'Estado obrigatório'),
  zip_code: z.string().optional(),
  delivery_fee: z.string().optional(),
  min_order_value: z.string().optional(),
  avg_delivery_time: z.string().optional(),
  contract_accepted: z.boolean().refine(val => val === true, 'Você precisa aceitar o contrato'),
});

type StoreForm = z.infer<typeof storeSchema>;

const benefits = [
  { icon: TrendingUp, title: 'Aumente suas vendas', description: 'Alcance milhares de clientes na sua região' },
  { icon: Rocket, title: 'Comece rápido', description: 'Cadastro simples e aprovação em até 24h' },
  { icon: Users, title: 'Mais visibilidade', description: 'Destaque sua loja para novos clientes' },
  { icon: Headphones, title: 'Suporte dedicado', description: 'Equipe pronta para ajudar seu negócio' },
  { icon: Shield, title: 'Pagamentos seguros', description: 'Receba com segurança e pontualidade' },
  { icon: Store, title: 'Gestão completa', description: 'Painel para gerenciar pedidos e produtos' },
];

export default function StoreRegister() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const form = useForm<StoreForm>({
    resolver: zodResolver(storeSchema),
    defaultValues: {
      contract_accepted: false,
    }
  });

  const handleSubmit = async (data: StoreForm) => {
    if (!user) {
      toast.error('Você precisa estar logado para cadastrar uma empresa');
      navigate('/auth');
      return;
    }

    setIsLoading(true);

    const slug = data.name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

    const { error } = await supabase.from('stores').insert({
      owner_id: user.id,
      name: data.name,
      slug: `${slug}-${Date.now()}`,
      description: data.description || null,
      phone: data.phone,
      email: data.email,
      address: data.address,
      city: data.city,
      state: data.state,
      zip_code: data.zip_code || null,
      delivery_fee: parseFloat(data.delivery_fee || '0'),
      min_order_value: parseFloat(data.min_order_value || '0'),
      avg_delivery_time: parseInt(data.avg_delivery_time || '30'),
      contract_accepted: data.contract_accepted,
      contract_accepted_at: new Date().toISOString(),
      status: 'pending',
    });

    setIsLoading(false);

    if (error) {
      console.error('Error creating store:', error);
      toast.error('Erro ao cadastrar empresa. Tente novamente.');
      return;
    }

    setIsSuccess(true);
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center animate-scale-in shadow-xl border-0">
          <CardContent className="pt-10 pb-8 px-8">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-12 h-12 text-primary" />
            </div>
            <h2 className="text-2xl font-bold mb-3">Cadastro Enviado!</h2>
            <p className="text-muted-foreground mb-8 leading-relaxed">
              Sua empresa foi cadastrada com sucesso. Nossa equipe irá analisar seu cadastro e você receberá uma confirmação em até 24 horas.
            </p>
            <div className="space-y-3">
              <Button onClick={() => navigate('/store/dashboard')} className="w-full shadow-md" size="lg">
                Ir para o Painel
              </Button>
              <Button variant="ghost" onClick={() => navigate('/')} className="w-full">
                Voltar para Home
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-card/80 backdrop-blur-lg border-b border-border">
        <div className="container mx-auto px-4 py-3 flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <Logo size="sm" />
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-14 md:py-20 px-4">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/8 via-transparent to-accent/5" />
        <div className="absolute top-10 right-0 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
        
        <div className="container mx-auto max-w-4xl text-center relative">
          <span className="inline-flex items-center gap-2 text-xs uppercase tracking-widest font-semibold text-primary bg-primary/10 px-4 py-2 rounded-full mb-6 animate-fade-in">
            <Building2 className="w-3.5 h-3.5" />
            Para Empresas
          </span>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tighter leading-none mb-4 animate-fade-in-up" style={{ animationDelay: '0.1s', opacity: 0 }}>
            Faça parte do <span className="text-primary">Comanda</span>
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto animate-fade-in-up" style={{ animationDelay: '0.2s', opacity: 0 }}>
            Cadastre sua empresa e comece a vender para milhares de clientes na sua região. 
            Aumente seu faturamento com nossa plataforma.
          </p>
        </div>
      </section>

      {/* Benefits Grid */}
      <section className="py-10 px-4 bg-muted/30">
        <div className="container mx-auto max-w-5xl">
          <h2 className="text-lg font-semibold text-center mb-8">Por que vender no Comanda?</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
            {benefits.map((benefit, index) => (
              <div 
                key={index} 
                className="group bg-card p-4 rounded-xl border border-border/50 text-center hover:border-primary/20 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300"
              >
                <div className="w-12 h-12 bg-primary/10 group-hover:bg-primary/15 rounded-xl flex items-center justify-center mx-auto mb-3 transition-colors duration-300">
                  <benefit.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold text-sm mb-1">{benefit.title}</h3>
                <p className="text-xs text-muted-foreground">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Registration Form */}
      <main className="container mx-auto px-4 py-10 max-w-2xl">
        <Card className="shadow-xl border-0 overflow-hidden">
          <CardHeader className="text-center pb-2 pt-8">
            <CardTitle className="text-2xl font-bold">Cadastre sua Empresa</CardTitle>
            <CardDescription className="text-muted-foreground">
              Preencha os dados abaixo para começar a vender
            </CardDescription>
          </CardHeader>

          <CardContent className="px-6 md:px-8 pb-8">
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
              {/* Dados da Empresa */}
              <FormSection icon={Building2} title="Dados da Empresa">
                <div className="space-y-4">
                  <FormField label="Nome da Empresa" required error={form.formState.errors.name?.message}>
                    <Input placeholder="Ex: Supermercado Central" {...form.register('name')} />
                  </FormField>

                  <FormField label="Categoria" required error={form.formState.errors.category_type?.message}>
                    <Select onValueChange={(value) => form.setValue('category_type', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a categoria" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="supermarket">Supermercado</SelectItem>
                        <SelectItem value="pharmacy">Farmácia</SelectItem>
                        <SelectItem value="cosmetics">Cosméticos</SelectItem>
                        <SelectItem value="drinks">Bebidas</SelectItem>
                        <SelectItem value="petshop">Pet Shop</SelectItem>
                        <SelectItem value="restaurant">Restaurante</SelectItem>
                        <SelectItem value="other">Outro</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormField>

                  <FormField label="Descrição">
                    <Textarea placeholder="Descreva sua empresa..." rows={3} {...form.register('description')} />
                  </FormField>
                </div>
              </FormSection>

              {/* Contato */}
              <FormSection icon={Phone} title="Contato">
                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField label="Telefone" required error={form.formState.errors.phone?.message}>
                    <Input placeholder="(11) 99999-9999" {...form.register('phone')} />
                  </FormField>
                  <FormField label="Email" required error={form.formState.errors.email?.message}>
                    <Input type="email" placeholder="contato@empresa.com" {...form.register('email')} />
                  </FormField>
                </div>
              </FormSection>

              {/* Endereço */}
              <FormSection icon={MapPin} title="Endereço">
                <div className="space-y-4">
                  <FormField label="Endereço Completo" required error={form.formState.errors.address?.message}>
                    <Input placeholder="Rua, número, bairro" {...form.register('address')} />
                  </FormField>
                  <div className="grid gap-4 sm:grid-cols-3">
                    <FormField label="Cidade" required error={form.formState.errors.city?.message}>
                      <Input placeholder="São Paulo" {...form.register('city')} />
                    </FormField>
                    <FormField label="Estado" required error={form.formState.errors.state?.message}>
                      <Input placeholder="SP" maxLength={2} {...form.register('state')} />
                    </FormField>
                    <FormField label="CEP">
                      <Input placeholder="00000-000" {...form.register('zip_code')} />
                    </FormField>
                  </div>
                </div>
              </FormSection>

              {/* Delivery */}
              <FormSection icon={Clock} title="Configurações de Entrega">
                <div className="grid gap-4 sm:grid-cols-3">
                  <FormField label="Taxa de Entrega (R$)">
                    <Input type="number" step="0.01" placeholder="0.00" {...form.register('delivery_fee')} />
                  </FormField>
                  <FormField label="Pedido Mínimo (R$)">
                    <Input type="number" step="0.01" placeholder="0.00" {...form.register('min_order_value')} />
                  </FormField>
                  <FormField label="Tempo Médio (min)">
                    <Input type="number" placeholder="30" {...form.register('avg_delivery_time')} />
                  </FormField>
                </div>
              </FormSection>

              {/* Contrato */}
              <div className="p-5 bg-muted/50 rounded-xl border border-border/50">
                <div className="flex items-start gap-3">
                  <Checkbox
                    id="contract"
                    checked={form.watch('contract_accepted')}
                    onCheckedChange={(checked) => form.setValue('contract_accepted', checked as boolean)}
                    className="mt-0.5"
                  />
                  <div className="space-y-1">
                    <Label htmlFor="contract" className="cursor-pointer font-medium">
                      Aceito os termos do contrato de parceria *
                    </Label>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Ao aceitar, você concorda com os{' '}
                      <a href="/terms" className="text-primary hover:underline">Termos de Uso</a>,{' '}
                      <a href="/privacy" className="text-primary hover:underline">Política de Privacidade</a>
                      {' '}e{' '}
                      <a href="/partner-contract" className="text-primary hover:underline">Contrato de Parceria</a>.
                    </p>
                  </div>
                </div>
                {form.formState.errors.contract_accepted && (
                  <p className="text-sm text-destructive mt-2">{form.formState.errors.contract_accepted.message}</p>
                )}
              </div>

              <Button 
                type="submit" 
                className="w-full shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all duration-300" 
                size="lg"
                disabled={isLoading}
              >
                {isLoading ? 'Cadastrando...' : 'Cadastrar Empresa'}
              </Button>

              <p className="text-center text-sm text-muted-foreground">
                Já tem uma empresa cadastrada?{' '}
                <Link to="/auth" className="text-primary hover:underline font-medium">
                  Faça login
                </Link>
              </p>
            </form>
          </CardContent>
        </Card>
      </main>

      {/* Footer */}
      <footer className="bg-muted/30 py-6 px-4 text-center">
        <p className="text-xs text-muted-foreground">© {new Date().getFullYear()} Comanda. Todos os direitos reservados.</p>
      </footer>
    </div>
  );
}

/* Reusable form sub-components */
function FormSection({ icon: Icon, title, children }: { icon: React.ElementType; title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-base flex items-center gap-2 text-primary">
        <Icon className="w-4.5 h-4.5" />
        {title}
      </h3>
      {children}
    </div>
  );
}

function FormField({ label, required, error, children }: { label: string; required?: boolean; error?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-sm">
        {label} {required && <span className="text-destructive">*</span>}
      </Label>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
