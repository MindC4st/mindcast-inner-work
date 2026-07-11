-- Phase 1a — add a distinct `admin` role.
--
-- Until now app_role was ('member','facilitator') and "admin" was overloaded
-- onto the facilitator role (App.tsx AdminRoute checks role === 'facilitator').
-- We now separate the two so a *room facilitator* can run a live session and
-- see attendance/Q&A WITHOUT the ability to read member journals or manage
-- payments — that privilege moves to `admin`.
--
-- NOTE: a new enum value cannot be used in the same transaction it is added,
-- so this migration only adds the value. Policies that reference
-- 'admin'::app_role live in later migration files.

ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'admin';
