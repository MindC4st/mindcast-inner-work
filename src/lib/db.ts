import type { SupabaseClient } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

// Single sanctioned type boundary for Supabase table access.
//
// The generated typegen is stale, so the schema is hand-maintained in
// "@/integrations/supabase/types" (kept in sync with supabase/migrations).
// Every table query in the app goes through `db` so it is checked against
// that schema; this cast is the one place the client is re-typed.
//
// Non-query surfaces (auth, storage, realtime channels, edge functions) keep
// using the original `supabase` client directly.
export const db = supabase as unknown as SupabaseClient<Database>;
