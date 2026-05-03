import { useState } from 'react';
import { Search, Plus, Sparkles, Edit, Trash2, ImageIcon, Save, X, Layers, Loader2 } from 'lucide-react';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { socialAPI, SocialSkill } from '@/api/social';

export default function SocialSkillsAdmin() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<SocialSkill | null>(null);
  const [formState, setFormState] = useState<Partial<SocialSkill>>({
    task: '',
    image: '',
    description: '',
    instruction: '',
    category: 'greetings'
  });

  // Fetch Data
  const { data: skillsData, isLoading } = useQuery({
    queryKey: ['social-skills'],
    queryFn: socialAPI.getAll
  });

  const tasks: SocialSkill[] = skillsData?.data || [];

  // Mutations
  const createMutation = useMutation({
    mutationFn: socialAPI.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['social-skills'] });
      toast.success("New social task added");
      setIsModalOpen(false);
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string, data: Partial<SocialSkill> }) => socialAPI.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['social-skills'] });
      toast.success("Social task updated");
      setIsModalOpen(false);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: socialAPI.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['social-skills'] });
      toast.success("Task removed");
    }
  });

  const filteredTasks = tasks.filter(t => 
    t.task.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenAdd = () => {
    setEditingTask(null);
    setFormState({ task: '', image: '', description: '', instruction: '', category: 'greetings' });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (task: SocialSkill) => {
    setEditingTask(task);
    setFormState({ ...task });
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("Delete this social task?")) {
      deleteMutation.mutate(id);
    }
  };

  const handleSave = () => {
    if (!formState.task || !formState.description) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (editingTask && editingTask._id) {
      updateMutation.mutate({ id: editingTask._id, data: formState });
    } else {
      createMutation.mutate(formState as SocialSkill);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
             <Sparkles className="h-8 w-8 text-violet-500" /> Social Skills Manager
          </h1>
          <p className="text-muted-foreground mt-1">Manage the library of social interaction tasks and instructions.</p>
        </div>
        <button onClick={handleOpenAdd} className="therapy-button flex items-center gap-2 bg-violet-600 hover:bg-violet-700 shadow-lg shadow-violet-200">
          <Plus className="h-4 w-4" /> New Task
        </button>
      </div>

      <Card className="therapy-card border-none">
        <CardHeader className="px-6 py-4 flex flex-row items-center justify-between border-b border-muted/20">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search tasks or categories..." 
              className="pl-10 bg-muted/20 border-none rounded-xl h-11"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-violet-50 rounded-lg border border-violet-100 text-violet-700 text-xs font-bold uppercase tracking-wider">
            <Layers className="h-3.5 w-3.5" /> {tasks.length} Total Tasks
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-20 flex flex-col items-center justify-center gap-4">
               <Loader2 className="h-10 w-10 animate-spin text-violet-500" />
               <p className="text-muted-foreground font-medium">Loading social tasks...</p>
            </div>
          ) : (
            <Table>
              <TableHeader className="bg-muted/5">
                <TableRow className="hover:bg-transparent border-muted/20">
                  <TableHead className="px-6">Task</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="hidden md:table-cell">Instructions</TableHead>
                  <TableHead className="text-right px-6">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTasks.map((task) => (
                  <TableRow key={task._id} className="border-muted/20 hover:bg-muted/10 transition-colors group">
                    <TableCell className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <img src={task.image} className="w-12 h-12 rounded-xl object-cover shadow-sm border border-white" alt="" />
                        <div className="flex flex-col">
                          <span className="font-bold text-foreground">{task.task}</span>
                          <span className="text-xs text-muted-foreground line-clamp-1">{task.description}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="px-2.5 py-1 bg-violet-100 text-violet-700 rounded-lg text-[10px] font-bold uppercase tracking-widest">
                        {task.category}
                      </span>
                    </TableCell>
                    <TableCell className="hidden md:table-cell max-w-[300px]">
                      <span className="text-xs italic text-muted-foreground line-clamp-2">"{task.instruction}"</span>
                    </TableCell>
                    <TableCell className="text-right px-6">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="sm" onClick={() => handleOpenEdit(task)} className="h-8 w-8 p-0 hover:bg-violet-50 hover:text-violet-600">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(task._id!)} className="h-8 w-8 p-0 text-rose-600 hover:bg-rose-50">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredTasks.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="h-32 text-center text-muted-foreground">
                      No tasks found. Click "New Task" to add one.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[550px] rounded-3xl border-none shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-violet-600">
              {editingTask ? 'Edit Social Task' : 'New Social Task'}
            </DialogTitle>
            <DialogDescription>
              Configure the interactive social skill practice for children.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-5 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label className="text-sm font-semibold">Task Name</Label>
                <Input
                  value={formState.task}
                  onChange={(e) => setFormState({ ...formState, task: e.target.value })}
                  className="rounded-xl bg-muted/20 border-none h-11"
                  placeholder="e.g. Wave Hello"
                />
              </div>
              <div className="grid gap-2">
                <Label className="text-sm font-semibold">Category</Label>
                <Select value={formState.category} onValueChange={(v) => setFormState({ ...formState, category: v })}>
                  <SelectTrigger className="rounded-xl bg-muted/20 border-none h-11">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-muted/20 shadow-xl">
                    <SelectItem value="greetings">Greetings</SelectItem>
                    <SelectItem value="manners">Manners</SelectItem>
                    <SelectItem value="needs">Needs</SelectItem>
                    <SelectItem value="social">Social</SelectItem>
                    <SelectItem value="emotions">Emotions</SelectItem>
                    <SelectItem value="communication">Communication</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-2">
              <Label className="text-sm font-semibold">Description</Label>
              <textarea
                value={formState.description}
                onChange={(e) => setFormState({ ...formState, description: e.target.value })}
                className="rounded-xl bg-muted/20 border-none p-3 h-20 text-sm outline-none resize-none"
                placeholder="What is this task about?"
              />
            </div>

            <div className="grid gap-2">
              <Label className="text-sm font-semibold">Instruction (Step-by-Step)</Label>
              <textarea
                value={formState.instruction}
                onChange={(e) => setFormState({ ...formState, instruction: e.target.value })}
                className="rounded-xl bg-muted/20 border-none p-3 h-20 text-sm outline-none resize-none border-2 border-transparent focus:border-violet-200"
                placeholder="How should the child perform this?"
              />
            </div>

            <div className="grid gap-2">
              <Label className="text-sm font-semibold">Image URL (Unsplash or Assets)</Label>
              <div className="flex gap-2">
                <Input
                  value={formState.image}
                  onChange={(e) => setFormState({ ...formState, image: e.target.value })}
                  className="rounded-xl bg-muted/20 border-none h-11"
                  placeholder="https://..."
                />
                <Button variant="ghost" className="rounded-xl h-11 bg-muted/20">
                   <ImageIcon className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          <DialogFooter className="mt-2">
            <Button variant="ghost" onClick={() => setIsModalOpen(false)} className="rounded-xl px-6">Cancel</Button>
            <Button 
              onClick={handleSave} 
              disabled={createMutation.isPending || updateMutation.isPending}
              className="rounded-xl px-8 bg-violet-600 hover:bg-violet-700 text-white gap-2 shadow-lg shadow-violet-200"
            >
              {createMutation.isPending || updateMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              Save Task
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
