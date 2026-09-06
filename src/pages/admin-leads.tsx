import { useState } from 'react';
import { AdminLayout } from '@/components/admin-layout';
import { useGetLeads, useUpdateLead, useDeleteLead, getGetLeadsQueryKey } from '@workspace/api-client-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Trash2, Save } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import type { Lead } from '@workspace/api-client-react';

export default function AdminLeads() {
  const { data: leads, isLoading } = useGetLeads();
  const updateLead = useUpdateLead();
  const deleteLead = useDeleteLead();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editStatus, setEditStatus] = useState('');
  const [editNotes, setEditNotes] = useState('');

  const handleEdit = (lead: Lead) => {
    setEditingId(lead.id);
    setEditStatus(lead.status);
    setEditNotes(lead.notes || '');
  };

  const handleSave = (id: number) => {
    updateLead.mutate(
      { id, data: { status: editStatus as any, notes: editNotes } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetLeadsQueryKey() });
          setEditingId(null);
          toast({ title: 'Lead updated successfully' });
        },
        onError: () => {
          toast({ title: 'Failed to update lead', variant: 'destructive' });
        }
      }
    );
  };

  const handleDelete = (id: number) => {
    deleteLead.mutate(
      { id },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetLeadsQueryKey() });
          toast({ title: 'Lead deleted successfully' });
        },
        onError: () => {
          toast({ title: 'Failed to delete lead', variant: 'destructive' });
        }
      }
    );
  };

  const statusColors = {
    new: 'bg-blue-500/20 text-blue-300',
    contacted: 'bg-yellow-500/20 text-yellow-300',
    won: 'bg-green-500/20 text-green-300',
    lost: 'bg-red-500/20 text-red-300',
  };

  return (
    <AdminLayout>
      <div className="space-y-6 sm:space-y-8">
        <div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-1 sm:mb-2">Leads</h1>
          <p className="text-muted-foreground text-sm">Manage incoming project inquiries</p>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-48 bg-muted/20 animate-pulse rounded-xl" />
            ))}
          </div>
        ) : leads && leads.length > 0 ? (
          <div className="space-y-4">
            {leads.map((lead) => {
              const isEditing = editingId === lead.id;
              
              return (
                <Card key={lead.id} className="border-glow" data-testid={`card-lead-${lead.id}`}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-bold mb-1">{lead.name}</h3>
                        <div className="text-sm text-muted-foreground space-y-1">
                          <div>{lead.email}</div>
                          {lead.company && <div>{lead.company}</div>}
                          <div className="text-xs">
                            {lead.createdAt ? new Date(lead.createdAt).toLocaleDateString('en-US', {
                              year: 'numeric', 
                              month: 'long', 
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            }) : '—'}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {isEditing ? (
                          <Select value={editStatus} onValueChange={setEditStatus}>
                            <SelectTrigger className="w-32" data-testid={`select-status-${lead.id}`}>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="new">New</SelectItem>
                              <SelectItem value="contacted">Contacted</SelectItem>
                              <SelectItem value="won">Won</SelectItem>
                              <SelectItem value="lost">Lost</SelectItem>
                            </SelectContent>
                          </Select>
                        ) : (
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[lead.status]}`}>
                            {lead.status.charAt(0).toUpperCase() + lead.status.slice(1)}
                          </span>
                        )}
                        
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="sm" data-testid={`button-delete-${lead.id}`}>
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete this lead?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDelete(lead.id)} data-testid={`confirm-delete-${lead.id}`}>
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm">
                      <div>
                        <div className="text-muted-foreground">Project Type</div>
                        <div className="font-medium">{lead.projectType}</div>
                      </div>
                      {lead.budget && (
                        <div>
                          <div className="text-muted-foreground">Budget</div>
                          <div className="font-medium">{lead.budget}</div>
                        </div>
                      )}
                      {lead.timeline && (
                        <div>
                          <div className="text-muted-foreground">Timeline</div>
                          <div className="font-medium">{lead.timeline}</div>
                        </div>
                      )}
                    </div>

                    {lead.details && (
                      <div className="mb-4 p-4 bg-muted/20 rounded-lg">
                        <div className="text-sm text-muted-foreground mb-1">Details</div>
                        <div className="text-sm">{lead.details}</div>
                      </div>
                    )}

                    <div>
                      <div className="text-sm text-muted-foreground mb-2">Notes</div>
                      {isEditing ? (
                        <Textarea
                          value={editNotes}
                          onChange={(e) => setEditNotes(e.target.value)}
                          placeholder="Add internal notes..."
                          className="mb-3"
                          data-testid={`textarea-notes-${lead.id}`}
                        />
                      ) : (
                        <div className="text-sm mb-3 p-3 bg-muted/10 rounded min-h-[60px]">
                          {lead.notes || 'No notes yet'}
                        </div>
                      )}
                      
                      {isEditing ? (
                        <div className="flex gap-2">
                          <Button onClick={() => handleSave(lead.id)} size="sm" disabled={updateLead.isPending} data-testid={`button-save-${lead.id}`}>
                            <Save className="w-4 h-4 mr-2" />
                            {updateLead.isPending ? 'Saving...' : 'Save'}
                          </Button>
                          <Button onClick={() => setEditingId(null)} variant="outline" size="sm" data-testid={`button-cancel-${lead.id}`}>
                            Cancel
                          </Button>
                        </div>
                      ) : (
                        <Button onClick={() => handleEdit(lead)} variant="outline" size="sm" data-testid={`button-edit-${lead.id}`}>
                          Edit
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card>
            <CardContent className="p-12 text-center text-muted-foreground">
              No leads yet
            </CardContent>
          </Card>
        )}
      </div>
    </AdminLayout>
  );
}
