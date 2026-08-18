ALTER TABLE "RecipeComment" ADD COLUMN "parentId" TEXT;

CREATE INDEX "RecipeComment_parentId_idx" ON "RecipeComment"("parentId");

ALTER TABLE "RecipeComment" ADD CONSTRAINT "RecipeComment_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "RecipeComment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
