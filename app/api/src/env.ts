import dotenv from 'dotenv';

// Imported first (and only) for its side effect: populating process.env
// before any other module reads it. ES module imports are evaluated before
// top-level statements run, so calling dotenv.config() inline in server.ts
// (after `import app from './app'`) was too late — app.ts's transitive
// imports (e.g. config/supabase.ts) had already read undefined env vars.
dotenv.config();

// Local-only overrides live in a separate ignored file so production credentials
// and test controls are never mixed. Hosting platforms should set these values
// directly in their environment instead.
if (process.env.NODE_ENV !== 'production') {
  dotenv.config({ path: '.env.test-mode', override: true });
}
