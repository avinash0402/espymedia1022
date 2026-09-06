import { useEffect, useState } from 'react';
import { AdminLayout } from '@/components/admin-layout';
import {
  useGetPlatforms, useCreatePlatform, useUpdatePlatform, useDeletePlatform,
  useGetPricingPlans, useCreatePricingPlan, useUpdatePricingPlan, useDeletePricingPlan,
  useGetLegalPages, useUpdateLegalPage,
  useGetSeoPages, useUpdateSeoPage,
  useGetSettings, useUpdateSettings,
  getGetPlatformsQueryKey, getGetPricingQueryKey, getGetLegalPagesQueryKey,
  getGetSeoPagesQueryKey, getGetSettingsQueryKey,
  type Platform, type PricingPlan, type LegalPage, type SeoPage,
  type HomepageStat,
} from '@workspace/api-client-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { ImageUpload } from '@/components/image-upload';
import { useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { Plus, Save, Trash2, Pencil, Layers3, CreditCard, FileText, Search, LayoutTemplate, BarChart3 } from 'lucide-react';
import { RichTextHighlightEditor, normalizeHeroHeadline } from '@/components/rich-text-highlight-editor';

type Tab = 'hero' | 'platforms' | 'pricing' | 'site' | 'legal' | 'seo';

const slugify = (value: string) => value.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

export default function AdminContent() {
  const [tab, setTab] = useState<Tab>('hero');
  const tabs = [
    { id: 'hero' as const, label: 'Hero Section', icon: LayoutTemplate },
    { id: 'platforms' as const, label: 'Platforms', icon: Layers3 },
    { id: 'pricing' as const, label: 'Pricing', icon: CreditCard },
    { id: 'site' as const, label: 'Stats & Footer', icon: BarChart3 },
    { id: 'legal' as const, label: 'Legal Pages', icon: FileText },
    { id: 'seo' as const, label: 'SEO', icon: Search },
  ];
  return (
    <AdminLayout>
      <div className="space-y-8">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-primary mb-3">Website CMS</p>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-1 sm:mb-2">Content Management</h1>
          <p className="text-muted-foreground text-sm">Manage homepage content, platforms, pricing, legal pages, and SEO.</p>
        </div>
        <div className="flex flex-wrap gap-2 border-b border-border pb-3">
          {tabs.map(({ id, label, icon: Icon }) => (
            <Button key={id} variant={tab === id ? 'default' : 'ghost'} size="sm" onClick={() => setTab(id)} className={tab === id ? 'gradient-purple text-xs sm:text-sm' : 'text-xs sm:text-sm'}>
              <Icon className="w-3.5 h-3.5 mr-1.5" />{label}
            </Button>
          ))}
        </div>
        {tab === 'hero' && <HeroPanel />}
        {tab === 'platforms' && <PlatformsPanel />}
        {tab === 'pricing' && <PricingPanel />}
        {tab === 'site' && <StatsFooterPanel />}
        {tab === 'legal' && <LegalPanel />}
        {tab === 'seo' && <SeoPanel />}
      </div>
    </AdminLayout>
  );
}

function HeroPanel() {
  const { data: settings, isLoading } = useGetSettings();
  const updateSettings = useUpdateSettings();
  const qc = useQueryClient();
  const { toast } = useToast();
  const [form, setForm] = useState({
    heroBadge: '',
    heroHeadline: '',
    heroSubheadline: '',
  });

  useEffect(() => {
    if (settings) {
      setForm({
        heroBadge: settings.heroBadge || '',
        heroHeadline: normalizeHeroHeadline(settings.heroHeadline1 || '', settings.heroHeadline2 || ''),
        heroSubheadline: settings.heroSubheadline || '',
      });
    }
  }, [settings]);

  const save = () => {
     updateSettings.mutate({ data: { ...form, heroHeadline1: form.heroHeadline, heroHeadline2: '' } }, {
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: getGetSettingsQueryKey() });
        toast({ title: 'Hero section updated' });
      },
      onError: () => toast({ title: 'Could not save', variant: 'destructive' }),
    });
  };

  if (isLoading) return <div className="h-64 bg-muted/20 animate-pulse rounded-xl" />;

  return (
    <Card className="border-glow">
      <CardContent className="p-6 space-y-5">
        <div>
          <h2 className="text-xl font-semibold mb-1">Hero Section Text</h2>
          <p className="text-sm text-muted-foreground">Control the headline, badge text, and subheadline displayed in the hero section of the homepage.</p>
        </div>

        <div>
          <Label htmlFor="heroBadge">Badge Text</Label>
          <Input
            id="heroBadge"
            className="mt-2"
            value={form.heroBadge}
            onChange={(e) => setForm({ ...form, heroBadge: e.target.value })}
            placeholder="Now booking Q4 client slots"
          />
          <p className="text-xs text-muted-foreground mt-1">Small badge shown above the main headline</p>
        </div>

        <div>
          <Label>Headline</Label>
          <div className="mt-2">
            <RichTextHighlightEditor
              value={form.heroHeadline}
              onChange={(heroHeadline) => setForm({ ...form, heroHeadline })}
            />
          </div>
          <p className="text-xs text-muted-foreground mt-1">Select only the words you want to highlight. Add a line break inside the editor when you need one.</p>
        </div>

        <div>
          <Label htmlFor="heroSubheadline">Subheadline / Description</Label>
          <Textarea
            id="heroSubheadline"
            className="mt-2"
            value={form.heroSubheadline}
            onChange={(e) => setForm({ ...form, heroSubheadline: e.target.value })}
            placeholder="Espy Media is a full-stack creative studio..."
            rows={4}
          />
        </div>

        <Button onClick={save} className="gradient-purple w-full" disabled={updateSettings.isPending}>
          <Save className="w-4 h-4 mr-2" />{updateSettings.isPending ? 'Saving...' : 'Save Hero Section'}
        </Button>
      </CardContent>
    </Card>
  );
}

