import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, Package, ClipboardList, Settings, 
  LogOut, Save, Store, Clock, Truck, Image, Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Logo } from '@/components/Logo';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { Store as StoreType } from '@/types';

interface OpeningHours {
  [key: string]: { open: string; close: string; closed: boolean };
}

const DAYS_OF_WEEK = [
  { key: 'monday', label: 'Segunda-feira' },
  { key: 'tuesday', label: 'Terça-feira' },
  { key: 'wednesday', label: 'Quarta-feira' },
  { key: 'thursday', label: 'Quinta-feira' },
  { key: 'friday', label: 'Sexta-feira' },
  { key: 'saturday', label: 'Sábado' },
  { key: 'sunday', label: 'Domingo' },
];

const DEFAULT_HOURS: OpeningHours = DAYS_OF_WEEK.reduce((acc, day) => ({
  ...acc,
  [day.key]: { open: '08:00', close: '18:00', closed: false }
}), {});

export default function StoreSettings() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [store, setStore] = useState<StoreType | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [bannerUrl, setBannerUrl] = useState('');
  const [deliveryFee, setDeliveryFee] = useState('0');
  const [minOrderValue, setMinOrderValue] = useState('0');
  const [avgDeliveryTime, setAvgDeliveryTime] = useState('30');
  const [isOpen, setIsOpen] = useState(true);
  const [openingHours, setOpeningHours] = useState<OpeningHours>(DEFAULT_HOURS);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    fetchStore();
  }, [user, navigate]);

  const fetchStore = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('stores')
      .select('*')
      .eq('owner_id', user.id)
      .maybeSingle();

    if (error || !data) {
      navigate('/store/dashboard');
      return;
    }

    const storeData = data as StoreType;
    setStore(storeData);
    
    // Populate form fields
    setName(storeData.name || '');
    setDescription(storeData.description || '');
    setPhone(storeData.phone || '');
    setEmail(storeData.email || '');
    setAddress(storeData.address || '');
    setCity(storeData.city || '');
    setState(storeData.state || '');
    setZipCode(storeData.zip_code || '');
    setLogoUrl(storeData.logo_url || '');
    setBannerUrl(storeData.banner_url || '');
    setDeliveryFee(String(storeData.delivery_fee || 0));
    setMinOrderValue(String(storeData.min_order_value || 0));
    setAvgDeliveryTime(String(storeData.avg_delivery_time || 30));
    setIsOpen(storeData.is_open ?? true);
    setOpeningHours(storeData.opening_hours as OpeningHours || DEFAULT_HOURS);

    setLoading(false);
  };

  const handleSave = async () => {
    if (!store) return;

    setSaving(true);

    const { error } = await supabase
      .from('stores')
      .update({
        name,
        description,
        phone,
        email,
        address,
        city,
        state,
        zip_code: zipCode,
        logo_url: logoUrl || null,
        banner_url: bannerUrl || null,
        delivery_fee: parseFloat(deliveryFee) || 0,
        min_order_value: parseFloat(minOrderValue) || 0,
        avg_delivery_time: parseInt(avgDeliveryTime) || 30,
        is_open: isOpen,
        opening_hours: openingHours,
      })
      .eq('id', store.id);

    if (error) {
      console.error('Error updating store:', error);
      toast.error('Erro ao salvar configurações');
    } else {
      toast.success('Configurações salvas com sucesso!');
    }

    setSaving(false);
  };

  const updateOpeningHour = (day: string, field: 'open' | 'close' | 'closed', value: string | boolean) => {
    setOpeningHours(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        [field]: value
      }
    }));
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar for desktop */}
      <aside className="fixed left-0 top-0 bottom-0 w-64 bg-secondary text-secondary-foreground hidden lg:flex flex-col">
        <div className="p-4 border-b border-secondary-foreground/10">
          <Logo size="sm" />
        </div>

        <nav className="flex-1 p-4 space-y-1">
          <Link
            to="/store/dashboard"
            className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-secondary-foreground/10 transition-colors"
          >
            <LayoutDashboard className="w-5 h-5" />
            Dashboard
          </Link>
          <Link
            to="/store/products"
            className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-secondary-foreground/10 transition-colors"
          >
            <Package className="w-5 h-5" />
            Produtos
          </Link>
          <Link
            to="/store/orders"
            className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-secondary-foreground/10 transition-colors"
          >
            <ClipboardList className="w-5 h-5" />
            Pedidos
          </Link>
          <Link
            to="/store/settings"
            className="flex items-center gap-3 px-4 py-3 rounded-lg bg-primary text-primary-foreground"
          >
            <Settings className="w-5 h-5" />
            Configurações
          </Link>
        </nav>

        <div className="p-4 border-t border-secondary-foreground/10">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-secondary-foreground/10 transition-colors w-full text-left"
          >
            <LogOut className="w-5 h-5" />
            Sair
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="lg:ml-64">
        <header className="sticky top-0 z-40 bg-card border-b border-border px-4 lg:px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold">Configurações</h1>
              <p className="text-sm text-muted-foreground">
                Configure sua loja
              </p>
            </div>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              Salvar alterações
            </Button>
          </div>
        </header>

        <div className="p-4 lg:p-6">
          <Tabs defaultValue="info" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-flex">
              <TabsTrigger value="info" className="gap-2">
                <Store className="w-4 h-4 hidden sm:block" />
                Informações
              </TabsTrigger>
              <TabsTrigger value="images" className="gap-2">
                <Image className="w-4 h-4 hidden sm:block" />
                Imagens
              </TabsTrigger>
              <TabsTrigger value="hours" className="gap-2">
                <Clock className="w-4 h-4 hidden sm:block" />
                Horários
              </TabsTrigger>
              <TabsTrigger value="delivery" className="gap-2">
                <Truck className="w-4 h-4 hidden sm:block" />
                Entrega
              </TabsTrigger>
            </TabsList>

            {/* Basic Info Tab */}
            <TabsContent value="info">
              <Card>
                <CardHeader>
                  <CardTitle>Informações da Loja</CardTitle>
                  <CardDescription>
                    Dados básicos e contato da sua loja
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="name">Nome da loja *</Label>
                      <Input
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Nome da sua loja"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Telefone</Label>
                      <Input
                        id="phone"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="(00) 00000-0000"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">E-mail</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="contato@sualoja.com"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Descrição</Label>
                    <Textarea
                      id="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Descreva sua loja..."
                      rows={3}
                    />
                  </div>

                  <div className="border-t pt-6">
                    <h4 className="font-medium mb-4">Endereço</h4>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2 sm:col-span-2">
                        <Label htmlFor="address">Endereço *</Label>
                        <Input
                          id="address"
                          value={address}
                          onChange={(e) => setAddress(e.target.value)}
                          placeholder="Rua, número, bairro"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="city">Cidade *</Label>
                        <Input
                          id="city"
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                          placeholder="Cidade"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="state">Estado *</Label>
                        <Input
                          id="state"
                          value={state}
                          onChange={(e) => setState(e.target.value)}
                          placeholder="UF"
                          maxLength={2}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="zipCode">CEP</Label>
                        <Input
                          id="zipCode"
                          value={zipCode}
                          onChange={(e) => setZipCode(e.target.value)}
                          placeholder="00000-000"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="border-t pt-6 flex items-center justify-between">
                    <div>
                      <Label htmlFor="isOpen">Loja aberta</Label>
                      <p className="text-sm text-muted-foreground">
                        Defina se sua loja está aceitando pedidos
                      </p>
                    </div>
                    <Switch
                      id="isOpen"
                      checked={isOpen}
                      onCheckedChange={setIsOpen}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Images Tab */}
            <TabsContent value="images">
              <Card>
                <CardHeader>
                  <CardTitle>Imagens da Loja</CardTitle>
                  <CardDescription>
                    Logo e banner que aparecem na vitrine
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="logoUrl">URL do Logo</Label>
                    <Input
                      id="logoUrl"
                      value={logoUrl}
                      onChange={(e) => setLogoUrl(e.target.value)}
                      placeholder="https://exemplo.com/logo.png"
                    />
                    {logoUrl && (
                      <div className="mt-2">
                        <img
                          src={logoUrl}
                          alt="Logo preview"
                          className="w-24 h-24 object-cover rounded-lg border"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bannerUrl">URL do Banner</Label>
                    <Input
                      id="bannerUrl"
                      value={bannerUrl}
                      onChange={(e) => setBannerUrl(e.target.value)}
                      placeholder="https://exemplo.com/banner.png"
                    />
                    {bannerUrl && (
                      <div className="mt-2">
                        <img
                          src={bannerUrl}
                          alt="Banner preview"
                          className="w-full max-w-md h-32 object-cover rounded-lg border"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Opening Hours Tab */}
            <TabsContent value="hours">
              <Card>
                <CardHeader>
                  <CardTitle>Horário de Funcionamento</CardTitle>
                  <CardDescription>
                    Configure os dias e horários de abertura
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {DAYS_OF_WEEK.map((day) => (
                      <div
                        key={day.key}
                        className="flex items-center gap-4 p-4 rounded-lg border bg-muted/30"
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-[140px]">
                          <Switch
                            checked={!openingHours[day.key]?.closed}
                            onCheckedChange={(checked) => 
                              updateOpeningHour(day.key, 'closed', !checked)
                            }
                          />
                          <span className={`font-medium ${openingHours[day.key]?.closed ? 'text-muted-foreground' : ''}`}>
                            {day.label}
                          </span>
                        </div>
                        
                        {!openingHours[day.key]?.closed ? (
                          <div className="flex items-center gap-2">
                            <Input
                              type="time"
                              value={openingHours[day.key]?.open || '08:00'}
                              onChange={(e) => updateOpeningHour(day.key, 'open', e.target.value)}
                              className="w-28"
                            />
                            <span className="text-muted-foreground">às</span>
                            <Input
                              type="time"
                              value={openingHours[day.key]?.close || '18:00'}
                              onChange={(e) => updateOpeningHour(day.key, 'close', e.target.value)}
                              className="w-28"
                            />
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-sm">Fechado</span>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Delivery Tab */}
            <TabsContent value="delivery">
              <Card>
                <CardHeader>
                  <CardTitle>Configurações de Entrega</CardTitle>
                  <CardDescription>
                    Taxas e tempo estimado de entrega
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid gap-6 sm:grid-cols-3">
                    <div className="space-y-2">
                      <Label htmlFor="deliveryFee">Taxa de entrega (R$)</Label>
                      <Input
                        id="deliveryFee"
                        type="number"
                        min="0"
                        step="0.01"
                        value={deliveryFee}
                        onChange={(e) => setDeliveryFee(e.target.value)}
                        placeholder="0.00"
                      />
                      <p className="text-xs text-muted-foreground">
                        Valor cobrado por entrega
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="minOrderValue">Pedido mínimo (R$)</Label>
                      <Input
                        id="minOrderValue"
                        type="number"
                        min="0"
                        step="0.01"
                        value={minOrderValue}
                        onChange={(e) => setMinOrderValue(e.target.value)}
                        placeholder="0.00"
                      />
                      <p className="text-xs text-muted-foreground">
                        Valor mínimo para pedidos
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="avgDeliveryTime">Tempo médio (min)</Label>
                      <Input
                        id="avgDeliveryTime"
                        type="number"
                        min="1"
                        value={avgDeliveryTime}
                        onChange={(e) => setAvgDeliveryTime(e.target.value)}
                        placeholder="30"
                      />
                      <p className="text-xs text-muted-foreground">
                        Tempo estimado de entrega
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}
