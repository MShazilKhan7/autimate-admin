import { useState, useEffect } from 'react';
import {
  Search, Plus, Mic, Edit, Trash2, Save, BookOpen,
  Loader2, Music, Layers, X, ImageIcon,
  Video, Palette, Smile
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Table, TableBody, TableCell, TableHead,
  TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Dialog, DialogContent, DialogDescription,
  DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { therapyModulesAPI, therapyWordsAPI } from '@/api/therapy';
import type { SpeechTherapyWord, SpeechTherapyModule, ModuleStep, ModuleStepType } from "@/api/therapy";

/* ─────────────────────────────────────────────
   CONSTANTS
───────────────────────────────────────────── */

const STEP_TYPES: ModuleStepType[] = ['imitation', 'expressive', 'phoneme', 'checkpoint'];

const STEP_TYPE_META: Record<ModuleStepType, { label: string; color: string; bg: string }> = {
  imitation:  { label: 'Imitation',   color: 'text-violet-700',  bg: 'bg-violet-100'  },
  expressive: { label: 'Expressive',  color: 'text-sky-700',     bg: 'bg-sky-100'     },
  phoneme:    { label: 'Phoneme',     color: 'text-emerald-700', bg: 'bg-emerald-100' },
  checkpoint: { label: 'Checkpoint',  color: 'text-amber-700',   bg: 'bg-amber-100'   },
};

/* ─────────────────────────────────────────────
   SMALL HELPERS
───────────────────────────────────────────── */

function Badge({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest ${className}`}>
      {children}
    </span>
  );
}

function SectionTab({
  active, onClick, icon: Icon, label, count
}: {
  active: boolean; onClick: () => void;
  icon: React.ElementType; label: string; count: number;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2.5 px-5 py-3 rounded-2xl font-semibold text-sm transition-all duration-200 ${
        active
          ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-200'
          : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'
      }`}
    >
      <Icon className="h-4 w-4" />
      {label}
      <span className={`ml-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
        active ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-600'
      }`}>{count}</span>
    </button>
  );
}

/* ─────────────────────────────────────────────
   PHONEMES INPUT
   Root cause of the bug: the old code did value={form.phonemes?.join(', ')}
   which re-joined the array on every keystroke. The moment the user typed ","
   it parsed immediately → stripped the trailing comma → cursor jumped.

   Fix: maintain a LOCAL string draft that the user types into freely.
   The array is only updated when the field loses focus (onBlur).
   The badge preview derives from the current draft string inline,
   so it still updates as the user types without touching the array.
───────────────────────────────────────────── */

