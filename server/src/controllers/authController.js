import bcrypt from 'bcryptjs';
import cookieSignature from 'cookie-signature';
import prisma from '../prisma.js';
import { sanitizeUser } from '../utils/sanitize.js';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function register(req, res) {
  try {
    const { name, email, password } = req.body || {};

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Nama, email, dan password wajib diisi' });
    }
    if (!EMAIL_REGEX.test(email)) {
      return res.status(400).json({ message: 'Format email tidak valid' });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: 'Password minimal 6 karakter' });
    }

    const existing = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (existing) {
      return res.status(409).json({ message: 'Email sudah terdaftar' });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name: name.trim(),
        email: email.toLowerCase(),
        passwordHash,
      },
    });

    return res.status(201).json({ message: 'Akun berhasil dibuat. Silakan masuk.', user: sanitizeUser(user) });
  } catch (err) {
    console.error('Register error:', err);
    return res.status(500).json({ message: 'Terjadi kesalahan pada server' });
  }
}

export async function login(req, res) {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ message: 'Email dan password wajib diisi' });
    }

    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (!user || !user.passwordHash) {
      return res.status(401).json({ message: 'Email atau password salah' });
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      return res.status(401).json({ message: 'Email atau password salah' });
    }

    req.login(user, (err) => {
      if (err) return res.status(500).json({ message: 'Gagal membuat sesi' });

      const signedSid = 's:' + cookieSignature.sign(req.sessionID, process.env.SESSION_SECRET);
      const maxAge = 1000 * 60 * 60 * 24 * 7;
      const cookieParts = [
        'connect.sid=' + signedSid,
        'Path=/',
        'HttpOnly',
        'SameSite=Lax',
        'Secure',
        'Max-Age=' + Math.floor(maxAge / 1000),
      ];
      res.setHeader('Set-Cookie', cookieParts.join('; '));

      return res.json({ user: sanitizeUser(user) });
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ message: 'Terjadi kesalahan pada server' });
  }
}

export function me(req, res) {
  return res.json({ user: sanitizeUser(req.user) });
}

export function logout(req, res) {
  req.logout((err) => {
    if (err) return res.status(500).json({ message: 'Gagal keluar' });
    req.session.destroy(() => {
      res.clearCookie('connect.sid');
      return res.json({ message: 'Berhasil keluar' });
    });
  });
}

export async function changePassword(req, res) {
  try {
    const { currentPassword, newPassword } = req.body || {};
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Password lama dan baru wajib diisi' });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'Password baru minimal 6 karakter' });
    }

    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    if (!user || !user.passwordHash) {
      return res.status(400).json({ message: 'Akun tidak memiliki password' });
    }

    const valid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!valid) {
      return res.status(401).json({ message: 'Password lama salah' });
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({ where: { id: req.user.id }, data: { passwordHash } });

    return res.json({ message: 'Password berhasil diubah' });
  } catch (err) {
    console.error('Change password error:', err);
    return res.status(500).json({ message: 'Terjadi kesalahan pada server' });
  }
}

export async function deleteAccount(req, res) {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    if (!user) {
      return res.status(404).json({ message: 'Pengguna tidak ditemukan' });
    }

    await prisma.user.delete({ where: { id: req.user.id } });

    req.logout((err) => {
      if (err) return res.status(500).json({ message: 'Gagal menghapus akun' });
      req.session.destroy(() => {
        res.clearCookie('connect.sid');
        return res.json({ message: 'Akun berhasil dihapus' });
      });
    });
  } catch (err) {
    console.error('Delete account error:', err);
    return res.status(500).json({ message: 'Terjadi kesalahan pada server' });
  }
}
