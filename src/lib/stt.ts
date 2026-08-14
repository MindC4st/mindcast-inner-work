import { supabase } from "@/integrations/supabase/client";

// Typed query boundary for the staff-training tables, which are not yet in
// the generated Database types (migrations pending on the remote project).
// One cast lives here; callers get structural typing without `any`.

export type SttResult = { data: unknown; error: { message: string } | null };

export interface SttBuilder extends PromiseLike<SttResult> {
  select(cols?: string): SttBuilder;
  insert(row: object | object[]): SttBuilder;
  update(row: object): SttBuilder;
  upsert(row: object, opts?: { onConflict: string }): SttBuilder;
  eq(col: string, v: unknown): SttBuilder;
  in(col: string, v: unknown[]): SttBuilder;
  order(col: string, opts?: { ascending?: boolean }): SttBuilder;
  limit(n: number): SttBuilder;
  single(): Promise<SttResult>;
  maybeSingle(): Promise<SttResult>;
}

export const stt = (table: string): SttBuilder =>
  supabase.from(table as never) as unknown as SttBuilder;
