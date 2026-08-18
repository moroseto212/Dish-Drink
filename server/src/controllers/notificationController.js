import prisma from '../prisma.js';

export async function getNotifications(req, res) {
  try {
    const notifications = await prisma.notification.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    const unreadCount = await prisma.notification.count({
      where: { userId: req.user.id, isRead: false },
    });

    return res.json({ notifications, unreadCount });
  } catch (err) {
    console.error('Get notifications error:', err);
    return res.status(500).json({ message: 'Terjadi kesalahan pada server' });
  }
}

export async function readAllNotifications(req, res) {
  try {
    const result = await prisma.notification.updateMany({
      where: { userId: req.user.id, isRead: false },
      data: { isRead: true },
    });

    return res.json({ updated: result.count, unreadCount: 0 });
  } catch (err) {
    console.error('Read notifications error:', err);
    return res.status(500).json({ message: 'Terjadi kesalahan pada server' });
  }
}
