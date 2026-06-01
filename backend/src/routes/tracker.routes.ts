// Route tracker — GET /api/tracker/:ref
// Recherche une soumission par référence d'appel d'offres ou identifiant

import { Router } from 'express';
import prisma from '../lib/prisma';

const router = Router();

/**
 * GET /api/tracker/:ref
 * Cherche une soumission (TenderSubmission) par id partiel ou référence de l'appel
 * Format attendu : CTD-2026-XXXXX
 */
router.get('/:ref', async (req, res) => {
  const { ref } = req.params;

  try {
    const submission = await prisma.tenderSubmission.findFirst({
      where: {
        OR: [
          { id: { contains: ref.replace(/CTD-\d{4}-/i, '') } },
          { tender: { reference: { contains: ref } } },
        ],
      },
      include: {
        tender: {
          select: { reference: true, title: true, status: true, deadline: true },
        },
      },
    });

    if (!submission) {
      return res.status(404).json({ message: 'Dossier introuvable', ref });
    }

    const steps = [
      {
        state: 'done',
        title: 'Réception de la soumission',
        desc: "Votre soumission a été reçue et enregistrée dans notre système.",
        date: new Date(submission.submittedAt).toLocaleDateString('fr-FR', {
          day: 'numeric', month: 'long', year: 'numeric',
        }),
      },
      {
        state: submission.status !== 'REÇUE' ? 'done' : 'pending',
        title: 'Vérification de conformité',
        desc: "Contrôle de la complétude du dossier et de l'éligibilité du soumissionnaire.",
        date: submission.status !== 'REÇUE' ? 'Effectué' : 'En attente',
      },
      {
        state: submission.status === 'EN_EVALUATION'
          ? 'current'
          : (submission.status === 'RETENUE' || submission.status === 'REJETÉE' ? 'done' : 'pending'),
        title: 'Évaluation technique et financière',
        desc: 'Examen approfondi de votre offre par les directions compétentes de la CTD.',
        date: submission.status === 'EN_EVALUATION'
          ? 'En cours'
          : (submission.status === 'RETENUE' || submission.status === 'REJETÉE' ? 'Effectuée' : 'À venir'),
      },
      {
        state: submission.status === 'RETENUE'
          ? 'done'
          : (submission.status === 'REJETÉE' ? 'rejected' : 'pending'),
        title: 'Décision du Comité de pilotage',
        desc: 'Délibération et décision finale sur les soumissions retenues.',
        date: (submission.status === 'RETENUE' || submission.status === 'REJETÉE')
          ? 'Effectuée'
          : `Prévu avant ${submission.tender?.deadline
              ? new Date(submission.tender.deadline).toLocaleDateString('fr-FR')
              : 'N/A'}`,
      },
    ];

    const statusMap: Record<string, { status: string; statusLabel: string }> = {
      'REÇUE':         { status: 'progress', statusLabel: 'Reçue — en attente de traitement' },
      'EN_EVALUATION': { status: 'progress', statusLabel: "En cours d'évaluation" },
      'RETENUE':       { status: 'done',     statusLabel: 'Soumission retenue ✓' },
      'REJETÉE':       { status: 'review',   statusLabel: 'Non retenue' },
    };

    const statusInfo = statusMap[submission.status] ?? {
      status: 'progress',
      statusLabel: submission.status,
    };

    return res.json({
      ref,
      type: `Soumission — ${submission.tender?.title ?? "Appel d'offres CTD"}`,
      deposit: new Date(submission.submittedAt).toLocaleDateString('fr-FR', {
        day: 'numeric', month: 'long', year: 'numeric',
      }),
      service: 'Direction des Opérations de Cession',
      deadline: submission.tender?.deadline
        ? new Date(submission.tender.deadline).toLocaleDateString('fr-FR', {
            day: 'numeric', month: 'long', year: 'numeric',
          })
        : 'À préciser',
      status: statusInfo.status,
      statusLabel: statusInfo.statusLabel,
      steps,
      structure: submission.structureName,
    });
  } catch (error) {
    console.error('[TRACKER] Erreur:', error);
    return res.status(500).json({ message: 'Erreur serveur', ref });
  }
});

export default router;
