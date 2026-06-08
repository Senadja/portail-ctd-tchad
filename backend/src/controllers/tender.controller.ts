import { Request, Response } from 'express';
import prisma from '../lib/prisma';

export const getTenders = async (req: Request, res: Response) => {
  try {
    const { status } = req.query;
    const where: any = {};
    if (status) where.status = status as string;

    const tenders = await prisma.tender.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
    return res.json(tenders);
  } catch (error) {
    console.error('Erreur lors de la récupération des appels d\'offres:', error);
    return res.status(500).json({ message: 'Erreur serveur' });
  }
};

export const createTender = async (req: Request, res: Response) => {
  try {
    const { reference, title, description, status, deadline, fileUrl, documents, customStatuses } = req.body;

    if (!reference || !title || !deadline) {
      return res.status(400).json({ message: 'Référence, titre et date limite requis' });
    }

    const tender = await prisma.tender.create({
      data: {
        reference,
        title,
        description,
        status: status || 'En cours',
        deadline: new Date(deadline),
        fileUrl,
        documents,
        customStatuses,
      },
    });

    return res.status(201).json(tender);
  } catch (error) {
    console.error('Erreur lors de la création de l\'appel d\'offres:', error);
    return res.status(500).json({ message: 'Erreur serveur' });
  }
};

export const updateTender = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { reference, title, description, status, deadline, fileUrl, documents, customStatuses } = req.body;

    const tender = await prisma.tender.update({
      where: { id },
      data: {
        reference,
        title,
        description,
        status,
        deadline: deadline ? new Date(deadline) : undefined,
        fileUrl,
        documents,
        customStatuses,
      },
    });

    return res.json(tender);
  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'appel d\'offres:', error);
    return res.status(500).json({ message: 'Erreur serveur' });
  }
};

export const deleteTender = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.tender.delete({ where: { id } });
    return res.json({ message: 'Appel d\'offres supprimé avec succès' });
  } catch (error) {
    console.error('Erreur lors de la suppression de l\'appel d\'offres:', error);
    return res.status(500).json({ message: 'Erreur serveur' });
  }
};

// ─── Soumissions ─────────────────────────────────────────────────────────────

export const getSubmissions = async (req: Request, res: Response) => {
  try {
    const { id } = req.params; // tenderId
    const tender = await prisma.tender.findUnique({ where: { id } });
    if (!tender) return res.status(404).json({ message: 'Appel d\'offres introuvable' });

    const submissions = await prisma.tenderSubmission.findMany({
      where: { tenderId: id },
      orderBy: { submittedAt: 'desc' },
    });
    return res.json(submissions);
  } catch (error) {
    console.error('[TENDER] getSubmissions error:', error);
    return res.status(500).json({ message: 'Erreur serveur' });
  }
};

export const patchSubmissionStatus = async (req: Request, res: Response) => {
  try {
    const { subId } = req.params;
    const { status } = req.body;

    const validStatuses = ['REÇUE', 'EN_EVALUATION', 'RETENUE', 'REJETÉE'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Statut invalide' });
    }

    const updated = await prisma.tenderSubmission.update({
      where: { id: subId },
      data: { status },
    });
    return res.json(updated);
  } catch (error) {
    console.error('[TENDER] patchSubmissionStatus error:', error);
    return res.status(500).json({ message: 'Erreur serveur' });
  }
};
