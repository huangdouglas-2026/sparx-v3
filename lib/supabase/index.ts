export { createClient as createBrowserClient } from './client';
export { createClient as createServerClient } from './server';

// Re-export createClient for backward compatibility
// In server components/routes, use createServerClient from './server' directly
// In client components, use createBrowserClient from './client' directly
export { createClient } from './client';
