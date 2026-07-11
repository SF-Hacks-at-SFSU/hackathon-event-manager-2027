import { createClient } from '@supabase/supabase-js';
import ws from 'ws';

// Node 20 has no native WebSocket; supabase-js's realtime client needs one
// even though we only use the auth API here. Node 22 (the CI/prod target)
// wouldn't need this, but this keeps local dev working on either version.
export const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
  // `as any`, not a structural cast to `typeof WebSocket` — ws's WebSocket
  // class doesn't structurally match the ambient WebSocket type in every
  // TS/@types/node version, and that mismatch surfaced only in Vercel's
  // build environment, not locally.
  realtime: { transport: ws as any }
});
