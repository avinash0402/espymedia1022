import { useState } from 'react';
import { AdminLayout } from '@/components/admin-layout';
import {
  useGetGraphicWorks, useGetGraphicCategories,
  useCreateGraphicWork, useUpdateGraphicWork, useDeleteGraphicWork,
  useCreateGraphicCategory, useUpdateGraphicCategory, useDeleteGraphicCategory,
} from '@workspace/api-client-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { ImageUpload } from '@/components/image-upload';
import { BulkImageUpload, type UploadedImage } from '@/components/bulk-image-upload';
import { useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { Plus, Save, Trash2, Pencil, Image, CheckSquare, Square, X, Tag } from 'lucide-react';

const slugify = (value: string) =>
  value.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

const blank = {
  title: '', slug: '', categoryId: undefined as number | undefined,
  imageUrl: '', galleryUrls: [] as string[], description: '', altText: '',
  published: true, featured: false, sortOrder: 0,
};

export default function AdminGraphic() {
  const { data: works = [], isLoading } = useGetGraphicWorks();
  const { data: categories = [] } = useGetGraphicCategories();
  const create = useCreateGraphicWork();
  const update = useUpdateGraphicWork();
  const remove = useDeleteGraphicWork();
  const createCategory = useCreateGraphicCategory();
  const updateCategory = useUpdateGraphicCategory();
  const deleteCategory = useDeleteGraphicCategory();
  const qc = useQueryClient();
  const { toast } = useToast();

  const [editing, setEditing] = useState<number | null>(null);
  const [draft, setDraft] = useState({ ...blank });
  const [categoryName, setCategoryName] = useState('');
  const [showForm, setShowForm] = useState(false);

  // Bulk selection state
  const [bulkMode, setBulkMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [bulkTitles, setBulkTitles] = useState<Record<number, string>>({});
  const [bulkCategoryId, setBulkCategoryId] = useState<string>('');
  const [isBulkSaving, setIsBulkSaving] = useState(false);

  const resetForm = () => {
    setEditing(null);
    setDraft({ ...blank, sortOrder: works.length });
    setShowForm(false);
  };

  const save = () => {
    if (!draft.title) {
      toast({ title: 'Work title is required', variant: 'destructive' });
      return;
    }
    const data = { ...draft, slug: draft.slug || slugify(draft.title) };
    const done = () => {
      qc.invalidateQueries({ queryKey: ['cms', 'graphic-works'] });
      resetForm();
      toast({ title: editing !== null ? 'Graphic work updated' : 'Graphic work added' });
    };
    const fail = (err: any) => {
      const msg = err?.message || 'Could not save graphic work';
      toast({ title: msg, variant: 'destructive' });
    };
    if (editing !== null) update.mutate({ id: editing, data }, { onSuccess: done, onError: fail });
    else create.mutate({ data }, { onSuccess: done, onError: fail });
  };

  const startEdit = (work: any) => {
    setEditing(work.id);
    setDraft({ ...blank, ...work, galleryUrls: work.galleryUrls || [] });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const addCategory = () => {
    if (!categoryName) return;
    createCategory.mutate(
      { data: { name: categoryName, slug: slugify(categoryName) } },
      { onSuccess: () => { setCategoryName(''); qc.invalidateQueries({ queryKey: ['cms', 'graphic-categories'] }); toast({ title: 'Category added' }); } }
    );
  };

  const createSeparateWorks = async (uploads: UploadedImage[]) => {
    if (!uploads.length) return;
    try {
      for (const [index, upload] of uploads.entries()) {
        const filename = upload.name.replace(/\.[^/.]+$/, '').replace(/[_-]+/g, ' ').trim();
        const title = filename || `Graphic work ${works.length + index + 1}`;
        await create.mutateAsync({
          data: {
            title,
            slug: `${slugify(title) || 'graphic-work'}-${Date.now()}-${index}`,
            categoryId: draft.categoryId,
            imageUrl: upload.url,
            galleryUrls: [],
            description: '',
            altText: title,
            published: true,
            featured: false,
            sortOrder: works.length + index,
          },
        });
      }
      qc.invalidateQueries({ queryKey: ['cms', 'graphic-works'] });
      toast({ title: `${uploads.length} separate graphic works added` });
    } catch (error: any) {
      toast({ title: error?.message || 'Some graphic works could not be added', variant: 'destructive' });
    }
  };

  // Bulk selection helpers
  const toggleSelect = (id: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === works.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(works.map((w) => w.id)));
    }
  };

  const enterBulkMode = () => {
    setBulkMode(true);
    setSelectedIds(new Set());
    setBulkTitles({});
    setBulkCategoryId('');
    setShowForm(false);
  };

  const exitBulkMode = () => {
    setBulkMode(false);
    setSelectedIds(new Set());
    setBulkTitles({});
    setBulkCategoryId('');
  };

  const handleBulkTitleChange = (id: number, value: string) => {
    setBulkTitles((prev) => ({ ...prev, [id]: value }));
  };

  const applyBulkChanges = async () => {
    if (selectedIds.size === 0) {
      toast({ title: 'No items selected', variant: 'destructive' });
      return;
    }
    setIsBulkSaving(true);
    let successCount = 0;
    let failCount = 0;

    for (const id of selectedIds) {
      const work = works.find((w) => w.id === id);
      if (!work) continue;

      const newTitle = bulkTitles[id] !== undefined ? bulkTitles[id] : work.title;
      const newCategoryId = bulkCategoryId !== '' ? Number(bulkCategoryId) : work.categoryId;

      try {
        await update.mutateAsync({
          id,
          data: {
            ...work,
            title: newTitle,
            slug: newTitle !== work.title ? slugify(newTitle) || work.slug : work.slug,
            categoryId: newCategoryId,
          },
        });
        successCount++;
      } catch {
        failCount++;
      }
    }

    qc.invalidateQueries({ queryKey: ['cms', 'graphic-works'] });
    setIsBulkSaving(false);

    if (failCount === 0) {
      toast({ title: `${successCount} work${successCount !== 1 ? 's' : ''} updated` });
    } else {
      toast({ title: `${successCount} updated, ${failCount} failed`, variant: 'destructive' });
    }

    exitBulkMode();
  };

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-1 sm:mb-2">Graphic Portfolio</h1>
            <p className="text-muted-foreground text-sm">Manage graphic design work, categories, and featured placement</p>
          </div>
          <div className="flex gap-2 shrink-0">
            {!bulkMode ? (
              <>
                {!showForm && (
                  <Button variant="outline" onClick={enterBulkMode}>
                    <CheckSquare className="w-4 h-4 mr-2" /> Bulk Select
                  </Button>
                )}
                {!showForm && (
                  <Button className="gradient-purple" onClick={() => { setDraft({ ...blank, sortOrder: works.length }); setShowForm(true); }}>
                    <Plus className="w-4 h-4 mr-2" /> Add Work
                  </Button>
                )}
              </>
            ) : (
              <Button variant="outline" onClick={exitBulkMode}>
                <X className="w-4 h-4 mr-2" /> Cancel Bulk
              </Button>
            )}
          </div>
        </div>

        {/* Bulk Selection Toolbar */}
        {bulkMode && (
          <Card className="border-primary/30 bg-primary/5">
            <CardContent className="p-4">
              <div className="flex flex-wrap items-center gap-4">
                <button
                  onClick={toggleSelectAll}
                  className="flex items-center gap-2 text-sm font-medium hover:text-primary transition-colors"
                >
                  {selectedIds.size === works.length && works.length > 0
                    ? <CheckSquare className="w-4 h-4 text-primary" />
                    : <Square className="w-4 h-4" />}
                  {selectedIds.size === works.length && works.length > 0 ? 'Deselect All' : 'Select All'}
                </button>

                <span className="text-sm text-muted-foreground">
                  {selectedIds.size} item{selectedIds.size !== 1 ? 's' : ''} selected
                </span>

                <div className="flex items-center gap-2 ml-auto flex-wrap">
                  <div className="flex items-center gap-2">
                    <Tag className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    <select
                      className="h-9 rounded-md border border-input bg-background px-3 text-sm min-w-[160px]"
                      value={bulkCategoryId}
                      onChange={(e) => setBulkCategoryId(e.target.value)}
                    >
                      <option value="">— Bulk assign category —</option>
                      <option value="0">Uncategorized</option>
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                  </div>

                  <Button
                    onClick={applyBulkChanges}
                    className="gradient-purple"
                    disabled={selectedIds.size === 0 || isBulkSaving}
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {isBulkSaving ? 'Saving...' : 'Apply Changes'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Categories */}
        <Card className="border-glow">
          <CardContent className="p-5 space-y-3">
            <h2 className="font-semibold">Categories</h2>
            <div className="flex gap-2">
              <Input value={categoryName} onChange={(e) => setCategoryName(e.target.value)} placeholder="New category name" onKeyDown={(e) => e.key === 'Enter' && addCategory()} />
              <Button variant="outline" onClick={addCategory}><Plus className="w-4 h-4 mr-2" />Add</Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <span key={cat.id} className="inline-flex items-center gap-1 rounded-full bg-primary/10 text-primary px-3 py-1 text-sm">
                  <button
                    onClick={() => {
                      const name = window.prompt('Rename category', cat.name);
                      if (name && name !== cat.name)
                        updateCategory.mutate({ id: cat.id, data: { name, slug: slugify(name) } });
                    }}
                  >
                    {cat.name}
                  </button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <button aria-label={`Delete ${cat.name}`} className="ml-1 text-primary/60 hover:text-destructive">×</button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete category "{cat.name}"?</AlertDialogTitle>
                        <AlertDialogDescription>Works in this category will become uncategorised.</AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => deleteCategory.mutate({ id: cat.id })}>Delete</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </span>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Add / Edit Form */}
        {showForm && (
          <Card className="border-glow">
            <CardContent className="p-6 space-y-5">
              <h2 className="text-xl font-semibold">{editing !== null ? 'Edit Work' : 'Add New Work'}</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Work Title *</Label>
                  <Input className="mt-1" value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} placeholder="Brand identity campaign" />
                </div>
                <div>
                  <Label>Slug (auto-generated if empty)</Label>
                  <Input className="mt-1" value={draft.slug} onChange={(e) => setDraft({ ...draft, slug: e.target.value })} placeholder="brand-identity-campaign" />
                </div>
                <div>
                  <Label>Category</Label>
                  <select
                    className="mt-1 w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                    value={draft.categoryId || ''}
                    onChange={(e) => setDraft({ ...draft, categoryId: e.target.value ? Number(e.target.value) : undefined })}
                  >
                    <option value="">Uncategorized</option>
                    {categories.map((cat) => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                  </select>
                </div>
                <div>
                  <Label>Display Order</Label>
                  <Input className="mt-1" type="number" value={draft.sortOrder} onChange={(e) => setDraft({ ...draft, sortOrder: Number(e.target.value) })} />
                </div>
              </div>

              <div>
                <Label className="mb-2 block">Cover / Featured Image</Label>
                <ImageUpload
                  value={draft.imageUrl}
                  onChange={(url) => setDraft({ ...draft, imageUrl: url })}
                  label="This is the main image shown in the gallery grid"
                />
              </div>

              <div>
                <Label>Alt Text</Label>
                <Input className="mt-1" value={draft.altText} onChange={(e) => setDraft({ ...draft, altText: e.target.value })} placeholder="Descriptive alt text for accessibility" />
              </div>

              <div>
                <Label>Description</Label>
                <Textarea className="mt-1" value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} placeholder="Brief description of this work..." />
              </div>

              {/* Bulk Gallery Image Upload */}
              <div>
                <Label className="mb-2 block">Gallery Images</Label>
                <BulkImageUpload
                  values={draft.galleryUrls}
                  onChange={(urls) => setDraft({ ...draft, galleryUrls: urls })}
                  label="Upload multiple images at once — each image becomes its own graphic work with a starter title from the filename. Edit each title below."
                  onUploaded={createSeparateWorks}
                />
                <p className="text-xs text-muted-foreground mt-2">
                  New bulk uploads are separate portfolio items. Existing gallery images on this work are preserved.
                </p>
              </div>

              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <Switch checked={draft.published} onCheckedChange={(v) => setDraft({ ...draft, published: v })} id="pub" />
                  <Label htmlFor="pub">Published</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch checked={draft.featured} onCheckedChange={(v) => setDraft({ ...draft, featured: v })} id="feat" />
                  <Label htmlFor="feat">Featured on homepage</Label>
                </div>
              </div>

              <div className="flex gap-3">
                <Button onClick={save} className="gradient-purple" disabled={create.isPending || update.isPending}>
                  <Save className="w-4 h-4 mr-2" />{create.isPending || update.isPending ? 'Saving...' : editing !== null ? 'Update Work' : 'Add Work'}
                </Button>
                <Button variant="outline" onClick={resetForm}>Cancel</Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Works list */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => <div key={i} className="h-28 rounded-xl bg-muted/20 animate-pulse" />)}
          </div>
        ) : works.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center text-muted-foreground">
              No graphic works yet. Add your first one above.
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {works.map((work) => {
              const cat = categories.find((c) => c.id === work.categoryId);
              const isSelected = selectedIds.has(work.id);
              return (
                <Card
                  key={work.id}
                  className={`border-glow transition-all ${bulkMode ? 'cursor-pointer' : ''} ${isSelected ? 'ring-2 ring-primary border-primary/50' : ''}`}
                  onClick={bulkMode ? () => toggleSelect(work.id) : undefined}
                >
                  <CardContent className="p-5 flex gap-4">
                    {/* Checkbox in bulk mode */}
                    {bulkMode && (
                      <div className="flex items-center justify-center flex-shrink-0">
                        {isSelected
                          ? <CheckSquare className="w-5 h-5 text-primary" />
                          : <Square className="w-5 h-5 text-muted-foreground" />}
                      </div>
                    )}

                    {work.imageUrl ? (
                      <img src={work.imageUrl} alt={work.altText || work.title} className="w-24 h-20 object-cover rounded-lg flex-shrink-0" />
                    ) : (
                      <div className="w-24 h-20 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0">
                        <Image className="w-5 h-5 text-muted-foreground" />
                      </div>
                    )}

                    <div className="flex-1 min-w-0">
                      {/* Editable title when selected in bulk mode */}
                      {bulkMode && isSelected ? (
                        <Input
                          className="mb-1 h-8 text-sm font-semibold"
                          value={bulkTitles[work.id] !== undefined ? bulkTitles[work.id] : work.title}
                          onChange={(e) => { e.stopPropagation(); handleBulkTitleChange(work.id, e.target.value); }}
                          onClick={(e) => e.stopPropagation()}
                          placeholder="Work title"
                        />
                      ) : (
                        <h3 className="font-semibold truncate">{work.title}</h3>
                      )}
                      {cat && <p className="text-xs text-primary">{cat.name}</p>}
                      <p className="text-xs text-muted-foreground mt-1">
                        {work.published ? 'Published' : 'Draft'} · {work.featured ? 'Featured' : 'Not featured'}
                        {work.galleryUrls?.length > 0 && ` · ${work.galleryUrls.length} gallery image${work.galleryUrls.length !== 1 ? 's' : ''}`}
                      </p>
                      {/* Gallery thumbnail strip */}
                      {work.galleryUrls?.length > 0 && (
                        <div className="flex gap-1 mt-2 overflow-x-auto">
                          {work.galleryUrls.slice(0, 6).map((url, i) => (
                            <img key={i} src={url} alt={`Gallery ${i + 1}`} className="w-10 h-8 object-cover rounded flex-shrink-0 border border-border" />
                          ))}
                          {work.galleryUrls.length > 6 && (
                            <div className="w-10 h-8 rounded flex-shrink-0 border border-border bg-muted/20 flex items-center justify-center text-[10px] text-muted-foreground">
                              +{work.galleryUrls.length - 6}
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {!bulkMode && (
                      <div className="flex flex-col gap-2">
                        <Button variant="ghost" size="sm" onClick={() => startEdit(work)}><Pencil className="w-4 h-4" /></Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="sm"><Trash2 className="w-4 h-4" /></Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete "{work.title}"?</AlertDialogTitle>
                              <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => {
                                remove.mutate({ id: work.id }, {
                                  onSuccess: () => {
                                    qc.invalidateQueries({ queryKey: ['cms', 'graphic-works'] });
                                    toast({ title: 'Work deleted' });
                                  }
                                });
                              }}>Delete</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
