import { useState } from 'react';
import { 
  Search, Plus, Brain, Edit, Trash2, 
  ImageIcon, X, Save, AlertCircle 
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
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

// Mock data structure
interface Exercise {
  word: string;
  relatedPhoneme: string[];
  level: number;
  image: string[];
}

const initialData: Record<string, Exercise[]> = {
  "1": [
    { "word": "ball", "relatedPhoneme": ["b","ɔ","l"], "level": 1, "image": ["ball1.png","ball2.png"] },
    { "word": "cat", "relatedPhoneme": ["k","æ","t"], "level": 1, "image": ["cat1.png","cat2.png"] },
  ],
  "2": [
    { "word": "apple", "relatedPhoneme": ["æ","p","əl"], "level": 2, "image": ["apple1.png","apple2.png"] },
  ],
  "3": [], "4": [], "5": []
};

export default function ExercisesPage() {
  const [data, setData] = useState(initialData);
  const [activeLevel, setActiveLevel] = useState("1");
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExercise, setEditingExercise] = useState<Exercise | null>(null);
  const [formState, setFormState] = useState<Exercise>({
    word: '',
    relatedPhoneme: [],
    level: 1,
    image: []
  });

  const filteredExercises = (data[activeLevel] || []).filter(ex => 
    ex.word.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenAdd = () => {
    setEditingExercise(null);
    setFormState({ word: '', relatedPhoneme: [], level: parseInt(activeLevel), image: [] });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (ex: Exercise) => {
    setEditingExercise(ex);
    setFormState({ ...ex });
    setIsModalOpen(true);
  };

  const handleDelete = (word: string) => {
    if (confirm(`Are you sure you want to delete "${word}"?`)) {
      const updatedLevelData = data[activeLevel].filter(ex => ex.word !== word);
      setData({ ...data, [activeLevel]: updatedLevelData });
      toast.success("Exercise deleted successfully");
    }
  };

  const handleSave = () => {
    if (!formState.word) {
      toast.error("Word is required");
      return;
    }

    const updatedData = { ...data };
    const levelKey = formState.level.toString();
    
    if (editingExercise) {
      // Update
      updatedData[levelKey] = updatedData[levelKey].map(ex => 
        ex.word === editingExercise.word ? formState : ex
      );
    } else {
      // Add
      if (updatedData[levelKey].some(ex => ex.word === formState.word)) {
        toast.error("This word already exists in this level");
        return;
      }
      updatedData[levelKey] = [...updatedData[levelKey], formState];
    }

    setData(updatedData);
    setIsModalOpen(false);
    toast.success(editingExercise ? "Word updated" : "Word added");
  };

  const addPhoneme = (p: string) => {
    if (p && !formState.relatedPhoneme.includes(p)) {
      setFormState({ ...formState, relatedPhoneme: [...formState.relatedPhoneme, p] });
    }
  };

  const removePhoneme = (p: string) => {
    setFormState({ ...formState, relatedPhoneme: formState.relatedPhoneme.filter(item => item !== p) });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Imitation Exercises</h1>
          <p className="text-muted-foreground mt-1">Full management of speech therapy syllabus data.</p>
        </div>
        <button onClick={handleOpenAdd} className="therapy-button flex items-center gap-2 shadow-lg shadow-primary/20">
          <Plus className="h-4 w-4" /> Add New Word
        </button>
      </div>

      <Card className="therapy-card border-none">
        <CardHeader className="pb-0">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <Tabs value={activeLevel} onValueChange={setActiveLevel} className="w-full max-w-md">
              <TabsList className="bg-muted/20 p-1 rounded-xl w-full">
                {["1", "2", "3", "4", "5"].map((level) => (
                  <TabsTrigger 
                    key={level} 
                    value={level}
                    className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white transition-all px-6"
                  >
                    Lvl {level}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
            
            <div className="relative w-full max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search words..." 
                className="pl-10 bg-muted/20 border-none rounded-xl"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="pt-6">
          <div className="rounded-xl border border-muted/20 overflow-hidden">
            <Table>
              <TableHeader className="bg-muted/5">
                <TableRow className="hover:bg-transparent border-muted/20">
                  <TableHead className="w-[200px]">Word</TableHead>
                  <TableHead>Phonemes</TableHead>
                  <TableHead>Assets</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredExercises.length > 0 ? (
                  filteredExercises.map((ex, idx) => (
                    <TableRow key={idx} className="border-muted/20 hover:bg-muted/10 transition-colors group">
                      <TableCell className="font-bold text-lg text-primary capitalize">{ex.word}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {ex.relatedPhoneme.map((p, i) => (
                            <span key={i} className="px-2 py-0.5 bg-primary/10 text-primary rounded-md text-xs font-mono font-medium">
                              /{p}/
                            </span>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="p-1.5 bg-blue-50 rounded-lg">
                            <ImageIcon className="h-3.5 w-3.5 text-blue-600" />
                          </div>
                          <span className="text-xs font-medium">{ex.image.length} images</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => handleOpenEdit(ex)}
                            className="h-8 w-8 p-0 hover:bg-primary/10 hover:text-primary"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => handleDelete(ex.word)}
                            className="h-8 w-8 p-0 text-rose-600 hover:text-rose-600 hover:bg-rose-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="h-32 text-center">
                      <div className="flex flex-col items-center justify-center text-muted-foreground gap-2">
                        <AlertCircle className="h-8 w-8 opacity-20" />
                        <p>No words found in Level {activeLevel}</p>
                        <Button variant="link" onClick={handleOpenAdd} className="text-primary p-0 h-auto">Add the first one</Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Management Dialog */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[500px] rounded-3xl border-none shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-primary">
              {editingExercise ? 'Edit Word' : 'Add New Word'}
            </DialogTitle>
            <DialogDescription>
              Update the speech therapy data for Level {formState.level}.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-6 py-4">
            <div className="grid gap-2">
              <Label htmlFor="word" className="text-sm font-semibold">Target Word</Label>
              <Input
                id="word"
                placeholder="e.g. Banana"
                value={formState.word}
                onChange={(e) => setFormState({ ...formState, word: e.target.value })}
                className="rounded-xl bg-muted/20 border-none h-11"
              />
            </div>

            <div className="grid gap-2">
              <Label className="text-sm font-semibold">Phonemes</Label>
              <div className="flex flex-wrap gap-2 p-3 bg-muted/20 rounded-xl min-h-[44px]">
                {formState.relatedPhoneme.map((p) => (
                  <span key={p} className="flex items-center gap-1.5 px-2.5 py-1 bg-white rounded-lg text-sm shadow-sm border border-primary/10">
                    /{p}/
                    <X className="h-3 w-3 cursor-pointer text-muted-foreground hover:text-rose-500" onClick={() => removePhoneme(p)} />
                  </span>
                ))}
                <input
                  placeholder="Type and press Enter..."
                  className="bg-transparent border-none outline-none text-sm flex-1 min-w-[120px]"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      addPhoneme(e.currentTarget.value);
                      e.currentTarget.value = '';
                    }
                  }}
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label className="text-sm font-semibold">Images (Filenames)</Label>
              <div className="grid gap-2">
                {formState.image.map((img, idx) => (
                  <div key={idx} className="flex gap-2">
                    <Input 
                      value={img} 
                      className="rounded-xl bg-muted/20 border-none h-10"
                      onChange={(e) => {
                        const newImgs = [...formState.image];
                        newImgs[idx] = e.target.value;
                        setFormState({ ...formState, image: newImgs });
                      }}
                    />
                    <Button variant="ghost" size="icon" onClick={() => setFormState({ ...formState, image: formState.image.filter((_, i) => i !== idx) })}>
                      <X className="h-4 w-4 text-muted-foreground" />
                    </Button>
                  </div>
                ))}
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="rounded-xl border-dashed border-muted-foreground/30 hover:bg-primary/5 hover:text-primary hover:border-primary/30"
                  onClick={() => setFormState({ ...formState, image: [...formState.image, ''] })}
                >
                  <Plus className="h-3 w-3 mr-2" /> Add Image Path
                </Button>
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="ghost" onClick={() => setIsModalOpen(false)} className="rounded-xl px-6">Cancel</Button>
            <Button onClick={handleSave} className="rounded-xl px-8 bg-primary hover:bg-primary/90 text-white gap-2 shadow-lg shadow-primary/20">
              <Save className="h-4 w-4" /> {editingExercise ? 'Update Word' : 'Save Word'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
