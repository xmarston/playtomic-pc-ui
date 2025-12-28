-- AlterTable
ALTER TABLE "PageView" ADD COLUMN     "browser" TEXT;

-- CreateIndex
CREATE INDEX "PageView_browser_idx" ON "PageView"("browser");
