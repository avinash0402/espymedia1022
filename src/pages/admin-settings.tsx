import { useEffect, useState } from 'react';
import { AdminLayout } from '@/components/admin-layout';
import { useGetSettings, useUpdateSettings, getGetSettingsQueryKey, type Settings } from '@workspace/api-client-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ImageUpload } from '@/components/image-upload';
import { Save } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';

const emptySettings = {
  siteName: '', siteDescription: '', contactEmail: '', supportEmail: '', phone: '', whatsapp: '',
  address: '', mapsEmbed: '', logoUrl: '', footerLogoUrl: '', faviconUrl: '', footerText: '',
  twitterUrl: '', instagramUrl: '', linkedinUrl: '', facebookUrl: '', behanceUrl: '', dribbbleUrl: '',
  youtubeUrl: '', githubUrl: '', defaultMetaTitle: '', defaultMetaDescription: '', defaultMetaKeywords: '',
  defaultOgImage: '', robotsTxt: '', gtmId: '', chatbotAvatarUrl: '',
};

type FormData = typeof emptySettings;

export default function AdminSettings() {
  const { data: settings, isLoading } = useGetSettings();
  const updateSettings = useUpdateSettings();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [formData, setFormData] = useState(emptySettings);

  useEffect(() => {
    if (settings) setFormData({ ...emptySettings, ...settings });
  }, [settings]);

  const update = (key: keyof FormData, value: string) =>
    setFormData((current) => ({ ...current, [key]: value }));

  const handleSave = () =>
    updateSettings.mutate({ data: formData }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetSettingsQueryKey() });
        toast({ title: 'Settings updated successfully' });
      },
      onError: () => toast({ title: 'Could not save settings', variant: 'destructive' }),
    });

  const field = (key: keyof FormData, label: string, placeholder = '') => (
    <div key={key}>
      <Label htmlFor={key}>{label}</Label>
      <Input
        id={key}
        value={formData[key]}
        onChange={(e) => update(key, e.target.value)}
        placeholder={placeholder}
        className="mt-2"
      />
    </div>
  );

  return (
    <AdminLayout>
      <div className="space-y-6 sm:space-y-8">
        <div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-1 sm:mb-2">Website Settings</h1>
          <p className="text-muted-foreground text-sm">Control contact details, branding, social links, and SEO defaults.</p>
        </div>
        {isLoading ? <div className="h-96 bg-muted/20 animate-pulse rounded-xl" /> : (
          <Card className="border-glow">
            <CardContent className="p-6 space-y-8">

              {/* Company & Contact */}
              <section className="space-y-4">
                <h2 className="text-xl font-semibold">Company & Contact</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {field('siteName', 'Site Name', 'Espy Media')}
                  {field('contactEmail', 'Company Email', 'hello@espymedia.in')}
                  {field('supportEmail', 'Support Email', 'support@espymedia.in')}
                  {field('phone', 'Phone Number', '+91...')}
                  {field('whatsapp', 'WhatsApp Number', '+91...')}
                  {field('address', 'Office Address', 'Hyderabad, India')}
                </div>
                <div>{field('mapsEmbed', 'Google Maps Embed URL', 'https://www.google.com/maps/embed...')}</div>
                <div>
                  <Label htmlFor="siteDescription">Site Description</Label>
                  <Textarea id="siteDescription" value={formData.siteDescription} onChange={(e) => update('siteDescription', e.target.value)} className="mt-2" />
                </div>
                <div>
                  <Label htmlFor="footerText">Footer Text</Label>
                  <Textarea id="footerText" value={formData.footerText} onChange={(e) => update('footerText', e.target.value)} className="mt-2" />
                </div>
              </section>

              {/* Branding Assets */}
              <section className="border-t border-border pt-6 space-y-4">
                <h2 className="text-xl font-semibold">Branding Assets</h2>
                <p className="text-sm text-muted-foreground">Upload images directly — no need to paste URLs.</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label>Header Logo</Label>
                    <ImageUpload
                      value={formData.logoUrl}
                      onChange={(url) => update('logoUrl', url)}
                      label="Shown in the navigation bar"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Footer Logo</Label>
                    <ImageUpload
                      value={formData.footerLogoUrl}
                      onChange={(url) => update('footerLogoUrl', url)}
                      label="Shown in the website footer"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Favicon</Label>
                    <ImageUpload
                      value={formData.faviconUrl}
                      onChange={(url) => update('faviconUrl', url)}
                      label="Browser tab icon (ICO, SVG or PNG)"
                      accept=".ico,.png,.svg,image/x-icon,image/vnd.microsoft.icon,image/png,image/svg+xml"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Chatbot Avatar</Label>
                    <ImageUpload
                      value={formData.chatbotAvatarUrl}
                      onChange={(url) => update('chatbotAvatarUrl', url)}
                      label="Profile photo shown in the chat widget header"
                    />
                  </div>
                </div>
              </section>

              {/* Social Media */}
              <section className="border-t border-border pt-6 space-y-4">
                <h2 className="text-xl font-semibold">Social Media</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {(['twitterUrl', 'instagramUrl', 'linkedinUrl', 'facebookUrl', 'behanceUrl', 'dribbbleUrl', 'youtubeUrl', 'githubUrl'] as const).map((key) =>
                    field(key, key.replace('Url', '').replace(/^./, (c) => c.toUpperCase()), 'https://...')
                  )}
                </div>
              </section>

              {/* Google Tag Manager */}
              <section className="border-t border-border pt-6 space-y-4">
                <h2 className="text-xl font-semibold">Google Tag Manager</h2>
                <p className="text-sm text-muted-foreground">Your GTM container ID is injected automatically into every page. Manage Google Analytics, Meta Pixel, and other tags from GTM without touching code. For full per-page SEO settings, use the <strong>SEO & Analytics</strong> section in the sidebar.</p>
                <div>
                  <Label htmlFor="gtmId">GTM Container ID</Label>
                  <Input id="gtmId" value={formData.gtmId} onChange={(e) => update('gtmId', e.target.value)} placeholder="GTM-XXXXXXX" className="mt-2 font-mono" />
                </div>
              </section>

              {/* SEO Defaults */}
              <section className="border-t border-border pt-6 space-y-4">
                <h2 className="text-xl font-semibold">SEO Defaults & Robots</h2>
                {field('defaultMetaTitle', 'Default Meta Title')}
                <div>
                  <Label htmlFor="defaultMetaDescription">Default Meta Description</Label>
                  <Textarea id="defaultMetaDescription" value={formData.defaultMetaDescription} onChange={(e) => update('defaultMetaDescription', e.target.value)} className="mt-2" />
                </div>
                {field('defaultMetaKeywords', 'Default Meta Keywords', 'design, web development')}
                <div className="space-y-2">
                  <Label>Default Open Graph Image</Label>
                  <ImageUpload
                    value={formData.defaultOgImage}
                    onChange={(url) => update('defaultOgImage', url)}
                    label="Image shown when sharing links on social media (1200x630px recommended)"
                  />
                </div>
                <div>
                  <Label htmlFor="robotsTxt">robots.txt</Label>
                  <Textarea id="robotsTxt" value={formData.robotsTxt} onChange={(e) => update('robotsTxt', e.target.value)} className="mt-2 font-mono text-sm" />
                </div>
              </section>

              <Button onClick={handleSave} className="w-full gradient-purple" disabled={updateSettings.isPending}>
                <Save className="w-4 h-4 mr-2" />{updateSettings.isPending ? 'Saving...' : 'Save Settings'}
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </AdminLayout>
  );
}
