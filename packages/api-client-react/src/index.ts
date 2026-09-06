import {
  useQuery,
  useMutation,
  useQueryClient,
  type UseQueryOptions,
} from '@tanstack/react-query';

// ---------------------------------------------------------------------------
// Shared fetch helper
// ---------------------------------------------------------------------------

const BASE = '/api';

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    credentials: 'include',
    ...options,
    headers: options?.body instanceof FormData
      ? { ...(options?.headers ?? {}) }
      : { 'Content-Type': 'application/json', ...(options?.headers ?? {}) },
  });
  if (!res.ok) {
    const msg = await res.text().catch(() => res.statusText);
    throw new Error(msg || `${res.status} ${res.statusText}`);
  }
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

// ---------------------------------------------------------------------------
// Types  (match exactly what admin pages use)
// ---------------------------------------------------------------------------

export interface Project {
  id: number;
  title: string;
  slug: string;
  category: string;
  categoryId?: number;
  clientName: string;
  challenge: string;
  approach: string;
  result: string;
  metrics: string;
  imageUrl?: string;
  galleryUrls?: string[];
  techStack?: string[];
  liveUrl?: string;
  altText?: string;
  coverImage?: string;
  coverVideo?: string;
  published: boolean;
  featured: boolean;
  sortOrder?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProjectCategory {
  id: number;
  name: string;
  slug: string;
}

export interface Testimonial {
  id: number;
  clientName: string;
  company: string;
  role?: string;
  quote: string;
  rating: number;
  avatarUrl?: string;
  published: boolean;
  sortOrder?: number;
  createdAt?: string;
}

export interface BlogPost {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImageUrl?: string;
  author?: string;
  published: boolean;
  publishedAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Lead {
  id: number;
  name: string;
  email: string;
  company?: string;
  projectType?: string;
  budget?: string;
  timeline?: string;
  details?: string;
  status: 'new' | 'contacted' | 'won' | 'lost';
  notes?: string;
  createdAt?: string;
}

export interface Service {
  id: number;
  name: string;
  headline: string;
  description: string;
  icon?: string;
  sortOrder?: number;
  published?: boolean;
}

export interface Settings {
  id?: number;
  siteName?: string;
  siteDescription?: string;
  contactEmail?: string;
  supportEmail?: string;
  phone?: string;
  whatsapp?: string;
  address?: string;
  mapsEmbed?: string;
  logoUrl?: string;
  footerLogoUrl?: string;
  faviconUrl?: string;
  footerText?: string;
  twitterUrl?: string;
  instagramUrl?: string;
  linkedinUrl?: string;
  facebookUrl?: string;
  behanceUrl?: string;
  dribbbleUrl?: string;
  youtubeUrl?: string;
  githubUrl?: string;
  defaultMetaTitle?: string;
  defaultMetaDescription?: string;
  defaultMetaKeywords?: string;
  defaultOgImage?: string;
  robotsTxt?: string;
  heroBadge?: string;
  heroHeadline1?: string;
  heroHeadline2?: string;
  heroSubheadline?: string;
  homepageStats?: HomepageStat[];
  gtmId?: string;
  chatbotAvatarUrl?: string;
}

export interface HomepageStat {
  end: number;
  suffix: string;
  label: string;
}

export interface Platform { id: number; name: string; slug: string; logoUrl: string; linkUrl: string; published: boolean; sortOrder: number; }
export interface PricingPlan { id: number; name: string; price: string; period: string; description: string; features: string[]; ctaText: string; highlighted: boolean; published: boolean; sortOrder: number; }
export interface GraphicCategory { id: number; name: string; slug: string; }
export interface GraphicWork { id: number; title: string; slug: string; categoryId?: number; imageUrl: string; galleryUrls: string[]; description: string; altText: string; published: boolean; featured: boolean; sortOrder: number; }
export interface LegalPage { slug: string; title: string; content: string; updatedAt?: string; }
export interface SeoPage { id: number; path: string; metaTitle: string; metaDescription: string; metaKeywords: string; ogTitle: string; ogDescription: string; ogImage: string; twitterTitle: string; twitterDescription: string; canonicalUrl: string; structuredData: Record<string, unknown>; noindex: boolean; }

export interface DashboardStats {
  newLeadsThisWeek: number;
  totalLeads: number;
  wonLeads: number;
  totalProjects: number;
  publishedPosts: number;
  testimonialCount: number;
}

// ---------------------------------------------------------------------------
// Query key factories
// ---------------------------------------------------------------------------

export const getGetProjectsQueryKey = () => ['projects'] as const;
export const getGetProjectCategoriesQueryKey = () => ['project-categories'] as const;
export const getGetFeaturedProjectsQueryKey = () => ['projects', 'featured'] as const;
export const getGetTestimonialsQueryKey = () => ['testimonials'] as const;
export const getGetBlogPostsQueryKey = () => ['blog-posts'] as const;
export const getGetRecentBlogPostsQueryKey = () => ['blog-posts', 'recent'] as const;
export const getGetLeadsQueryKey = () => ['leads'] as const;
export const getGetServicesQueryKey = () => ['services'] as const;
export const getGetSettingsQueryKey = () => ['settings'] as const;
export const getGetDashboardStatsQueryKey = () => ['dashboard-stats'] as const;
export const getGetPlatformsQueryKey = () => ['cms', 'platforms'] as const;
export const getGetPricingQueryKey = () => ['cms', 'pricing'] as const;
export const getGetGraphicWorksQueryKey = () => ['cms', 'graphic-works'] as const;
export const getGetGraphicCategoriesQueryKey = () => ['cms', 'graphic-categories'] as const;
export const getGetLegalPagesQueryKey = () => ['cms', 'legal'] as const;
export const getGetSeoPagesQueryKey = () => ['cms', 'seo'] as const;

export function useGetPlatforms() { return useQuery<Platform[]>({ queryKey: getGetPlatformsQueryKey(), queryFn: () => apiFetch('/cms/platforms') }); }
export function useCreatePlatform() { const qc = useQueryClient(); return useMutation({ mutationFn: ({ data }: { data: Partial<Platform> }) => apiFetch<Platform>('/cms/platforms', { method: 'POST', body: JSON.stringify(data) }), onSuccess: () => qc.invalidateQueries({ queryKey: getGetPlatformsQueryKey() }) }); }
export function useUpdatePlatform() { const qc = useQueryClient(); return useMutation({ mutationFn: ({ id, data }: { id: number; data: Partial<Platform> }) => apiFetch<Platform>(`/cms/platforms/${id}`, { method: 'PATCH', body: JSON.stringify(data) }), onSuccess: () => qc.invalidateQueries({ queryKey: getGetPlatformsQueryKey() }) }); }
export function useDeletePlatform() { const qc = useQueryClient(); return useMutation({ mutationFn: ({ id }: { id: number }) => apiFetch(`/cms/platforms/${id}`, { method: 'DELETE' }), onSuccess: () => qc.invalidateQueries({ queryKey: getGetPlatformsQueryKey() }) }); }
export function useGetPricingPlans() { return useQuery<PricingPlan[]>({ queryKey: getGetPricingQueryKey(), queryFn: () => apiFetch('/cms/pricing') }); }
export function useCreatePricingPlan() { const qc = useQueryClient(); return useMutation({ mutationFn: ({ data }: { data: Partial<PricingPlan> }) => apiFetch<PricingPlan>('/cms/pricing', { method: 'POST', body: JSON.stringify(data) }), onSuccess: () => qc.invalidateQueries({ queryKey: getGetPricingQueryKey() }) }); }
export function useUpdatePricingPlan() { const qc = useQueryClient(); return useMutation({ mutationFn: ({ id, data }: { id: number; data: Partial<PricingPlan> }) => apiFetch<PricingPlan>(`/cms/pricing/${id}`, { method: 'PATCH', body: JSON.stringify(data) }), onSuccess: () => qc.invalidateQueries({ queryKey: getGetPricingQueryKey() }) }); }
export function useDeletePricingPlan() { const qc = useQueryClient(); return useMutation({ mutationFn: ({ id }: { id: number }) => apiFetch(`/cms/pricing/${id}`, { method: 'DELETE' }), onSuccess: () => qc.invalidateQueries({ queryKey: getGetPricingQueryKey() }) }); }
export function useGetGraphicWorks() { return useQuery<GraphicWork[]>({ queryKey: getGetGraphicWorksQueryKey(), queryFn: () => apiFetch('/cms/graphic-works') }); }
export function useGetGraphicCategories() { return useQuery<GraphicCategory[]>({ queryKey: getGetGraphicCategoriesQueryKey(), queryFn: () => apiFetch('/cms/graphic-categories') }); }
export function useCreateGraphicWork() { const qc = useQueryClient(); return useMutation({ mutationFn: ({ data }: { data: Partial<GraphicWork> }) => apiFetch<GraphicWork>('/cms/graphic-works', { method: 'POST', body: JSON.stringify(data) }), onSuccess: () => qc.invalidateQueries({ queryKey: getGetGraphicWorksQueryKey() }) }); }
export function useUpdateGraphicWork() { const qc = useQueryClient(); return useMutation({ mutationFn: ({ id, data }: { id: number; data: Partial<GraphicWork> }) => apiFetch<GraphicWork>(`/cms/graphic-works/${id}`, { method: 'PATCH', body: JSON.stringify(data) }), onSuccess: () => qc.invalidateQueries({ queryKey: getGetGraphicWorksQueryKey() }) }); }
export function useDeleteGraphicWork() { const qc = useQueryClient(); return useMutation({ mutationFn: ({ id }: { id: number }) => apiFetch(`/cms/graphic-works/${id}`, { method: 'DELETE' }), onSuccess: () => qc.invalidateQueries({ queryKey: getGetGraphicWorksQueryKey() }) }); }
export function useCreateGraphicCategory() { const qc = useQueryClient(); return useMutation({ mutationFn: ({ data }: { data: Partial<GraphicCategory> }) => apiFetch<GraphicCategory>('/cms/graphic-categories', { method: 'POST', body: JSON.stringify(data) }), onSuccess: () => qc.invalidateQueries({ queryKey: getGetGraphicCategoriesQueryKey() }) }); }
export function useUpdateGraphicCategory() { const qc = useQueryClient(); return useMutation({ mutationFn: ({ id, data }: { id: number; data: Partial<GraphicCategory> }) => apiFetch<GraphicCategory>(`/cms/graphic-categories/${id}`, { method: 'PATCH', body: JSON.stringify(data) }), onSuccess: () => qc.invalidateQueries({ queryKey: getGetGraphicCategoriesQueryKey() }) }); }
export function useDeleteGraphicCategory() { const qc = useQueryClient(); return useMutation({ mutationFn: ({ id }: { id: number }) => apiFetch(`/cms/graphic-categories/${id}`, { method: 'DELETE' }), onSuccess: () => qc.invalidateQueries({ queryKey: getGetGraphicCategoriesQueryKey() }) }); }
export function useGetLegalPages() { return useQuery<LegalPage[]>({ queryKey: getGetLegalPagesQueryKey(), queryFn: () => apiFetch('/cms/legal') }); }
export function useGetLegalPage(slug: string) { return useQuery<LegalPage>({ queryKey: ['cms', 'legal', slug], queryFn: async () => { const pages = await apiFetch<LegalPage[]>('/cms/legal'); const page = pages.find((item) => item.slug === slug); if (!page) throw new Error('Legal page not found'); return page; } }); }
export function useUpdateLegalPage() { const qc = useQueryClient(); return useMutation({ mutationFn: ({ slug, data }: { slug: string; data: Partial<LegalPage> }) => apiFetch<LegalPage>(`/cms/legal/${slug}`, { method: 'PATCH', body: JSON.stringify(data) }), onSuccess: () => qc.invalidateQueries({ queryKey: getGetLegalPagesQueryKey() }) }); }
export function useGetSeoPages() { return useQuery<SeoPage[]>({ queryKey: getGetSeoPagesQueryKey(), queryFn: () => apiFetch('/cms/seo') }); }
export function useCreateSeoPage() { const qc = useQueryClient(); return useMutation({ mutationFn: ({ data }: { data: Partial<SeoPage> }) => apiFetch<SeoPage>('/cms/seo', { method: 'POST', body: JSON.stringify(data) }), onSuccess: () => qc.invalidateQueries({ queryKey: getGetSeoPagesQueryKey() }) }); }
export function useUpdateSeoPage() { const qc = useQueryClient(); return useMutation({ mutationFn: ({ id, data }: { id: number; data: Partial<SeoPage> }) => apiFetch<SeoPage>(`/cms/seo/${id}`, { method: 'PATCH', body: JSON.stringify(data) }), onSuccess: () => qc.invalidateQueries({ queryKey: getGetSeoPagesQueryKey() }) }); }
export function useDeleteSeoPage() { const qc = useQueryClient(); return useMutation({ mutationFn: ({ id }: { id: number }) => apiFetch(`/cms/seo/${id}`, { method: 'DELETE' }), onSuccess: () => qc.invalidateQueries({ queryKey: getGetSeoPagesQueryKey() }) }); }

// ---------------------------------------------------------------------------
// Projects
// ---------------------------------------------------------------------------

export function useGetProjects(
  params?: Record<string, unknown>,
  options?: Omit<UseQueryOptions<Project[]>, 'queryKey' | 'queryFn'>,
) {
  return useQuery<Project[]>({
    queryKey: [...getGetProjectsQueryKey(), params],
    queryFn: () => apiFetch<Project[]>('/projects'),
    ...options,
  });
}

export function useGetProjectCategories() {
  return useQuery<ProjectCategory[]>({
    queryKey: getGetProjectCategoriesQueryKey(),
    queryFn: () => apiFetch('/projects/categories'),
  });
}

export function useCreateProjectCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ data }: { data: Partial<ProjectCategory> }) =>
      apiFetch<ProjectCategory>('/projects/categories', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: getGetProjectCategoriesQueryKey() }),
  });
}

