import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Truck, ArrowLeft, MapPin, Phone, Mail, User, Car, Loader2, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Logo } from '@/components/Logo';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const VEHICLE_TYPES = [
  { value: 'moto', label: 'Moto' },
  { value: 'bicicleta', label: 'Bicicleta' },
  { value: 'carro', label: 'Carro' },
  { value: 'van', label: 'Van' },
];

const BENEFITS = [
  { icon: '💰', title: 'Ganhos flexíveis', description: 'Defina seus próprios horários e ganhe por entrega' },
  { icon: '📱', title: 'App intuitivo', description: 'Receba pedidos e navegue facilmente' },
  { icon: '⚡', title: 'Pagamento rápido', description: 'Receba seus ganhos semanalmente' },
  { icon: '🛡️', title: 'Suporte 24/7', description: 'Equipe de suporte sempre disponível' },
];

export default function DriverRegister() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Form states
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [cpf, setCpf] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [vehicleType, setVehicleType] = useState('');
  const [licensePlate, setLicensePlate] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!acceptTerms) {
      toast.error('Você precisa aceitar os termos para continuar');
      return;
    }

    if (!vehicleType) {
      toast.error('Selecione o tipo de veículo');
      return;
    }

    setLoading(true);

    try {
      // If user is logged in, create driver profile
      if (user) {
        const { error } = await supabase
          .from('delivery_drivers')
          .insert({
            user_id: user.id,
            vehicle_type: vehicleType,
            license_plate: licensePlate || null,
            is_active: false, // Pending approval
            is_available: false,
          });

        if (error) throw error;

        // Add driver role
        await supabase
          .from('user_roles')
          .insert({
            user_id: user.id,
            role: 'delivery_driver',
          });
      }

      setSuccess(true);
      toast.success('Cadastro enviado com sucesso!');
    } catch (error: any) {
      console.error('Error registering driver:', error);
      toast.error(error.message || 'Erro ao enviar cadastro');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardContent className="pt-8 pb-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Cadastro Enviado!</h2>
            <p className="text-muted-foreground mb-6">
              Recebemos seu cadastro e entraremos em contato em breve para dar continuidade ao processo.
            </p>
            <Button onClick={() => navigate('/')} className="w-full">
              Voltar para o início
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-secondary text-secondary-foreground py-4 px-4">
        <div className="container mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <ArrowLeft className="w-5 h-5" />
            <Logo size="sm" />
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-secondary text-secondary-foreground py-12 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center mx-auto mb-6">
            <Truck className="w-10 h-10 text-primary-foreground" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            Seja um Entregador Comanda
          </h1>
          <p className="text-lg text-secondary-foreground/80 max-w-2xl mx-auto">
            Ganhe dinheiro fazendo entregas no seu tempo. Flexibilidade e autonomia para você trabalhar quando quiser.
          </p>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-12 px-4 bg-muted/30">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-2xl font-bold text-center mb-8">Por que ser entregador Comanda?</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {BENEFITS.map((benefit, index) => (
              <Card key={index} className="text-center p-4">
                <div className="text-4xl mb-2">{benefit.icon}</div>
                <h3 className="font-semibold mb-1">{benefit.title}</h3>
                <p className="text-sm text-muted-foreground">{benefit.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Registration Form */}
      <section className="py-12 px-4">
        <div className="container mx-auto max-w-xl">
          <Card>
            <CardHeader>
              <CardTitle>Cadastre-se como Entregador</CardTitle>
              <CardDescription>
                Preencha seus dados para começar a fazer entregas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="fullName">Nome completo *</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="fullName"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Seu nome completo"
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">E-mail *</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="seu@email.com"
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Telefone *</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="phone"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="(00) 00000-0000"
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cpf">CPF *</Label>
                    <Input
                      id="cpf"
                      value={cpf}
                      onChange={(e) => setCpf(e.target.value)}
                      placeholder="000.000.000-00"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="city">Cidade *</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="city"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        placeholder="Sua cidade"
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="state">Estado *</Label>
                    <Input
                      id="state"
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      placeholder="UF"
                      maxLength={2}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="vehicleType">Tipo de veículo *</Label>
                    <Select value={vehicleType} onValueChange={setVehicleType}>
                      <SelectTrigger>
                        <Car className="w-4 h-4 mr-2 text-muted-foreground" />
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        {VEHICLE_TYPES.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="licensePlate">Placa do veículo</Label>
                    <Input
                      id="licensePlate"
                      value={licensePlate}
                      onChange={(e) => setLicensePlate(e.target.value.toUpperCase())}
                      placeholder="ABC-1234"
                    />
                  </div>
                </div>

                <div className="flex items-start gap-2 pt-4">
                  <Checkbox
                    id="terms"
                    checked={acceptTerms}
                    onCheckedChange={(checked) => setAcceptTerms(checked === true)}
                  />
                  <label htmlFor="terms" className="text-sm text-muted-foreground leading-tight cursor-pointer">
                    Li e aceito os <Link to="/terms" className="text-primary hover:underline">Termos de Uso</Link> e a{' '}
                    <Link to="/privacy" className="text-primary hover:underline">Política de Privacidade</Link>
                  </label>
                </div>

                <Button type="submit" className="w-full" size="lg" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    <>
                      <Truck className="w-4 h-4 mr-2" />
                      Quero ser entregador
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-muted py-8 px-4 text-center">
        <p className="text-sm text-muted-foreground">
          Dúvidas? Entre em contato: <a href="mailto:entregadores@comanda.app" className="text-primary hover:underline">entregadores@comanda.app</a>
        </p>
      </footer>
    </div>
  );
}
