import { useState } from 'react';
import { AdminLayout } from '@/components/admin-layout';
import { useGetBlogPosts, useCreateBlogPost, useUpdateBlogPost, useDeleteBlogPost, getGetBlogPostsQueryKey, getGetRecentBlogPostsQueryKey } from '@workspace/api-client-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Switch } from '@/components/ui/switch';
import { Plus, Trash2, Pencil } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import type { BlogPost } from '@workspace/api-client-react';

export default function AdminBlog() {
  const { data: posts, isLoading } = useGetBlogPosts();
  const createPost = useCreateBlogPost();
  const updatePost = useUpdateBlogPost();
  const deletePost = useDeleteBlogPost();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    published: false
  });

  const handleEdit = (post: BlogPost) => {
    setEditingPost(post);
    setFormData({
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt || '',
      content: post.content,
      published: post.published
    });
    setDialogOpen(true);
  };

  const handleSubmit = () => {
    if (!formData.title || !formData.slug || !formData.content) {
      toast({ title: 'Please fill in required fields', variant: 'destructive' });
      return;
    }

    if (editingPost) {
      updatePost.mutate(
        { id: editingPost.id, data: formData },
        {
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: getGetBlogPostsQueryKey() });
            queryClient.invalidateQueries({ queryKey: getGetRecentBlogPostsQueryKey() });
            setDialogOpen(false);
            setEditingPost(null);
            resetForm();
            toast({ title: 'Post updated successfully' });
          }
        }
      );
    } else {
      createPost.mutate(
        { data: formData },
        {
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: getGetBlogPostsQueryKey() });
            queryClient.invalidateQueries({ queryKey: getGetRecentBlogPostsQueryKey() });
            setDialogOpen(false);
            resetForm();
            toast({ title: 'Post created successfully' });
          }
        }
      );
    }
  };

  const handleDelete = (id: number) => {
    deletePost.mutate(
      { id },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetBlogPostsQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetRecentBlogPostsQueryKey() });
          toast({ title: 'Post deleted successfully' });
        }
      }
    );
  };

  const resetForm = () => {
    setFormData({
      title: '',
      slug: '',
      excerpt: '',
      content: '',
      published: false
    });
    setEditingPost(null);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setEditingPost(null);
    resetForm();
  };

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-1 sm:mb-2">Blog</h1>
            <p className="text-muted-foreground text-sm">Manage blog posts</p>
          </div>
          
          <Dialog open={dialogOpen} onOpenChange={(open) => { if (!open) handleDialogClose(); else setDialogOpen(open); }}>
            <DialogTrigger asChild>
              <Button className="gradient-purple" data-testid="button-create-post">
                <Plus className="w-4 h-4 mr-2" />
                New Post
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingPost ? 'Edit Post' : 'Create Post'}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Post title"
                    data-testid="input-post-title"
                  />
                </div>

                <div>
                  <Label htmlFor="slug">Slug *</Label>
                  <Input
                    id="slug"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    placeholder="post-slug"
                    data-testid="input-post-slug"
                  />
                </div>

                <div>
                  <Label htmlFor="excerpt">Excerpt</Label>
                  <Textarea
                    id="excerpt"
                    value={formData.excerpt}
                    onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                    placeholder="Short description..."
                    data-testid="textarea-post-excerpt"
                  />
                </div>

                <div>
                  <Label htmlFor="content">Content *</Label>
                  <Textarea
                    id="content"
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    placeholder="Full post content..."
                    className="min-h-[300px]"
                    data-testid="textarea-post-content"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <Switch
                    id="published"
                    checked={formData.published}
                    onCheckedChange={(checked) => setFormData({ ...formData, published: checked })}
                    data-testid="switch-post-published"
                  />
                  <Label htmlFor="published">Published</Label>
                </div>

                <Button
                  onClick={handleSubmit}
                  className="w-full gradient-purple"
                  disabled={createPost.isPending || updatePost.isPending}
                  data-testid="button-save-post"
                >
                  {(createPost.isPending || updatePost.isPending) ? 'Saving...' : editingPost ? 'Update Post' : 'Create Post'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-24 bg-muted/20 animate-pulse rounded-xl" />
            ))}
          </div>
        ) : posts && posts.length > 0 ? (
          <div className="space-y-4">
            {posts.map((post) => (
              <Card key={post.id} className="border-glow" data-testid={`card-post-${post.id}`}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold mb-2">{post.title}</h3>
                      {post.excerpt && (
                        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{post.excerpt}</p>
                      )}
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>{post.createdAt ? new Date(post.createdAt).toLocaleDateString() : '—'}</span>
                        {post.published && (
                          <span className="px-2 py-1 rounded-full bg-green-500/20 text-green-300">Published</span>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <Button onClick={() => handleEdit(post)} variant="ghost" size="sm" data-testid={`button-edit-post-${post.id}`}>
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="sm" data-testid={`button-delete-post-${post.id}`}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete this post?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(post.id)} data-testid={`confirm-delete-post-${post.id}`}>
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="p-12 text-center text-muted-foreground">
              No blog posts yet
            </CardContent>
          </Card>
        )}
      </div>
    </AdminLayout>
  );
}
