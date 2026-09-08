ALTER TYPE public.t_shirt_size ADD VALUE IF NOT EXISTS 'US_XXXL';

ALTER TABLE public.applications
  ADD COLUMN IF NOT EXISTS github_url text,
  ADD COLUMN IF NOT EXISTS discord_username text,
  ADD COLUMN IF NOT EXISTS team_preference text,
  ADD COLUMN IF NOT EXISTS sf_hacks_promo_email boolean,
  ADD COLUMN IF NOT EXISTS photo_release_consent boolean,
  ADD COLUMN IF NOT EXISTS resume_share_consent boolean,
  ADD COLUMN IF NOT EXISTS dietary_none boolean,
  ADD COLUMN IF NOT EXISTS dietary_nut_allergy boolean,
  ADD COLUMN IF NOT EXISTS dietary_other boolean;
