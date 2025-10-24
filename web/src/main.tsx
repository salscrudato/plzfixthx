import React from "react";
import ReactDOM from "react-dom/client";
import "@/styles/tailwind.css";
import App from "./App";
import { initAnalytics } from "./lib/firebase";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { validateEnv } from "./lib/env";
import { logger } from "./lib/logger";
import { registerServiceWorker } from "./lib/registerSW";
import { initVersionCheck, APP_VERSION } from "./lib/versionCheck";

// Validate environment variables at startup
try {
  validateEnv();
  logger.info("Application starting...", { version: APP_VERSION });
} catch (error) {
  logger.error("Failed to validate environment", error);
  throw error;
}

initAnalytics();
registerServiceWorker();
initVersionCheck();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);
