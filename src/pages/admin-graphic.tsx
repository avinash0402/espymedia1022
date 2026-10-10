import { useState } from 'react';
import { AdminLayout } from '@/components/admin-layout';
import {
  useGetGraphicWorks,
  useGetGraphicCategories,
  createGraphicWorkRecord,
  updateGraphicWorkRecord,
  deleteGraphicWorkRecord,
  useCreateGraphicCategory,
} from '@workspace/api-client-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { BulkImageUpload, type UploadedImage } from '@/components/bulk-image-upload';
import { useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import {
  Check,
  CheckSquare,
  ImagePlus,
  Loader2,
  Plus,
  Star,
  Square,
  Tag,
  Trash2,
  X,
} from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

const slugify = (value: string) =>
  value.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

const MAX_FEATURED_GRAPHIC_WORKS = 10;

async function settleInBatches<T>(
  items: T[],
  run: (item: T, index: number) => Promise<unknown>,
  batchSize = 5,
): Promise<PromiseSettledResult<unknown>[]> {
  const results: PromiseSettledResult<unknown>[] = [];
  for (let start = 0; start < items.length; start += batchSize) {
    const batch = items.slice(start, start + batchSize);
    results.push(...await Promise.allSettled(batch.map((item, index) => run(item, start + index))));
  }
  return results;
}

export default function AdminGraphic() {
  const { data: works = [], isLoading, error } = useGetGraphicWorks();
  const { data: categories = [], error: categoriesError } = useGetGraphicCategories();
  const createCategory = useCreateGraphicCategory();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [newCategory, setNewCategory] = useState('');
  const [uploadCategoryId, setUploadCategoryId] = useState('');
  const [bulkCategoryId, setBulkCategoryId] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [isApplying, setIsApplying] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const featuredCount = works.filter((work) => work.featured).length;
  const selectedWorks = works.filter((work) => selectedIds.has(work.id));
  const selectedFeaturedCount = selectedWorks.filter((work) => work.featured).length;
  const selectedUnfeaturedCount = selectedWorks.length - selectedFeaturedCount;
  const remainingFeaturedSlots = Math.max(0, MAX_FEATURED_GRAPHIC_WORKS - featuredCount);
  const visibleWorks = works.filter((work) => {
    if (activeFilter === 'featured') return work.featured;
    if (activeFilter === 'uncategorized') return !work.categoryId;
    if (activeFilter !== 'all') return work.categoryId === Number(activeFilter);
    return true;
  });
  const visibleSelectedCount = visibleWorks.filter((work) => selectedIds.has(work.id)).length;

  const refreshWorks = () => queryClient.invalidateQueries({ queryKey: ['cms', 'graphic-works'] });
  const refreshCategories = () => queryClient.invalidateQueries({ queryKey: ['cms', 'graphic-categories'] });

  const handleUploaded = async (uploads: UploadedImage[]) => {
    const categoryId = uploadCategoryId ? Number(uploadCategoryId) : undefined;
    const results = await settleInBatches(uploads, (upload, index) => {
      const baseName = upload.name.replace(/\.[^/.]+$/, '').replace(/[_-]+/g, ' ').trim();
      const title = baseName || `Portfolio image ${works.length + index + 1}`;
      const uniqueSuffix = `${Date.now()}-${index}-${Math.random().toString(36).slice(2, 8)}`;
      return createGraphicWorkRecord({
        title,
        slug: `${slugify(title) || 'portfolio-image'}-${uniqueSuffix}`,
        categoryId,
        imageUrl: upload.url,
        galleryUrls: [],
        description: '',
        altText: title,
        published: true,
        featured: false,
        sortOrder: works.length + index,
      });
    });

    await refreshWorks();
    const created = results.filter((result) => result.status === 'fulfilled').length;
    const failures = results.flatMap((result, index) =>
      result.status === 'rejected' ? [uploads[index].name] : [],
    );
    if (created) {
      toast({ title: `${created} image${created === 1 ? '' : 's'} added to the portfolio` });
    }
    if (failures.length) {
      toast({
        title: `${failures.length} image${failures.length === 1 ? '' : 's'} could not be added`,
        description: failures.join(', '),
        variant: 'destructive',
      });
    }
  };

  const addCategory = async () => {
    const name = newCategory.trim();
    const slug = slugify(name);
    if (!name || !slug) return;

    try {
      await createCategory.mutateAsync({ data: { name, slug } });
      setNewCategory('');
      await refreshCategories();
      toast({ title: 'Category added' });
    } catch (categoryError) {
      toast({
        title: categoryError instanceof Error ? categoryError.message : 'Could not add category',
        variant: 'destructive',
      });
    }
  };

  const toggleSelection = (id: number) => {
    setSelectedIds((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    setSelectedIds((current) => {
      const next = new Set(current);
      if (visibleSelectedCount === visibleWorks.length) {
        visibleWorks.forEach((work) => next.delete(work.id));
      } else {
        visibleWorks.forEach((work) => next.add(work.id));
      }
      return next;
    });
  };

  const assignCategory = async () => {
    if (!selectedIds.size) return;
    setIsApplying(true);
    const results = await settleInBatches(
      Array.from(selectedIds),
      (id) => updateGraphicWorkRecord(id, {
        categoryId: bulkCategoryId ? Number(bulkCategoryId) : null,
      }),
    );
    await refreshWorks();
    setIsApplying(false);
    const updated = results.filter((result) => result.status === 'fulfilled').length;
    const failed = results.length - updated;
    toast({
      title: failed ? `${updated} updated, ${failed} failed` : `Category updated for ${updated} images`,
      ...(failed ? { variant: 'destructive' as const } : {}),
    });
    if (!failed) setSelectedIds(new Set());
  };

  const setSelectedFeatured = async (featured: boolean) => {
    const targets = selectedWorks.filter((work) => work.featured !== featured);
    if (!targets.length) return;
    if (featured && targets.length > remainingFeaturedSlots) {
      toast({
        title: `Only ${remainingFeaturedSlots} homepage feature slot${remainingFeaturedSlots === 1 ? '' : 's'} left`,
        description: `Unfeature existing images or select no more than ${remainingFeaturedSlots} additional image${remainingFeaturedSlots === 1 ? '' : 's'}.`,
        variant: 'destructive',
      });
      return;
    }

    setIsApplying(true);
    const results: PromiseSettledResult<unknown>[] = [];
    for (const work of targets) {
      try {
        results.push({ status: 'fulfilled', value: await updateGraphicWorkRecord(work.id, { featured }) });
      } catch (reason) {
        results.push({ status: 'rejected', reason });
      }
    }
    await refreshWorks();
    setIsApplying(false);
    const updated = results.filter((result) => result.status === 'fulfilled').length;
    const failures = results.flatMap((result) =>
      result.status === 'rejected'
        ? [result.reason instanceof Error ? result.reason.message : 'The server rejected an update']
        : [],
    );
    const failed = failures.length;
    toast({
      title: failed
        ? `${updated} updated, ${failed} failed`
        : featured
          ? `${updated} image${updated === 1 ? '' : 's'} featured on the homepage`
          : `${updated} image${updated === 1 ? '' : 's'} removed from homepage features`,
      ...(failed ? { description: failures.slice(0, 3).join('; ') } : {}),
      ...(failed ? { variant: 'destructive' as const } : {}),
    });
    if (!failed) setSelectedIds(new Set());
  };

  const deleteSelected = async () => {
    if (!selectedIds.size) return;
    setIsDeleting(true);
    const ids = Array.from(selectedIds);
    const results = await settleInBatches(ids, deleteGraphicWorkRecord);
    await refreshWorks();
    const deletedIds = ids.filter((_, index) => results[index]?.status === 'fulfilled');
    const failedIds = ids.filter((_, index) => results[index]?.status === 'rejected');
    setSelectedIds(new Set(failedIds));
    setIsDeleting(false);
    toast({
      title: failedIds.length ? `${deletedIds.length} deleted, ${failedIds.length} failed` : `${deletedIds.length} images deleted`,
      ...(failedIds.length ? { variant: 'destructive' as const } : {}),
    });
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <header>
          <p className="mb-2 text-xs uppercase tracking-[0.2em] text-primary">Portfolio CMS</p>
          <h1 className="mb-1 text-2xl font-bold sm:text-3xl">Graphic Portfolio</h1>
          <p className="text-sm text-muted-foreground">Upload images, select them, then assign categories, choose up to 10 homepage features, or delete them. Featured images are selected independently of category.</p>
        </header>

        <Card className="border-glow">
          <CardContent className="space-y-5 p-5 sm:p-6">
            <div className="flex items-center gap-2">
              <ImagePlus className="h-5 w-5 text-primary" />
              <h2 className="font-semibold">Add portfolio images</h2>
            </div>
            <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_minmax(220px,0.6fr)] sm:items-end">
              <BulkImageUpload
                onUploaded={handleUploaded}
                label="Select or drop multiple images. Each image is added as a separate portfolio item."
              />
              <div className="space-y-2">
                <Label htmlFor="upload-category">Category for new images</Label>
                <select
                  id="upload-category"
                  className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                  value={uploadCategoryId}
                  onChange={(event) => setUploadCategoryId(event.target.value)}
                >
                  <option value="">Uncategorized</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>{category.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="space-y-4 p-5 sm:p-6">
            <div className="flex items-center gap-2">
              <Tag className="h-5 w-5 text-primary" />
              <h2 className="font-semibold">Categories</h2>
            </div>
            <div className="flex gap-2">
              <Input
                value={newCategory}
                onChange={(event) => setNewCategory(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    event.preventDefault();
                    void addCategory();
                  }
                }}
                placeholder="Add a category"
                aria-label="New category name"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => void addCategory()}
                disabled={!newCategory.trim() || createCategory.isPending}
              >
                <Plus className="mr-2 h-4 w-4" /> Add
              </Button>
            </div>
            {categoriesError && (
              <p role="alert" className="text-sm text-destructive">
                Could not load categories: {categoriesError.message}
              </p>
            )}
          </CardContent>
        </Card>

        <section aria-label="Graphic portfolio images" className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="font-semibold">Images <span className="text-muted-foreground">({visibleWorks.length}{activeFilter === 'all' ? '' : ` of ${works.length}`})</span></h2>
              <p className="text-xs text-muted-foreground">
                Select images using the corner checkboxes. Homepage features: {featuredCount}/{MAX_FEATURED_GRAPHIC_WORKS}.
              </p>
              <p className="text-xs text-muted-foreground">
                Until you feature an image, the homepage keeps showing its first 10 published images. After you choose features, it shows only those images.
              </p>
            </div>
            {visibleWorks.length > 0 && (
              <Button type="button" variant="outline" size="sm" onClick={toggleAll}>
                {visibleSelectedCount === visibleWorks.length
                  ? <CheckSquare className="mr-2 h-4 w-4" />
                  : <Square className="mr-2 h-4 w-4" />}
                {visibleSelectedCount === visibleWorks.length ? 'Deselect visible' : 'Select visible'}
              </Button>
            )}
          </div>

          {!isLoading && !error && works.length > 0 && (
            <div className="flex gap-2 overflow-x-auto pb-1" aria-label="Filter portfolio images by category">
              {[
                { id: 'all', label: 'All', count: works.length },
                { id: 'featured', label: 'Featured', count: featuredCount },
                { id: 'uncategorized', label: 'Uncategorized', count: works.filter((work) => !work.categoryId).length },
                ...categories.map((category) => ({
                  id: String(category.id),
                  label: category.name,
                  count: works.filter((work) => work.categoryId === category.id).length,
                })),
              ].map((filter) => (
                <button
                  key={filter.id}
                  type="button"
                  aria-pressed={activeFilter === filter.id}
                  onClick={() => setActiveFilter(filter.id)}
                  className={`shrink-0 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                    activeFilter === filter.id
                      ? 'border-primary bg-primary/15 text-primary'
                      : 'border-border bg-background text-muted-foreground hover:border-primary/50 hover:text-foreground'
                  }`}
                >
                  {filter.label} <span className="ml-1 opacity-70">{filter.count}</span>
                </button>
              ))}
            </div>
          )}

          {selectedIds.size > 0 && (
            <Card className="sticky top-3 z-20 border-primary/30 bg-background/95 backdrop-blur">
              <CardContent className="flex flex-wrap items-center gap-3 p-3">
                <span className="text-sm font-medium">{selectedIds.size} selected</span>
                <select
                  aria-label="Assign selected images to category"
                  className="h-9 min-w-44 flex-1 rounded-md border border-input bg-background px-3 text-sm sm:flex-none"
                  value={bulkCategoryId}
                  onChange={(event) => setBulkCategoryId(event.target.value)}
                >
                  <option value="">Uncategorized</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>{category.name}</option>
                  ))}
                </select>
                <Button type="button" size="sm" onClick={() => void assignCategory()} disabled={isApplying || isDeleting}>
                  {isApplying ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Check className="mr-2 h-4 w-4" />}
                  Assign category
                </Button>
                {selectedUnfeaturedCount > 0 && (
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => void setSelectedFeatured(true)}
                    disabled={isApplying || isDeleting || selectedUnfeaturedCount > remainingFeaturedSlots}
                  >
                    <Star className="mr-2 h-4 w-4" />
                    Feature selected
                  </Button>
                )}
                {selectedFeaturedCount > 0 && (
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => void setSelectedFeatured(false)}
                    disabled={isApplying || isDeleting}
                  >
                    <Star className="mr-2 h-4 w-4" />
                    Unfeature selected
                  </Button>
                )}
                {selectedUnfeaturedCount > remainingFeaturedSlots && (
                  <span className="w-full text-xs text-muted-foreground">
                    Unfeature existing images or select no more than {remainingFeaturedSlots} additional image{remainingFeaturedSlots === 1 ? '' : 's'}.
                  </span>
                )}
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button type="button" size="sm" variant="destructive" disabled={isApplying || isDeleting}>
                      <Trash2 className="mr-2 h-4 w-4" /> Delete selected
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete {selectedIds.size} selected images?</AlertDialogTitle>
                      <AlertDialogDescription>This permanently removes the selected portfolio records. Uploaded image files are not removed from storage.</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => void deleteSelected()} disabled={isDeleting}>
                        {isDeleting ? 'Deleting…' : 'Delete images'}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  aria-label="Clear selection"
                  onClick={() => setSelectedIds(new Set())}
                  disabled={isApplying || isDeleting}
                >
                  <X className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          )}

          {isLoading ? (
            <div className="columns-2 gap-3 sm:columns-3 lg:columns-4 xl:columns-5">
              {Array.from({ length: 8 }, (_, index) => (
                <div key={index} className="mb-3 aspect-[3/2] break-inside-avoid animate-pulse rounded-xl bg-muted/20" />
              ))}
            </div>
          ) : error ? (
            <Card role="alert">
              <CardContent className="p-8 text-center text-sm text-destructive">
                Could not load portfolio images: {error.message}
              </CardContent>
            </Card>
          ) : works.length === 0 ? (
            <Card>
              <CardContent className="p-10 text-center text-sm text-muted-foreground">
                No portfolio images yet. Add images above to get started.
              </CardContent>
            </Card>
          ) : (
            <div className="columns-2 gap-3 sm:columns-3 lg:columns-4 xl:columns-5">
              {visibleWorks.map((work) => {
                const selected = selectedIds.has(work.id);
                const category = categories.find((item) => item.id === work.categoryId);
                return (
                  <button
                    key={work.id}
                    type="button"
                    onClick={() => toggleSelection(work.id)}
                    aria-pressed={selected}
                    aria-label={`${selected ? 'Deselect' : 'Select'} portfolio image${category ? ` in ${category.name}` : ''}`}
                    className={`group relative mb-3 inline-block w-full break-inside-avoid overflow-hidden rounded-xl border bg-muted/10 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                      selected ? 'border-primary ring-2 ring-primary/70' : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <img
                      src={work.imageUrl}
                      alt={work.altText || 'Graphic portfolio image'}
                      loading="lazy"
                      decoding="async"
                      className="block h-auto w-full object-contain"
                    />
                    {category && (
                      <span className="absolute bottom-2 left-2 max-w-[calc(100%-1rem)] truncate rounded-full bg-black/75 px-2.5 py-1 text-xs text-white backdrop-blur">
                        {category.name}
                      </span>
                    )}
                    {work.featured && (
                      <span
                        className="absolute left-2 top-2 flex h-7 w-7 items-center justify-center rounded-md bg-primary text-primary-foreground"
                        title="Featured on homepage"
                        aria-label="Featured on homepage"
                      >
                        <Star className="h-4 w-4 fill-current" />
                      </span>
                    )}
                    <span className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-md border border-white/40 bg-black/60 text-white">
                      {selected && <Check className="h-4 w-4" />}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </AdminLayout>
  );
}