export function useGetFeaturedProjects(
  options?: Omit<UseQueryOptions<Project[]>, 'queryKey' | 'queryFn'>,
) {
  return useQuery<Project[]>({
    queryKey: getGetFeaturedProjectsQueryKey(),
    queryFn: () => apiFetch<Project[]>('/projects/featured'),
    ...options,
  });
}

export function useGetProject(
  id: number | string,
  options?: Omit<UseQueryOptions<Project>, 'queryKey' | 'queryFn'>,
) {
  return useQuery<Project>({
    queryKey: ['projects', id],
    queryFn: () => apiFetch<Project>(`/projects/${id}`),
    enabled: !!id,
    ...options,
  });
}

export function useCreateProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ data }: { data: Partial<Project> }) =>
      apiFetch<Project>('/projects', { method: 'POST', body: JSON.stringify(data) }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: getGetProjectsQueryKey() });
      qc.invalidateQueries({ queryKey: getGetFeaturedProjectsQueryKey() });
    },
  });
}

export function useUpdateProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Project> }) =>
      apiFetch<Project>(`/projects/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: getGetProjectsQueryKey() });
      qc.invalidateQueries({ queryKey: getGetFeaturedProjectsQueryKey() });
    },
  });
}

export function useDeleteProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id }: { id: number }) =>
      apiFetch<void>(`/projects/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: getGetProjectsQueryKey() });
      qc.invalidateQueries({ queryKey: getGetFeaturedProjectsQueryKey() });
    },
  });
}

