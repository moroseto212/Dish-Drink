import path from 'path';
import fs from 'fs/promises';
import cloudinary from '../config/cloudinary.js';
import prisma from '../prisma.js';
import { sanitizeUser } from '../utils/sanitize.js';

export async function uploadAvatar(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Pilih file gambar terlebih dahulu' });
    }

    let avatarUrl;

    if (cloudinary) {
      const dataUri = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
      const result = await cloudinary.uploader.upload(dataUri, {
        folder: 'dish-drink/avatars',
        transformation: [{ width: 400, height: 400, crop: 'fill' }],
      });
      avatarUrl = result.secure_url;
    } else {
      const uploadsDir = path.resolve('uploads/avatars');
      await fs.mkdir(uploadsDir, { recursive: true });
      const ext = path.extname(req.file.originalname) || '.jpg';
      const filename = `${req.user.id}-${Date.now()}${ext}`;
      await fs.writeFile(path.join(uploadsDir, filename), req.file.buffer);
      avatarUrl = `/uploads/avatars/${filename}`;
    }

    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: { avatarUrl },
    });

    return res.json({ user: sanitizeUser(user) });
  } catch (err) {
    console.error('Upload avatar error:', err);
    return res.status(500).json({ message: 'Terjadi kesalahan saat mengunggah foto' });
  }
}

export async function uploadCover(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Pilih file gambar terlebih dahulu' });
    }

    let url;

    if (cloudinary) {
      const dataUri = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
      const result = await cloudinary.uploader.upload(dataUri, {
        folder: 'dish-drink/covers',
        transformation: [{ width: 1280, crop: 'limit' }],
      });
      url = result.secure_url;
    } else {
      const coversDir = path.resolve('uploads/covers');
      await fs.mkdir(coversDir, { recursive: true });
      const ext = path.extname(req.file.originalname) || '.jpg';
      const filename = `${req.user.id}-${Date.now()}${ext}`;
      await fs.writeFile(path.join(coversDir, filename), req.file.buffer);
      url = `/uploads/covers/${filename}`;
    }

    return res.json({ url });
  } catch (err) {
    console.error('Upload cover error:', err);
    return res.status(500).json({ message: 'Terjadi kesalahan saat mengunggah foto' });
  }
}
