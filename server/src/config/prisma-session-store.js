import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const Store = require('express-session/session/store.js');
import prisma from '../prisma.js';
export default class PrismaSessionStore extends Store {
  constructor() {
    super();
    process.nextTick(() => this.emit('connect'));
  }

  async get(sid, callback) {
    try {
      const session = await prisma.session.findUnique({ where: { sid } });
      if (!session) return callback(null, null);
      if (session.expire < new Date()) {
        await prisma.session.delete({ where: { sid } });
        return callback(null, null);
      }
      callback(null, session.sess);
    } catch (err) {
      callback(err);
    }
  }

  async set(sid, session, callback) {
    try {
      const expire = new Date(session.cookie?.expires || Date.now() + 7 * 24 * 60 * 60 * 1000);
      await prisma.session.upsert({
        where: { sid },
        create: { sid, sess: session, expire },
        update: { sess: session, expire },
      });
      callback(null);
    } catch (err) {
      callback(err);
    }
  }

  async destroy(sid, callback) {
    try {
      await prisma.session.delete({ where: { sid } }).catch(() => {});
      callback(null);
    } catch (err) {
      callback(err);
    }
  }

  async touch(sid, session, callback) {
    try {
      const expire = new Date(session.cookie?.expires || Date.now() + 7 * 24 * 60 * 60 * 1000);
      await prisma.session.update({
        where: { sid },
        data: { expire },
      }).catch(() => {});
      callback(null);
    } catch (err) {
      callback(err);
    }
  }
}
