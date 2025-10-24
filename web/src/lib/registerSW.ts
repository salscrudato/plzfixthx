import { logger } from "./logger";

export function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/sw.js', { updateViaCache: 'none' })
        .then((registration) => {
          logger.info('Service Worker registered', { scope: registration.scope });

          // Check for updates immediately on page load
          registration.update();

          // Check for updates more frequently (every 5 minutes)
          setInterval(() => {
            registration.update();
          }, 5 * 60 * 1000);

          // Listen for updates
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  // New service worker available - auto-reload after a short delay
                  logger.info('New service worker available - reloading...');

                  // Auto-reload to get the latest version
                  setTimeout(() => {
                    window.location.reload();
                  }, 1000);
                }
              });
            }
          });

          // Listen for controller change (new SW activated)
          navigator.serviceWorker.addEventListener('controllerchange', () => {
            logger.info('Service Worker controller changed - reloading...');
            window.location.reload();
          });
        })
        .catch((error) => {
          logger.error('Service Worker registration failed', error);
        });
    });

    // Check for updates when page becomes visible
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) {
        navigator.serviceWorker.ready.then((registration) => {
          registration.update();
        });
      }
    });
  }
}

export function unregisterServiceWorker() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready
      .then((registration) => {
        registration.unregister();
        logger.info('Service Worker unregistered');
      })
      .catch((error) => {
        logger.error('Service Worker unregistration failed', error);
      });
  }
}

