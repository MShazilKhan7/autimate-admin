import { useState } from 'react';
import { Search, Plus, Mic, Edit, Trash2, Save, X, BookOpen, Loader2, Music } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { therapyAPI, SpeechTherapyWord } from '@/api/therapy';

export default function SpeechTherapyAdmin() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingWord, setEditingWord] = useState<SpeechTherapyWord | null>(null);
  const [formState, setFormState] = useState<Partial<SpeechTherapyWord>>({
    word: '',
    image: '',
    category: '',
    phonemes: []
  });

  // Fetch Data
  const { data: therapyData, isLoading } = useQuery({
    queryKey: ['speech-therapy'],
    queryFn: therapyAPI.getAll
  });

  const words: SpeechTherapyWord[] = therapyData?.data || [];

  // Mutations
  const createMutation = useMutation({
    mutationFn: therapyAPI.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['speech-therapy'] });
      toast.success("New word added to syllabus");
      setIsModalOpen(false);
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string, data: Partial<SpeechTherapyWord> }) => therapyAPI.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['speech-therapy'] });
      toast.success("Word updated");
      setIsModalOpen(false);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: therapyAPI.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['speech-therapy'] });
      toast.success("Word removed");
    }
  });

  const filteredWords = words.filter(w => 
    w.word.toLowerCase().includes(searchTerm.toLowerCase()) ||
    w.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenAdd = () => {
    setEditingWord(null);
    setFormState({ word: '', image: '', category: '', phonemes: [] });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (word: SpeechTherapyWord) => {
    setEditingWord(word);
    setFormState({ ...word });
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("Delete this word from the syllabus?")) {
      deleteMutation.mutate(id);
    }
  };

  const handleSave = () => {
    if (!formState.word || !formState.category) {
      toast.error("Please fill in required fields");
      return;
    }

    if (editingWord && editingWord._id) {
      updateMutation.mutate({ id: editingWord._id, data: formState });
    } else {
      createMutation.mutate(formState as SpeechTherapyWord);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
             <Mic className="h-8 w-8 text-emerald-500" /> Speech Therapy Syllabus
          </h1>
          <p className="text-muted-foreground mt-1">Manage phoneme targets and pronunciation exercises.</p>
        </div>
        <button onClick={handleOpenAdd} className="therapy-button flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-200">
          <Plus className="h-4 w-4" /> New Word
        </button>
      </div>

      <Card className="therapy-card border-none">
        <CardHeader className="px-6 py-4 flex flex-row items-center justify-between border-b border-muted/20">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search words..." 
              className="pl-10 bg-muted/20 border-none rounded-xl h-11"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 rounded-lg border border-emerald-100 text-emerald-700 text-xs font-bold uppercase tracking-wider">
            <BookOpen className="h-3.5 w-3.5" /> {words.length} Total Words
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-20 flex flex-col items-center justify-center gap-4">
               <Loader2 className="h-10 w-10 animate-spin text-emerald-500" />
               <p className="text-muted-foreground font-medium">Loading syllabus...</p>
            </div>
          ) : (
            <Table>
              <TableHeader className="bg-muted/5">
                <TableRow className="hover:bg-transparent border-muted/20">
                  <TableHead className="px-6 text-xs font-bold uppercase tracking-wider">Target Word</TableHead>
                  <TableHead className="text-xs font-bold uppercase tracking-wider">Category</TableHead>
                  <TableHead className="text-xs font-bold uppercase tracking-wider hidden md:table-cell">Phonemes</TableHead>
                  <TableHead className="text-right px-6 text-xs font-bold uppercase tracking-wider">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredWords.map((item) => (
                  <TableRow key={item._id} className="border-muted/20 hover:bg-muted/10 transition-colors group">
                    <TableCell className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <img src={item.image} className="w-12 h-12 rounded-xl object-cover shadow-sm border border-white" alt="" />
                        <span className="font-bold text-lg text-foreground tracking-tight">{item.word}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="px-2.5 py-1 bg-emerald-100 text-emerald-700 rounded-lg text-[10px] font-bold uppercase tracking-widest">
                        {item.category}
                      </span>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <div className="flex flex-wrap gap-1.5">
                        {item.phonemes.map((p, i) => (
                          <span key={i} className="px-2 py-0.5 bg-muted/30 text-muted-foreground rounded-md text-[11px] font-mono border border-muted/10">
                            /{p}/
                          </span>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="text-right px-6">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="sm" onClick={() => handleOpenEdit(item)} className="h-8 w-8 p-0 hover:bg-emerald-50 hover:text-emerald-600">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(item._id!)} className="h-8 w-8 p-0 text-rose-600 hover:bg-rose-50">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredWords.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="h-32 text-center text-muted-foreground">
                      No words found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[500px] rounded-3xl border-none shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-emerald-600">
              {editingWord ? 'Edit Word' : 'Add Word to Syllabus'}
            </DialogTitle>
            <DialogDescription>
              Set the pronunciation targets and visual aids for this exercise.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-5 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label className="text-sm font-semibold">Target Word</Label>
                <Input
                  value={formState.word}
                  onChange={(e) => setFormState({ ...formState, word: e.target.value })}
                  className="rounded-xl bg-muted/20 border-none h-11 text-lg font-semibold"
                  placeholder="e.g. Banana"
                />
              </div>
              <div className="grid gap-2">
                <Label className="text-sm font-semibold">Category</Label>
                <Input
                  value={formState.category}
                  onChange={(e) => setFormState({ ...formState, category: e.target.value })}
                  className="rounded-xl bg-muted/20 border-none h-11"
                  placeholder="e.g. Fruits"
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label className="text-sm font-semibold">Phonemes (Comma separated)</Label>
              <div className="relative">
                <Music className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-500" />
                <Input
                  value={formState.phonemes?.join(', ')}
                  onChange={(e) => setFormState({ ...formState, phonemes: e.target.value.split(',').map(p => p.trim()).filter(Boolean) })}
                  className="rounded-xl bg-muted/20 border-none h-11 pl-10 font-mono"
                  placeholder="b, uh, n, aa, n, uh"
                />
              </div>
              <p className="text-[10px] text-muted-foreground px-1 italic">Break the word into individual sounds for scoring.</p>
            </div>

            <div className="grid gap-2">
              <Label className="text-sm font-semibold">Image URL</Label>
              <Input
                value={formState.image}
                onChange={(e) => setFormState({ ...formState, image: e.target.value })}
                className="rounded-xl bg-muted/20 border-none h-11"
                placeholder="https://..."
              />
            </div>
          </div>

          <DialogFooter className="mt-2">
            <Button variant="ghost" onClick={() => setIsModalOpen(false)} className="rounded-xl px-6">Cancel</Button>
            <Button 
              onClick={handleSave} 
              disabled={createMutation.isPending || updateMutation.isPending}
              className="rounded-xl px-8 bg-emerald-600 hover:bg-emerald-700 text-white gap-2 shadow-lg shadow-emerald-200"
            >
              {createMutation.isPending || updateMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              Save Word
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
