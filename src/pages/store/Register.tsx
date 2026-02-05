import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  Building2, MapPin, Phone, Mail, Clock, ArrowLeft, 
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
  {
    icon: TrendingUp,
    title: 'Aumente suas vendas',
    description: 'Alcance milhares de clientes na sua região'
  },
  {
    icon: Rocket,
    title: 'Comece rápido',
    description: 'Cadastro simples e aprovação em até 24h'
  },
  {
    icon: Users,
    title: 'Mais visibilidade',
    description: 'Destaque sua loja para novos clientes'
  },
  {
    icon: Headphones,
    title: 'Suporte dedicado',
    description: 'Equipe pronta para ajudar seu negócio'
  },
  {
    icon: Shield,
    title: 'Pagamentos seguros',
    description: 'Receba com segurança e pontualidade'
  },
  {
    icon: Store,
    title: 'Gestão completa',
    description: 'Painel para gerenciar pedidos e produtos'
  },
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
      <div className="min-h-screen bg-primary flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center">
          <CardContent className="pt-8 pb-6">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Cadastro Enviado!</h2>
            <p className="text-muted-foreground mb-6">
              Sua empresa foi cadastrada com sucesso. Nossa equipe irá analisar seu cadastro e você receberá uma confirmação em até 24 horas.
            </p>
            <div className="space-y-3">
              <Button onClick={() => navigate('/store/dashboard')} className="w-full">
                Ir para o Painel
              </Button>
              <Button variant="outline" onClick={() => navigate('/')} className="w-full">
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
      <header className="sticky top-0 z-40 bg-primary text-primary-foreground border-b border-primary/20">
        <div className="container mx-auto px-4 py-3 flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate(-1)}
            className="text-primary-foreground hover:bg-primary-foreground/10"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <Logo size="sm" />
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-primary text-primary-foreground py-12 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <div className="inline-flex items-center gap-2 bg-primary-foreground/20 px-4 py-2 rounded-full mb-6">
            <Building2 className="w-5 h-5" />
            <span className="text-sm font-medium">Para Empresas</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            Faça parte do Comanda
          </h1>
          <p className="text-lg text-primary-foreground/90 max-w-2xl mx-auto">
            Cadastre sua empresa e comece a vender para milhares de clientes na sua região. 
            Aumente seu faturamento com nossa plataforma.
          </p>
        </div>
      </section>

      {/* Benefits Grid */}
      <section className="py-10 px-4 bg-muted/50">
        <div className="container mx-auto max-w-5xl">
          <h2 className="text-xl font-semibold text-center mb-8">Por que vender no Comanda?</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {benefits.map((benefit, index) => (
              <div 
                key={index} 
                className="bg-card p-4 rounded-xl border border-border text-center"
              >
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
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
      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <Card className="border-2">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-2xl">Cadastre sua Empresa</CardTitle>
            <CardDescription>
              Preencha os dados abaixo para começar a vender
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
              {/* Dados da Empresa */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg flex items-center gap-2 text-primary">
                  <Building2 className="w-5 h-5" />
                  Dados da Empresa
                </h3>

                <div className="grid gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome da Empresa *</Label>
                    <Input
                      id="name"
                      placeholder="Ex: Supermercado Central"
                      {...form.register('name')}
                    />
                    {form.formState.errors.name && (
                      <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="category_type">Categoria *</Label>
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
                    {form.formState.errors.category_type && (
                      <p className="text-sm text-destructive">{form.formState.errors.category_type.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Descrição</Label>
                    <Textarea
                      id="description"
                      placeholder="Descreva sua empresa..."
                      rows={3}
                      {...form.register('description')}
                    />
                  </div>
                </div>
              </div>

              {/* Contato */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg flex items-center gap-2 text-primary">
                  <Phone className="w-5 h-5" />
                  Contato
                </h3>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Telefone *</Label>
                    <Input
                      id="phone"
                      placeholder="(11) 99999-9999"
                      {...form.register('phone')}
                    />
                    {form.formState.errors.phone && (
                      <p className="text-sm text-destructive">{form.formState.errors.phone.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="contato@empresa.com"
                      {...form.register('email')}
                    />
                    {form.formState.errors.email && (
                      <p className="text-sm text-destructive">{form.formState.errors.email.message}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Endereço */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg flex items-center gap-2 text-primary">
                  <MapPin className="w-5 h-5" />
                  Endereço
                </h3>

                <div className="grid gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="address">Endereço Completo *</Label>
                    <Input
                      id="address"
                      placeholder="Rua, número, bairro"
                      {...form.register('address')}
                    />
                    {form.formState.errors.address && (
                      <p className="text-sm text-destructive">{form.formState.errors.address.message}</p>
                    )}
                  </div>

                  <div className="grid gap-4 sm:grid-cols-3">
                    <div className="space-y-2">
                      <Label htmlFor="city">Cidade *</Label>
                      <Input
                        id="city"
                        placeholder="São Paulo"
                        {...form.register('city')}
                      />
                      {form.formState.errors.city && (
                        <p className="text-sm text-destructive">{form.formState.errors.city.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="state">Estado *</Label>
                      <Input
                        id="state"
                        placeholder="SP"
                        maxLength={2}
                        {...form.register('state')}
                      />
                      {form.formState.errors.state && (
                        <p className="text-sm text-destructive">{form.formState.errors.state.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="zip_code">CEP</Label>
                      <Input
                        id="zip_code"
                        placeholder="00000-000"
                        {...form.register('zip_code')}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Delivery */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg flex items-center gap-2 text-primary">
                  <Clock className="w-5 h-5" />
                  Configurações de Entrega
                </h3>

                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="delivery_fee">Taxa de Entrega (R$)</Label>
                    <Input
                      id="delivery_fee"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      {...form.register('delivery_fee')}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="min_order_value">Pedido Mínimo (R$)</Label>
                    <Input
                      id="min_order_value"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      {...form.register('min_order_value')}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="avg_delivery_time">Tempo Médio (min)</Label>
                    <Input
                      id="avg_delivery_time"
                      type="number"
                      placeholder="30"
                      {...form.register('avg_delivery_time')}
                    />
                  </div>
                </div>
              </div>

              {/* Contrato */}
              <div className="space-y-4 p-4 bg-muted rounded-lg">
                <div className="flex items-start gap-3">
                  <Checkbox
                    id="contract"
                    checked={form.watch('contract_accepted')}
                    onCheckedChange={(checked) => form.setValue('contract_accepted', checked as boolean)}
                  />
                  <div className="space-y-1">
                    <Label htmlFor="contract" className="cursor-pointer">
                      Aceito os termos do contrato de parceria *
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Ao aceitar, você concorda com os{' '}
                      <a href="/terms" className="text-primary hover:underline">
                        Termos de Uso
                      </a>
                      ,{' '}
                      <a href="/privacy" className="text-primary hover:underline">
                        Política de Privacidade
                      </a>
                      {' '}e{' '}
                      <a href="/partner-contract" className="text-primary hover:underline">
                        Contrato de Parceria
                      </a>
                      .
                    </p>
                  </div>
                </div>
                {form.formState.errors.contract_accepted && (
                  <p className="text-sm text-destructive">{form.formState.errors.contract_accepted.message}</p>
                )}
              </div>

              <Button 
                type="submit" 
                className="w-full" 
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
      <footer className="bg-muted py-6 px-4 text-center text-sm text-muted-foreground">
        <p>© 2024 Comanda. Todos os direitos reservados.</p>
      </footer>
    </div>
  );
}
