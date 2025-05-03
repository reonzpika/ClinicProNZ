-- Drop the foreign key constraint first
ALTER TABLE "templates" DROP CONSTRAINT IF EXISTS "templates_owner_id_users_id_fk";

-- Change users.id from UUID to text
ALTER TABLE "users" ALTER COLUMN "id" TYPE text;
ALTER TABLE "users" ALTER COLUMN "id" DROP DEFAULT;

-- Change templates.id and owner_id from UUID to text
ALTER TABLE "templates" ALTER COLUMN "id" TYPE text;
ALTER TABLE "templates" ALTER COLUMN "id" DROP DEFAULT;
ALTER TABLE "templates" ALTER COLUMN "owner_id" TYPE text;

-- Re-add the foreign key constraint
ALTER TABLE "templates" ADD CONSTRAINT "templates_owner_id_users_id_fk" 
  FOREIGN KEY ("owner_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION; 