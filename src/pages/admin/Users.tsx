import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, Search, Filter, Eye, Shield, ShieldCheck, 
  Store, Truck, User as UserIcon, MoreHorizontal, Plus, Pencil, Trash2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { CreateUserDialog } from '@/components/admin/CreateUserDialog';
import { EditUserDialog } from '@/components/admin/EditUserDialog';
import { ExportButton } from '@/components/admin/ExportButton';
import { DeleteUserDialog } from '@/components/admin/DeleteUserDialog';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { Database } from '@/integrations/supabase/types';

type AppRole = Database['public']['Enums']['app_role'];

interface UserProfile {
  id: string;
  user_id: string;
  full_name: string | null;
  phone: string | null;
  city: string | null;
  state: string | null;
  created_at: string;
}

interface UserWithRoles extends UserProfile {
  roles: AppRole[];
}

const roleConfig: Record<AppRole, { label: string; icon: React.ElementType; color: string }> = {
  customer: { label: 'Cliente', icon: UserIcon, color: 'bg-muted text-muted-foreground' },
  company_owner: { label: 'Lojista', icon: Store, color: 'bg-primary/20 text-primary' },
  company_staff: { label: 'Funcionário', icon: Users, color: 'bg-secondary/20 text-secondary-foreground' },
  delivery_driver: { label: 'Entregador', icon: Truck, color: 'bg-accent/20 text-accent-foreground' },
  admin: { label: 'Admin', icon: ShieldCheck, color: 'bg-destructive/20 text-destructive' },
};

