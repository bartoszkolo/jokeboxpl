# Cloudflare Turnstile Integration Guide

This guide explains how to set up Cloudflare Turnstile to replace the MathCaptcha system for better UX and security.

## Overview

Cloudflare Turnstile is a user-friendly, privacy-preserving alternative to traditional CAPTCHAs. It provides invisible verification that's less intrusive for users while being more effective against bots.

## Benefits over MathCaptcha

- **Better UX**: No math problems to solve - verification is invisible
- **More Secure**: Advanced bot detection that's harder to bypass
- **Privacy-Preserving**: No tracking or data collection
- **Seamless Integration**: Works automatically in the background
- **Mobile-Friendly**: Better experience on mobile devices

## Setup Instructions

### 1. Get Turnstile Keys

1. Log in to your [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Navigate to **Turnstile** in the left sidebar
3. Click **"Add site"** and configure:
   - **Site name**: Jokebox
   - **Domains**: jokebox.pl (and any staging domains)
   - **Widget mode**: Managed (recommended)
   - **Pre-clearance**: Off (for general use)

4. After creation, you'll get:
   - **Site Key** (public): Starts with `0x4AAAA...`
   - **Secret Key** (private): Keep this secure

### 2. Environment Configuration

Create `.env.local` file in your project root:

```env
# Cloudflare Turnstile Configuration
VITE_TURNSTILE_SITE_KEY=0x4AAAAAAABkMYinukE8nzjk
```

### 3. Server-Side Configuration

Set the secret key in your production environment:

```bash
# For Cloudflare Workers deployment
wrangler secret put TURNSTILE_SECRET_KEY

# Enter your secret key when prompted
```

### 4. Deployment

The application is already configured to use Turnstile:

- **Frontend**: `TurnstileCaptcha` component in `src/components/TurnstileCaptcha.tsx`
- **Backend**: Verification endpoint in `functions/verify-turnstile.ts`
- **Integration**: Already implemented in `AddJokePage.tsx`

### 5. Testing

1. Build the application: `pnpm build`
2. Deploy to staging environment first
3. Test the joke submission flow
4. Verify Turnstile widget appears and functions correctly

## Configuration Options

### Widget Appearance

The `TurnstileCaptcha` component supports these options:

```typescript
options={{
  theme: 'light' | 'dark' | 'auto',    // Widget theme
  size: 'normal' | 'compact',          // Widget size
  retry: 'auto' | 'never',             // Auto-retry on failure
  'refresh-expired': 'auto' | 'manual' // Refresh expired tokens
}}
```

### Security Considerations

- **Site Key**: Public, can be exposed in frontend code
- **Secret Key**: Never expose in frontend code - use environment variables
- **Domain Verification**: Turnstile only works on configured domains
- **Token Expiration**: Tokens expire after 5 minutes by default

## Troubleshooting

### Common Issues

1. **"Invalid token" error**
   - Check that TURNSTILE_SECRET_KEY is correctly configured
   - Verify the token hasn't expired (5-minute timeout)

2. **Widget not loading**
   - Ensure VITE_TURNSTILE_SITE_KEY is set correctly
   - Check that the domain is configured in Cloudflare Turnstile

3. **CORS issues**
   - Verify API endpoint is properly configured in Cloudflare Workers
   - Check that the domain is whitelisted in Turnstile settings

### Debug Mode

For development, you can use Cloudflare's test keys:
- Site Key: `1x00000000000000000000AA`
- Secret Key: `1x00000000000000000000000000000000AA`

**Important**: Never use test keys in production!

## Migration from MathCaptcha

The migration is seamless:

1. **User Experience**: Users no longer see math problems
2. **Security**: Enhanced protection against sophisticated bots
3. **Performance**: Faster verification process
4. **Mobile**: Better experience on mobile devices

## Security Best Practices

1. **Rotate Keys**: Regularly update your secret keys
2. **Monitor Logs**: Check verification logs for unusual patterns
3. **Domain Restrictions**: Only enable Turnstile on necessary domains
4. **Rate Limiting**: Implement additional rate limiting if needed

## Files Modified

- `src/components/TurnstileCaptcha.tsx` - New Turnstile component
- `src/pages/AddJokePage.tsx` - Updated to use Turnstile
- `functions/verify-turnstile.ts` - Server-side verification
- `tsconfig.app.json` - Added Turnstile types
- `wrangler.toml` - Environment configuration
- `.env.example` - Environment variables template

## Support

For issues with Cloudflare Turnstile:
- [Cloudflare Turnstile Documentation](https://developers.cloudflare.com/turnstile/)
- [Cloudflare Community](https://community.cloudflare.com/)