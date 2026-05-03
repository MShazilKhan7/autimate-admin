import { useState } from 'react';
import { Search, UserPlus, MoreHorizontal, Edit, Trash2, Mail, Save, X, Shield, ShieldCheck, User as UserIcon, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usersAPI, User } from '@/api/users';

export default function UsersPage() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formState, setFormState] = useState<Partial<User>>({
    firstName: '',
    lastName: '',
    email: '',
    role: 'user',
  });

  // Fetch Data
  const { data: usersData, isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: usersAPI.getAll
  });

  const users: User[] = usersData?.users || [];

  // Mutations
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string, data: Partial<User> }) => usersAPI.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success("User updated successfully");
      setIsModalOpen(false);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: usersAPI.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success("User account deleted");
    }
  });

  const filteredUsers = users.filter(user => 
    `${user.firstName} ${user.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenEdit = (user: User) => {
    setEditingUser(user);
    setFormState({ ...user });
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("Permanently delete this user account? This cannot be undone.")) {
      deleteMutation.mutate(id);
    }
  };

  const handleSave = () => {
    if (!formState.firstName || !formState.email) {
      toast.error("Required fields are missing");
      return;
    }

    if (editingUser) {
      updateMutation.mutate({ id: editingUser._id, data: formState });
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">User Management</h1>
          <p className="text-muted-foreground mt-1">Full control over accounts, roles, and platform access.</p>
        </div>
      </div>

      <Card className="therapy-card border-none">
        <CardHeader className="px-6 py-4 border-b border-muted/20 flex flex-row items-center justify-between">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search users..." 
              className="pl-10 bg-muted/20 border-none rounded-xl h-11"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground bg-muted/10 px-3 py-1.5 rounded-lg border border-muted/20">
             <ShieldCheck className="h-3.5 w-3.5 text-green-500" /> {users.length} Registered Accounts
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-20 flex flex-col items-center justify-center gap-4">
               <Loader2 className="h-10 w-10 animate-spin text-primary" />
               <p className="text-muted-foreground font-medium">Synchronizing user data...</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent border-muted/20 bg-muted/5">
                  <TableHead className="px-6 h-12">User Details</TableHead>
                  <TableHead className="h-12">Role</TableHead>
                  <TableHead className="h-12">Status</TableHead>
                  <TableHead className="h-12">Joined Date</TableHead>
                  <TableHead className="text-right px-6 h-12">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user._id} className="border-muted/20 hover:bg-muted/10 transition-colors group">
                    <TableCell className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold shadow-inner">
                          {user.firstName[0]}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-bold text-foreground text-sm">{user.firstName} {user.lastName}</span>
                          <span className="text-[11px] text-muted-foreground tracking-tight">{user.email}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5 w-fit ${
                        user.role === 'admin' ? 'bg-rose-100 text-rose-700' : 'bg-primary/10 text-primary'
                      }`}>
                        {user.role === 'admin' ? <Shield className="h-3 w-3" /> : <UserIcon className="h-3 w-3" />}
                        {user.role}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className={`h-2 w-2 rounded-full shadow-sm ${user.isVerified ? 'bg-green-500 animate-pulse' : 'bg-amber-500'}`} />
                        <span className="text-xs font-medium text-muted-foreground">{user.isVerified ? 'Verified' : 'Pending'}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-xs font-mono text-muted-foreground tracking-tighter">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right px-6">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-9 w-9 p-0 hover:bg-muted/30 rounded-xl">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="rounded-2xl border-muted/20 shadow-2xl w-48 p-1.5">
                          <DropdownMenuLabel className="text-[10px] font-bold uppercase text-muted-foreground px-2 py-1.5">User Actions</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => handleOpenEdit(user)} className="flex items-center gap-2 cursor-pointer rounded-lg py-2">
                            <Edit className="h-3.5 w-3.5" /> Edit Profile
                          </DropdownMenuItem>
                          <DropdownMenuSeparator className="bg-muted/20" />
                          <DropdownMenuItem onClick={() => handleDelete(user._id)} className="flex items-center gap-2 cursor-pointer rounded-lg py-2 text-rose-600 focus:text-rose-600 focus:bg-rose-50">
                            <Trash2 className="h-3.5 w-3.5" /> Delete Account
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredUsers.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="h-32 text-center text-muted-foreground italic">
                      No matching users found in the database.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[450px] rounded-3xl border-none shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-primary">
              {editingUser ? 'Update User' : 'User Settings'}
            </DialogTitle>
            <DialogDescription>
              Assign roles and update account permissions.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-5 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label className="text-sm font-semibold">First Name</Label>
                <Input
                  value={formState.firstName}
                  onChange={(e) => setFormState({ ...formState, firstName: e.target.value })}
                  className="rounded-xl bg-muted/20 border-none h-11"
                />
              </div>
              <div className="grid gap-2">
                <Label className="text-sm font-semibold">Last Name</Label>
                <Input
                  value={formState.lastName}
                  onChange={(e) => setFormState({ ...formState, lastName: e.target.value })}
                  className="rounded-xl bg-muted/20 border-none h-11"
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label className="text-sm font-semibold">Email Address</Label>
              <Input
                type="email"
                value={formState.email}
                onChange={(e) => setFormState({ ...formState, email: e.target.value })}
                className="rounded-xl bg-muted/20 border-none h-11"
              />
            </div>

            <div className="grid gap-2">
              <Label className="text-sm font-semibold">Platform Role</Label>
              <Select value={formState.role} onValueChange={(val: "user" | "admin") => setFormState({ ...formState, role: val })}>
                <SelectTrigger className="rounded-xl bg-muted/20 border-none h-11">
                  <SelectValue placeholder="Select Role" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-muted/20 shadow-xl">
                  <SelectItem value="user">User (Parent/Child)</SelectItem>
                  <SelectItem value="admin">System Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter className="mt-2">
            <Button variant="ghost" onClick={() => setIsModalOpen(false)} className="rounded-xl px-6">Cancel</Button>
            <Button 
              onClick={handleSave} 
              disabled={updateMutation.isPending}
              className="rounded-xl px-8 bg-primary hover:bg-primary/90 text-white gap-2 shadow-lg shadow-primary/20"
            >
              {updateMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              {editingUser ? 'Update Profile' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