function StatsFooterPanel() {
  const { data: settings, isLoading } = useGetSettings();
  const updateSettings = useUpdateSettings();
  const qc = useQueryClient();
  const { toast } = useToast();
  const defaultStats: HomepageStat[] = [
    { end: 120, suffix: '+', label: 'Clients Served' },
    { end: 340, suffix: '+', label: 'Campaigns Run' },
    { end: 4.8, suffix: 'x', label: 'Average ROAS' },
    { end: 28000, suffix: '+', label: 'Leads Generated' },
  ];
  const [footerText, setFooterText] = useState('');
  const [stats, setStats] = useState<HomepageStat[]>(defaultStats);

  useEffect(() => {
    if (settings) {
      setFooterText(settings.footerText || 'START\nDOMINATING.');
      setStats(settings.homepageStats?.length ? settings.homepageStats : defaultStats);
    }
  }, [settings]);

  const save = () => {
    updateSettings.mutate({ data: { footerText, homepageStats: stats } }, {
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: getGetSettingsQueryKey() });
        toast({ title: 'Stats and footer updated' });
      },
      onError: () => toast({ title: 'Could not save content', variant: 'destructive' }),
    });
  };

  if (isLoading) return <div className="h-64 bg-muted/20 animate-pulse rounded-xl" />;

  return (
    <Card className="border-glow">
      <CardContent className="p-6 space-y-6">
        <div>
          <h2 className="text-xl font-semibold mb-1">Homepage Stats & Footer CTA</h2>
          <p className="text-sm text-muted-foreground">Edit the four stats band values and the large footer call-to-action. Use a new line in the footer text to split it across lines.</p>
        </div>
        <div>
          <Label htmlFor="footerCta">Footer CTA Text</Label>
          <Textarea id="footerCta" className="mt-2 text-lg" rows={3} value={footerText} onChange={(e) => setFooterText(e.target.value)} placeholder={'START\nDOMINATING.'} />
        </div>
        <div className="space-y-4">
          <Label>Homepage Stats</Label>
          {stats.map((stat, index) => (
            <div key={index} className="grid grid-cols-[1fr_90px_90px] gap-3 items-end">
              <div>
                <Label className="text-xs text-muted-foreground">Label</Label>
                <Input value={stat.label} onChange={(e) => setStats(stats.map((item, i) => i === index ? { ...item, label: e.target.value } : item))} />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Number</Label>
                <Input type="number" step="any" value={stat.end} onChange={(e) => setStats(stats.map((item, i) => i === index ? { ...item, end: Number(e.target.value) } : item))} />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Suffix</Label>
                <Input value={stat.suffix} onChange={(e) => setStats(stats.map((item, i) => i === index ? { ...item, suffix: e.target.value } : item))} placeholder="+" />
              </div>
            </div>
          ))}
        </div>
        <Button onClick={save} className="gradient-purple w-full" disabled={updateSettings.isPending}>
          <Save className="w-4 h-4 mr-2" />{updateSettings.isPending ? 'Saving...' : 'Save Stats & Footer'}
        </Button>
      </CardContent>
    </Card>
  );
}

