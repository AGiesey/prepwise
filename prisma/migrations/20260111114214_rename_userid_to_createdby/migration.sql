-- Drop the old foreign key constraint
ALTER TABLE "Recipe" DROP CONSTRAINT IF EXISTS "Recipe_userId_fkey";

-- Rename the column from userId to createdBy
ALTER TABLE "Recipe" RENAME COLUMN "userId" TO "createdBy";

-- Update all existing recipes to set createdBy to the user with email adamgiesey@gmail.com
-- This migration creates a placeholder user if needed, which will be properly synced with Auth0
-- when the user signs up. The getOrCreateUserFromAuth0 function will find this user by email
-- and update it with Auth0 data (externalId, authProvider, etc.), so there's no conflict.
DO $$
DECLARE
  default_user_id TEXT;
  recipe_count INTEGER;
BEGIN
  -- Check if there are any recipes that need updating
  SELECT COUNT(*) INTO recipe_count FROM "Recipe" WHERE "createdBy" IS NULL;
  
  -- Only proceed if there are recipes to update
  IF recipe_count > 0 THEN
    -- Try to get the user with the email (may already exist from Auth0)
    SELECT id INTO default_user_id FROM "User" WHERE email = 'adamgiesey@gmail.com' LIMIT 1;
    
    -- If user doesn't exist, create a placeholder user
    -- This placeholder will be updated by getOrCreateUserFromAuth0 when you sign up with Auth0
    -- The sync function looks up by email and updates the existing record, so no conflicts
    IF default_user_id IS NULL THEN
      INSERT INTO "User" (id, email, "emailVerified", roles, "createdAt", "updatedAt")
      VALUES (gen_random_uuid(), 'adamgiesey@gmail.com', false, ARRAY[]::TEXT[], NOW(), NOW())
      RETURNING id INTO default_user_id;
    END IF;
    
    -- Update all recipes that have NULL createdBy
    UPDATE "Recipe" 
    SET "createdBy" = default_user_id
    WHERE "createdBy" IS NULL;
  END IF;
END $$;

-- Make the column NOT NULL
ALTER TABLE "Recipe" ALTER COLUMN "createdBy" SET NOT NULL;

-- Add the new foreign key constraint with the new column name
ALTER TABLE "Recipe" ADD CONSTRAINT "Recipe_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
