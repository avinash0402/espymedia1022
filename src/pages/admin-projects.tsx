import { useState } from 'react';
import { AdminLayout } from '@/components/admin-layout';
import { useGetProjects, useCreateProject, useUpdateProject, useDeleteProject, useGetProjectCategories, useCreateProjectCategory, getGetProjectsQueryKey, getGetFeaturedProjectsQueryKey } from '@workspace/api-client-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Switch } from '@/components/ui/switch';
import { ImageUpload } from '@/components/image-upload';
import { Plus, Trash2, Pencil, ExternalLink, X } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import type { Project } from '@workspace/api-client-react';

function TechStackInput({ tags, onChange }: { tags: string[]; onChange: (tags: string[]) => void }) {
  const [input, setInput] = useState('');

  const addTag = () => {
    const trimmed = input.trim();
    if (trimmed && !tags.includes(trimmed)) {
      onChange([...tags, trimmed]);
    }
    setInput('');
  };

  const removeTag = (index: number) => {
    onChange(tags.filter((_, i) => i !== index));
  };

  return (
    <div className="mt-1 space-y-2">
      <div className="flex gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTag(); } }}
          placeholder="e.g. React, Node.js, Tailwind CSS"
          className="flex-1"
        />
        <Button type="button" variant="outline" size="sm" onClick={addTag} disabled={!input.trim()}>
          <Plus className="w-4 h-4 mr-1" /> Add
        </Button>
      </div>
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {tags.map((tag, i) => (
            <span key={i} className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-primary/10 text-primary text-sm border border-primary/20">
              {tag}
              <button type="button" onClick={() => removeTag(i)} className="hover:text-destructive transition-colors ml-0.5">
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

const blankForm = {
  title: '',
  slug: '',
  category: '',
  categoryId: undefined as number | undefined,
  clientName: '',
  description: '',
  techStack: [] as string[],
  imageUrl: '',
  liveUrl: '',
  published: false,
  featured: false,
  sortOrder: 0,
};


export default function AdminProjects() {
  const { data: projects, isLoading } = useGetProjects();
  const { data: categories = [] } = useGetProjectCategories();
  const createCategory = useCreateProjectCategory();
  const createProject = useCreateProject();
  const updateProject = useUpdateProject();
  const deleteProject = useDeleteProject();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [formData, setFormData] = useState(blankForm);

  const handleEdit = (project: Project) => {
    setEditingProject(project);
    setFormData({
      title: project.title,
      slug: project.slug,
      category: project.category,
      categoryId: project.categoryId,
      clientName: project.clientName || '',
      description: project.challenge || '',
      techStack: project.techStack || [],
      imageUrl: project.imageUrl || '',
      liveUrl: project.liveUrl || '',
      published: project.published,
      featured: project.featured,
      sortOrder: project.sortOrder || 0,
    });
    setDialogOpen(true);
  };

  const handleSubmit = () => {
    if (!formData.title || !formData.slug) {
      toast({ title: 'Title and slug are required', variant: 'destructive' });
      return;
    }

    const payload = {
      ...formData,
      challenge: formData.description,
    };

    if (editingProject) {
      updateProject.mutate(
        { id: editingProject.id, data: payload },
        {
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: getGetProjectsQueryKey() });
            queryClient.invalidateQueries({ queryKey: getGetFeaturedProjectsQueryKey() });
            setDialogOpen(false);
            setEditingProject(null);
            resetForm();
            toast({ title: 'Project updated successfully' });
          },
          onError: () => toast({ title: 'Failed to update project', variant: 'destructive' }),
        }
      );
    } else {
      createProject.mutate(
        { data: payload },
        {
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: getGetProjectsQueryKey() });
            queryClient.invalidateQueries({ queryKey: getGetFeaturedProjectsQueryKey() });
            setDialogOpen(false);
            resetForm();
            toast({ title: 'Project created successfully' });
          },
          onError: () => toast({ title: 'Failed to create project', variant: 'destructive' }),
        }
      );
    }
  };

  const handleDelete = (id: number) => {
    deleteProject.mutate(
      { id },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetProjectsQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetFeaturedProjectsQueryKey() });
          toast({ title: 'Project deleted successfully' });
        },
      }
    );
  };

  const resetForm = () => {
    setFormData(blankForm);
    setEditingProject(null);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setEditingProject(null);
    resetForm();
  };

  const autoSlug = (title: string) =>
    title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-1 sm:mb-2">Web Projects</h1>
            <p className="text-muted-foreground text-sm">Manage web design portfolio projects shown on the homepage and project pages</p>
          </div>

          <Dialog open={dialogOpen} onOpenChange={(open) => { if (!open) handleDialogClose(); else setDialogOpen(open); }}>
            <DialogTrigger asChild>
              <Button className="gradient-purple" onClick={() => { resetForm(); setDialogOpen(true); }} data-testid="button-create-project">
                <Plus className="w-4 h-4 mr-2" /> New Project
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingProject ? 'Edit Project' : 'Create Project'}</DialogTitle>
              </DialogHeader>
              <div className="space-y-5">
                {/* Cover image */}
                <div>
                  <Label className="mb-2 block">Cover Image</Label>
                  <ImageUpload
                    value={formData.imageUrl}
                    onChange={(url) => setFormData({ ...formData, imageUrl: url })}
                    label="Upload the main project image (displayed on project card)"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="title">Project Title *</Label>
                    <Input
                      id="title"
                      className="mt-1"
                      value={formData.title}
                      onChange={(e) => {
                        const title = e.target.value;
                        setFormData({ ...formData, title, slug: formData.slug || autoSlug(title) });
                      }}
                      placeholder="NovaSpark Technologies"
                      data-testid="input-project-title"
                    />
                  </div>
                  <div>
                    <Label htmlFor="slug">Slug *</Label>
                    <Input
                      id="slug"
                      className="mt-1"
                      value={formData.slug}
                      onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                      placeholder="novaspark-technologies"
                      data-testid="input-project-slug"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="category">Category</Label>
                    <select
                      id="category"
                      className="mt-1 w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                      value={formData.categoryId || ''}
                      onChange={(e) => {
                        const selected = categories.find((c) => c.id === Number(e.target.value));
                        setFormData({ ...formData, categoryId: e.target.value ? Number(e.target.value) : undefined, category: selected?.name || '' });
                      }}
                      data-testid="input-project-category"
                    >
                      <option value="">Select category</option>
                      {categories.map((cat) => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                    </select>
                    <div className="mt-2 flex gap-2">
                      <Input placeholder="New category" id="new-project-category" />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const input = document.getElementById('new-project-category') as HTMLInputElement;
                          if (input.value) {
                            createCategory.mutate(
                              { data: { name: input.value, slug: input.value.toLowerCase().replace(/[^a-z0-9]+/g, '-') } },
                              { onSuccess: () => { input.value = ''; toast({ title: 'Category added' }); } }
                            );
                          }
                        }}
                      >
                        Add
                      </Button>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="clientName">Client Name</Label>
                    <Input
                      id="clientName"
                      className="mt-1"
                      value={formData.clientName}
                      onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                      placeholder="Client Inc"
                      data-testid="input-project-client"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="description">Project Description</Label>
                  <Textarea
                    id="description"
                    className="mt-1"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Describe the project — what was built, the results, and what makes it stand out..."
                    rows={4}
                    data-testid="textarea-project-challenge"
                  />
                </div>

                <div>
                  <Label>Tech Stack / Tags</Label>
                  <TechStackInput
                    tags={formData.techStack}
                    onChange={(tags) => setFormData({ ...formData, techStack: tags })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="liveUrl">Live Project URL</Label>
                    <Input
                      id="liveUrl"
                      className="mt-1"
                      value={formData.liveUrl}
                      onChange={(e) => setFormData({ ...formData, liveUrl: e.target.value })}
                      placeholder="https://..."
                    />
                  </div>
                  <div>
                    <Label htmlFor="sortOrder">Display Order</Label>
                    <Input
                      id="sortOrder"
                      className="mt-1"
                      type="number"
                      value={formData.sortOrder}
                      onChange={(e) => setFormData({ ...formData, sortOrder: Number(e.target.value) })}
                    />
                  </div>
                </div>

                <div className="flex items-center gap-6 pt-1">
                  <div className="flex items-center gap-2">
                    <Switch
                      id="published"
                      checked={formData.published}
                      onCheckedChange={(checked) => setFormData({ ...formData, published: checked })}
                      data-testid="switch-project-published"
                    />
                    <Label htmlFor="published">Published</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      id="featured"
                      checked={formData.featured}
                      onCheckedChange={(checked) => setFormData({ ...formData, featured: checked })}
                      data-testid="switch-project-featured"
                    />
                    <Label htmlFor="featured">Featured on homepage</Label>
                  </div>
                </div>

                <Button
                  onClick={handleSubmit}
                  className="w-full gradient-purple"
                  disabled={createProject.isPending || updateProject.isPending}
                  data-testid="button-save-project"
                >
                  {(createProject.isPending || updateProject.isPending) ? 'Saving...' : editingProject ? 'Update Project' : 'Create Project'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-32 bg-muted/20 animate-pulse rounded-xl" />
            ))}
          </div>
        ) : projects && projects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {projects.map((project) => (
              <Card key={project.id} className="border-glow" data-testid={`card-project-${project.id}`}>
                <CardContent className="p-6 flex gap-4">
                  {project.imageUrl ? (
                    <img src={project.imageUrl} alt={project.altText || project.title} className="w-20 h-16 object-cover rounded-lg flex-shrink-0" />
                  ) : (
                    <div className="w-20 h-16 rounded-lg bg-white/5 border border-white/10 flex-shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h3 className="text-lg font-bold truncate">{project.title}</h3>
                        <div className="text-sm text-muted-foreground">
                          {project.category}{project.clientName && ` · ${project.clientName}`}
                        </div>
                      </div>
                      <div className="flex gap-1 flex-shrink-0">
                        {project.liveUrl && (
                          <a href={project.liveUrl} target="_blank" rel="noreferrer">
                            <Button variant="ghost" size="sm"><ExternalLink className="w-4 h-4" /></Button>
                          </a>
                        )}
                        <Button onClick={() => handleEdit(project)} variant="ghost" size="sm" data-testid={`button-edit-project-${project.id}`}>
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="sm" data-testid={`button-delete-project-${project.id}`}>
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete this project?</AlertDialogTitle>
                              <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDelete(project.id)} data-testid={`confirm-delete-project-${project.id}`}>
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-2 text-xs flex-wrap">
                      {project.published && <span className="px-2 py-0.5 rounded-full bg-green-500/20 text-green-300">Published</span>}
                      {project.featured && <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300">Featured</span>}
                      {(project.techStack || []).slice(0, 3).map((tag) => (
                        <span key={tag} className="px-2 py-0.5 rounded-full bg-white/5 text-zinc-400">{tag}</span>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="p-12 text-center text-muted-foreground">
              No projects yet. Create your first one.
            </CardContent>
          </Card>
        )}
      </div>
    </AdminLayout>
  );
}