// ---------------------------------------------------------------------------
// Testimonials
// ---------------------------------------------------------------------------

export function useGetTestimonials(
  params?: { published?: boolean },
  options?: Omit<UseQueryOptions<Testimonial[]>, 'queryKey' | 'queryFn'>,
) {
  return useQuery<Testimonial[]>({
    queryKey: [...getGetTestimonialsQueryKey(), params],
    queryFn: () =>
      apiFetch<Testimonial[]>(
        params?.published !== undefined
          ? `/testimonials?published=${params.published}`
          : '/testimonials',
      ),
    ...options,
  });
}

export function useCreateTestimonial() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ data }: { data: Partial<Testimonial> }) =>
      apiFetch<Testimonial>('/testimonials', { method: 'POST', body: JSON.stringify(data) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: getGetTestimonialsQueryKey() }),
  });
}

export function useUpdateTestimonial() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Testimonial> }) =>
      apiFetch<Testimonial>(`/testimonials/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: getGetTestimonialsQueryKey() }),
  });
}

export function useDeleteTestimonial() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id }: { id: number }) =>
      apiFetch<void>(`/testimonials/${id}`, { method: 'DELETE' }),
    onSuccess: () => qc.invalidateQueries({ queryKey: getGetTestimonialsQueryKey() }),
  });
}

// ---------------------------------------------------------------------------
// Blog Posts
// ---------------------------------------------------------------------------

export function useGetBlogPosts(
  params?: Record<string, unknown>,
  options?: Omit<UseQueryOptions<BlogPost[]>, 'queryKey' | 'queryFn'>,
) {
  return useQuery<BlogPost[]>({
    queryKey: [...getGetBlogPostsQueryKey(), params],
    queryFn: () => apiFetch<BlogPost[]>('/blog-posts'),
    ...options,
  });
}

export function useGetRecentBlogPosts(
  options?: Omit<UseQueryOptions<BlogPost[]>, 'queryKey' | 'queryFn'>,
) {
  return useQuery<BlogPost[]>({
    queryKey: getGetRecentBlogPostsQueryKey(),
    queryFn: () => apiFetch<BlogPost[]>('/blog-posts?recent=true&limit=3'),
    ...options,
  });
}

export function useGetBlogPost(
  id: number | string,
  options?: Omit<UseQueryOptions<BlogPost>, 'queryKey' | 'queryFn'>,
) {
  return useQuery<BlogPost>({
    queryKey: ['blog-posts', id],
    queryFn: () => apiFetch<BlogPost>(`/blog-posts/${id}`),
    enabled: !!id,
    ...options,
  });
}

export function useCreateBlogPost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ data }: { data: Partial<BlogPost> }) =>
      apiFetch<BlogPost>('/blog-posts', { method: 'POST', body: JSON.stringify(data) }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: getGetBlogPostsQueryKey() });
      qc.invalidateQueries({ queryKey: getGetRecentBlogPostsQueryKey() });
    },
  });
}

export function useUpdateBlogPost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<BlogPost> }) =>
      apiFetch<BlogPost>(`/blog-posts/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: getGetBlogPostsQueryKey() });
      qc.invalidateQueries({ queryKey: getGetRecentBlogPostsQueryKey() });
    },
  });
}

