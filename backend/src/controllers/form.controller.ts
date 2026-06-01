import { Request, Response } from 'express';
import prisma from '../lib/prisma';

export const submitForm = async (req: Request, res: Response) => {
  try {
    const { type, data } = req.body;

    if (!type || !data) {
      return res.status(400).json({ message: 'Type et données du formulaire requis' });
    }

    const submission = await prisma.formSubmission.create({
      data: {
        type,
        data,
      },
    });

    return res.status(201).json(submission);
  } catch (error) {
    console.error('Erreur lors de la soumission du formulaire:', error);
    return res.status(500).json({ message: 'Erreur serveur' });
  }
};

export const getSubmissions = async (req: Request, res: Response) => {
  try {
    const { type } = req.query;
    const where: any = {};
    if (type) where.type = type as string;

    const submissions = await prisma.formSubmission.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
    return res.json(submissions);
  } catch (error) {
    console.error('Erreur lors de la récupération des formulaires:', error);
    return res.status(500).json({ message: 'Erreur serveur' });
  }
};

export const updateSubmissionStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const submission = await prisma.formSubmission.update({
      where: { id },
      data: { status },
    });

    return res.json(submission);
  } catch (error) {
    console.error('Erreur lors de la mise à jour du formulaire:', error);
    return res.status(500).json({ message: 'Erreur serveur' });
  }
};
