
DROP POLICY IF EXISTS responses_insert_any ON public.session_responses;

CREATE POLICY responses_insert_authenticated
ON public.session_responses
FOR INSERT
TO authenticated
WITH CHECK (
  hidden = false
  AND (user_id IS NULL OR user_id = auth.uid())
);

CREATE POLICY responses_insert_anon
ON public.session_responses
FOR INSERT
TO anon
WITH CHECK (
  is_public = true
  AND hidden = false
  AND user_id IS NULL
);
