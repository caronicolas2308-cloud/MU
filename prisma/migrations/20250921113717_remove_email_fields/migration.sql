-- DropIndex (only if exists)
DROP INDEX IF EXISTS "Admin_email_key";

-- DropIndex (only if exists)
DROP INDEX IF EXISTS "Prof_email_key";

-- AlterTable
ALTER TABLE "Admin" DROP COLUMN IF EXISTS "email";

-- AlterTable
ALTER TABLE "Prof" DROP COLUMN IF EXISTS "email";

-- CreateIndex (only if not exists)
CREATE UNIQUE INDEX IF NOT EXISTS "Admin_name_key" ON "Admin"("name");
