-- Align schema with v2 spec
-- organizations: add has_master_sheet flag
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS has_master_sheet BOOLEAN DEFAULT false;

-- jobs: replace applicant_count with page_count
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS page_count INTEGER DEFAULT 0;
ALTER TABLE jobs DROP COLUMN IF EXISTS applicant_count;

-- applicants: drop label column (not in v2 schema)
ALTER TABLE applicants DROP COLUMN IF EXISTS label;

-- documents: add page_count per document
ALTER TABLE documents ADD COLUMN IF NOT EXISTS page_count INTEGER DEFAULT 1;
