-- CreateTable
CREATE TABLE "RecipeRating" (
    "userId" TEXT NOT NULL,
    "recipeId" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RecipeRating_pkey" PRIMARY KEY ("userId","recipeId")
);

-- CreateIndex
CREATE INDEX "RecipeRating_recipeId_idx" ON "RecipeRating"("recipeId");

-- AddForeignKey
ALTER TABLE "RecipeRating" ADD CONSTRAINT "RecipeRating_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecipeRating" ADD CONSTRAINT "RecipeRating_recipeId_fkey" FOREIGN KEY ("recipeId") REFERENCES "Recipe"("id") ON DELETE CASCADE ON UPDATE CASCADE;