export function useDeleteBlogPost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id }: { id: number }) =>
      apiFetch<void>(`/blog-posts/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: getGetBlogPostsQueryKey() });
      qc.invalidateQueries({ queryKey: getGetRecentBlogPostsQueryKey() });
    },
  });
}

// ---------------------------------------------------------------------------
// Leads
// ---------------------------------------------------------------------------

export function useGetLeads(
  params?: Record<string, unknown>,
  options?: Omit<UseQueryOptions<Lead[]>, 'queryKey' | 'queryFn'>,
) {
  return useQuery<Lead[]>({
    queryKey: [...getGetLeadsQueryKey(), params],
    queryFn: () => apiFetch<Lead[]>('/leads'),
    ...options,
  });
}

export function useCreateLead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ data }: { data: Partial<Lead> }) =>
      apiFetch<Lead>('/leads', { method: 'POST', body: JSON.stringify(data) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: getGetLeadsQueryKey() }),
  });
}

export function useUpdateLead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Lead> }) =>
      apiFetch<Lead>(`/leads/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: getGetLeadsQueryKey() }),
  });
}

export function useDeleteLead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id }: { id: number }) =>
      apiFetch<void>(`/leads/${id}`, { method: 'DELETE' }),
    onSuccess: () => qc.invalidateQueries({ queryKey: getGetLeadsQueryKey() }),
  });
}

