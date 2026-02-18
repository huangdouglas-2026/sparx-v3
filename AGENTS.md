# AGENTS.md

> **⚠️ IMPORTANT: Read this first!**
>
> Before working on this codebase, you MUST read:
> 1. **[AGENT_COMPASS.md](./AGENT_COMPASS.md)** - The absolute truth for all agents
> 2. **[AGENT_CHECKLIST.md](./AGENT_CHECKLIST.md)** - Mandatory checklist before any action
>
> **These documents contain the non-negotiable rules for this project.**

---

This file contains technical instructions for AI agents working on the Spark (星火) codebase.

## Project Overview

**Spark is an AI-driven networking capital management system**, built with Next.js 16, React 19, TypeScript, and Supabase.

**Core Philosophy:**
- Spark = 人脈資本的 AI 戦略顧問
- NOT a contact management tool
- NOT a CRM
- NOT a LinkedIn clone

**For full understanding, read:**
- [PRODUCT_VISION.md](./PRODUCT_VISION.md) - What Spark is and why it exists
- [BRAND_GUIDELINES.md](./BRAND_GUIDELINES.md) - Visual and verbal identity
- [ARCHITECTURE.md](./ARCHITECTURE.md) - Technical architecture
- [DEVELOPMENT_ROADMAP.md](./DEVELOPMENT_ROADMAP.md) - Development phases and priorities

## Development Commands

```bash
npm install              # Install dependencies
npm run dev             # Start development server (Next.js)
npm run build           # Build for production
npm run start           # Start production server
npm run lint            # Run ESLint
```

**Note**: No testing framework is currently configured. Consider adding Jest + React Testing Library for test coverage.

## Architecture

### Service Layer Pattern
Business logic is abstracted to `/services/` directory:
- `contactService.ts` - Contact CRUD operations
- `profileService.ts` - User profile management  
- `geminiService.ts` - AI integration (OCR, summaries)
- `articleService.ts` - Article management

### Next.js App Router Structure
- `/app/` - Next.js App Router with route groups
- `/app/(main)/` - Main routes with shared layout
- `/components/` - React UI components
- `/lib/` - Utilities and configuration
- `/types.ts` - Centralized TypeScript definitions

## Code Style Guidelines

### TypeScript
- **Strict mode enabled** - All code must pass strict TypeScript checks
- **Centralized types** - All interfaces defined in `/types.ts`
- **Explicit typing** - Avoid `any` type, use proper interfaces
- **Async/await** - Use async/await for all async operations

```typescript
// Service pattern example
export const contactService = {
  async getContacts(): Promise<DashboardContact[]> {
    // Implementation
  }
}
```

### Component Conventions
- **PascalCase** for component names: `LoginForm`, `TabBar`
- **Function components** with named exports
- **'use client'** directive for client components
- **React hooks** for state management

```typescript
'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export function LoginForm() {
  const [loading, setLoading] = useState(false)
  // Component logic
}
```

### Import Organization
1. React/Next.js imports first
2. Third-party libraries
3. Local imports with `@/` alias
4. Relative imports

```typescript
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { DashboardContact } from '@/types'
```

### File Naming
- **PascalCase** for components: `LoginForm.tsx`
- **camelCase** for utilities: `contactService.ts`
- **kebab-case** for routes when needed

### Error Handling
- **Service layer**: Log errors and re-throw for component handling
- **Component layer**: Use try-catch with user-friendly error messages

```typescript
// Service layer
if (error) {
  console.error('Error fetching contacts:', error);
  throw error;
}

// Component layer
try {
  // Operation
} catch (error: any) {
  console.error('Login error:', error)
  alert(`登入失敗: ${error.message}`)
} finally {
  setLoading(false)
}
```

## Design System

### Styling
- **Tailwind CSS 4** for styling
- **Mobile-first design** - Max width 480px
- **Dark theme** with orange accent (#ee8c2b)
- **Custom CSS variables** defined in `globals.css`

```css
:root {
  --primary: #ee8c2b;
  --background-dark: #221910;
  --surface-dark: #332619;
}
```

### Component Patterns
- **Responsive design** using Tailwind classes
- **Custom utilities** like `.no-scrollbar`
- **Consistent spacing** and color usage

## Environment Variables

Required in `.env.local`:
- `NEXT_PUBLIC_GEMINI_API_KEY` - Google Gemini API key
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key

## Database & Backend

### Supabase Integration
- **PostgreSQL** with Row Level Security (RLS)
- **Authentication** via Supabase Auth (Google OAuth)
- **Real-time subscriptions** for data updates
- **Client creation** in `/lib/supabase/`

```typescript
import { createClient } from '@/lib/supabase/client'
const supabase = createClient()
```

## AI Integration

### Google Gemini AI 2.0 Flash
- **OCR functionality** for business card scanning
- **Content summarization** for article sharing
- **Environment variable** usage for API keys

## Testing

**Currently no testing framework configured**. When adding tests:
- Consider Jest + React Testing Library
- Test service layer functions separately
- Test component rendering and interactions
- Mock Supabase and Gemini API calls

## Common Tasks

### Adding New Components
1. Create in `/components/` directory
2. Use PascalCase naming
3. Add 'use client' directive if needed
4. Import with `@/` alias
5. Follow existing component patterns

### Service Layer Updates
1. Update corresponding service in `/services/`
2. Maintain async/await pattern
3. Handle errors appropriately
4. Update TypeScript interfaces in `/types.ts`

### Database Changes
1. Update Supabase schema
2. Update TypeScript interfaces in `/types.ts`
3. Update service layer functions
4. Test with real data

## Code Quality

- **ESLint** configured with Next.js rules
- **TypeScript strict mode** enforced
- **No console.log** in production code
- **Proper error handling** required
- **Consistent formatting** expected

## Security Considerations

- **Environment variables** for sensitive data
- **Supabase RLS** for data access control
- **Input validation** on forms
- **API key protection** through server-side calls when possible

## Performance

- **Next.js optimization** for production builds
- **Image optimization** through Next.js Image component
- **Code splitting** automatic with Next.js
- **Lazy loading** for heavy components when needed

This file should be updated as the codebase evolves. Follow these patterns to maintain consistency and code quality.