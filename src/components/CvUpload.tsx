import { useEffect, useState } from 'react';
import { Upload, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '@/components/ui/dialog';
import { cvStore, subscribeStore } from '@/lib/storage';
import { readCvFile } from '@/lib/cv-file';
import { extractCvSkills } from '@/lib/skill-match';

export function CvUpload() {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState('');
  const [stored, setStored] = useState('');
  const [busy, setBusy] = useState(false);
  useEffect(() => { const sync = () => setStored(cvStore.get()); sync(); return subscribeStore(sync); }, []);
  const skills = extractCvSkills(draft);
  return <Dialog open={open} onOpenChange={value => { setOpen(value); if (value) setDraft(cvStore.get()); }}>
    <DialogTrigger asChild><Button variant="outline" size="sm"><Upload className="size-4" /><span className="hidden sm:inline">{stored ? 'Your CV' : 'Upload CV'}</span><span className="sm:hidden">CV</span></Button></DialogTrigger>
    <DialogContent className="max-h-[90dvh] overflow-y-auto">
      <DialogHeader><DialogTitle>Your CV & skills</DialogTitle><DialogDescription>Local skill checks use no AI credits. Your CV is sent for AI rewriting only when you choose “Tailor my CV”.</DialogDescription></DialogHeader>
      <Button asChild variant="outline" disabled={busy}><label className="cursor-pointer">{busy ? <Loader2 className="size-4 animate-spin" /> : <Upload className="size-4" />} Upload PDF / DOCX / TXT<input type="file" aria-label="Upload CV file" accept=".pdf,.docx,.txt,.md,.markdown" className="sr-only" disabled={busy} onChange={async event => { const file = event.target.files?.[0]; if (!file) return; setBusy(true); try { setDraft(await readCvFile(file)); } catch (error) { toast.error(error instanceof Error ? error.message : 'Could not read this CV.'); } finally { setBusy(false); event.target.value = ''; } }} /></label></Button>
      <Textarea aria-label="CV text" value={draft} maxLength={20000} onChange={event => setDraft(event.target.value)} rows={9} placeholder="Or paste your CV here" />
      <div className="space-y-2"><h3 className="text-sm font-semibold">Skills found in your CV</h3>{skills.length ? <div className="flex flex-wrap gap-2">{skills.map(skill => <span key={skill.name} className="rounded-md bg-secondary px-2 py-1 text-xs" title={skill.evidence}>{skill.name} · {skill.level}</span>)}</div> : <p className="text-xs text-muted-foreground">No recognised skills yet. Include tools and specific examples of your work.</p>}</div>
      <div className="flex flex-wrap justify-between gap-2"><Button variant="ghost" disabled={!stored || busy} onClick={() => { cvStore.set(''); setDraft(''); toast.success('CV removed'); }}>Remove CV</Button><Button disabled={draft.trim().length < 50 || busy} onClick={() => { cvStore.set(draft.trim()); setOpen(false); toast.success('CV saved — skill matches updated'); }}>Save CV</Button></div>
    </DialogContent>
  </Dialog>;
}