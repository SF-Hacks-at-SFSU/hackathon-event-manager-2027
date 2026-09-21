ALTER TABLE public.applications
  ADD COLUMN IF NOT EXISTS age_group text,
  ADD COLUMN IF NOT EXISTS referral_source text;
