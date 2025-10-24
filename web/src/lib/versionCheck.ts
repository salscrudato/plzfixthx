import { logger } from "./logger";

// Update this version whenever you deploy
export const APP_VERSION = "1.0.2";

const VERSION_CHECK_INTERVAL = 5 * 60 * 1000; // 5 minutes
const VERSION_KEY = "app_version";

/**
 * Check if the app version has changed and reload if necessary
 */
export function initVersionCheck() {
  // Store current version
  const storedVersion = localStorage.getItem(VERSION_KEY);
  
  if (storedVersion && storedVersion !== APP_VERSION) {
    logger.info("Version changed, clearing caches...", {
      old: storedVersion,
      new: APP_VERSION
    });
    
    // Clear all caches
    if ('caches' in window) {
      caches.keys().then((names) => {
        names.forEach((name) => {
          caches.delete(name);
        });
      });
    }
    
    // Clear localStorage except for important data
    const keysToPreserve = ['user_preferences', 'auth_token'];
    const preserved: Record<string, string | null> = {};
    keysToPreserve.forEach(key => {
      preserved[key] = localStorage.getItem(key);
    });
    
    localStorage.clear();
    
    keysToPreserve.forEach(key => {
      if (preserved[key]) {
        localStorage.setItem(key, preserved[key]!);
      }
    });
  }
  
  // Update stored version
  localStorage.setItem(VERSION_KEY, APP_VERSION);
  
  // Periodically check for version changes
  setInterval(() => {
    checkForUpdates();
  }, VERSION_CHECK_INTERVAL);
  
  // Check when page becomes visible
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
      checkForUpdates();
    }
  });
}

/**
 * Check for updates by fetching a version file or checking the service worker
 */
async function checkForUpdates() {
  try {
    // Force a service worker update check
    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.getRegistration();
      if (registration) {
        await registration.update();
      }
    }
    
    // Check if there's a new version by trying to fetch index.html
    const response = await fetch('/index.html', {
      cache: 'no-cache',
      headers: {
        'Cache-Control': 'no-cache'
      }
    });
    
    if (response.ok) {
      const html = await response.text();
      
      // Look for version meta tag or build hash in the HTML
      // This is a simple check - you could make it more sophisticated
      const currentHtml = document.documentElement.outerHTML;
      
      // If the HTML has changed significantly, there might be an update
      if (html !== currentHtml) {
        logger.info("Detected potential update");
        
        // Check if service worker has an update waiting
        if ('serviceWorker' in navigator) {
          const registration = await navigator.serviceWorker.getRegistration();
          if (registration?.waiting) {
            logger.info("Update available, reloading...");
            registration.waiting.postMessage({ type: 'SKIP_WAITING' });
            window.location.reload();
          }
        }
      }
    }
  } catch (error) {
    logger.error("Version check failed", error);
  }
}

/**
 * Force a hard reload of the application
 */
export async function forceReload(): Promise<void> {
  // Clear all caches
  if ('caches' in window) {
    const names = await caches.keys();
    await Promise.all(names.map((name) => caches.delete(name)));
  }

  // Hard reload
  window.location.reload();
}

