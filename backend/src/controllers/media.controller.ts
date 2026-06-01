// Controller Media — CRUD médiathèque
// Gère l'upload, la liste et la suppression des fichiers

import { Request, Response } from 'express';
import prisma from '../lib/prisma';
import path from 'path';
import fs from 'fs';

const UPLOAD_DIR = path.join(__dirname, '../../uploads');

// ─── GET /api/media ───────────────────────────────────────────
export const listMedia = async (req: Request, res: Response) => {
  try {
    const { type, search } = req.query;

    const where: any = {};
    if (type && type !== 'all') {
      if (type === 'image') where.mimeType = { startsWith: 'image/' };
      if (type === 'pdf')   where.mimeType = 'application/pdf';
      if (type === 'doc')   where.mimeType = { contains: 'word' };
    }
    if (search) {
      where.filename = { contains: String(search), mode: 'insensitive' };
    }

    const files = await prisma.mediaFile.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    return res.json(files);
  } catch (error) {
    console.error('[MEDIA] listMedia error:', error);
    return res.status(500).json({ message: 'Erreur serveur' });
  }
};

// ─── POST /api/media/upload ────────────────────────────────────
export const uploadMedia = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Aucun fichier reçu' });
    }

    const file = req.file;
    const url = `/uploads/${file.filename}`;

    const media = await prisma.mediaFile.create({
      data: {
        filename: file.originalname || file.filename,
        url,
        mimeType: file.mimetype,
        size: file.size,
        alt: req.body.alt || '',
      },
    });

    return res.status(201).json(media);
  } catch (error) {
    console.error('[MEDIA] uploadMedia error:', error);
    return res.status(500).json({ message: 'Erreur lors de l\'upload' });
  }
};

// ─── PUT /api/media/:id ────────────────────────────────────────
export const updateMedia = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { alt } = req.body;

    const media = await prisma.mediaFile.update({
      where: { id },
      data: { alt },
    });

    return res.json(media);
  } catch (error) {
    console.error('[MEDIA] updateMedia error:', error);
    return res.status(500).json({ message: 'Erreur serveur' });
  }
};

// ─── DELETE /api/media/:id ────────────────────────────────────
export const deleteMedia = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const media = await prisma.mediaFile.findUnique({ where: { id } });
    if (!media) {
      return res.status(404).json({ message: 'Fichier introuvable' });
    }

    // Supprimer le fichier physique
    const filePath = path.join(UPLOAD_DIR, path.basename(media.url));
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await prisma.mediaFile.delete({ where: { id } });

    return res.json({ message: 'Fichier supprimé' });
  } catch (error) {
    console.error('[MEDIA] deleteMedia error:', error);
    return res.status(500).json({ message: 'Erreur lors de la suppression' });
  }
};