export default function AdminUsers() {
  const navigate = useNavigate();
  const { user, isAdmin, loading: authLoading } = useAuth();
  const [users, setUsers] = useState<UserWithRoles[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [selectedUser, setSelectedUser] = useState<UserWithRoles | null>(null);
  const [isAddingRole, setIsAddingRole] = useState(false);
  const [roleToAdd, setRoleToAdd] = useState<AppRole | ''>('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserWithRoles | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deletingUser, setDeletingUser] = useState<UserWithRoles | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    
    // Fetch profiles
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (profilesError) {
      console.error('Error fetching profiles:', profilesError);
      toast.error('Erro ao carregar usuários');
      setLoading(false);
      return;
    }

    // Fetch all roles
    const { data: allRoles, error: rolesError } = await supabase
      .from('user_roles')
      .select('user_id, role');

    if (rolesError) {
      console.error('Error fetching roles:', rolesError);
    }

    // Map profiles with roles
    const usersWithRoles: UserWithRoles[] = (profiles || []).map((profile) => {
      const userRoles = (allRoles || [])
        .filter(r => r.user_id === profile.user_id)
        .map(r => r.role);
      
      return {
        ...profile,
        roles: userRoles,
      };
    });

    setUsers(usersWithRoles);
    setLoading(false);
  };

  const handleAddRole = async () => {
    if (!selectedUser || !roleToAdd) return;

    const { error } = await supabase
      .from('user_roles')
      .insert({
        user_id: selectedUser.user_id,
        role: roleToAdd,
      });

    if (error) {
      if (error.code === '23505') {
        toast.error('Usuário já possui este papel');
      } else {
        console.error('Error adding role:', error);
        toast.error('Erro ao adicionar papel');
      }
      return;
    }

    toast.success(`Papel ${roleConfig[roleToAdd].label} adicionado com sucesso`);
    setIsAddingRole(false);
    setRoleToAdd('');
    
    // Update local state
    setUsers(users.map(u => 
      u.id === selectedUser.id 
        ? { ...u, roles: [...u.roles, roleToAdd] }
        : u
    ));
    setSelectedUser(prev => prev ? { ...prev, roles: [...prev.roles, roleToAdd] } : null);
  };

  const handleRemoveRole = async (roleToRemove: AppRole) => {
    if (!selectedUser) return;

    // Prevent removing last role
    if (selectedUser.roles.length <= 1) {
      toast.error('Usuário deve ter pelo menos um papel');
      return;
    }

    // Prevent removing own admin role
    if (roleToRemove === 'admin' && selectedUser.user_id === user?.id) {
      toast.error('Você não pode remover seu próprio papel de administrador');
      return;
    }

    const { error } = await supabase
      .from('user_roles')
      .delete()
      .eq('user_id', selectedUser.user_id)
      .eq('role', roleToRemove);

    if (error) {
      console.error('Error removing role:', error);
      toast.error('Erro ao remover papel');
      return;
    }

    toast.success(`Papel ${roleConfig[roleToRemove].label} removido com sucesso`);
    
    // Update local state
    const updatedRoles = selectedUser.roles.filter(r => r !== roleToRemove);
    setUsers(users.map(u => 
      u.id === selectedUser.id 
        ? { ...u, roles: updatedRoles }
        : u
    ));
    setSelectedUser(prev => prev ? { ...prev, roles: updatedRoles } : null);
  };

  const filteredUsers = users.filter(u => {
    const matchesSearch = 
      (u.full_name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (u.phone?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (u.city?.toLowerCase() || '').includes(searchTerm.toLowerCase());
    
    const matchesRole = roleFilter === 'all' || u.roles.includes(roleFilter as AppRole);
    
    return matchesSearch && matchesRole;
  });

  const availableRolesToAdd = selectedUser
    ? (Object.keys(roleConfig) as AppRole[]).filter(r => !selectedUser.roles.includes(r))
    : [];

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <AdminSidebar />

      <main className="lg:ml-64">
        <header className="sticky top-0 z-40 bg-card border-b border-border px-4 lg:px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold">Usuários</h1>
              <p className="text-sm text-muted-foreground">
                Gerencie os usuários da plataforma
              </p>
            </div>
            <div className="flex items-center gap-2">
              <ExportButton
                title="Usuários"
                subtitle="Relatório de usuários da plataforma"
                filename="usuarios-comanda"
                columns={[
                  { header: 'Nome', key: 'name', width: 25 },
                  { header: 'Telefone', key: 'phone', width: 18 },
                  { header: 'Cidade', key: 'city', width: 18 },
                  { header: 'Estado', key: 'state', width: 10 },
                  { header: 'Papéis', key: 'roles', width: 30 },
                  { header: 'Cadastro', key: 'date', width: 14 },
                ]}
                data={filteredUsers.map(u => ({
                  name: u.full_name || 'Sem nome',
                  phone: u.phone || '',
                  city: u.city || '',
                  state: u.state || '',
                  roles: u.roles.map(r => roleConfig[r].label).join(', '),
                  date: new Date(u.created_at).toLocaleDateString('pt-BR'),
                }))}
              />
              <Badge variant="outline" className="hidden sm:flex">
                {users.length} usuários
              </Badge>
              <Button onClick={() => setIsCreateOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Novo Usuário
              </Button>
            </div>
          </div>
        </header>

        <div className="p-4 lg:p-6 space-y-6">
          {/* Stats */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {(Object.entries(roleConfig) as [AppRole, typeof roleConfig[AppRole]][]).map(([role, config]) => {
              const count = users.filter(u => u.roles.includes(role)).length;
              const Icon = config.icon;
              return (
                <Card key={role} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setRoleFilter(role)}>
                  <CardContent className="pt-4 pb-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${config.color}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">{config.label}</p>
                        <p className="text-lg font-bold">{count}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Filters */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por nome, telefone ou cidade..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={roleFilter} onValueChange={setRoleFilter}>
                  <SelectTrigger className="w-full sm:w-48">
                    <Filter className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="Filtrar por papel" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os papéis</SelectItem>
                    {(Object.entries(roleConfig) as [AppRole, typeof roleConfig[AppRole]][]).map(([role, config]) => (
                      <SelectItem key={role} value={role}>{config.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Users Table */}
          <Card>
            <CardHeader>
              <CardTitle>Lista de Usuários ({filteredUsers.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {filteredUsers.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Nenhum usuário encontrado</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Usuário</TableHead>
                      <TableHead>Localização</TableHead>
                      <TableHead>Papéis</TableHead>
                      <TableHead>Cadastro</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((userItem) => (
                      <TableRow key={userItem.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center">
                              <UserIcon className="w-5 h-5 text-muted-foreground" />
                            </div>
                            <div>
                              <p className="font-medium">{userItem.full_name || 'Sem nome'}</p>
                              {userItem.phone && (
                                <p className="text-sm text-muted-foreground">{userItem.phone}</p>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {userItem.city && userItem.state 
                            ? `${userItem.city}, ${userItem.state}`
                            : <span className="text-muted-foreground">—</span>
                          }
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {userItem.roles.map((role) => {
                              const config = roleConfig[role];
                              const Icon = config.icon;
                              return (
                                <Badge key={role} className={config.color}>
                                  <Icon className="w-3 h-3 mr-1" />
                                  {config.label}
                                </Badge>
                              );
                            })}
                          </div>
                        </TableCell>
                        <TableCell>
                          {new Date(userItem.created_at).toLocaleDateString('pt-BR')}
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => { setEditingUser(userItem); setIsEditOpen(true); }}>
                                <Pencil className="w-4 h-4 mr-2" />
                                Editar
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                onClick={() => { 
                                  setSelectedUser(userItem); 
                                  setIsAddingRole(true); 
                                }}
                              >
                                <Shield className="w-4 h-4 mr-2" />
                                Gerenciar papéis
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                className="text-destructive"
                                onClick={() => { setDeletingUser(userItem); setIsDeleteOpen(true); }}
                                disabled={userItem.user_id === user?.id}
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Excluir
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      {/* User Details Dialog */}
      <Dialog open={!!selectedUser && !isAddingRole} onOpenChange={() => setSelectedUser(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Detalhes do Usuário</DialogTitle>
          </DialogHeader>

          {selectedUser && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center">
                  <UserIcon className="w-8 h-8 text-muted-foreground" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">{selectedUser.full_name || 'Sem nome'}</h3>
                  {selectedUser.phone && <p className="text-muted-foreground">{selectedUser.phone}</p>}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Cidade</p>
                  <p className="font-medium">{selectedUser.city || '—'}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Estado</p>
                  <p className="font-medium">{selectedUser.state || '—'}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Cadastrado em</p>
                  <p className="font-medium">
                    {new Date(selectedUser.created_at).toLocaleDateString('pt-BR')}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-muted-foreground mb-2">Papéis</p>
                <div className="flex flex-wrap gap-2">
                  {selectedUser.roles.map((role) => {
                    const config = roleConfig[role];
                    const Icon = config.icon;
                    return (
                      <Badge key={role} className={config.color}>
                        <Icon className="w-3 h-3 mr-1" />
                        {config.label}
                      </Badge>
                    );
                  })}
                </div>
              </div>

              <Button 
                className="w-full" 
                variant="outline"
                onClick={() => setIsAddingRole(true)}
              >
                <Shield className="w-4 h-4 mr-2" />
                Gerenciar Papéis
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Manage Roles Dialog */}
      <Dialog open={isAddingRole} onOpenChange={(open) => { setIsAddingRole(open); if (!open) setRoleToAdd(''); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Gerenciar Papéis</DialogTitle>
            <DialogDescription>
              Adicione ou remova papéis do usuário {selectedUser?.full_name || 'selecionado'}
            </DialogDescription>
          </DialogHeader>

          {selectedUser && (
            <div className="space-y-4">
              {/* Current Roles */}
              <div>
                <p className="text-sm font-medium mb-2">Papéis atuais</p>
                <div className="space-y-2">
                  {selectedUser.roles.map((role) => {
                    const config = roleConfig[role];
                    const Icon = config.icon;
                    const canRemove = selectedUser.roles.length > 1 && 
                      !(role === 'admin' && selectedUser.user_id === user?.id);
                    
                    return (
                      <div key={role} className="flex items-center justify-between p-2 bg-muted rounded-lg">
                        <div className="flex items-center gap-2">
                          <Badge className={config.color}>
                            <Icon className="w-3 h-3 mr-1" />
                            {config.label}
                          </Badge>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          disabled={!canRemove}
                          onClick={() => handleRemoveRole(role)}
                          className="text-destructive hover:text-destructive"
                        >
                          Remover
                        </Button>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Add New Role */}
              {availableRolesToAdd.length > 0 && (
                <div>
                  <p className="text-sm font-medium mb-2">Adicionar papel</p>
                  <div className="flex gap-2">
                    <Select value={roleToAdd} onValueChange={(v) => setRoleToAdd(v as AppRole)}>
                      <SelectTrigger className="flex-1">
                        <SelectValue placeholder="Selecione um papel" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableRolesToAdd.map((role) => (
                          <SelectItem key={role} value={role}>
                            {roleConfig[role].label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button onClick={handleAddRole} disabled={!roleToAdd}>
                      Adicionar
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => { setIsAddingRole(false); setRoleToAdd(''); }}>
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create User Dialog */}
      <CreateUserDialog 
        open={isCreateOpen} 
        onOpenChange={setIsCreateOpen} 
        onCreated={fetchUsers} 
      />

      {/* Edit User Dialog */}
      <EditUserDialog 
        user={editingUser} 
        open={isEditOpen} 
        onOpenChange={(open) => { setIsEditOpen(open); if (!open) setEditingUser(null); }} 
        onUpdated={fetchUsers} 
      />

      {/* Delete User Dialog */}
      <DeleteUserDialog 
        userId={deletingUser?.user_id || null}
        userName={deletingUser?.full_name || null}
        open={isDeleteOpen} 
        onOpenChange={(open) => { setIsDeleteOpen(open); if (!open) setDeletingUser(null); }} 
        onDeleted={fetchUsers} 
      />
    </div>
  );
}
