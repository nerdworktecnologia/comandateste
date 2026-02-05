import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, Package, ClipboardList, Settings, 
  Plus, Tag, Trash2, Edit, LogOut, ToggleLeft, ToggleRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Logo } from '@/components/Logo';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { Store as StoreType, Coupon } from '@/types';

export default function StoreCoupons() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [store, setStore] = useState<StoreType | null>(null);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  
  // Form state
  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');
  const [discountType, setDiscountType] = useState<'percentage' | 'fixed'>('percentage');
  const [discountValue, setDiscountValue] = useState('');
  const [minOrderValue, setMinOrderValue] = useState('');
  const [maxDiscount, setMaxDiscount] = useState('');
  const [usageLimit, setUsageLimit] = useState('');
  const [validUntil, setValidUntil] = useState('');

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    fetchStoreData();
  }, [user, navigate]);

  const fetchStoreData = async () => {
    if (!user) return;

    const { data: storeData } = await supabase
      .from('stores')
      .select('*')
      .eq('owner_id', user.id)
      .maybeSingle();

    if (storeData) {
      setStore(storeData as StoreType);
      await fetchCoupons(storeData.id);
    }

    setLoading(false);
  };

  const fetchCoupons = async (storeId: string) => {
    const { data } = await supabase
      .from('coupons')
      .select('*')
      .eq('store_id', storeId)
      .order('created_at', { ascending: false });

    if (data) {
      setCoupons(data as Coupon[]);
    }
  };

  const resetForm = () => {
    setCode('');
    setDescription('');
    setDiscountType('percentage');
    setDiscountValue('');
    setMinOrderValue('');
    setMaxDiscount('');
    setUsageLimit('');
    setValidUntil('');
    setEditingCoupon(null);
  };

  const openEditDialog = (coupon: Coupon) => {
    setEditingCoupon(coupon);
    setCode(coupon.code);
    setDescription(coupon.description || '');
    setDiscountType(coupon.discount_type);
    setDiscountValue(coupon.discount_value.toString());
    setMinOrderValue(coupon.min_order_value?.toString() || '');
    setMaxDiscount(coupon.max_discount?.toString() || '');
    setUsageLimit(coupon.usage_limit?.toString() || '');
    setValidUntil(coupon.valid_until ? coupon.valid_until.split('T')[0] : '');
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!store || !code || !discountValue) {
      toast.error('Preencha os campos obrigatórios');
      return;
    }

    const couponData = {
      store_id: store.id,
      code: code.toUpperCase().trim(),
      description: description || null,
      discount_type: discountType,
      discount_value: parseFloat(discountValue),
      min_order_value: minOrderValue ? parseFloat(minOrderValue) : 0,
      max_discount: maxDiscount ? parseFloat(maxDiscount) : null,
      usage_limit: usageLimit ? parseInt(usageLimit) : null,
      valid_until: validUntil ? new Date(validUntil).toISOString() : null,
    };

    if (editingCoupon) {
      const { error } = await supabase
        .from('coupons')
        .update(couponData)
        .eq('id', editingCoupon.id);

      if (error) {
        toast.error('Erro ao atualizar cupom');
        return;
      }
      toast.success('Cupom atualizado!');
    } else {
      const { error } = await supabase
        .from('coupons')
        .insert(couponData);

      if (error) {
        if (error.code === '23505') {
          toast.error('Já existe um cupom com este código');
        } else {
          toast.error('Erro ao criar cupom');
        }
        return;
      }
      toast.success('Cupom criado!');
    }

    setDialogOpen(false);
    resetForm();
    fetchCoupons(store.id);
  };

  const toggleCouponStatus = async (coupon: Coupon) => {
    const { error } = await supabase
      .from('coupons')
      .update({ is_active: !coupon.is_active })
      .eq('id', coupon.id);

    if (error) {
      toast.error('Erro ao atualizar status');
      return;
    }

    fetchCoupons(store!.id);
  };

  const deleteCoupon = async (couponId: string) => {
    if (!confirm('Tem certeza que deseja excluir este cupom?')) return;

    const { error } = await supabase
      .from('coupons')
      .delete()
      .eq('id', couponId);

    if (error) {
      toast.error('Erro ao excluir cupom');
      return;
    }

    toast.success('Cupom excluído!');
    fetchCoupons(store!.id);
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

  if (!store) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Você não possui uma loja cadastrada.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 bottom-0 w-64 bg-secondary text-secondary-foreground hidden lg:flex flex-col">
        <div className="p-4 border-b border-secondary-foreground/10">
          <Logo size="sm" />
        </div>

        <nav className="flex-1 p-4 space-y-1">
          <Link to="/store/dashboard" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-secondary-foreground/10">
            <LayoutDashboard className="w-5 h-5" />
            Dashboard
          </Link>
          <Link to="/store/products" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-secondary-foreground/10">
            <Package className="w-5 h-5" />
            Produtos
          </Link>
          <Link to="/store/orders" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-secondary-foreground/10">
            <ClipboardList className="w-5 h-5" />
            Pedidos
          </Link>
          <Link to="/store/coupons" className="flex items-center gap-3 px-4 py-3 rounded-lg bg-primary text-primary-foreground">
            <Tag className="w-5 h-5" />
            Cupons
          </Link>
          <Link to="/store/settings" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-secondary-foreground/10">
            <Settings className="w-5 h-5" />
            Configurações
          </Link>
        </nav>

        <div className="p-4 border-t border-secondary-foreground/10">
          <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-secondary-foreground/10 w-full">
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
              <h1 className="text-xl font-semibold">Cupons de Desconto</h1>
              <p className="text-sm text-muted-foreground">Gerencie os cupons da sua loja</p>
            </div>
            <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm(); }}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Novo Cupom
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>{editingCoupon ? 'Editar Cupom' : 'Novo Cupom'}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div>
                    <Label>Código do Cupom *</Label>
                    <Input
                      value={code}
                      onChange={(e) => setCode(e.target.value.toUpperCase())}
                      placeholder="EX: DESCONTO10"
                    />
                  </div>
                  <div>
                    <Label>Descrição</Label>
                    <Input
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="10% de desconto em compras acima de R$ 50"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Tipo de Desconto *</Label>
                      <Select value={discountType} onValueChange={(v) => setDiscountType(v as 'percentage' | 'fixed')}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="percentage">Porcentagem (%)</SelectItem>
                          <SelectItem value="fixed">Valor Fixo (R$)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Valor do Desconto *</Label>
                      <Input
                        type="number"
                        value={discountValue}
                        onChange={(e) => setDiscountValue(e.target.value)}
                        placeholder={discountType === 'percentage' ? '10' : '15.00'}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Pedido Mínimo (R$)</Label>
                      <Input
                        type="number"
                        value={minOrderValue}
                        onChange={(e) => setMinOrderValue(e.target.value)}
                        placeholder="50.00"
                      />
                    </div>
                    <div>
                      <Label>Desconto Máximo (R$)</Label>
                      <Input
                        type="number"
                        value={maxDiscount}
                        onChange={(e) => setMaxDiscount(e.target.value)}
                        placeholder="20.00"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Limite de Uso</Label>
                      <Input
                        type="number"
                        value={usageLimit}
                        onChange={(e) => setUsageLimit(e.target.value)}
                        placeholder="100"
                      />
                    </div>
                    <div>
                      <Label>Válido até</Label>
                      <Input
                        type="date"
                        value={validUntil}
                        onChange={(e) => setValidUntil(e.target.value)}
                      />
                    </div>
                  </div>
                  <Button className="w-full" onClick={handleSubmit}>
                    {editingCoupon ? 'Salvar Alterações' : 'Criar Cupom'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </header>

        <div className="p-4 lg:p-6">
          {coupons.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Tag className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h3 className="font-semibold mb-2">Nenhum cupom cadastrado</h3>
                <p className="text-muted-foreground mb-4">Crie seu primeiro cupom de desconto</p>
                <Button onClick={() => setDialogOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Criar Cupom
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {coupons.map((coupon) => (
                <Card key={coupon.id} className={!coupon.is_active ? 'opacity-60' : ''}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg font-mono">{coupon.code}</CardTitle>
                      <Badge variant={coupon.is_active ? 'default' : 'secondary'}>
                        {coupon.is_active ? 'Ativo' : 'Inativo'}
                      </Badge>
                    </div>
                    {coupon.description && (
                      <CardDescription>{coupon.description}</CardDescription>
                    )}
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="text-2xl font-bold text-primary">
                      {coupon.discount_type === 'percentage'
                        ? `${coupon.discount_value}% OFF`
                        : `R$ ${coupon.discount_value.toFixed(2)} OFF`}
                    </div>
                    <div className="text-sm text-muted-foreground space-y-1">
                      {coupon.min_order_value > 0 && (
                        <p>Pedido mínimo: R$ {coupon.min_order_value.toFixed(2)}</p>
                      )}
                      {coupon.max_discount && (
                        <p>Desconto máximo: R$ {coupon.max_discount.toFixed(2)}</p>
                      )}
                      {coupon.usage_limit && (
                        <p>Usos: {coupon.usage_count}/{coupon.usage_limit}</p>
                      )}
                      {coupon.valid_until && (
                        <p>Válido até: {new Date(coupon.valid_until).toLocaleDateString('pt-BR')}</p>
                      )}
                    </div>
                    <div className="flex gap-2 pt-2">
                      <Button variant="outline" size="sm" onClick={() => toggleCouponStatus(coupon)}>
                        {coupon.is_active ? (
                          <><ToggleRight className="w-4 h-4 mr-1" /> Desativar</>
                        ) : (
                          <><ToggleLeft className="w-4 h-4 mr-1" /> Ativar</>
                        )}
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => openEditDialog(coupon)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => deleteCoupon(coupon.id)}>
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
