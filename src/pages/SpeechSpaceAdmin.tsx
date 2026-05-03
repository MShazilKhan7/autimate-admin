import { useState } from 'react';
import { Search, Plus, Rocket, Edit, Trash2, Save, X, Layers, Star, PlusCircle, CheckCircle2, Loader2, Gamepad2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { spaceAPI, SpeechSpaceLevel, PracticeItem } from '@/api/space';

export default function SpeechSpaceAdmin() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLevel, setEditingLevel] = useState<SpeechSpaceLevel | null>(null);
  const [formState, setFormState] = useState<Partial<SpeechSpaceLevel>>({
    levelNumber: 1,
    name: '',
    description: '',
    icon: '🚀',
    starsRequired: 0,
    items: []
  });

  // Fetch Data
  const { data: levelsData, isLoading } = useQuery({
    queryKey: ['speech-space'],
    queryFn: spaceAPI.getAll
  });

  const levels: SpeechSpaceLevel[] = levelsData?.data || [];

  // Mutations
  const createMutation = useMutation({
    mutationFn: spaceAPI.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['speech-space'] });
      toast.success("New level added to game");
      setIsModalOpen(false);
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string, data: Partial<SpeechSpaceLevel> }) => spaceAPI.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['speech-space'] });
      toast.success("Level configuration updated");
      setIsModalOpen(false);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: spaceAPI.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['speech-space'] });
      toast.success("Level removed");
    }
  });

  const handleOpenAdd = () => {
    setEditingLevel(null);
    setFormState({ 
      levelNumber: (levels[levels.length - 1]?.levelNumber || 0) + 1,
      name: '',
      description: '',
      icon: '🚀',
      starsRequired: 0,
      items: []
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (level: SpeechSpaceLevel) => {
    setEditingLevel(level);
    setFormState({ ...level });
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("Permanently delete this level?")) {
      deleteMutation.mutate(id);
    }
  };

  const handleAddItem = () => {
    const newItem: PracticeItem = { text: '', type: 'word', hint: '', emoji: '✨' };
    setFormState({ ...formState, items: [...(formState.items || []), newItem] });
  };

  const handleRemoveItem = (index: number) => {
    const newItems = [...(formState.items || [])];
    newItems.splice(index, 1);
    setFormState({ ...formState, items: newItems });
  };

  const handleUpdateItem = (index: number, field: keyof PracticeItem, value: string) => {
    const newItems = [...(formState.items || [])];
    newItems[index] = { ...newItems[index], [field]: value };
    setFormState({ ...formState, items: newItems });
  };

  const handleSave = () => {
    if (!formState.name) {
      toast.error("Level name is required");
      return;
    }

    if (editingLevel && editingLevel._id) {
      updateMutation.mutate({ id: editingLevel._id, data: formState });
    } else {
      createMutation.mutate(formState as SpeechSpaceLevel);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
             <Rocket className="h-8 w-8 text-sky-500" /> Speech Space Curriculum
          </h1>
          <p className="text-muted-foreground mt-1">Configure game levels, star requirements, and practice items.</p>
        </div>
        <button onClick={handleOpenAdd} className="therapy-button flex items-center gap-2 bg-sky-600 hover:bg-sky-700 shadow-lg shadow-sky-200">
          <Plus className="h-4 w-4" /> New Level
        </button>
      </div>

      {isLoading ? (
        <div className="p-20 flex flex-col items-center justify-center gap-4">
           <Loader2 className="h-10 w-10 animate-spin text-sky-500" />
           <p className="text-muted-foreground font-medium">Loading game curriculum...</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {levels.map((level) => (
            <Card key={level._id} className="therapy-card border-none group hover:scale-[1.02] transition-all duration-300 overflow-hidden">
              <div className="h-2 bg-sky-500/10 group-hover:bg-sky-500 transition-colors" />
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                  <Gamepad2 className="h-3.5 w-3.5" /> Level {level.levelNumber}
                </CardTitle>
                <div className="text-2xl">{level.icon}</div>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <h3 className="text-xl font-bold text-foreground">{level.name}</h3>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{level.description}</p>
                </div>
                
                <div className="flex items-center justify-between py-3 border-y border-muted/20 mb-6">
                  <div className="flex flex-col items-center">
                    <span className="text-xs font-bold text-muted-foreground">Items</span>
                    <span className="text-lg font-bold text-foreground">{level.items.length}</span>
                  </div>
                  <div className="w-px h-8 bg-muted/20" />
                  <div className="flex flex-col items-center">
                    <span className="text-xs font-bold text-muted-foreground">Stars</span>
                    <div className="flex items-center gap-1">
                      <Star className="h-3 w-3 text-amber-500 fill-amber-500" />
                      <span className="text-lg font-bold text-foreground">{level.starsRequired}</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => handleOpenEdit(level)} className="flex-1 rounded-xl border-muted/30 hover:bg-sky-50 hover:text-sky-600 hover:border-sky-200 gap-2">
                    <Edit className="h-3.5 w-3.5" /> Edit
                  </Button>
                  <Button variant="ghost" onClick={() => handleDelete(level._id!)} className="h-10 w-10 p-0 text-rose-600 hover:bg-rose-50 rounded-xl">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
          
          {levels.length === 0 && (
            <div className="col-span-full p-20 text-center bg-muted/10 rounded-3xl border-2 border-dashed border-muted/20">
              <Rocket className="h-12 w-12 text-muted/30 mx-auto mb-4" />
              <p className="text-muted-foreground font-medium">No game levels found. Add your first level to start the curriculum!</p>
            </div>
          )}
        </div>
      )}

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto rounded-3xl border-none shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-sky-600">
              {editingLevel ? 'Edit Level Details' : 'Configure New Level'}
            </DialogTitle>
            <DialogDescription>
              Define the level structure, items, and unlock requirements.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-6 py-4">
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-3 grid gap-2">
                <Label className="text-sm font-semibold text-muted-foreground">Level #</Label>
                <Input
                  type="number"
                  value={formState.levelNumber}
                  onChange={(e) => setFormState({ ...formState, levelNumber: parseInt(e.target.value) })}
                  className="rounded-xl bg-muted/20 border-none h-11 text-center font-bold"
                />
              </div>
              <div className="col-span-6 grid gap-2">
                <Label className="text-sm font-semibold text-muted-foreground">Level Name</Label>
                <Input
                  value={formState.name}
                  onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                  className="rounded-xl bg-muted/20 border-none h-11"
                  placeholder="e.g. Milky Way"
                />
              </div>
              <div className="col-span-3 grid gap-2">
                <Label className="text-sm font-semibold text-muted-foreground">Stars Req.</Label>
                <Input
                  type="number"
                  value={formState.starsRequired}
                  onChange={(e) => setFormState({ ...formState, starsRequired: parseInt(e.target.value) })}
                  className="rounded-xl bg-muted/20 border-none h-11 text-center font-bold text-amber-600"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
               <div className="grid gap-2">
                <Label className="text-sm font-semibold text-muted-foreground">Description</Label>
                <Input
                  value={formState.description}
                  onChange={(e) => setFormState({ ...formState, description: e.target.value })}
                  className="rounded-xl bg-muted/20 border-none h-11"
                  placeholder="Briefly describe this level..."
                />
              </div>
              <div className="grid gap-2">
                <Label className="text-sm font-semibold text-muted-foreground">Level Icon</Label>
                <Input
                  value={formState.icon}
                  onChange={(e) => setFormState({ ...formState, icon: e.target.value })}
                  className="rounded-xl bg-muted/20 border-none h-11 text-center text-xl"
                  placeholder="🚀"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-muted/20 pb-2">
                <h3 className="font-bold text-foreground flex items-center gap-2">
                  <Layers className="h-4 w-4 text-sky-500" /> Practice Items ({formState.items?.length || 0})
                </h3>
                <Button variant="ghost" onClick={handleAddItem} className="h-8 text-sky-600 hover:bg-sky-50 rounded-lg gap-2 text-xs font-bold">
                  <PlusCircle className="h-4 w-4" /> Add Item
                </Button>
              </div>

              <div className="space-y-3">
                {formState.items?.map((item, idx) => (
                  <div key={idx} className="p-4 bg-muted/10 rounded-2xl flex gap-4 items-start group relative">
                    <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-xs font-bold text-sky-500 shrink-0 shadow-sm">
                      {idx + 1}
                    </div>
                    <div className="flex-1 grid grid-cols-12 gap-3">
                      <div className="col-span-7">
                        <Input 
                          placeholder="Item text..." 
                          value={item.text} 
                          onChange={(e) => handleUpdateItem(idx, 'text', e.target.value)}
                          className="bg-white border-none rounded-lg h-9 text-sm"
                        />
                      </div>
                      <div className="col-span-5">
                         <Select value={item.type} onValueChange={(v) => handleUpdateItem(idx, 'type', v)}>
                          <SelectTrigger className="bg-white border-none rounded-lg h-9 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="letter">Letter</SelectItem>
                            <SelectItem value="word">Word</SelectItem>
                            <SelectItem value="sentence">Sentence</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="col-span-12">
                        <Input 
                          placeholder="Helpful hint..." 
                          value={item.hint}
                          onChange={(e) => handleUpdateItem(idx, 'hint', e.target.value)}
                          className="bg-white/50 border-none rounded-lg h-8 text-[11px] italic"
                        />
                      </div>
                    </div>
                    <Button 
                      variant="ghost" 
                      onClick={() => handleRemoveItem(idx)}
                      className="h-8 w-8 p-0 text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                
                {formState.items?.length === 0 && (
                  <div className="p-8 text-center bg-muted/5 rounded-2xl border border-dashed border-muted/20">
                    <p className="text-xs text-muted-foreground italic">Add at least one practice item to this level.</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <DialogFooter className="sticky bottom-0 bg-white pt-4">
            <Button variant="ghost" onClick={() => setIsModalOpen(false)} className="rounded-xl px-6">Cancel</Button>
            <Button 
              onClick={handleSave} 
              disabled={createMutation.isPending || updateMutation.isPending}
              className="rounded-xl px-8 bg-sky-600 hover:bg-sky-700 text-white gap-2 shadow-lg shadow-sky-200"
            >
              {createMutation.isPending || updateMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              Save Level
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
