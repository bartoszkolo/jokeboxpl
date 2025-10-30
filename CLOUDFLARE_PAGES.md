# Cloudflare Pages Deployment Guide

This guide explains how to deploy your Jokebox application to Cloudflare Pages.

## Prerequisites

- Cloudflare account
- GitHub repository with your code
- Supabase project credentials

## Configuration Already Done

✅ **Client-side routing**: `_redirects` file created in `public/` directory
✅ **Build script**: `build:pages` script added to package.json
✅ **Environment variables**: Supabase credentials updated to use environment variables

## Deployment Steps

### 1. Connect Your Repository

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Navigate to **Pages** → **Create a project**
3. Connect your GitHub repository containing this code

### 2. Configure Build Settings

In the Cloudflare Pages setup:

- **Build command**: `pnpm run build:pages`
- **Build output directory**: `dist`
- **Root directory**: (leave empty)

### 3. Set Environment Variables

Add these environment variables in your Cloudflare Pages project settings:

```
VITE_SUPABASE_URL=https://pkkjrepnqrrgttkoxcfj.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBra2pyZXBucXJyZ3R0a294Y2ZqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ3Nzk4NDksImV4cCI6MjA3MDM1NTg0OX0.qt1SRUr1ZIhQfYy8bZ9jBTMgdv8oQp24Enr11sqMt2Y
```

### 4. Custom Domain (Optional)

If you want to use your custom domain `jokebox.pl`:

1. Go to your Pages project → **Custom domains**
2. Add `jokebox.pl`
3. Update your DNS records as instructed by Cloudflare

## Local Development

To test locally before deploying:

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Build for production (locally)
pnpm run build:pages

# Preview production build
pnpm preview
```

## Differences from Workers Deployment

| Feature | Cloudflare Workers | Cloudflare Pages |
|---------|------------------|------------------|
| Deployment | `wrangler deploy` | Git-based deployment |
| Static assets | Served from Workers | Optimized CDN delivery |
| Build process | Manual | Automatic on git push |
| Environment | Server-side | Client-side only |
| Configuration | `wrangler.toml` | Cloudflare Dashboard |

## Important Notes

- This is a **client-side only** deployment (no server-side functions)
- All API calls go directly to Supabase from the browser
- The `_redirects` file ensures React Router works correctly
- Environment variables are prefixed with `VITE_` for Vite to expose them to the client

## Troubleshooting

### Build Issues
- Ensure `pnpm` is available in your build environment
- Check that all dependencies are properly installed

### Runtime Issues
- Verify environment variables are correctly set in Cloudflare Pages dashboard
- Check browser console for any Supabase connection errors
- Ensure your Supabase project allows your custom domain as a trusted origin

### Routing Issues
- If routing doesn't work, ensure the `_redirects` file is in the `public/` directory
- Check that all routes fall back to `/index.html` (SPA routing)