function PlatformsPanel() {
  const { data = [], isLoading } = useGetPlatforms();
  const create = useCreatePlatform();
  const update = useUpdatePlatform();
  const remove = useDeletePlatform();
  const qc = useQueryClient();
  const { toast } = useToast();
  const [editing, setEditing] = useState<number | null>(null);
  const [draft, setDraft] = useState({ name: '', slug: '', logoUrl: '', linkUrl: '', published: true, sortOrder: 0 });
  const reset = () => { setEditing(null); setDraft({ name: '', slug: '', logoUrl: '', linkUrl: '', published: true, sortOrder: data.length }); };
  const save = () => {
    const done = () => { qc.invalidateQueries({ queryKey: getGetPlatformsQueryKey() }); reset(); toast({ title: editing ? 'Platform updated' : 'Platform added' }); };
    if (editing) update.mutate({ id: editing, data: draft }, { onSuccess: done, onError: () => toast({ title: 'Could not save platform', variant: 'destructive' }) });
    else create.mutate({ data: { ...draft, slug: draft.slug || slugify(draft.name || `platform-${Date.now()}`) } }, { onSuccess: done, onError: () => toast({ title: 'Could not save platform', variant: 'destructive' }) });
  };
  const edit = (item: Platform) => { setEditing(item.id); setDraft({ name: item.name, slug: item.slug, logoUrl: item.logoUrl || '', linkUrl: item.linkUrl || '', published: item.published, sortOrder: item.sortOrder }); };

  return (
    <div className="space-y-5">
      <Card className="border-glow">
        <CardContent className="p-5 space-y-4">
          <h2 className="font-semibold">{editing ? 'Edit Platform' : 'Add Platform'}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><Label>Platform Name</Label><Input className="mt-1" value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} placeholder="Meta Ads" /></div>
            <div><Label>Platform Link</Label><Input className="mt-1" value={draft.linkUrl} onChange={(e) => setDraft({ ...draft, linkUrl: e.target.value })} placeholder="https://..." /></div>
            <div><Label>Order</Label><Input className="mt-1" type="number" value={draft.sortOrder} onChange={(e) => setDraft({ ...draft, sortOrder: Number(e.target.value) })} /></div>
            <div className="flex items-end gap-3 pb-1"><Switch checked={draft.published} onCheckedChange={(published) => setDraft({ ...draft, published })} /><span className="text-sm">Visible on homepage</span></div>
          </div>
          <div>
            <Label className="mb-2 block">Platform Logo</Label>
            <ImageUpload value={draft.logoUrl} onChange={(url) => setDraft({ ...draft, logoUrl: url })} label="Upload platform logo" />
          </div>
          <div className="flex gap-2">
            <Button onClick={save} className="gradient-purple"><Save className="w-4 h-4 mr-2" />{editing ? 'Update Platform' : 'Add Platform'}</Button>
            {editing && <Button variant="outline" onClick={reset}>Cancel</Button>}
          </div>
        </CardContent>
      </Card>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {isLoading ? <LoadingCards /> : data.map((item) => (
          <Card key={item.id} className="border-glow">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden flex-shrink-0">
                {item.logoUrl ? <img src={item.logoUrl} alt={item.name} className="max-w-full max-h-full object-contain" /> : <Layers3 className="w-5 h-5 text-primary" />}
              </div>
              <div className="flex-1">
                <h3 className="font-semibold">{item.name}</h3>
                <p className="text-xs text-muted-foreground">{item.published ? 'Visible' : 'Hidden'} · Order {item.sortOrder}</p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => edit(item)}><Pencil className="w-4 h-4" /></Button>
              <Button variant="ghost" size="sm" onClick={() => { remove.mutate({ id: item.id }); }}><Trash2 className="w-4 h-4" /></Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function PricingPanel() {
  const { data = [], isLoading } = useGetPricingPlans();
  const create = useCreatePricingPlan();
  const update = useUpdatePricingPlan();
  const remove = useDeletePricingPlan();
  const qc = useQueryClient();
  const { toast } = useToast();
  const [editing, setEditing] = useState<PricingPlan | null>(null);
  const blank: PricingPlan = { id: 0, name: '', price: '', period: 'One-time', description: '', features: [], ctaText: 'Get started', highlighted: false, published: true, sortOrder: data.length };
  const save = () => {
    if (!editing?.name) return toast({ title: 'Plan name is required', variant: 'destructive' });
    const payload = { ...editing, features: editing.features.filter(Boolean) };
    const done = () => { qc.invalidateQueries({ queryKey: getGetPricingQueryKey() }); setEditing(null); toast({ title: editing.id ? 'Pricing plan updated' : 'Pricing plan added' }); };
    if (editing.id) update.mutate({ id: editing.id, data: payload }, { onSuccess: done });
    else create.mutate({ data: payload }, { onSuccess: done });
  };
  return (
    <div className="space-y-4">
      <div className="flex justify-end"><Button className="gradient-purple" onClick={() => setEditing({ ...blank, sortOrder: data.length })}><Plus className="w-4 h-4 mr-2" />Add Pricing Plan</Button></div>
      {isLoading ? <LoadingCards /> : data.map((plan) => editing?.id === plan.id
        ? <Card key={plan.id} className="border-glow"><CardContent className="p-5 space-y-4">{pricingFields(editing, setEditing)}<Button onClick={save} className="gradient-purple"><Save className="w-4 h-4 mr-2" />Save Plan</Button><Button variant="outline" className="ml-2" onClick={() => setEditing(null)}>Cancel</Button></CardContent></Card>
        : <Card key={plan.id} className="border-glow"><CardContent className="p-5 flex flex-col md:flex-row gap-4 md:items-center"><div className="flex-1"><div className="flex items-center gap-2"><h3 className="text-xl font-bold">{plan.name}</h3>{plan.highlighted && <span className="text-xs rounded-full bg-primary/20 px-2 py-1 text-primary">Most Popular</span>}</div><p className="text-2xl font-bold mt-2">{plan.price}</p><p className="text-sm text-muted-foreground mt-1">{plan.description}</p><p className="text-xs text-muted-foreground mt-3">{plan.features.length} features · {plan.published ? 'Published' : 'Hidden'}</p></div><div className="flex gap-2"><Button variant="outline" onClick={() => setEditing({ ...plan })}><Pencil className="w-4 h-4 mr-2" />Edit</Button><Button variant="ghost" onClick={() => remove.mutate({ id: plan.id })}><Trash2 className="w-4 h-4" /></Button></div></CardContent></Card>
      )}
      {editing?.id === 0 && <Card className="border-glow"><CardContent className="p-5 space-y-4">{pricingFields(editing, setEditing)}<Button onClick={save} className="gradient-purple"><Save className="w-4 h-4 mr-2" />Create Plan</Button><Button variant="outline" className="ml-2" onClick={() => setEditing(null)}>Cancel</Button></CardContent></Card>}
    </div>
  );
}

function pricingFields(plan: PricingPlan, setPlan: (p: PricingPlan) => void) {
  const set = (key: keyof PricingPlan, value: unknown) => setPlan({ ...plan, [key]: value });
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div><Label>Plan Name</Label><Input className="mt-1" value={plan.name} onChange={(e) => set('name', e.target.value)} /></div>
      <div><Label>Price</Label><Input className="mt-1" value={plan.price} onChange={(e) => set('price', e.target.value)} /></div>
      <div><Label>Billing Label</Label><Input className="mt-1" value={plan.period} onChange={(e) => set('period', e.target.value)} /></div>
      <div className="md:col-span-2"><Label>Description</Label><Textarea className="mt-1" value={plan.description} onChange={(e) => set('description', e.target.value)} /></div>
      <div className="md:col-span-2"><Label>Features (one per line)</Label><Textarea className="mt-1" value={plan.features.join('\n')} onChange={(e) => set('features', e.target.value.split('\n'))} /></div>
      <div><Label>Button Label</Label><Input className="mt-1" value={plan.ctaText} onChange={(e) => set('ctaText', e.target.value)} /></div>
      <div><Label>Display Order</Label><Input className="mt-1" type="number" value={plan.sortOrder} onChange={(e) => set('sortOrder', Number(e.target.value))} /></div>
      <div className="flex items-end gap-4 pb-2"><Switch checked={plan.highlighted} onCheckedChange={(v) => set('highlighted', v)} /><span className="text-sm">Highlight plan</span><Switch checked={plan.published} onCheckedChange={(v) => set('published', v)} /><span className="text-sm">Published</span></div>
    </div>
  );
}

function LegalPanel() {
  const { data = [], isLoading } = useGetLegalPages();
  const update = useUpdateLegalPage();
  const qc = useQueryClient();
  const { toast } = useToast();
  const [editing, setEditing] = useState<LegalPage | null>(null);
  return (
    <div className="space-y-4">
      {isLoading ? <LoadingCards /> : data.map((page) =>
        editing?.slug === page.slug
          ? <Card key={page.slug} className="border-glow"><CardContent className="p-5 space-y-4">
              <div><Label>Page Title</Label><Input className="mt-1" value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value })} /></div>
              <div><Label>Content (HTML)</Label><Textarea className="mt-1 min-h-64 font-mono text-sm" value={editing.content} onChange={(e) => setEditing({ ...editing, content: e.target.value })} /></div>
              <Button onClick={() => update.mutate({ slug: editing.slug, data: editing }, { onSuccess: () => { qc.invalidateQueries({ queryKey: getGetLegalPagesQueryKey() }); setEditing(null); toast({ title: 'Legal page updated' }); } })} className="gradient-purple"><Save className="w-4 h-4 mr-2" />Save Page</Button>
            </CardContent></Card>
          : <Card key={page.slug} className="border-glow"><CardContent className="p-5 flex items-center justify-between">
              <div><h3 className="font-semibold">{page.title}</h3><p className="text-xs text-muted-foreground">/{page.slug}</p></div>
              <Button variant="outline" onClick={() => setEditing({ ...page })}><Pencil className="w-4 h-4 mr-2" />Edit Content</Button>
            </CardContent></Card>
      )}
    </div>
  );
}

