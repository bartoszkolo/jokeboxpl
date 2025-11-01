-- Migration: Add newsletter_consent field to profiles table
-- Created at: 1761764600

-- Add newsletter_consent column to profiles table
ALTER TABLE profiles ADD COLUMN newsletter_consent BOOLEAN DEFAULT FALSE;

-- Add comment to describe the field
COMMENT ON COLUMN profiles.newsletter_consent IS 'Whether the user has consented to receive newsletter emails';