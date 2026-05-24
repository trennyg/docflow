-- Switch billing unit from documents to pages
-- Add addon_pages column (never resets, stacks on top of monthly plan)
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS addon_pages INTEGER DEFAULT 0;

-- Update monthly page limits per plan
UPDATE organizations SET credits_limit = 30  WHERE plan = 'free';
UPDATE organizations SET credits_limit = 130 WHERE plan = 'starter';
UPDATE organizations SET credits_limit = 330 WHERE plan = 'growth';
UPDATE organizations SET credits_limit = 600 WHERE plan = 'unlimited';
