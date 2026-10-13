-- AlterTable
ALTER TABLE "User" ADD COLUMN "companyId" TEXT;

-- CreateIndex
CREATE INDEX "User_companyId_idx" ON "User"("companyId");
