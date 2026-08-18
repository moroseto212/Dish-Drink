import prisma from '../prisma.js';
import { sanitizeUser } from '../utils/sanitize.js';

const RECIPE_SELECT = {
  id: true,
  authorId: true,
  title: true,
  description: true,
  coverUrl: true,
  category: true,
  prepTime: true,
  cookTime: true,
  servings: true,
  difficulty: true,
  visibility: true,
  createdAt: true,
  author: {
    select: { id: true, name: true, avatarUrl: true },
  },
  _count: {
    select: { likes: true, saves: true, comments: true },
  },
};

function buildWhere(search) {
  const where = { visibility: 'PUBLIC' };
  if (search && search.trim()) {
    const term = search.trim();
    where.OR = [
      { title: { contains: term, mode: 'insensitive' } },
      { description: { contains: term, mode: 'insensitive' } },
      { author: { name: { contains: term, mode: 'insensitive' } } },
    ];
  }
  return where;
}

function buildOrderBy(sort) {
  switch (sort) {
    case 'best':
      return [{ likes: { _count: 'desc' } }, { createdAt: 'desc' }];
    case 'oldest':
      return [{ createdAt: 'asc' }];
    case 'newest':
    default:
      return [{ createdAt: 'desc' }];
  }
}

export async function listRecipes(req, res) {
  try {
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 12, 1), 50);
    const search = req.query.search || '';
    const sort = req.query.sort || 'newest';

    const where = buildWhere(search);

    const [recipes, total] = await Promise.all([
      prisma.recipe.findMany({
        where,
        select: RECIPE_SELECT,
        orderBy: buildOrderBy(sort),
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.recipe.count({ where }),
    ]);

    let likedMap = {};
    let savedMap = {};
    if (req.user) {
      const [likes, saves] = await Promise.all([
        prisma.recipeLike.findMany({
          where: { userId: req.user.id, recipeId: { in: recipes.map((r) => r.id) } },
          select: { recipeId: true },
        }),
        prisma.recipeSave.findMany({
          where: { userId: req.user.id, recipeId: { in: recipes.map((r) => r.id) } },
          select: { recipeId: true },
        }),
      ]);
      likedMap = Object.fromEntries(likes.map((l) => [l.recipeId, true]));
      savedMap = Object.fromEntries(saves.map((s) => [s.recipeId, true]));
    }

    return res.json({
      recipes: recipes.map((r) => ({
        ...r,
        liked: !!likedMap[r.id],
        saved: !!savedMap[r.id],
      })),
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (err) {
    console.error('List recipes error:', err);
    return res.status(500).json({ message: 'Terjadi kesalahan pada server' });
  }
}

export async function getRecipe(req, res) {
  try {
    const { id } = req.params;

    const recipe = await prisma.recipe.findUnique({
      where: { id },
      select: {
        ...RECIPE_SELECT,
        ingredients: true,
        steps: true,
        updatedAt: true,
        comments: {
          orderBy: { createdAt: 'asc' },
          take: 200,
          select: {
            id: true,
            parentId: true,
            content: true,
            createdAt: true,
            user: { select: { id: true, name: true, avatarUrl: true } },
          },
        },
      },
    });

    if (!recipe) {
      return res.status(404).json({ message: 'Resep tidak ditemukan' });
    }

    if (recipe.visibility === 'PRIVATE' && (!req.user || recipe.authorId !== req.user.id)) {
      return res.status(403).json({ message: 'Resep ini bersifat pribadi' });
    }

    const comments = buildCommentTree(recipe.comments);

    let liked = false;
    let saved = false;
    let myRating = null;
    if (req.user) {
      const [like, save, rating] = await Promise.all([
        prisma.recipeLike.findUnique({
          where: { userId_recipeId: { userId: req.user.id, recipeId: id } },
        }),
        prisma.recipeSave.findUnique({
          where: { userId_recipeId: { userId: req.user.id, recipeId: id } },
        }),
        prisma.recipeRating.findUnique({
          where: { userId_recipeId: { userId: req.user.id, recipeId: id } },
        }),
      ]);
      liked = !!like;
      saved = !!save;
      myRating = rating ? rating.rating : null;
    }

    const ratingAgg = await prisma.recipeRating.aggregate({
      where: { recipeId: id },
      _avg: { rating: true },
      _count: { rating: true },
    });

    return res.json({
      recipe: {
        ...recipe,
        comments,
        liked,
        saved,
        myRating,
        avgRating: ratingAgg._avg.rating ? Math.round(ratingAgg._avg.rating * 10) / 10 : null,
        ratingCount: ratingAgg._count.rating,
        author: sanitizeUser(recipe.author),
      },
    });
  } catch (err) {
    console.error('Get recipe error:', err);
    return res.status(500).json({ message: 'Terjadi kesalahan pada server' });
  }
}

export async function createRecipe(req, res) {
  try {
    const { title, description, coverUrl, category, ingredients, steps, prepTime, cookTime, servings, difficulty, visibility } =
      req.body || {};

    if (!title || !title.trim()) {
      return res.status(400).json({ message: 'Judul resep wajib diisi' });
    }
    if (!Array.isArray(ingredients) || ingredients.length === 0) {
      return res.status(400).json({ message: 'Bahan resep wajib diisi' });
    }
    if (!Array.isArray(steps) || steps.length === 0) {
      return res.status(400).json({ message: 'Langkah memasak wajib diisi' });
    }

    const recipe = await prisma.recipe.create({
      data: {
        authorId: req.user.id,
        title: title.trim(),
        description: description || '',
        coverUrl: coverUrl || null,
        category: category === 'DRINK' ? 'DRINK' : 'FOOD',
        ingredients,
        steps,
        prepTime: prepTime ? parseInt(prepTime, 10) : null,
        cookTime: cookTime ? parseInt(cookTime, 10) : null,
        servings: servings ? parseInt(servings, 10) : null,
        difficulty: difficulty || null,
        visibility: visibility === 'PUBLIC' ? 'PUBLIC' : 'PRIVATE',
      },
    });

    return res.status(201).json({ recipe });
  } catch (err) {
    console.error('Create recipe error:', err);
    return res.status(500).json({ message: 'Terjadi kesalahan pada server' });
  }
}

export async function updateRecipe(req, res) {
  try {
    const { id } = req.params;
    const existing = await prisma.recipe.findUnique({ where: { id } });

    if (!existing) {
      return res.status(404).json({ message: 'Resep tidak ditemukan' });
    }
    if (existing.authorId !== req.user.id) {
      return res.status(403).json({ message: 'Anda tidak berhak mengubah resep ini' });
    }

    const { title, description, coverUrl, category, ingredients, steps, prepTime, cookTime, servings, difficulty, visibility } =
      req.body || {};

    const recipe = await prisma.recipe.update({
      where: { id },
      data: {
        title: title !== undefined ? title : existing.title,
        description: description !== undefined ? description : existing.description,
        coverUrl: coverUrl !== undefined ? coverUrl : existing.coverUrl,
        category: category !== undefined ? (category === 'DRINK' ? 'DRINK' : 'FOOD') : existing.category,
        ingredients: ingredients !== undefined ? ingredients : existing.ingredients,
        steps: steps !== undefined ? steps : existing.steps,
        prepTime: prepTime !== undefined ? parseInt(prepTime, 10) : existing.prepTime,
        cookTime: cookTime !== undefined ? parseInt(cookTime, 10) : existing.cookTime,
        servings: servings !== undefined ? parseInt(servings, 10) : existing.servings,
        difficulty: difficulty !== undefined ? difficulty : existing.difficulty,
        visibility: visibility !== undefined ? visibility : existing.visibility,
      },
    });

    return res.json({ recipe });
  } catch (err) {
    console.error('Update recipe error:', err);
    return res.status(500).json({ message: 'Terjadi kesalahan pada server' });
  }
}

export async function deleteRecipe(req, res) {
  try {
    const { id } = req.params;
    const existing = await prisma.recipe.findUnique({ where: { id } });

    if (!existing) {
      return res.status(404).json({ message: 'Resep tidak ditemukan' });
    }
    if (existing.authorId !== req.user.id) {
      return res.status(403).json({ message: 'Anda tidak berhak menghapus resep ini' });
    }

    await prisma.recipe.delete({ where: { id } });
    return res.json({ message: 'Resep berhasil dihapus' });
  } catch (err) {
    console.error('Delete recipe error:', err);
    return res.status(500).json({ message: 'Terjadi kesalahan pada server' });
  }
}

function buildCommentTree(flatComments) {
  const byParent = new Map();
  for (const c of flatComments) {
    const key = c.parentId || 'root';
    if (!byParent.has(key)) byParent.set(key, []);
    byParent.get(key).push(c);
  }

  const buildChildren = (parentId) => {
    const children = byParent.get(parentId) || [];
    return children
      .slice()
      .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
      .map((c) => ({ ...c, replies: buildChildren(c.id) }));
  };

  const roots = byParent.get('root') || [];
  roots.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  return roots.map((c) => ({ ...c, replies: buildChildren(c.id) }));
}

async function getViewableRecipe(id, userId) {
  const recipe = await prisma.recipe.findUnique({
    where: { id },
    select: { id: true, authorId: true, visibility: true },
  });
  if (!recipe) return null;
  if (recipe.visibility === 'PRIVATE' && recipe.authorId !== userId) return null;
  return recipe;
}

export async function likeRecipe(req, res) {
  try {
    const { id } = req.params;
    const recipe = await getViewableRecipe(id, req.user.id);
    if (!recipe) {
      return res.status(404).json({ message: 'Resep tidak ditemukan' });
    }

    await prisma.recipeLike.upsert({
      where: { userId_recipeId: { userId: req.user.id, recipeId: id } },
      update: {},
      create: { userId: req.user.id, recipeId: id },
    });

    const likesCount = await prisma.recipeLike.count({ where: { recipeId: id } });
    return res.json({ liked: true, likesCount });
  } catch (err) {
    console.error('Like recipe error:', err);
    return res.status(500).json({ message: 'Terjadi kesalahan pada server' });
  }
}

export async function unlikeRecipe(req, res) {
  try {
    const { id } = req.params;
    await prisma.recipeLike.deleteMany({ where: { userId: req.user.id, recipeId: id } });

    const likesCount = await prisma.recipeLike.count({ where: { recipeId: id } });
    return res.json({ liked: false, likesCount });
  } catch (err) {
    console.error('Unlike recipe error:', err);
    return res.status(500).json({ message: 'Terjadi kesalahan pada server' });
  }
}

export async function saveRecipe(req, res) {
  try {
    const { id } = req.params;
    const recipe = await getViewableRecipe(id, req.user.id);
    if (!recipe) {
      return res.status(404).json({ message: 'Resep tidak ditemukan' });
    }

    await prisma.recipeSave.upsert({
      where: { userId_recipeId: { userId: req.user.id, recipeId: id } },
      update: {},
      create: { userId: req.user.id, recipeId: id },
    });

    const savesCount = await prisma.recipeSave.count({ where: { recipeId: id } });
    return res.json({ saved: true, savesCount });
  } catch (err) {
    console.error('Save recipe error:', err);
    return res.status(500).json({ message: 'Terjadi kesalahan pada server' });
  }
}

export async function unsaveRecipe(req, res) {
  try {
    const { id } = req.params;
    await prisma.recipeSave.deleteMany({ where: { userId: req.user.id, recipeId: id } });

    const savesCount = await prisma.recipeSave.count({ where: { recipeId: id } });
    return res.json({ saved: false, savesCount });
  } catch (err) {
    console.error('Unsave recipe error:', err);
    return res.status(500).json({ message: 'Terjadi kesalahan pada server' });
  }
}

export async function addComment(req, res) {
  try {
    const { id } = req.params;
    const { content: rawContent, parentId } = req.body || {};
    const content = String(rawContent || '').trim();
    if (!content) {
      return res.status(400).json({ message: 'Komentar tidak boleh kosong' });
    }
    if (content.length > 1000) {
      return res.status(400).json({ message: 'Komentar terlalu panjang (maks 1000 karakter)' });
    }

    const recipe = await getViewableRecipe(id, req.user.id);
    if (!recipe) {
      return res.status(404).json({ message: 'Resep tidak ditemukan' });
    }

    if (parentId) {
      const parent = await prisma.recipeComment.findUnique({
        where: { id: parentId },
        select: { id: true, recipeId: true },
      });
      if (!parent || parent.recipeId !== id) {
        return res.status(400).json({ message: 'Komentar yang dibalas tidak ditemukan' });
      }
    }

    const comment = await prisma.recipeComment.create({
      data: { recipeId: id, userId: req.user.id, content, parentId: parentId || null },
      select: {
        id: true,
        parentId: true,
        content: true,
        createdAt: true,
        user: { select: { id: true, name: true, avatarUrl: true } },
      },
    });

    const commentsCount = await prisma.recipeComment.count({ where: { recipeId: id } });
    return res.status(201).json({ comment, commentsCount });
  } catch (err) {
    console.error('Add comment error:', err);
    return res.status(500).json({ message: 'Terjadi kesalahan pada server' });
  }
}

export async function deleteComment(req, res) {
  try {
    const { id, commentId } = req.params;
    const comment = await prisma.recipeComment.findUnique({
      where: { id: commentId },
      select: { id: true, userId: true, recipeId: true },
    });

    if (!comment || comment.recipeId !== id) {
      return res.status(404).json({ message: 'Komentar tidak ditemukan' });
    }
    if (comment.userId !== req.user.id) {
      return res.status(403).json({ message: 'Anda tidak berhak menghapus komentar ini' });
    }

    await prisma.recipeComment.delete({ where: { id: commentId } });

    const commentsCount = await prisma.recipeComment.count({ where: { recipeId: id } });
    return res.json({ message: 'Komentar berhasil dihapus', commentsCount });
  } catch (err) {
    console.error('Delete comment error:', err);
    return res.status(500).json({ message: 'Terjadi kesalahan pada server' });
  }
}

export async function rateRecipe(req, res) {
  try {
    const { id } = req.params;
    const rating = parseInt(req.body?.rating, 10);
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating harus antara 1-5' });
    }

    const recipe = await getViewableRecipe(id, req.user.id);
    if (!recipe) {
      return res.status(404).json({ message: 'Resep tidak ditemukan' });
    }

    await prisma.recipeRating.upsert({
      where: { userId_recipeId: { userId: req.user.id, recipeId: id } },
      update: { rating },
      create: { userId: req.user.id, recipeId: id, rating },
    });

    const [agg, myRating] = await Promise.all([
      prisma.recipeRating.aggregate({ where: { recipeId: id }, _avg: { rating: true }, _count: { rating: true } }),
      prisma.recipeRating.findUnique({ where: { userId_recipeId: { userId: req.user.id, recipeId: id } } }),
    ]);

    return res.json({
      myRating: myRating.rating,
      avgRating: agg._avg.rating ? Math.round(agg._avg.rating * 10) / 10 : null,
      ratingCount: agg._count.rating,
    });
  } catch (err) {
    console.error('Rate recipe error:', err);
    return res.status(500).json({ message: 'Terjadi kesalahan pada server' });
  }
}

export async function unrateRecipe(req, res) {
  try {
    const { id } = req.params;
    await prisma.recipeRating.deleteMany({ where: { userId: req.user.id, recipeId: id } });

    const agg = await prisma.recipeRating.aggregate({ where: { recipeId: id }, _avg: { rating: true }, _count: { rating: true } });
    return res.json({
      myRating: null,
      avgRating: agg._avg.rating ? Math.round(agg._avg.rating * 10) / 10 : null,
      ratingCount: agg._count.rating,
    });
  } catch (err) {
    console.error('Unrate recipe error:', err);
    return res.status(500).json({ message: 'Terjadi kesalahan pada server' });
  }
}
