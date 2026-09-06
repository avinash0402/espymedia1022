import { useState } from 'react';
import { AdminLayout } from '@/components/admin-layout';
import { useGetTestimonials, useCreateTestimonial, useUpdateTestimonial, useDeleteTestimonial, getGetTestimonialsQueryKey } from '@workspace/api-client-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Switch } from '@/components/ui/switch';
import { ImageUpload } from '@/components/image-upload';
import { Plus, Trash2, Pencil } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import type { Testimonial } from '@workspace/api-client-react';

export default function AdminTestimonials() {
  const { data: testimonials, isLoading } = useGetTestimonials();
  const createTestimonial = useCreateTestimonial();
  const updateTestimonial = useUpdateTestimonial();
  const deleteTestimonial = useDeleteTestimonial();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTestimonial, setEditingTestimonial] = useState<Testimonial | null>(null);
  const [formData, setFormData] = useState({
    quote: '',
    clientName: '',
    company: '',
    role: '',
    rating: 5,
    avatarUrl: '',
    published: false,
  });

  const handleEdit = (testimonial: Testimonial) => {
    setEditingTestimonial(testimonial);
    setFormData({
      quote: testimonial.quote,
      clientName: testimonial.clientName,
      company: testimonial.company,
      role: testimonial.role || '',
      rating: testimonial.rating || 5,
      avatarUrl: testimonial.avatarUrl || '',
      published: testimonial.published,
    });
    setDialogOpen(true);
  };

  const handleSubmit = () => {
    if (!formData.quote || !formData.clientName || !formData.company) {
      toast({ title: 'Please fill in required fields', variant: 'destructive' });
      return;
    }

    if (editingTestimonial) {
      updateTestimonial.mutate(
        { id: editingTestimonial.id, data: formData },
        {
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: getGetTestimonialsQueryKey() });
            setDialogOpen(false);
            setEditingTestimonial(null);
            resetForm();
            toast({ title: 'Testimonial updated successfully' });
          },
        }
      );
    } else {
      createTestimonial.mutate(
        { data: formData },
        {
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: getGetTestimonialsQueryKey() });
            setDialogOpen(false);
            resetForm();
            toast({ title: 'Testimonial created successfully' });
          },
        }
      );
    }
  };

  const handleDelete = (id: number) => {
    deleteTestimonial.mutate(
      { id },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetTestimonialsQueryKey() });
          toast({ title: 'Testimonial deleted successfully' });
        },
      }
    );
  };

  const resetForm = () => {
    setFormData({ quote: '', clientName: '', company: '', role: '', rating: 5, avatarUrl: '', published: false });
    setEditingTestimonial(null);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setEditingTestimonial(null);
    resetForm();
  };

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-1 sm:mb-2">Testimonials</h1>
            <p className="text-muted-foreground text-sm">Manage client testimonials shown on the homepage. Toggle "Published" to control visibility.</p>
          </div>

          <Dialog open={dialogOpen} onOpenChange={(open) => { if (!open) handleDialogClose(); else setDialogOpen(open); }}>
            <DialogTrigger asChild>
              <Button className="gradient-purple" data-testid="button-create-testimonial">
                <Plus className="w-4 h-4 mr-2" /> New Testimonial
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingTestimonial ? 'Edit Testimonial' : 'Create Testimonial'}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="quote">Quote *</Label>
                  <Textarea
                    id="quote"
                    value={formData.quote}
                    onChange={(e) => setFormData({ ...formData, quote: e.target.value })}
                    placeholder="Client testimonial..."
                    className="mt-1 min-h-[120px]"
                    data-testid="textarea-testimonial-quote"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="clientName">Client Name *</Label>
                    <Input
                      id="clientName"
                      className="mt-1"
                      value={formData.clientName}
                      onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                      placeholder="John Smith"
                      data-testid="input-testimonial-clientname"
                    />
                  </div>
                  <div>
                    <Label htmlFor="company">Company *</Label>
                    <Input
                      id="company"
                      className="mt-1"
                      value={formData.company}
                      onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                      placeholder="Company Inc"
                      data-testid="input-testimonial-company"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="role">Role / Position</Label>
                    <Input
                      id="role"
                      className="mt-1"
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                      placeholder="Founder"
                    />
                  </div>
                  <div>
                    <Label htmlFor="rating">Rating (1–5)</Label>
                    <Input
                      id="rating"
                      className="mt-1"
                      type="number"
                      min="1"
                      max="5"
                      value={formData.rating}
                      onChange={(e) => setFormData({ ...formData, rating: Number(e.target.value) })}
                      data-testid="input-testimonial-rating"
                    />
                  </div>
                </div>

                <div>
                  <Label className="mb-2 block">Client Avatar (optional)</Label>
                  <ImageUpload
                    value={formData.avatarUrl}
                    onChange={(url) => setFormData({ ...formData, avatarUrl: url })}
                    label="Upload a client headshot or company logo"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <Switch
                    id="published"
                    checked={formData.published}
                    onCheckedChange={(checked) => setFormData({ ...formData, published: checked })}
                    data-testid="switch-testimonial-published"
                  />
                  <Label htmlFor="published">Published (visible on website)</Label>
                </div>

                <Button
                  onClick={handleSubmit}
                  className="w-full gradient-purple"
                  disabled={createTestimonial.isPending || updateTestimonial.isPending}
                  data-testid="button-save-testimonial"
                >
                  {(createTestimonial.isPending || updateTestimonial.isPending) ? 'Saving...' : editingTestimonial ? 'Update Testimonial' : 'Create Testimonial'}
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
        ) : testimonials && testimonials.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {testimonials.map((testimonial) => (
              <Card key={testimonial.id} className="border-glow" data-testid={`card-testimonial-${testimonial.id}`}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      {testimonial.avatarUrl ? (
                        <img src={testimonial.avatarUrl} alt={testimonial.clientName} className="w-10 h-10 rounded-full object-cover" />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm">
                          {testimonial.clientName.charAt(0)}
                        </div>
                      )}
                      <div>
                        <div className="font-semibold">{testimonial.clientName}</div>
                        <div className="text-xs text-muted-foreground">{testimonial.role && `${testimonial.role} · `}{testimonial.company}</div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={() => handleEdit(testimonial)} variant="ghost" size="sm" data-testid={`button-edit-testimonial-${testimonial.id}`}>
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="sm" data-testid={`button-delete-testimonial-${testimonial.id}`}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete this testimonial?</AlertDialogTitle>
                            <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(testimonial.id)} data-testid={`confirm-delete-testimonial-${testimonial.id}`}>
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>

                  <div className="flex gap-0.5 mb-2">
                    {Array.from({ length: testimonial.rating || 5 }).map((_, i) => (
                      <span key={i} className="text-primary text-sm">★</span>
                    ))}
                  </div>

                  <p className="text-sm mb-3 line-clamp-3 text-muted-foreground">&ldquo;{testimonial.quote}&rdquo;</p>

                  <div className="flex justify-between items-center">
                    <span className={`px-2 py-0.5 rounded-full text-xs ${testimonial.published ? 'bg-green-500/20 text-green-300' : 'bg-zinc-800 text-zinc-400'}`}>
                      {testimonial.published ? 'Published' : 'Draft'}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="p-12 text-center text-muted-foreground">
              No testimonials yet. Add your first client testimonial.
            </CardContent>
          </Card>
        )}
      </div>
    </AdminLayout>
  );
}
