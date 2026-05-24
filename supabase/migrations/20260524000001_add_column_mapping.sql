-- Add JSONB column to store client's custom Excel column mapping
-- Format: { "Full Name": "name", "PAN No.": "pan_number", ... }
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS column_mapping JSONB;
