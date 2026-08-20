-- Commerce roles. ALTER TYPE ... ADD VALUE cannot be used in the same
-- transaction as code that references the new values, so the enum extension
-- lives alone here and the commerce schema lands in the next migration.
--
-- Role model (see docs/COMMERCE.md):
--   commerce_admin — products, pricing, inventory, refunds, reporting, settings
--   fulfilment     — view paid orders, pick/pack/ship/tracking, receive stock
--   support        — find orders, resend emails, view status
-- admin implicitly holds every commerce role (helper functions below encode
-- that hierarchy once the schema migration creates them).

ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'commerce_admin';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'fulfilment';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'support';
