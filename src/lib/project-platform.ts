export function getProjectPlatformBadge(techStack: string[] = []): 'Shopify' | 'Custom Development' {
  return techStack.some((technology) => technology.trim().toLowerCase() === 'shopify')
    ? 'Shopify'
    : 'Custom Development';
}
