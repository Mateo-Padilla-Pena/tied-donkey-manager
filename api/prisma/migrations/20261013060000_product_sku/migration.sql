-- AlterTable
ALTER TABLE "Product" ADD COLUMN "sku" TEXT,
ADD COLUMN "providerSku" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Product_sku_key" ON "Product"("sku");
