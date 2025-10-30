# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Jokebox** is a Polish joke-sharing web application built with React, TypeScript, and Vite, deployed as a Cloudflare Workers application using Supabase as the backend. The app features user authentication, joke voting, categories, favorites, and an admin panel for content moderation.

## Development Commands

### Package Management
- `pnpm install --prefer-offline` - Install dependencies (used by all scripts)
- `pnpm clean` - Clean node_modules, .pnpm-store and reset package cache

### Development
- `pnpm dev` - Start development server (Vite on port 5173)
- `pnpm preview` - Preview production build locally

### Building
- `pnpm build` - Standard build to `./dist` (cleans .vite-temp first)
- `pnpm build:prod` - Production build with full TypeScript checking (sets BUILD_MODE=prod)

### Code Quality
- `pnpm lint` - Run ESLint on the codebase

### Deployment
- `wrangler deploy` - Deploy to Cloudflare Workers (configured for jokebox.pl domain)

## Architecture Overview

### Tech Stack
- **Frontend**: React 18.3.1 + TypeScript + Vite
- **UI Framework**: Radix UI components + Tailwind CSS with custom design system
- **State Management**: React Context API (AuthContext) + custom hooks
- **Backend**: Supabase (PostgreSQL) with Auth and real-time subscriptions
- **Deployment**: Cloudflare Workers via Wrangler
- **Package Manager**: pnpm

### Directory Structure
```
src/
├── components/          # Reusable UI components (Navbar, Footer, JokeCard, etc.)
├── pages/              # Route components
│   └── admin/          # Admin panel sub-pages
├── contexts/           # React contexts (AuthContext)
├── lib/                # Utilities (Supabase client)
└── types/              # TypeScript definitions (database types)
```

### Database Schema
- **profiles**: Users with admin status and authentication
- **jokes**: Joke content with workflow states (pending → published/rejected)
- **categories**: Joke categorization with SEO metadata
- **votes**: User voting history (upvote/downvote)
- **favorites**: User bookmarked jokes

### Authentication System
- Google OAuth + email/password via Supabase Auth
- Role-based access control (admin flag in profiles table)
- Protected routes using `AdminRoute` component
- Authentication state managed in `AuthContext`

### Joke Workflow
1. Users submit jokes (status: 'pending')
2. Admins review and approve/reject in admin panel
3. Approved jokes appear in main feed with voting system
4. Score calculated as upvotes - downvotes

### Admin Panel
- Located at `/admin` route with admin-only access
- Joke moderation (approve/reject pending jokes)
- User and category management
- Uses dedicated admin layout and routing components

## Key Technical Details

### Type Safety
- Supabase generates TypeScript types in `src/types/database.ts`
- Extended types like `JokeWithAuthor` include relations
- Path aliases configured: `@/*` maps to `src/*`

### UI/UX Patterns
- Component composition using Radix UI primitives
- Dark mode support via CSS classes
- Polish language interface throughout
- Responsive design with mobile-first approach
- Custom vibrant color scheme (sunset orange primary, electric teal secondary)

### State Management Patterns
- Global authentication state via React Context
- Local component state with React hooks
- Database operations through Supabase client
- Real-time updates via Supabase subscriptions

### Search Functionality
- Full-text search implemented with Polish language support
- Search results page with filtering capabilities
- Database indexing on joke content for performance

## Development Workflow

1. **Local Development**: Use `pnpm dev` to start Vite dev server
2. **Type Checking**: Production builds include full TypeScript compilation
3. **Linting**: ESLint configured with React and TypeScript rules
4. **Building**: Standard build goes to `./dist` directory for Cloudflare deployment
5. **Deployment**: Use Wrangler CLI to deploy to Cloudflare Workers

## Configuration Files

- **wrangler.toml**: Cloudflare deployment config (custom domain jokebox.pl)
- **vite.config.ts**: Vite build configuration with React plugin
- **tailwind.config.js**: Custom design system and color palette
- **tsconfig.json**: TypeScript configuration with path aliases
- **supabase/**: Database migrations and edge functions