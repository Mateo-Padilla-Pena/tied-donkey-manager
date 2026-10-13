-- Single full name replaces firstName/lastName/displayName
ALTER TABLE "User" ADD COLUMN "fullName" TEXT;
UPDATE "User"
SET "fullName" = COALESCE(NULLIF(TRIM(CONCAT_WS(' ', "firstName", "lastName")), ''), "displayName");

ALTER TABLE "User" DROP COLUMN "firstName",
DROP COLUMN "lastName",
DROP COLUMN "displayName",
DROP COLUMN "phone",
DROP COLUMN "photoUrl";

-- Phone and photo features are removed
ALTER TABLE "Supplier" DROP COLUMN "contactPhone";

DROP TABLE "ProductImage";
