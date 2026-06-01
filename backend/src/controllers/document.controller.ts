import { Request, Response } from 'express';
import prisma from '../lib/prisma';

export const getDocuments = async (req: Request, res: Response) => {
  try {
    const { category } = req.query;
    const where: any = {};
    if (category) where.category = category as string;

    const documents = await prisma.document.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
    return res.json(documents);
  } catch (error) {
    console.error('Erreur lors de la récupération des documents:', error);
    return res.status(500).json({ message: 'Erreur serveur' });
  }
};

export const createDocument = async (req: Request, res: Response) => {
  try {
    const { title, description, category, fileUrl, fileType, fileSize } = req.body;

    if (!title || (!fileUrl && !req.file)) {
      return res.status(400).json({ message: 'Titre et fichier requis' });
    }

    const document = await prisma.document.create({
      data: {
        title,
        description,
        category: category || 'Public',
        fileUrl: req.file ? `/uploads/${req.file.filename}` : fileUrl,
        fileType: req.file ? req.file.mimetype : fileType,
        fileSize: req.file ? `${(req.file.size / 1024 / 1024).toFixed(2)} MB` : fileSize,
      },
    });

    return res.status(201).json(document);
  } catch (error) {
    console.error('Erreur lors de la création du document:', error);
    return res.status(500).json({ message: 'Erreur serveur' });
  }
};

export const deleteDocument = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.document.delete({ where: { id } });
    return res.json({ message: 'Document supprimé avec succès' });
  } catch (error) {
    console.error('Erreur lors de la suppression du document:', error);
    return res.status(500).json({ message: 'Erreur serveur' });
  }
};

// Upload standalone file (PDF/DOC) — utilisé pour les dossiers d'AO
export const uploadFile = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Aucun fichier reçu' });
    }
    const url = `/uploads/${req.file.filename}`;
    return res.json({ url, filename: req.file.originalname, size: req.file.size });
  } catch (error) {
    console.error('Erreur upload fichier:', error);
    return res.status(500).json({ message: 'Erreur serveur' });
  }
};
