import { supabase } from "@/integrations/supabase/client";

// Colouring pages are paid kids content, so they live in the PRIVATE `colouring`
// bucket and are served via short-lived signed URLs. Only staff or an active
// member with the kids add-on can read that bucket (storage RLS), so only they
// can mint a URL.
//
// Backward compatibility: pages generated before this change were written to the
// public `worksheets` bucket and stored as absolute URLs. If the stored value is
// already a URL, pass it through unchanged so existing pages keep working.

export async function resolveColouringUrl(
  stored: string | null | undefined,
  expiresIn = 300,
): Promise<string | null> {
  const value = (stored || "").trim();
  if (!value) return null;

  // Legacy: an absolute public URL already.
  if (/^https?:\/\//i.test(value)) return value;

  const { data, error } = await (supabase as any).storage
    .from("colouring")
    .createSignedUrl(value, expiresIn);
  if (error || !data?.signedUrl) return null;
  return data.signedUrl as string;
}
