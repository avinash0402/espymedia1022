import { useState } from 'react';
import { AdminLayout } from '@/components/admin-layout';
import {
  useCreateFaq,
  useDeleteFaq,
  useGetCmsFaqs,
  useUpdateFaq,
  type Faq,
} from '@workspace/api-client-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Pencil, Plus, Save, Trash2, X } from 'lucide-react';

type FaqForm = Pick<Faq, 'question' | 'answer' | 'sortOrder' | 'published'>;

const emptyForm: FaqForm = {
  question: '',
  answer: '',
  sortOrder: 0,
  published: true,
};

export default function AdminFaq() {
  const { data: faqs = [], isLoading, error } = useGetCmsFaqs();
  const createFaq = useCreateFaq();
  const updateFaq = useUpdateFaq();
  const deleteFaq = useDeleteFaq();
  const { toast } = useToast();
  const [editing, setEditing] = useState<Faq | null>(null);
  const [form, setForm] = useState<FaqForm>(emptyForm);
  const [formOpen, setFormOpen] = useState(false);

  const startNew = () => {
    setEditing(null);
    setForm({ ...emptyForm, sortOrder: faqs.length });
    setFormOpen(true);
  };

  const startEdit = (faq: Faq) => {
    setEditing(faq);
    setForm({
      question: faq.question,
      answer: faq.answer,
      sortOrder: faq.sortOrder,
      published: faq.published,
    });
    setFormOpen(true);
  };

  const closeForm = () => {
    setEditing(null);
    setForm({ ...emptyForm });
    setFormOpen(false);
  };

  const submit = () => {
    const question = form.question.trim();
    const answer = form.answer.trim();
    if (!question || !answer) {
      toast({ title: 'Add both a question and an answer', variant: 'destructive' });
      return;
    }
    const data = { ...form, question, answer };
    const callbacks = {
      onSuccess: () => {
        closeForm();
        toast({ title: editing ? 'FAQ updated' : 'FAQ added' });
      },
      onError: (saveError: Error) => toast({
        title: 'Could not save FAQ',
        description: saveError.message,
        variant: 'destructive' as const,
      }),
    };
    if (editing) updateFaq.mutate({ id: editing.id, data }, callbacks);
    else createFaq.mutate({ data }, callbacks);
  };

  const togglePublished = (faq: Faq) => {
    updateFaq.mutate(
      { id: faq.id, data: { published: !faq.published } },
      {
        onSuccess: () => toast({ title: faq.published ? 'FAQ unpublished' : 'FAQ published' }),
        onError: (saveError) => toast({
          title: 'Could not update FAQ',
          description: saveError.message,
          variant: 'destructive',
        }),
      },
    );
  };

  const remove = (faq: Faq) => {
    deleteFaq.mutate(
      { id: faq.id },
      {
        onSuccess: () => toast({ title: 'FAQ deleted' }),
        onError: (deleteError) => toast({
          title: 'Could not delete FAQ',
          description: deleteError.message,
          variant: 'destructive',
        }),
      },
    );
  };

  const isSaving = createFaq.isPending || updateFaq.isPending;

  return (
    <AdminLayout>
      <div className="space-y-7">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="mb-2 text-xs uppercase tracking-[0.2em] text-primary">Website CMS</p>
            <h1 className="text-3xl font-bold sm:text-4xl">Frequently asked questions</h1>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
              Add, edit, reorder, publish, or remove the questions shown on the homepage.
            </p>
          </div>
          {!formOpen && (
            <Button onClick={startNew} className="gradient-purple self-start sm:self-auto">
              <Plus className="mr-2 h-4 w-4" /> Add FAQ
            </Button>
          )}
        </header>

        {formOpen && (
          <Card className="border-glow">
            <CardContent className="space-y-5 p-5 sm:p-6">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-xl font-semibold">{editing ? 'Edit FAQ' : 'Add a FAQ'}</h2>
                <Button type="button" variant="ghost" size="icon" onClick={closeForm} aria-label="Close FAQ form">
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div>
                <Label htmlFor="faq-question">Question</Label>
                <Input
                  id="faq-question"
                  className="mt-2"
                  maxLength={500}
                  value={form.question}
                  onChange={(event) => setForm({ ...form, question: event.target.value })}
                  placeholder="How long does a website project take?"
                />
              </div>
              <div>
                <Label htmlFor="faq-answer">Answer</Label>
                <Textarea
                  id="faq-answer"
                  className="mt-2 min-h-32"
                  value={form.answer}
                  onChange={(event) => setForm({ ...form, answer: event.target.value })}
                  placeholder="Write a clear, helpful answer..."
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-[180px_1fr] sm:items-end">
                <div>
                  <Label htmlFor="faq-sort-order">Display order</Label>
                  <Input
                    id="faq-sort-order"
                    className="mt-2"
                    type="number"
                    min={0}
                    value={form.sortOrder}
                    onChange={(event) => setForm({ ...form, sortOrder: Math.max(0, Number(event.target.value)) })}
                  />
                </div>
                <div className="flex items-center gap-3 pb-2">
                  <Switch
                    id="faq-published"
                    checked={form.published}
                    onCheckedChange={(published) => setForm({ ...form, published })}
                  />
                  <Label htmlFor="faq-published">Published on the website</Label>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button onClick={submit} disabled={isSaving}>
                  <Save className="mr-2 h-4 w-4" />{isSaving ? 'Saving…' : 'Save FAQ'}
                </Button>
                <Button variant="outline" onClick={closeForm}>Cancel</Button>
              </div>
            </CardContent>
          </Card>
        )}

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((item) => <div key={item} className="h-24 animate-pulse rounded-xl bg-muted/20" />)}
          </div>
        ) : error ? (
          <Card><CardContent className="p-6 text-sm text-destructive" role="alert">{error.message}</CardContent></Card>
        ) : faqs.length ? (
          <div className="space-y-3">
            {faqs.map((faq, index) => (
              <Card key={faq.id} className="border-border/70">
                <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <div className="mb-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                      <span>#{index + 1}</span>
                      <span className={`rounded-full px-2 py-0.5 ${faq.published ? 'bg-emerald-500/10 text-emerald-500' : 'bg-muted text-muted-foreground'}`}>
                        {faq.published ? 'Published' : 'Draft'}
                      </span>
                    </div>
                    <h2 className="font-semibold">{faq.question}</h2>
                    <p className="mt-2 whitespace-pre-line text-sm leading-6 text-muted-foreground">{faq.answer}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => startEdit(faq)}>
                      <Pencil className="mr-1.5 h-3.5 w-3.5" /> Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => togglePublished(faq)}
                      disabled={updateFaq.isPending}
                    >
                      {faq.published ? 'Unpublish' : 'Publish'}
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="icon" aria-label={`Delete ${faq.question}`} disabled={deleteFaq.isPending}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete this FAQ?</AlertDialogTitle>
                          <AlertDialogDescription>This question will be removed from the site and admin list.</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => remove(faq)}>Delete FAQ</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card><CardContent className="p-10 text-center text-sm text-muted-foreground">No FAQs yet. Add your first question to get started.</CardContent></Card>
        )}
      </div>
    </AdminLayout>
  );
}