// ---------------------------------------------------------------------------
// Services
// ---------------------------------------------------------------------------

export function useGetServices(
  params?: Record<string, unknown>,
  options?: Omit<UseQueryOptions<Service[]>, 'queryKey' | 'queryFn'>,
) {
  return useQuery<Service[]>({
    queryKey: [...getGetServicesQueryKey(), params],
    queryFn: () => apiFetch<Service[]>('/services'),
    ...options,
  });
}

export function useUpdateService() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Service> }) =>
      apiFetch<Service>(`/services/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: getGetServicesQueryKey() }),
  });
}

// ---------------------------------------------------------------------------
// Settings
// ---------------------------------------------------------------------------

export function useGetSettings(
  options?: Omit<UseQueryOptions<Settings>, 'queryKey' | 'queryFn'>,
) {
  return useQuery<Settings>({
    queryKey: getGetSettingsQueryKey(),
    queryFn: () => apiFetch<Settings>('/settings'),
    ...options,
  });
}

export function useUpdateSettings() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ data }: { data: Partial<Settings> }) =>
      apiFetch<Settings>('/settings', { method: 'PATCH', body: JSON.stringify(data) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: getGetSettingsQueryKey() }),
  });
}

// ---------------------------------------------------------------------------
// Dashboard
// ---------------------------------------------------------------------------

export function useGetDashboardStats(
  options?: Omit<UseQueryOptions<DashboardStats>, 'queryKey' | 'queryFn'>,
) {
  return useQuery<DashboardStats>({
    queryKey: getGetDashboardStatsQueryKey(),
    queryFn: () => apiFetch<DashboardStats>('/dashboard/stats'),
    ...options,
  });
}

// ---------------------------------------------------------------------------
// Auth
// ---------------------------------------------------------------------------

export interface AdminLoginInput {
  email: string;
  password: string;
}

export type AdminSetupInput = AdminLoginInput;

export function useAdminSetup() {
  return useMutation({
    mutationFn: ({ data }: { data: AdminSetupInput }) =>
      apiFetch<{ user: { id: number; email: string } }>('/auth/setup', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
  });
}

export function useAdminLogin() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ data }: { data: AdminLoginInput }) =>
      apiFetch<{ user: { id: number; username: string } }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['auth-me'] }),
  });
}

export function useGetAuthMe(
  options?: Omit<UseQueryOptions<{ id: number; username: string } | null>, 'queryKey' | 'queryFn'>,
) {
  return useQuery<{ id: number; username: string } | null>({
    queryKey: ['auth-me'],
    queryFn: () =>
      apiFetch<{ id: number; username: string }>('/auth/me').catch(() => null),
    retry: false,
    ...options,
  });
}

export function useAdminLogout() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => apiFetch<void>('/auth/logout', { method: 'POST' }),
    onSuccess: () => qc.clear(),
  });
}

// ---------------------------------------------------------------------------
// File Upload
// ---------------------------------------------------------------------------

export async function uploadFile(file: File): Promise<{ url: string }> {
  const form = new FormData();
  form.append('file', file);
  const res = await fetch('/api/upload', { method: 'POST', body: form, credentials: 'include' });
  if (!res.ok) throw new Error('Upload failed');
  return res.json();
}
