# I18n Refactoring Migration Guide

This document outlines the changes made to refactor the internationalization (i18n) implementation from a URL-based `[locale]` directory structure to a cookie/header-based approach.

## Overview

The application has been refactored to remove dependency on the `[locale]` directory structure while maintaining full internationalization functionality. The new implementation uses cookies and HTTP headers for locale detection and management.

## Key Changes

### 1. Directory Structure Changes

**Before:**
```
src/app/[locale]/
├── (main)/
│   ├── page.tsx
│   ├── layout.tsx
│   ├── profile/
│   ├── account/
│   └── ...
├── login/
├── layout.tsx
├── error.tsx
└── not-found.tsx
```

**After:**
```
src/app/
├── (main)/
│   ├── page.tsx
│   ├── layout.tsx
│   ├── profile/
│   ├── account/
│   └── ...
├── login/
├── layout.tsx
├── error.tsx
└── not-found.tsx
```

### 2. Locale Detection Strategy

The new system uses the following priority order for locale detection:

1. **Cookie** (`locale` cookie) - Primary source
2. **Accept-Language Header** - Fallback for new users
3. **Default locale** (`en`) - Final fallback

### 3. Configuration Changes

#### `src/i18n/i18n.ts`
- Removed dependency on `requestConfig.locale`
- Added custom `getLocale()` function for cookie/header-based detection
- Maintains same translation loading mechanism

#### `src/navigation.ts`
- Switched from `createLocalizedPathnamesNavigation` to `createSharedPathnamesNavigation`
- Added cookie helper functions: `setLocaleCookie()` and `getLocaleCookie()`
- Removed `localePrefix` configuration

#### `src/middlewares/i18n.ts`
- Completely rewritten to handle cookie-based locale detection
- Sets locale cookie based on Accept-Language header for new users
- No longer performs URL rewriting

#### `next.config.ts`
- Removed `withNextIntl` wrapper
- Simplified configuration (no URL-based routing needed)

### 4. Component Updates

#### Page Components
All page components have been updated to:
- Remove `params: Promise<{ locale: string }>` prop
- Remove `setRequestLocale()` calls
- Work directly with server-side locale detection

#### Language Switcher
- Enhanced to work with both user preferences and locale cookies
- Maintains backward compatibility with existing user preference system

### 5. New Components

#### `LocaleSwitcher`
A new component (`src/components/locale-switcher/`) that provides:
- Cookie-based locale switching
- Visual feedback during transitions
- Integration with the routing system

## Migration Benefits

1. **Simplified URLs**: No more `/en/profile` or `/es/dashboard` - clean URLs like `/profile`
2. **Better SEO**: Single URL structure with proper `lang` attribute
3. **Improved UX**: Locale persists across sessions via cookies
4. **Reduced Complexity**: Fewer dynamic routes and simpler middleware
5. **Better Performance**: No URL-based routing overhead

## Breaking Changes

### For Developers

1. **Page Components**: All page components that previously accepted `params.locale` need to be updated
2. **URL Structure**: Links and navigation no longer include locale prefixes
3. **Middleware Configuration**: Custom i18n middleware replaces next-intl's built-in middleware

### For Users

1. **Bookmarks**: Old URLs with locale prefixes will need to be updated
2. **Locale Persistence**: Locale is now stored in cookies instead of URL

## Implementation Details

### Locale Cookie
- **Name**: `locale`
- **Path**: `/`
- **Max Age**: 1 year (31536000 seconds)
- **SameSite**: `Lax`
- **Secure**: Only in production

### Fallback Logic
```typescript
async function getLocale(): Promise<string> {
  // 1. Check cookie
  const localeCookie = cookieStore.get('locale')?.value;
  if (localeCookie && locales.includes(localeCookie)) {
    return localeCookie;
  }

  // 2. Parse Accept-Language header
  const acceptLanguage = headersList.get('accept-language');
  // ... parsing logic

  // 3. Default fallback
  return defaultLocale;
}
```

### User Preference Integration
The system maintains integration with user preferences:
- Language changes update both cookie and user preferences
- User preferences take precedence for authenticated users
- Cookie serves as fallback for unauthenticated users

## Testing

The refactoring has been validated through:
- ✅ TypeScript compilation
- ✅ Next.js build process  
- ✅ All routes accessible without locale prefixes
- ✅ Locale detection working via cookies and headers

## Support

For questions or issues related to this refactoring:
1. Check that cookies are enabled in your browser
2. Verify Accept-Language headers are being sent correctly
3. Clear browser cache if experiencing locale detection issues
4. Check developer console for any JavaScript errors related to locale switching

## Future Enhancements

Potential improvements for the new system:
1. **Subdomain Support**: Easy to add `en.example.com` support
2. **Geolocation**: Integrate IP-based locale detection
3. **A/B Testing**: Test different locale detection strategies
4. **Analytics**: Track locale usage patterns