function SeoPanel() {
  const { data = [], isLoading } = useGetSeoPages();
  const update = useUpdateSeoPage();
  const qc = useQueryClient();
  const { toast } = useToast();
  const [editing, setEditing] = useState<SeoPage | null>(null);
  return (
    <div className="space-y-4">
      {isLoading ? <LoadingCards /> : data.map((page) =>
        editing?.id === page.id
          ? <Card key={page.id} className="border-glow"><CardContent className="p-5 space-y-4">{seoFields(editing, setEditing)}<Button onClick={() => update.mutate({ id: editing.id, data: editing }, { onSuccess: () => { qc.invalidateQueries({ queryKey: getGetSeoPagesQueryKey() }); setEditing(null); toast({ title: 'SEO settings updated' }); } })} className="gradient-purple"><Save className="w-4 h-4 mr-2" />Save SEO</Button></CardContent></Card>
          : <Card key={page.id} className="border-glow"><CardContent className="p-5 flex items-center justify-between">
              <div><h3 className="font-semibold">{page.path}</h3><p className="text-sm text-muted-foreground">{page.metaTitle || 'No meta title configured'}</p></div>
              <Button variant="outline" onClick={() => setEditing({ ...page })}><Pencil className="w-4 h-4 mr-2" />Edit SEO</Button>
            </CardContent></Card>
      )}
    </div>
  );
}

