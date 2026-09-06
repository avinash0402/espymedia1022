import { useState } from 'react';
import { AdminLayout } from '@/components/admin-layout';
import { useGetServices, useUpdateService, getGetServicesQueryKey } from '@workspace/api-client-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Save } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import type { Service } from '@workspace/api-client-react';

export default function AdminServices() {
  const { data: services, isLoading } = useGetServices();
  const updateService = useUpdateService();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editData, setEditData] = useState({
    name: '',
    headline: '',
    description: ''
  });

  const handleEdit = (service: Service) => {
    setEditingId(service.id);
    setEditData({
      name: service.name,
      headline: service.headline,
      description: service.description
    });
  };

  const handleSave = (id: number) => {
    updateService.mutate(
      { id, data: editData },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetServicesQueryKey() });
          setEditingId(null);
          toast({ title: 'Service updated successfully' });
        }
      }
    );
  };

  return (
    <AdminLayout>
      <div className="space-y-6 sm:space-y-8">
        <div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-1 sm:mb-2">Services</h1>
          <p className="text-muted-foreground text-sm">Manage the four core services displayed on the homepage</p>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-48 bg-muted/20 animate-pulse rounded-xl" />
            ))}
          </div>
        ) : services && services.length > 0 ? (
          <div className="space-y-6">
            {services.map((service) => {
              const isEditing = editingId === service.id;
              
              return (
                <Card key={service.id} className="border-glow" data-testid={`card-service-${service.id}`}>
                  <CardContent className="p-6">
                    {isEditing ? (
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor={`name-${service.id}`}>Name</Label>
                          <Input
                            id={`name-${service.id}`}
                            value={editData.name}
                            onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                            data-testid={`input-service-name-${service.id}`}
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor={`headline-${service.id}`}>Headline</Label>
                          <Input
                            id={`headline-${service.id}`}
                            value={editData.headline}
                            onChange={(e) => setEditData({ ...editData, headline: e.target.value })}
                            data-testid={`input-service-headline-${service.id}`}
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor={`desc-${service.id}`}>Description</Label>
                          <Textarea
                            id={`desc-${service.id}`}
                            value={editData.description}
                            onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                            data-testid={`textarea-service-description-${service.id}`}
                          />
                        </div>
                        
                        <div className="flex gap-2">
                          <Button 
                            onClick={() => handleSave(service.id)} 
                            disabled={updateService.isPending}
                            data-testid={`button-save-service-${service.id}`}
                          >
                            <Save className="w-4 h-4 mr-2" />
                            {updateService.isPending ? 'Saving...' : 'Save'}
                          </Button>
                          <Button onClick={() => setEditingId(null)} variant="outline" data-testid={`button-cancel-service-${service.id}`}>
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
                          <div>
                            <h3 className="text-xl sm:text-2xl font-bold mb-1">{service.name}</h3>
                            <p className="text-base sm:text-lg font-medium text-muted-foreground mb-2">{service.headline}</p>
                            <p className="text-sm text-muted-foreground">{service.description}</p>
                          </div>
                          <Button onClick={() => handleEdit(service)} variant="outline" className="self-start shrink-0" data-testid={`button-edit-service-${service.id}`}>
                            Edit
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card>
            <CardContent className="p-12 text-center text-muted-foreground">
              No services configured
            </CardContent>
          </Card>
        )}
      </div>
    </AdminLayout>
  );
}
