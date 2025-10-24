# Force Update Guide

This guide explains how to force users to see the latest version of the app when you deploy updates.

## How It Works

The app now has multiple mechanisms to ensure users always see the latest version:

### 1. **Service Worker with Network-First Strategy**
- HTML, JS, and CSS files are always fetched from the network first
- Cache is only used as a fallback when offline
- Service worker version is automatically updated on each deployment

### 2. **Aggressive Update Checking**
- Checks for updates every 5 minutes
- Checks when the page becomes visible (user switches back to the tab)
- Checks immediately on page load
- Auto-reloads when a new version is detected

### 3. **Cache-Control Headers**
- All HTML, JS, and CSS files have `no-cache, no-store, must-revalidate` headers
- Prevents browser from caching these files
- Images and static assets are cached for performance

### 4. **Version Tracking**
- App version is tracked in `web/src/lib/versionCheck.ts`
- Clears caches when version changes
- Preserves important user data (preferences, auth tokens)

## How to Force an Update

When you want to force all users to get the latest version:

### Option 1: Automatic (Recommended)
Just deploy normally - the system will handle it:
```bash
cd web && npm run build
firebase deploy --only hosting
```

The app will automatically:
- Detect the new deployment
- Clear old caches
- Reload the page for users

### Option 2: Manual Version Bump
If you want to be extra sure, update the version number:

1. Edit `web/src/lib/versionCheck.ts`:
   ```typescript
   export const APP_VERSION = "1.0.2"; // Increment this
   ```

2. Edit `web/public/sw.js`:
   ```javascript
   const VERSION = '1.0.2'; // Match the app version
   ```

3. Build and deploy:
   ```bash
   cd web && npm run build
   firebase deploy --only hosting
   ```

### Option 3: Nuclear Option (Clear Everything)
If you need to completely reset all caches:

1. Increment both version numbers (as in Option 2)
2. Deploy
3. Users will automatically get the update and all caches will be cleared

## What Happens for Users

When you deploy an update:

1. **Within 5 minutes**: The app checks for updates
2. **New version detected**: Service worker downloads new files
3. **Auto-reload**: Page automatically reloads (after 1 second delay)
4. **Cache cleared**: Old cached files are removed
5. **Fresh start**: User sees the latest version

## Testing Updates Locally

To test the update mechanism locally:

1. Start the dev server:
   ```bash
   cd web && npm run dev
   ```

2. Open http://localhost:5173

3. Make a change to the code

4. The page should auto-reload with the changes

## Monitoring

Check the browser console for update logs:
- `"Application starting..."` - Shows current version
- `"New service worker available - reloading..."` - Update detected
- `"Version changed, clearing caches..."` - Version bump detected

## Important Files

- `web/src/lib/versionCheck.ts` - Version tracking and update logic
- `web/src/lib/registerSW.ts` - Service worker registration and update checking
- `web/public/sw.js` - Service worker with caching strategy
- `firebase.json` - Cache-Control headers configuration

## Troubleshooting

### Users not seeing updates?

1. Check the version numbers are incremented
2. Verify deployment succeeded: `firebase hosting:channel:list`
3. Check browser console for errors
4. Try hard refresh: Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)

### Updates happening too frequently?

Adjust the update check interval in `web/src/lib/registerSW.ts`:
```typescript
setInterval(() => {
  registration.update();
}, 5 * 60 * 1000); // Change this value (currently 5 minutes)
```

### Want to disable auto-reload?

In `web/src/lib/registerSW.ts`, comment out the auto-reload:
```typescript
// setTimeout(() => {
//   window.location.reload();
// }, 1000);
```

And show a notification instead:
```typescript
if (confirm('A new version is available. Reload to update?')) {
  window.location.reload();
}
```

## Best Practices

1. **Always increment version numbers** when making significant changes
2. **Test locally first** before deploying to production
3. **Deploy during low-traffic periods** to minimize disruption
4. **Monitor logs** after deployment to ensure updates are working
5. **Keep the update interval reasonable** (5 minutes is good for most apps)

## Cache Strategy Summary

| File Type | Strategy | Cache Duration |
|-----------|----------|----------------|
| HTML | Network-first | No cache |
| JS | Network-first | No cache |
| CSS | Network-first | No cache |
| Images | Cache-first | 1 year |
| Service Worker | Network-only | No cache |
| API Calls | Network-only | No cache |

This ensures users always get the latest code while maintaining good performance for static assets.

