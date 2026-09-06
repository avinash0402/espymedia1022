import { useEffect, useState } from 'react';
import { AdminLayout } from '@/components/admin-layout';
import {
  useGetSeoPages, useCreateSeoPage, useUpdateSeoPage, useDeleteSeoPage,
  useGetSettings, useUpdateSettings,
  getGetSeoPagesQueryKey, getGetSettingsQueryKey,
  type SeoPage,
} from '@workspace/api-client-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { Plus, Save, Trash2, Pencil, Search, Tag } from 'lucide-react';

const blankPage = {
  path: '', metaTitle: '', metaDescription: '', metaKeywords: '',
  ogTitle: '', ogDescription: '', ogImage: '',
  twitterTitle: '', twitterDescription: '',
  canonicalUrl: '', noindex: false,
};

export default function AdminSeo() {
  const { data: pages = [], isLoading } = useGetSeoPages();
  const { data: settings } = useGetSettings();
  const updateSettings = useUpdateSettings();
  const createPage = useCreateSeoPage();
  const updatePage = useUpdateSeoPage();
  const deletePage = useDeleteSeoPage();
  const qc = useQueryClient();
  const { toast } = useToast();

  // GTM / Analytics settings
  const [gtmId, setGtmId] = useState('');
  const [gtmSaving, setGtmSaving] = useState(false);

  useEffect(() => {
    if (settings?.gtmId !== undefined) setGtmId(settings.gtmId || '');
  }, [settings?.gtmId]);

  const saveGtm = async () => {
    setGtmSaving(true);
    updateSettings.mutate({ data: { gtmId } }, {
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: getGetSettingsQueryKey() });
        toast({ title: 'Google Tag Manager updated' });
        setGtmSaving(false);
      },
      onError: () => {
        toast({ title: 'Could not save GTM settings', variant: 'destructive' });
        setGtmSaving(false);
      },
    });
  };

  // Page editing
  const [editing, setEditing] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [draft, setDraft] = useState({ ...blankPage });

  const resetForm = () => { setEditing(null); setDraft({ ...blankPage }); setShowForm(false); };

  const startEdit = (p: SeoPage) => {
    setEditing(p.id);
    setDraft({
      path: p.path, metaTitle: p.metaTitle, metaDescription: p.metaDescription,
      metaKeywords: p.metaKeywords, ogTitle: p.ogTitle, ogDescription: p.ogDescription,
      ogImage: p.ogImage, twitterTitle: p.twitterTitle, twitterDescription: p.twitterDescription,
      canonicalUrl: p.canonicalUrl, noindex: p.noindex,
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const save = () => {
    if (!draft.path) return toast({ title: 'Page path is required (e.g. /)', variant: 'destructive' });
    const path = draft.path.startsWith('/') ? draft.path : `/${draft.path}`;
    const data = { ...draft, path };
    const done = () => { qc.invalidateQueries({ queryKey: getGetSeoPagesQueryKey() }); resetForm(); toast({ title: editing !== null ? 'SEO page updated' : 'SEO page added' }); };
    const fail = (err: any) => toast({ title: err?.message || 'Could not save', variant: 'destructive' });
    if (editing !== null) updatePage.mutate({ id: editing, data }, { onSuccess: done, onError: fail });
    else createPage.mutate({ data }, { onSuccess: done, onError: fail });
  };

  const field = (key: keyof typeof blankPage, label: string, hint?: string, multiline = false) => (
    <div key={key}>
      <Label htmlFor={key}>{label}</Label>
      {multiline ? (
        <Textarea id={key} className="mt-1" value={String(draft[key])} onChange={(e) => setDraft({ ...draft, [key]: e.target.value })} rows={3} />
      ) : (
        <Input id={key} className="mt-1" value={String(draft[key])} onChange={(e) => setDraft({ ...draft, [key]: e.target.value })} />
      )}
      {hint && <p className="text-xs text-muted-foreground mt-1">{hint}</p>}
    </div>
  );

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-primary mb-2">Analytics & Visibility</p>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-1 sm:mb-2">SEO & Analytics</h1>
            <p className="text-muted-foreground text-sm">Google Tag Manager, per-page meta tags, Open Graph, and Twitter cards.</p>
          </div>
          {!showForm && (
            <Button className="gradient-purple shrink-0" onClick={() => { setDraft({ ...blankPage }); setShowForm(true); }}>
              <Plus className="w-4 h-4 mr-2" /> Add Page SEO
            </Button>
          )}
        </div>

        {/* ── Google Tag Manager ── */}
        <Card className="border-glow">
          <CardContent className="p-6 space-y-5">
            <div className="flex items-center gap-3 mb-1">
              <Tag className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-semibold">Google Tag Manager</h2>
            </div>
            <p className="text-sm text-muted-foreground">
              Paste your GTM container ID (e.g. <code className="font-mono bg-muted/30 px-1 rounded">GTM-XXXXXXX</code>). The snippet will be injected automatically into every page — no code changes needed.
            </p>
            <div className="flex gap-3 items-end">
              <div className="flex-1">
                <Label htmlFor="gtm-id">GTM Container ID</Label>
                <Input
                  id="gtm-id"
                  className="mt-2 font-mono"
                  value={gtmId}
                  onChange={(e) => setGtmId(e.target.value)}
                  placeholder="GTM-XXXXXXX"
                />
              </div>
              <Button onClick={saveGtm} className="gradient-purple shrink-0" disabled={gtmSaving}>
                <Save className="w-4 h-4 mr-2" />{gtmSaving ? 'Saving…' : 'Save GTM'}
              </Button>
            </div>
            {gtmId && (
              <div className="rounded-lg bg-green-500/10 border border-green-500/20 px-4 py-3 text-sm text-green-400">
                ✓ GTM container <strong>{gtmId}</strong> is active on all pages.
              </div>
            )}
            <div className="rounded-lg bg-muted/20 p-4 space-y-2 text-xs text-muted-foreground">
              <p className="font-semibold text-foreground text-sm">How to connect Google Analytics, Meta Pixel, etc.</p>
              <ol className="list-decimal list-inside space-y-1">
                <li>Add your GTM container ID above and save.</li>
                <li>Open <a href="https://tagmanager.google.com" target="_blank" rel="noreferrer" className="text-primary underline">Google Tag Manager</a> and log in to your container.</li>
                <li>Create a new tag for Google Analytics 4, Meta Pixel, or any other tool.</li>
                <li>Set the trigger to "All Pages" and publish the container.</li>
                <li>All tracking fires automatically — no code changes needed here.</li>
              </ol>
            </div>
          </CardContent>
        </Card>

        {/* ── Add / Edit SEO Page ── */}
        {showForm && (
          <Card className="border-glow">
            <CardContent className="p-6 space-y-5">
              <div className="flex items-center gap-2">
                <Search className="w-5 h-5 text-primary" />
                <h2 className="text-xl font-semibold">{editing !== null ? 'Edit Page SEO' : 'Add Page SEO'}</h2>
              </div>

              {field('path', 'Page Path *', 'Must start with /  e.g. / or /graphic-design or /blog')}

              <div className="border-t border-border pt-4">
                <p className="text-sm font-semibold mb-3 text-foreground">Basic Meta Tags</p>
                <div className="space-y-4">
                  {field('metaTitle', 'Meta Title', 'Shown in browser tab and Google search results (50–60 chars recommended)')}
                  {field('metaDescription', 'Meta Description', 'Snippet shown in Google results (150–160 chars recommended)', true)}
                  {field('metaKeywords', 'Meta Keywords', 'Comma-separated keywords (optional — most search engines ignore these)')}
                </div>
              </div>

              <div className="border-t border-border pt-4">
                <p className="text-sm font-semibold mb-3 text-foreground">Open Graph (Facebook / LinkedIn)</p>
                <div className="space-y-4">
                  {field('ogTitle', 'OG Title', 'Title shown when link is shared (defaults to Meta Title if empty)')}
                  {field('ogDescription', 'OG Description', 'Description shown when link is shared', true)}
                  {field('ogImage', 'OG Image URL', 'Full URL to preview image (1200×630px recommended)')}
                </div>
              </div>

              <div className="border-t border-border pt-4">
                <p className="text-sm font-semibold mb-3 text-foreground">Twitter Card</p>
                <div className="space-y-4">
                  {field('twitterTitle', 'Twitter Title', 'Defaults to OG Title if empty')}
                  {field('twitterDescription', 'Twitter Description', 'Defaults to OG Description if empty', true)}
                </div>
              </div>

              <div className="border-t border-border pt-4">
                <p className="text-sm font-semibold mb-3 text-foreground">Advanced</p>
                <div className="space-y-4">
                  {field('canonicalUrl', 'Canonical URL', 'Full URL if this page has a canonical source (leave blank if not needed)')}
                  <div className="flex items-center gap-3">
                    <Switch id="noindex" checked={draft.noindex} onCheckedChange={(v) => setDraft({ ...draft, noindex: v })} />
                    <div>
                      <Label htmlFor="noindex">No-index this page</Label>
                      <p className="text-xs text-muted-foreground">Tells search engines not to index this page</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <Button onClick={save} className="gradient-purple" disabled={createPage.isPending || updatePage.isPending}>
                  <Save className="w-4 h-4 mr-2" />{createPage.isPending || updatePage.isPending ? 'Saving…' : editing !== null ? 'Update Page' : 'Add Page'}
                </Button>
                <Button variant="outline" onClick={resetForm}>Cancel</Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* ── SEO Pages List ── */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Page SEO Entries</h2>
          {isLoading ? (
            <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-20 rounded-xl bg-muted/20 animate-pulse" />)}</div>
          ) : pages.length === 0 ? (
            <Card><CardContent className="p-10 text-center text-muted-foreground">No SEO pages configured yet. Add one above.</CardContent></Card>
          ) : (
            <div className="space-y-3">
              {pages.map((p) => (
                <Card key={p.id} className="border-glow">
                  <CardContent className="p-4 flex items-start gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <code className="text-sm font-mono bg-muted/30 px-2 py-0.5 rounded text-primary">{p.path}</code>
                        {p.noindex && <span className="text-[10px] px-2 py-0.5 rounded-full bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">no-index</span>}
                      </div>
                      {p.metaTitle && <p className="text-sm font-medium mt-1 truncate">{p.metaTitle}</p>}
                      {p.metaDescription && <p className="text-xs text-muted-foreground mt-0.5 truncate">{p.metaDescription}</p>}
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      <Button variant="ghost" size="sm" onClick={() => startEdit(p)}><Pencil className="w-4 h-4" /></Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="sm"><Trash2 className="w-4 h-4" /></Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete SEO entry for "{p.path}"?</AlertDialogTitle>
                            <AlertDialogDescription>The page will fall back to global SEO defaults.</AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => deletePage.mutate({ id: p.id }, { onSuccess: () => { qc.invalidateQueries({ queryKey: getGetSeoPagesQueryKey() }); toast({ title: 'SEO entry deleted' }); } })}>Delete</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
