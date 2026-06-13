import { Request, Response } from 'express';
import prisma from '../lib/prisma';

// Get all organismes (returns a flat list, but we can structure it in the frontend or include children)
export const getOrganismes = async (req: Request, res: Response) => {
  try {
    const organismes = await prisma.organisme.findMany({
      orderBy: { order: 'asc' },
    });
    res.json(organismes);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la récupération des organismes', error });
  }
};

// Get the full tree (nested)
export const getOrganismeTree = async (req: Request, res: Response) => {
  try {
    const rootOrganismes = await prisma.organisme.findMany({
      where: { parentId: null },
      include: {
        children: {
          include: {
            children: {
              include: {
                children: true
              }
            }
          }
        }
      },
      orderBy: { order: 'asc' }
    });
    res.json(rootOrganismes);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la récupération de l\'arbre des organismes', error });
  }
};

// Create an organisme
export const createOrganisme = async (req: Request, res: Response) => {
  try {
    const { name, description, parentId, order } = req.body;
    const organisme = await prisma.organisme.create({
      data: {
        name,
        description,
        parentId: parentId || null,
        order: order || 0,
      },
    });
    res.status(201).json(organisme);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la création de l\'organisme', error });
  }
};

// Update an organisme
export const updateOrganisme = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, description, parentId, order } = req.body;
    const organisme = await prisma.organisme.update({
      where: { id },
      data: {
        name,
        description,
        parentId: parentId || null,
        order: order !== undefined ? order : undefined,
      },
    });
    res.json(organisme);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la mise à jour de l\'organisme', error });
  }
};

// Delete an organisme
export const deleteOrganisme = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.organisme.delete({
      where: { id },
    });
    res.json({ message: 'Organisme supprimé avec succès' });
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la suppression de l\'organisme', error });
  }
};
