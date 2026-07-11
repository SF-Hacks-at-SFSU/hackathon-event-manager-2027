import { createClient } from '@supabase/supabase-js';
import ws from 'ws';

// Node 20 has no native WebSocket; supabase-js's realtime client needs one
// even though we only use the auth API here. Node 22 (the CI/prod target)
// wouldn't need this, but this keeps local dev working on either version.
export const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
  realtime: { transport: ws as unknown as typeof WebSocket }
});
