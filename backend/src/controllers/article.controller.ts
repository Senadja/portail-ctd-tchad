import { Request, Response } from 'express';
import prisma from '../lib/prisma';

const generateSlug = (title: string) => {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

export const getArticles = async (req: Request, res: Response) => {
  try {
    const { category, published } = req.query;
    
    const where: any = {};
    if (category) where.category = category;
    if (published !== undefined) where.published = published === 'true';

    const articles = await prisma.article.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
    
    return res.json(articles);
  } catch (error) {
    console.error('Erreur lors de la récupération des articles:', error);
    return res.status(500).json({ message: 'Erreur serveur' });
  }
};

export const getArticleBySlug = async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;
    const article = await prisma.article.findUnique({
      where: { slug },
    });

    if (!article) {
      return res.status(404).json({ message: 'Article non trouvé' });
    }

    return res.json(article);
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'article:', error);
    return res.status(500).json({ message: 'Erreur serveur' });
  }
};

export const createArticle = async (req: Request, res: Response) => {
  try {
    const { title, content, excerpt, author, image, category, published } = req.body;

    if (!title || !content) {
      return res.status(400).json({ message: 'Titre et contenu requis' });
    }

    let slug = generateSlug(title);
    
    // Vérifier si le slug existe déjà
    const existing = await prisma.article.findUnique({ where: { slug } });
    if (existing) {
      slug = `${slug}-${Date.now()}`;
    }

    const article = await prisma.article.create({
      data: {
        title,
        content,
        excerpt: excerpt || null,
        author: author || 'CTD',
        image,
        category,
        published: published || false,
        slug,
      },
    });

    return res.status(201).json(article);
  } catch (error) {
    console.error('Erreur lors de la création de l\'article:', error);
    return res.status(500).json({ message: 'Erreur serveur' });
  }
};

export const updateArticle = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { title, content, excerpt, author, image, category, published } = req.body;

    const data: any = { title, content, image, category, published };
    if (excerpt !== undefined) data.excerpt = excerpt;
    if (author  !== undefined) data.author  = author;
    
    if (title) {
      data.slug = generateSlug(title);
    }

    const article = await prisma.article.update({
      where: { id },
      data,
    });

    return res.json(article);
  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'article:', error);
    return res.status(500).json({ message: 'Erreur serveur' });
  }
};

export const deleteArticle = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.article.delete({
      where: { id },
    });
    return res.json({ message: 'Article supprimé avec succès' });
  } catch (error) {
    console.error('Erreur lors de la suppression de l\'article:', error);
    return res.status(500).json({ message: 'Erreur serveur' });
  }
};
