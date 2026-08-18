import prisma from '../prisma.js';

async function isParticipant(conversationId, userId) {
  const count = await prisma.conversationParticipant.count({
    where: { conversationId, userId },
  });
  return count > 0;
}

async function getOrCreateConversation(userId, otherId) {
  const key = [userId, otherId].sort().join(':');

  const existing = await prisma.conversation.findUnique({ where: { key }, select: { id: true } });
  if (existing) return existing.id;

  try {
    const created = await prisma.conversation.create({
      data: {
        key,
        participants: {
          create: [{ userId }, { userId: otherId }],
        },
      },
    });
    return created.id;
  } catch (err) {
    if (err.code === 'P2002') {
      const dup = await prisma.conversation.findUnique({ where: { key }, select: { id: true } });
      if (dup) return dup.id;
    }
    throw err;
  }
}

export async function listConversations(req, res) {
  try {
    const conversations = await prisma.conversation.findMany({
      where: { participants: { some: { userId: req.user.id } } },
      select: {
        id: true,
        updatedAt: true,
        participants: {
          select: { user: { select: { id: true, name: true, avatarUrl: true } } },
        },
        messages: { orderBy: { createdAt: 'desc' }, take: 1 },
      },
      orderBy: { updatedAt: 'desc' },
    });

    const list = await Promise.all(
      conversations.map(async (c) => {
        const otherUser = c.participants.find((p) => p.user.id !== req.user.id)?.user || null;
        const last = c.messages[0] || null;
        const unreadCount = await prisma.message.count({
          where: { conversationId: c.id, senderId: { not: req.user.id }, isRead: false },
        });
        return {
          id: c.id,
          otherUser,
          lastMessage: last
            ? { content: last.content, createdAt: last.createdAt, senderId: last.senderId }
            : null,
          unreadCount,
          updatedAt: c.updatedAt,
        };
      })
    );

    return res.json({ conversations: list });
  } catch (err) {
    console.error('List conversations error:', err);
    return res.status(500).json({ message: 'Terjadi kesalahan pada server' });
  }
}

export async function openConversation(req, res) {
  try {
    const { userId } = req.body || {};
    if (!userId) {
      return res.status(400).json({ message: 'Pengguna tidak valid' });
    }
    if (userId === req.user.id) {
      return res.status(400).json({ message: 'Tidak bisa chat dengan diri sendiri' });
    }

    const target = await prisma.user.findUnique({ where: { id: userId }, select: { id: true } });
    if (!target) {
      return res.status(404).json({ message: 'Pengguna tidak ditemukan' });
    }

    const [followThem, followBack] = await Promise.all([
      prisma.follow.findUnique({
        where: { followerId_followingId: { followerId: req.user.id, followingId: userId } },
        select: { id: true },
      }),
      prisma.follow.findUnique({
        where: { followerId_followingId: { followerId: userId, followingId: req.user.id } },
        select: { id: true },
      }),
    ]);

    if (!followThem || !followBack) {
      return res
        .status(403)
        .json({ message: 'Kamu hanya bisa chat dengan pengguna yang saling mengikuti' });
    }

    const conversationId = await getOrCreateConversation(req.user.id, userId);
    return res.json({ conversationId });
  } catch (err) {
    console.error('Open conversation error:', err);
    return res.status(500).json({ message: 'Terjadi kesalahan pada server' });
  }
}

export async function getMessages(req, res) {
  try {
    const { id } = req.params;
    if (!(await isParticipant(id, req.user.id))) {
      return res.status(403).json({ message: 'Tidak berhak mengakses percakapan ini' });
    }

    const messages = await prisma.message.findMany({
      where: { conversationId: id },
      orderBy: { createdAt: 'asc' },
      take: 200,
      select: { id: true, content: true, senderId: true, isRead: true, createdAt: true },
    });

    return res.json({ messages });
  } catch (err) {
    console.error('Get messages error:', err);
    return res.status(500).json({ message: 'Terjadi kesalahan pada server' });
  }
}

export async function sendMessage(req, res) {
  try {
    const { id } = req.params;
    const content = (req.body?.content || '').toString().trim();
    if (!content) {
      return res.status(400).json({ message: 'Pesan tidak boleh kosong' });
    }
    if (content.length > 2000) {
      return res.status(400).json({ message: 'Pesan terlalu panjang (maks 2000 karakter)' });
    }
    if (!(await isParticipant(id, req.user.id))) {
      return res.status(403).json({ message: 'Tidak berhak mengirim pesan di percakapan ini' });
    }

    const message = await prisma.message.create({
      data: { conversationId: id, senderId: req.user.id, content },
      select: { id: true, content: true, senderId: true, isRead: true, createdAt: true },
    });
    await prisma.conversation.update({ where: { id }, data: { updatedAt: new Date() } });

    return res.status(201).json({ message });
  } catch (err) {
    console.error('Send message error:', err);
    return res.status(500).json({ message: 'Terjadi kesalahan pada server' });
  }
}

export async function markConversationRead(req, res) {
  try {
    const { id } = req.params;
    const result = await prisma.message.updateMany({
      where: { conversationId: id, senderId: { not: req.user.id }, isRead: false },
      data: { isRead: true },
    });
    return res.json({ updated: result.count });
  } catch (err) {
    console.error('Mark read error:', err);
    return res.status(500).json({ message: 'Terjadi kesalahan pada server' });
  }
}

export async function unreadCount(req, res) {
  try {
    const conversations = await prisma.conversation.findMany({
      where: { participants: { some: { userId: req.user.id } } },
      select: { id: true },
    });
    const count = await prisma.message.count({
      where: {
        conversationId: { in: conversations.map((c) => c.id) },
        senderId: { not: req.user.id },
        isRead: false,
      },
    });
    return res.json({ unreadCount: count });
  } catch (err) {
    console.error('Unread count error:', err);
    return res.status(500).json({ message: 'Terjadi kesalahan pada server' });
  }
}
