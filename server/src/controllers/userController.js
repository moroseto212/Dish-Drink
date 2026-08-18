import prisma from '../prisma.js';
import { sanitizeUser } from '../utils/sanitize.js';

const PROFILE_RECIPE_SELECT = {
  id: true,
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
  _count: {
    select: { likes: true, saves: true, comments: true },
  },
};

export async function updateMe(req, res) {
  try {
    const { name, bio, avatarUrl } = req.body || {};

    const data = {};
    if (name !== undefined) {
      if (!String(name).trim()) {
        return res.status(400).json({ message: 'Nama tidak boleh kosong' });
      }
      data.name = String(name).trim();
    }
    if (bio !== undefined) data.bio = String(bio);
    if (avatarUrl !== undefined) data.avatarUrl = avatarUrl ? String(avatarUrl) : null;

    const user = await prisma.user.update({
      where: { id: req.user.id },
      data,
    });

    return res.json({ user: sanitizeUser(user) });
  } catch (err) {
    console.error('Update profile error:', err);
    return res.status(500).json({ message: 'Terjadi kesalahan pada server' });
  }
}

export function getMe(req, res) {
  return res.json({ user: sanitizeUser(req.user) });
}

export async function getProfile(req, res) {
  try {
    const { id } = req.params;
    const isSelf = req.user && req.user.id === id;

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        avatarUrl: true,
        bio: true,
        createdAt: true,
        _count: {
          select: { recipes: true, saves: true, likes: true, following: true, followers: true },
        },
      },
    });

    if (!user) {
      return res.status(404).json({ message: 'Pengguna tidak ditemukan' });
    }

    let isFollowing = false;
    let isFollowedBy = false;
    if (req.user && !isSelf) {
      const [follow, back] = await Promise.all([
        prisma.follow.findUnique({
          where: { followerId_followingId: { followerId: req.user.id, followingId: id } },
          select: { id: true },
        }),
        prisma.follow.findUnique({
          where: { followerId_followingId: { followerId: id, followingId: req.user.id } },
          select: { id: true },
        }),
      ]);
      isFollowing = !!follow;
      isFollowedBy = !!back;
    }

    return res.json({ profile: { ...user, isSelf, isFollowing, isFollowedBy } });
  } catch (err) {
    console.error('Get profile error:', err);
    return res.status(500).json({ message: 'Terjadi kesalahan pada server' });
  }
}

export async function searchUsers(req, res) {
  try {
    const q = (req.query.q || '').trim();
    const nameWhere = q
      ? {
          OR: [
            { name: { contains: q, mode: 'insensitive' } },
            { email: { contains: q, mode: 'insensitive' } },
          ],
        }
      : {};

    const users = await prisma.user.findMany({
      where: { ...nameWhere, id: { not: req.user.id } },
      select: {
        id: true,
        name: true,
        avatarUrl: true,
        bio: true,
        _count: { select: { followers: true, recipes: true } },
      },
      orderBy: { name: 'asc' },
      take: 30,
    });

    let followingSet = new Set();
    if (users.length > 0) {
      const following = await prisma.follow.findMany({
        where: { followerId: req.user.id, followingId: { in: users.map((u) => u.id) } },
        select: { followingId: true },
      });
      followingSet = new Set(following.map((f) => f.followingId));
    }

    return res.json({
      users: users.map((u) => ({ ...u, isFollowing: followingSet.has(u.id) })),
    });
  } catch (err) {
    console.error('Search users error:', err);
    return res.status(500).json({ message: 'Terjadi kesalahan pada server' });
  }
}

export async function listMutualUsers(req, res) {
  try {
    const myFollowing = await prisma.follow.findMany({
      where: { followerId: req.user.id },
      select: { followingId: true },
    });
    if (myFollowing.length === 0) {
      return res.json({ users: [] });
    }

    const ids = myFollowing.map((f) => f.followingId);
    const followersOfMe = await prisma.follow.findMany({
      where: { followerId: { in: ids }, followingId: req.user.id },
      select: { followerId: true },
    });
    const mutualIds = [...new Set(followersOfMe.map((f) => f.followerId))];

    const users = await prisma.user.findMany({
      where: { id: { in: mutualIds } },
      select: { id: true, name: true, avatarUrl: true, bio: true },
      orderBy: { name: 'asc' },
    });

    return res.json({ users });
  } catch (err) {
    console.error('List mutual users error:', err);
    return res.status(500).json({ message: 'Terjadi kesalahan pada server' });
  }
}

export async function followUser(req, res) {
  try {
    const { id } = req.params;
    if (id === req.user.id) {
      return res.status(400).json({ message: 'Tidak bisa mengikuti diri sendiri' });
    }

    const target = await prisma.user.findUnique({ where: { id }, select: { id: true } });
    if (!target) {
      return res.status(404).json({ message: 'Pengguna tidak ditemukan' });
    }

    await prisma.follow.upsert({
      where: { followerId_followingId: { followerId: req.user.id, followingId: id } },
      update: {},
      create: { followerId: req.user.id, followingId: id },
    });

    await prisma.notification.create({
      data: {
        userId: id,
        actorId: req.user.id,
        type: 'FOLLOW',
        text: `${req.user.name} mulai mengikuti kamu`,
      },
    });

    const count = await prisma.follow.count({ where: { followingId: id } });
    return res.json({ isFollowing: true, followersCount: count });
  } catch (err) {
    console.error('Follow error:', err);
    return res.status(500).json({ message: 'Terjadi kesalahan pada server' });
  }
}

export async function unfollowUser(req, res) {
  try {
    const { id } = req.params;

    await prisma.follow.deleteMany({ where: { followerId: req.user.id, followingId: id } });

    const count = await prisma.follow.count({ where: { followingId: id } });
    return res.json({ isFollowing: false, followersCount: count });
  } catch (err) {
    console.error('Unfollow error:', err);
    return res.status(500).json({ message: 'Terjadi kesalahan pada server' });
  }
}

export async function getUserRecipes(req, res) {
  try {
    const { id } = req.params;
    const isSelf = req.user && req.user.id === id;

    const user = await prisma.user.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!user) {
      return res.status(404).json({ message: 'Pengguna tidak ditemukan' });
    }

    const where = { authorId: id };
    if (!isSelf) {
      where.visibility = 'PUBLIC';
    }

    const [recipes, total] = await Promise.all([
      prisma.recipe.findMany({
        where,
        select: PROFILE_RECIPE_SELECT,
        orderBy: { createdAt: 'desc' },
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
      recipes: recipes.map((r) => ({ ...r, liked: !!likedMap[r.id], saved: !!savedMap[r.id] })),
      total,
    });
  } catch (err) {
    console.error('Get user recipes error:', err);
    return res.status(500).json({ message: 'Terjadi kesalahan pada server' });
  }
}
