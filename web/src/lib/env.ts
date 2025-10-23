import { z } from "zod";

/** Environment variable schema */
const envSchema = z.object({
  // Firebase config is optional since it can be hardcoded in firebase.ts
  VITE_FIREBASE_API_KEY: z.string().optional(),
  VITE_FIREBASE_AUTH_DOMAIN: z.string().optional(),
  VITE_FIREBASE_PROJECT_ID: z.string().optional(),
  VITE_FIREBASE_STORAGE_BUCKET: z.string().optional(),
  VITE_FIREBASE_MESSAGING_SENDER_ID: z.string().optional(),
  VITE_FIREBASE_APP_ID: z.string().optional(),
  VITE_FIREBASE_MEASUREMENT_ID: z.string().optional(),
  VITE_FUNCTIONS_BASE_URL: z.string().url("Functions base URL must be a valid URL").optional(),
  VITE_FUNCTIONS_REGION: z.string().optional(),
  MODE: z.enum(["development", "production", "test"]).optional(),
  DEV: z.boolean().optional(),
  PROD: z.boolean().optional(),
});

type Env = z.infer<typeof envSchema>;

/** Validated environment variables */
let validatedEnv: Env | null = null;

/** Validate environment variables at startup */
export function validateEnv(): Env {
  if (validatedEnv) {
    return validatedEnv;
  }

  try {
    validatedEnv = envSchema.parse(import.meta.env);
    console.log("✅ Environment variables validated successfully");
    return validatedEnv;
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error("❌ Environment validation failed:");
      error.issues.forEach((err: any) => {
        console.error(`  - ${err.path.join(".")}: ${err.message}`);
      });

      // In development, show a helpful error message
      if (import.meta.env.DEV) {
        const missingVars = error.issues.map((e: any) => e.path.join(".")).join(", ");
        throw new Error(
          `Missing or invalid environment variables: ${missingVars}\n\n` +
          `Please check your .env file and ensure all required variables are set.\n` +
          `See .env.example for reference.`
        );
      }
    }
    throw error;
  }
}

/** Get validated environment variables */
export function getEnv(): Env {
  if (!validatedEnv) {
    return validateEnv();
  }
  return validatedEnv;
}

/** Check if running in development mode */
export function isDevelopment(): boolean {
  return import.meta.env.DEV === true;
}

/** Check if running in production mode */
export function isProduction(): boolean {
  return import.meta.env.PROD === true;
}