function PhonemesInput({
  value,
  onChange,
}: {
  value: string[];
  onChange: (v: string[]) => void;
}) {
  const [draft, setDraft] = useState(() => value.join(', '));

  // Sync draft when parent resets (e.g. modal opens with a fresh/existing word)
  useEffect(() => {
    setDraft(value.join(', '));
    // Only re-sync when the array identity changes (open/close), not on every
    // onChange call — otherwise we'd overwrite the user's in-progress typing.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(value)]);

  const parse = (raw: string): string[] =>
    raw.split(',').map(p => p.trim()).filter(Boolean);

  // Commit parsed array to parent only on blur
  const handleBlur = () => onChange(parse(draft));

  // Live preview from the current draft string (doesn't touch the parent state)
  const preview = parse(draft);

  return (
    <div className="grid gap-2">
      <Label className="text-sm font-semibold flex items-center gap-1.5">
        <Music className="h-4 w-4 text-emerald-500" /> Phonemes (comma-separated)
      </Label>
      <Input
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={handleBlur}
        className="rounded-xl bg-muted/20 border-none h-11 font-mono"
        placeholder="b, uh, n, aa, n, uh"
      />
      {preview.length > 0 && (
        <div className="flex flex-wrap gap-1.5 px-1">
          {preview.map((p, i) => (
            <span key={i} className="px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-md text-[11px] font-mono">
              /{p}/
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────
   URL LIST INPUT (for images / videos arrays)
───────────────────────────────────────────── */

function UrlListInput({
  label, icon: Icon, values, onChange, placeholder
}: {
  label: string;
  icon: React.ElementType;
  values: string[];
  onChange: (v: string[]) => void;
  placeholder?: string;
}) {
  const [draft, setDraft] = useState('');

  const add = () => {
    const trimmed = draft.trim();
    if (!trimmed) return;
    onChange([...values, trimmed]);
    setDraft('');
  };

  const remove = (i: number) => onChange(values.filter((_, idx) => idx !== i));

  return (
    <div className="grid gap-2">
      <Label className="text-sm font-semibold flex items-center gap-1.5">
        <Icon className="h-4 w-4 text-emerald-500" /> {label}
      </Label>
      <div className="flex gap-2">
        <Input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), add())}
          className="rounded-xl bg-muted/20 border-none h-10 text-sm"
          placeholder={placeholder ?? 'https://...'}
        />
        <Button type="button" onClick={add} size="sm"
          className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-3 h-10 shrink-0">
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      {values.length > 0 && (
        <div className="flex flex-col gap-1.5 mt-1">
          {values.map((url, i) => (
            <div key={i} className="flex items-center gap-2 bg-muted/20 rounded-xl px-3 py-2 group">
              <span className="text-xs text-muted-foreground truncate flex-1 font-mono">{url}</span>
              <button type="button" onClick={() => remove(i)}
                className="opacity-0 group-hover:opacity-100 transition-opacity text-rose-500 hover:text-rose-700">
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────
   WORDS SECTION
───────────────────────────────────────────── */

const emptyWord = (): Partial<SpeechTherapyWord> => ({
  word: '', emoji: '', phonemes: [], images: [], videos: [], category: '', color: '#10b981'
});

function WordsSection() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [editing, setEditing] = useState<SpeechTherapyWord | null>(null);
  const [form, setForm] = useState<Partial<SpeechTherapyWord>>(emptyWord());

  const { data, isLoading } = useQuery({
    queryKey: ['therapy-words'],
    queryFn: therapyWordsAPI.getAll,
  });

  const words: SpeechTherapyWord[] = data?.data ?? data ?? [];

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['therapy-words'] });

  const createMutation = useMutation({
    mutationFn: therapyWordsAPI.create,
    onSuccess: () => { invalidate(); toast.success('Word added to library'); setIsOpen(false); },
    onError: () => toast.error('Failed to create word'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<SpeechTherapyWord> }) =>
      therapyWordsAPI.update(id, data),
    onSuccess: () => { invalidate(); toast.success('Word updated'); setIsOpen(false); },
    onError: () => toast.error('Failed to update word'),
  });

  const deleteMutation = useMutation({
    mutationFn: therapyWordsAPI.delete,
    onSuccess: () => { invalidate(); toast.success('Word removed'); },
    onError: () => toast.error('Failed to delete word'),
  });

  const filtered = words.filter(w =>
    w.word.toLowerCase().includes(search.toLowerCase()) ||
    w.category.toLowerCase().includes(search.toLowerCase())
  );

  const openAdd = () => { setEditing(null); setForm(emptyWord()); setIsOpen(true); };
  const openEdit = (w: SpeechTherapyWord) => { setEditing(w); setForm({ ...w }); setIsOpen(true); };
  const handleDelete = (id: string) => { if (confirm('Remove this word?')) deleteMutation.mutate(id); };

  const handleSave = () => {
    if (!form.word?.trim() || !form.category?.trim()) {
      toast.error('Word and Category are required');
      return;
    }
    if (editing?._id) {
      updateMutation.mutate({ id: editing._id, data: form });
    } else {
      createMutation.mutate(form as SpeechTherapyWord);
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <>
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-4 mb-4">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search words or categories…"
            className="pl-10 bg-muted/20 border-none rounded-xl h-11"
            value={search} onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <button onClick={openAdd}
          className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-2xl shadow-lg shadow-emerald-200 transition-all duration-150 shrink-0">
          <Plus className="h-4 w-4" /> New Word
        </button>
      </div>

      {/* Table */}
      <Card className="border-none shadow-sm overflow-hidden rounded-3xl">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-20 flex flex-col items-center gap-3">
              <Loader2 className="h-9 w-9 animate-spin text-emerald-500" />
              <p className="text-muted-foreground text-sm">Loading word library…</p>
            </div>
          ) : (
            <Table>
              <TableHeader className="bg-muted/5">
                <TableRow className="hover:bg-transparent border-muted/20">
                  <TableHead className="px-6 text-xs font-bold uppercase tracking-wider">Word</TableHead>
                  <TableHead className="text-xs font-bold uppercase tracking-wider">Category</TableHead>
                  <TableHead className="text-xs font-bold uppercase tracking-wider hidden md:table-cell">Phonemes</TableHead>
                  <TableHead className="text-xs font-bold uppercase tracking-wider hidden lg:table-cell">Media</TableHead>
                  <TableHead className="text-right px-6 text-xs font-bold uppercase tracking-wider">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((item) => (
                  <TableRow key={item._id} className="border-muted/20 hover:bg-muted/10 transition-colors">
                    <TableCell className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-xl shadow-sm border border-white"
                          style={{ background: `${item.color}20` }}>
                          {item.emoji}
                        </div>
                        <div>
                          <p className="font-bold text-base text-foreground">{item.word}</p>
                          <div className="w-2.5 h-2.5 rounded-full mt-0.5" style={{ background: item.color }} />
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className="bg-emerald-100 text-emerald-700">{item.category}</Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <div className="flex flex-wrap gap-1">
                        {item.phonemes.slice(0, 5).map((p, i) => (
                          <span key={i} className="px-1.5 py-0.5 bg-muted/30 rounded text-[10px] font-mono border border-muted/10">/{p}/</span>
                        ))}
                        {item.phonemes.length > 5 && (
                          <span className="text-[10px] text-muted-foreground">+{item.phonemes.length - 5}</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        {(item.images?.length ?? 0) > 0 && (
                          <span className="flex items-center gap-1">
                            <ImageIcon className="h-3 w-3" /> {item.images!.length}
                          </span>
                        )}
                        {(item.videos?.length ?? 0) > 0 && (
                          <span className="flex items-center gap-1">
                            <Video className="h-3 w-3" /> {item.videos!.length}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right px-6">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="sm" onClick={() => openEdit(item)}
                          className="h-8 w-8 p-0 hover:bg-emerald-50 hover:text-emerald-600 rounded-xl">
                          <Edit className="h-3.5 w-3.5" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(item._id!)}
                          className="h-8 w-8 p-0 text-rose-500 hover:bg-rose-50 rounded-xl"
                          disabled={deleteMutation.isPending}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {filtered.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="h-32 text-center text-muted-foreground text-sm">
                      No words found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Word Modal */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[580px] rounded-3xl border-none shadow-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-emerald-600">
              {editing ? 'Edit Word' : 'Add New Word'}
            </DialogTitle>
            <DialogDescription>Fill in the word details, phonemes, and optional media URLs.</DialogDescription>
          </DialogHeader>

          <div className="grid gap-5 py-2">
            {/* Word + Emoji row */}
            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2 grid gap-2">
                <Label className="text-sm font-semibold">Target Word *</Label>
                <Input
                  value={form.word}
                  onChange={(e) => setForm({ ...form, word: e.target.value })}
                  className="rounded-xl bg-muted/20 border-none h-11 text-lg font-bold"
                  placeholder="e.g. Banana"
                />
              </div>
              <div className="grid gap-2">
                <Label className="text-sm font-semibold flex items-center gap-1">
                  <Smile className="h-3.5 w-3.5 text-amber-500" /> Emoji
                </Label>
                <Input
                  value={form.emoji}
                  onChange={(e) => setForm({ ...form, emoji: e.target.value })}
                  className="rounded-xl bg-muted/20 border-none h-11 text-2xl text-center"
                  placeholder="🍌"
                />
              </div>
            </div>

            {/* Category + Color row */}
            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2 grid gap-2">
                <Label className="text-sm font-semibold">Category *</Label>
                <Input
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="rounded-xl bg-muted/20 border-none h-11"
                  placeholder="e.g. Fruits"
                />
              </div>
              <div className="grid gap-2">
                <Label className="text-sm font-semibold flex items-center gap-1">
                  <Palette className="h-3.5 w-3.5 text-purple-500" /> Color
                </Label>
                <div className="flex items-center gap-2 bg-muted/20 rounded-xl h-11 px-3">
                  <input
                    type="color"
                    value={form.color ?? '#10b981'}
                    onChange={(e) => setForm({ ...form, color: e.target.value })}
                    className="w-7 h-7 rounded-lg border-none cursor-pointer bg-transparent"
                  />
                  <span className="text-xs font-mono text-muted-foreground">{form.color}</span>
                </div>
              </div>
            </div>

            {/* ✅ Fixed Phonemes input */}
            <PhonemesInput
              value={form.phonemes ?? []}
              onChange={(v) => setForm({ ...form, phonemes: v })}
            />

            {/* Images */}
            <UrlListInput
              label="Image URLs"
              icon={ImageIcon}
              values={form.images ?? []}
              onChange={(v) => setForm({ ...form, images: v })}
              placeholder="https://example.com/banana.jpg"
            />

            {/* Videos */}
            <UrlListInput
              label="Video URLs"
              icon={Video}
              values={form.videos ?? []}
              onChange={(v) => setForm({ ...form, videos: v })}
              placeholder="https://example.com/banana.mp4"
            />
          </div>

          <DialogFooter className="mt-3 gap-2">
            <Button variant="ghost" onClick={() => setIsOpen(false)} className="rounded-xl px-5">Cancel</Button>
            <Button onClick={handleSave} disabled={isPending}
              className="rounded-xl px-7 bg-emerald-600 hover:bg-emerald-700 text-white gap-2 shadow-lg shadow-emerald-200">
              {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              {editing ? 'Save Changes' : 'Add Word'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

/* ─────────────────────────────────────────────
   STEP EDITOR (inside Module form)
───────────────────────────────────────────── */

function StepEditor({
  steps, words, onChange
}: {
  steps: ModuleStep[];
  words: SpeechTherapyWord[];
  onChange: (steps: ModuleStep[]) => void;
}) {
  const addStep = () => {
    onChange([...steps, { type: 'imitation', title: '', phase: '', wordId: '' }]);
  };

  const updateStep = (i: number, patch: Partial<ModuleStep>) => {
    onChange(steps.map((s, idx) => idx === i ? { ...s, ...patch } : s));
  };

  const removeStep = (i: number) => {
    onChange(steps.filter((_, idx) => idx !== i));
  };

  return (
    <div className="grid gap-3">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-semibold flex items-center gap-1.5">
          <Layers className="h-4 w-4 text-emerald-500" /> Steps ({steps.length})
        </Label>
        <button type="button" onClick={addStep}
          className="flex items-center gap-1 text-xs font-semibold text-emerald-600 hover:text-emerald-800 px-3 py-1.5 bg-emerald-50 rounded-xl transition-colors">
          <Plus className="h-3.5 w-3.5" /> Add Step
        </button>
      </div>

      {steps.length === 0 && (
        <div className="flex flex-col items-center justify-center py-8 bg-muted/10 rounded-2xl text-muted-foreground text-sm gap-2 border border-dashed border-muted/30">
          <Layers className="h-7 w-7 opacity-30" />
          No steps yet. Add one above.
        </div>
      )}

      <div className="flex flex-col gap-3">
        {steps.map((step, i) => {
          const meta = STEP_TYPE_META[step.type];
          return (
            <div key={i} className="bg-muted/10 rounded-2xl p-4 border border-muted/20 relative group">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-slate-200 text-slate-600 text-[10px] font-bold flex items-center justify-center">{i + 1}</span>
                  <Badge className={`${meta.bg} ${meta.color}`}>{meta.label}</Badge>
                </div>
                <button type="button" onClick={() => removeStep(i)}
                  className="opacity-0 group-hover:opacity-100 text-rose-400 hover:text-rose-600 transition-all">
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-1.5">
                  <Label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Type</Label>
                  <select
                    value={step.type}
                    onChange={(e) => updateStep(i, { type: e.target.value as ModuleStepType })}
                    className="rounded-xl bg-muted/20 border-none h-9 px-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-400 w-full">
                    {STEP_TYPES.map(t => (
                      <option key={t} value={t}>{STEP_TYPE_META[t].label}</option>
                    ))}
                  </select>
                </div>

                <div className="grid gap-1.5">
                  <Label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Phase</Label>
                  <Input
                    value={step.phase}
                    onChange={(e) => updateStep(i, { phase: e.target.value })}
                    className="rounded-xl bg-muted/20 border-none h-9 text-sm"
                    placeholder="e.g. Phase 1"
                  />
                </div>

                <div className="grid gap-1.5 col-span-2">
                  <Label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Step Title</Label>
                  <Input
                    value={step.title}
                    onChange={(e) => updateStep(i, { title: e.target.value })}
                    className="rounded-xl bg-muted/20 border-none h-9 text-sm"
                    placeholder="e.g. Say the word clearly"
                  />
                </div>

                <div className="grid gap-1.5 col-span-2">
                  <Label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Linked Word (optional)</Label>
                  <select
                    value={typeof step.wordId === 'string' ? step.wordId : (step.wordId as SpeechTherapyWord)?._id ?? ''}
                    onChange={(e) => updateStep(i, { wordId: e.target.value || undefined })}
                    className="rounded-xl bg-muted/20 border-none h-9 px-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-400 w-full">
                    <option value="">— No word linked —</option>
                    {words.map(w => (
                      <option key={w._id} value={w._id}>{w.emoji} {w.word} ({w.category})</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   MODULES SECTION
───────────────────────────────────────────── */

const emptyModule = (): Partial<SpeechTherapyModule> => ({
  title: '', subtitle: '', emoji: '', color: '#10b981', colorLight: '#d1fae5', steps: []
});

function ModulesSection() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [editing, setEditing] = useState<SpeechTherapyModule | null>(null);
  const [form, setForm] = useState<Partial<SpeechTherapyModule>>(emptyModule());

  const { data: modulesData, isLoading: modulesLoading } = useQuery({
    queryKey: ['therapy-modules'],
    queryFn: therapyModulesAPI.getAll,
  });

  const { data: wordsData } = useQuery({
    queryKey: ['therapy-words'],
    queryFn: therapyWordsAPI.getAll,
  });

  const modules: SpeechTherapyModule[] = modulesData?.data ?? modulesData ?? [];
  const words: SpeechTherapyWord[] = wordsData?.data ?? wordsData ?? [];

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['therapy-modules'] });

  const createMutation = useMutation({
    mutationFn: therapyModulesAPI.create,
    onSuccess: () => { invalidate(); toast.success('Module created'); setIsOpen(false); },
    onError: () => toast.error('Failed to create module'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<SpeechTherapyModule> }) =>
      therapyModulesAPI.update(id, data),
    onSuccess: () => { invalidate(); toast.success('Module updated'); setIsOpen(false); },
    onError: () => toast.error('Failed to update module'),
  });

  const deleteMutation = useMutation({
    mutationFn: therapyModulesAPI.delete,
    onSuccess: () => { invalidate(); toast.success('Module deleted'); },
    onError: () => toast.error('Failed to delete module'),
  });

  const filtered = modules.filter(m =>
    m.title.toLowerCase().includes(search.toLowerCase()) ||
    m.subtitle.toLowerCase().includes(search.toLowerCase())
  );

  const openAdd = () => { setEditing(null); setForm(emptyModule()); setIsOpen(true); };
  const openEdit = (m: SpeechTherapyModule) => { setEditing(m); setForm({ ...m, steps: [...m.steps] }); setIsOpen(true); };
  const handleDelete = (id: string) => { if (confirm('Delete this module?')) deleteMutation.mutate(id); };

  const handleSave = () => {
    if (!form.title?.trim()) { toast.error('Title is required'); return; }
    if (editing?._id) {
      updateMutation.mutate({ id: editing._id, data: form });
    } else {
      createMutation.mutate(form as SpeechTherapyModule);
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <>
      <div className="flex items-center justify-between gap-4 mb-4">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search modules…"
            className="pl-10 bg-muted/20 border-none rounded-xl h-11"
            value={search} onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <button onClick={openAdd}
          className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-2xl shadow-lg shadow-emerald-200 transition-all duration-150 shrink-0">
          <Plus className="h-4 w-4" /> New Module
        </button>
      </div>

      {modulesLoading ? (
        <div className="p-20 flex flex-col items-center gap-3">
          <Loader2 className="h-9 w-9 animate-spin text-emerald-500" />
          <p className="text-muted-foreground text-sm">Loading modules…</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((mod) => (
            <Card key={mod._id}
              className="border-none shadow-sm rounded-3xl overflow-hidden hover:shadow-md transition-shadow group">
              <div className="h-2 w-full" style={{ background: mod.color }} />
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-sm"
                    style={{ background: mod.colorLight }}>
                    {mod.emoji}
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="sm" onClick={() => openEdit(mod)}
                      className="h-8 w-8 p-0 hover:bg-emerald-50 hover:text-emerald-600 rounded-xl">
                      <Edit className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(mod._id!)}
                      className="h-8 w-8 p-0 text-rose-500 hover:bg-rose-50 rounded-xl"
                      disabled={deleteMutation.isPending}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
                <h3 className="font-bold text-base text-foreground leading-tight">{mod.title}</h3>
                {mod.subtitle && <p className="text-sm text-muted-foreground mt-0.5 line-clamp-2">{mod.subtitle}</p>}
                <div className="mt-3 flex items-center gap-3">
                  <Badge className="bg-slate-100 text-slate-600">
                    <Layers className="h-2.5 w-2.5 mr-1" />{mod.steps.length} steps
                  </Badge>
                  {mod.createdAt && (
                    <span className="text-[10px] text-muted-foreground">
                      {new Date(mod.createdAt).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}

          {filtered.length === 0 && (
            <div className="col-span-full flex flex-col items-center py-20 text-muted-foreground gap-3">
              <Layers className="h-10 w-10 opacity-20" />
              <p className="text-sm">No modules found.</p>
            </div>
          )}
        </div>
      )}

      {/* Module Modal */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[640px] rounded-3xl border-none shadow-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-emerald-600">
              {editing ? 'Edit Module' : 'Create New Module'}
            </DialogTitle>
            <DialogDescription>Configure module details and build the step sequence below.</DialogDescription>
          </DialogHeader>

          <div className="grid gap-5 py-2">
            <div className="grid grid-cols-4 gap-3">
              <div className="col-span-3 grid gap-2">
                <Label className="text-sm font-semibold">Module Title *</Label>
                <Input
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="rounded-xl bg-muted/20 border-none h-11 font-bold text-base"
                  placeholder="e.g. Animal Sounds"
                />
              </div>
              <div className="grid gap-2">
                <Label className="text-sm font-semibold flex items-center gap-1">
                  <Smile className="h-3.5 w-3.5 text-amber-500" /> Emoji
                </Label>
                <Input
                  value={form.emoji}
                  onChange={(e) => setForm({ ...form, emoji: e.target.value })}
                  className="rounded-xl bg-muted/20 border-none h-11 text-2xl text-center"
                  placeholder="🐾"
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label className="text-sm font-semibold">Subtitle</Label>
              <Input
                value={form.subtitle}
                onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
                className="rounded-xl bg-muted/20 border-none h-11"
                placeholder="Brief description of this module"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-2">
                <Label className="text-sm font-semibold flex items-center gap-1">
                  <Palette className="h-3.5 w-3.5 text-purple-500" /> Primary Color
                </Label>
                <div className="flex items-center gap-2 bg-muted/20 rounded-xl h-11 px-3">
                  <input
                    type="color"
                    value={form.color ?? '#10b981'}
                    onChange={(e) => setForm({ ...form, color: e.target.value })}
                    className="w-7 h-7 rounded-lg border-none cursor-pointer bg-transparent"
                  />
                  <span className="text-xs font-mono text-muted-foreground">{form.color}</span>
                </div>
              </div>
              <div className="grid gap-2">
                <Label className="text-sm font-semibold flex items-center gap-1">
                  <Palette className="h-3.5 w-3.5 text-pink-400" /> Light Color
                </Label>
                <div className="flex items-center gap-2 bg-muted/20 rounded-xl h-11 px-3">
                  <input
                    type="color"
                    value={form.colorLight ?? '#d1fae5'}
                    onChange={(e) => setForm({ ...form, colorLight: e.target.value })}
                    className="w-7 h-7 rounded-lg border-none cursor-pointer bg-transparent"
                  />
                  <span className="text-xs font-mono text-muted-foreground">{form.colorLight}</span>
                </div>
              </div>
            </div>

            <hr className="border-muted/30" />

            <StepEditor
              steps={form.steps ?? []}
              words={words}
              onChange={(steps) => setForm({ ...form, steps })}
            />
          </div>

          <DialogFooter className="mt-3 gap-2">
            <Button variant="ghost" onClick={() => setIsOpen(false)} className="rounded-xl px-5">Cancel</Button>
            <Button onClick={handleSave} disabled={isPending}
              className="rounded-xl px-7 bg-emerald-600 hover:bg-emerald-700 text-white gap-2 shadow-lg shadow-emerald-200">
              {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              {editing ? 'Save Changes' : 'Create Module'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

/* ─────────────────────────────────────────────
   ROOT PAGE
───────────────────────────────────────────── */

type TabKey = 'words' | 'modules';

export default function SpeechTherapyAdmin() {
  const [activeTab, setActiveTab] = useState<TabKey>('words');

  const { data: wordsData } = useQuery({ queryKey: ['therapy-words'], queryFn: therapyWordsAPI.getAll });
  const { data: modulesData } = useQuery({ queryKey: ['therapy-modules'], queryFn: therapyModulesAPI.getAll });

  const wordCount = (wordsData?.data ?? wordsData ?? []).length;
  const moduleCount = (modulesData?.data ?? modulesData ?? []).length;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
            <Mic className="h-8 w-8 text-emerald-500" /> Speech Therapy
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Manage the word library and therapy module sequences.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-4 py-2 bg-emerald-50 rounded-2xl border border-emerald-100 text-emerald-700 text-xs font-bold">
            <BookOpen className="h-3.5 w-3.5" /> {wordCount} Words
          </div>
          <div className="flex items-center gap-1.5 px-4 py-2 bg-violet-50 rounded-2xl border border-violet-100 text-violet-700 text-xs font-bold">
            <Layers className="h-3.5 w-3.5" /> {moduleCount} Modules
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1.5 bg-muted/30 p-1.5 rounded-2xl w-fit">
        <SectionTab active={activeTab === 'words'} onClick={() => setActiveTab('words')} icon={BookOpen} label="Word Library" count={wordCount} />
        <SectionTab active={activeTab === 'modules'} onClick={() => setActiveTab('modules')} icon={Layers} label="Modules" count={moduleCount} />
      </div>

      {activeTab === 'words' ? <WordsSection /> : <ModulesSection />}
    </div>
  );
}