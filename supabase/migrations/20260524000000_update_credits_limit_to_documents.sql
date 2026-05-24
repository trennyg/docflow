-- Migrate credits_limit from applicant-based to document-based limits
-- free: 45 docs/month, starter: 300, growth: 1050, unlimited: 15000
UPDATE organizations SET credits_limit = 45 WHERE plan = 'free';
UPDATE organizations SET credits_limit = 300 WHERE plan = 'starter';
UPDATE organizations SET credits_limit = 1050 WHERE plan = 'growth';
UPDATE organizations SET credits_limit = 15000 WHERE plan = 'unlimited';
