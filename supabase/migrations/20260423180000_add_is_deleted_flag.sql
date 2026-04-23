-- Migration: Add is_deleted flag for soft deletion
-- Date: 2026-04-23

ALTER TABLE invoices ADD COLUMN IF NOT EXISTS is_deleted boolean DEFAULT false;
