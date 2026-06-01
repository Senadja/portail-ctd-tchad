import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Récupérer le contenu d'une page par ID
export const getPageContent = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const page = await prisma.pageContent.findUnique({
      where: { id },
    });

    if (!page) {
      return res.status(404).json({ message: 'Page introuvable' });
    }

    res.json(page);
  } catch (error) {
    console.error('Erreur getPageContent:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération du contenu de la page' });
  }
};

// Récupérer toutes les pages (pour le CMS)
export const getAllPages = async (req: Request, res: Response) => {
  try {
    const pages = await prisma.pageContent.findMany({
      orderBy: { id: 'asc' },
    });
    res.json(pages);
  } catch (error) {
    console.error('Erreur getAllPages:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des pages' });
  }
};

// Mettre à jour le contenu d'une page (CMS)
export const updatePageContent = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { title, sections } = req.body;

    const updatedPage = await prisma.pageContent.update({
      where: { id },
      data: {
        title,
        sections,
      },
    });

    res.json(updatedPage);
  } catch (error) {
    console.error('Erreur updatePageContent:', error);
    res.status(500).json({ error: 'Erreur lors de la mise à jour de la page' });
  }
};