function seoFields(page: SeoPage, setPage: (p: SeoPage) => void) {
  const set = (key: keyof SeoPage, value: unknown) => setPage({ ...page, [key]: value });
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div><Label>Page Path</Label><Input className="mt-1" value={page.path} onChange={(e) => set('path', e.target.value)} /></div>
      <div><Label>Canonical URL</Label><Input className="mt-1" value={page.canonicalUrl} onChange={(e) => set('canonicalUrl', e.target.value)} /></div>
      <div className="md:col-span-2"><Label>Meta Title</Label><Input className="mt-1" value={page.metaTitle} onChange={(e) => set('metaTitle', e.target.value)} /></div>
      <div className="md:col-span-2"><Label>Meta Description</Label><Textarea className="mt-1" value={page.metaDescription} onChange={(e) => set('metaDescription', e.target.value)} /></div>
      <div><Label>Meta Keywords</Label><Input className="mt-1" value={page.metaKeywords} onChange={(e) => set('metaKeywords', e.target.value)} /></div>
      <div><Label>Open Graph Image URL</Label><Input className="mt-1" value={page.ogImage} onChange={(e) => set('ogImage', e.target.value)} /></div>
      <div className="md:col-span-2"><Label>Structured Data JSON</Label><Textarea className="mt-1 font-mono text-sm min-h-32" value={JSON.stringify(page.structuredData, null, 2)} onChange={(e) => { try { set('structuredData', JSON.parse(e.target.value)); } catch { /* keep editor usable while typing */ } }} /></div>
      <div className="flex items-center gap-2"><Switch checked={page.noindex} onCheckedChange={(v) => set('noindex', v)} /><span className="text-sm">No index this page</span></div>
    </div>
  );
}

function fieldLabel(text: string) { return <Label className="block mb-2">{text}</Label>; }
function LoadingCards() { return <>{[1, 2, 3].map((i) => <div key={i} className="h-24 rounded-xl bg-muted/20 animate-pulse" />)}</>; }
