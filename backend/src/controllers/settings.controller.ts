import { Request, Response } from 'express';
import prisma from '../lib/prisma';

const DEFAULT_PILLARS = JSON.stringify([
  { icon: 'Target',    title: 'Privatisation', description: 'Piloter les processus de cession des entreprises publiques et parapubliques' },
  { icon: 'Eye',       title: 'Transparence',  description: 'Garantir la régularité et l\'équité de toutes les opérations de désengagement' },
  { icon: 'Handshake', title: 'Partenariat',   description: 'Promouvoir les partenariats public-privé et l\'investissement au Tchad' },
]);

export const getSettings = async (req: Request, res: Response) => {
  try {
    let settings = await prisma.settings.findUnique({ where: { id: 'global' } });
    if (!settings) {
      settings = await prisma.settings.create({
        data: { id: 'global', aboutPillars: DEFAULT_PILLARS },
      });
    }
    // Ensure aboutPillars is always populated
    if (!settings.aboutPillars) {
      settings = await prisma.settings.update({
        where: { id: 'global' },
        data: { aboutPillars: DEFAULT_PILLARS },
      });
    }
    return res.json(settings);
  } catch (error) {
    console.error('Erreur settings GET:', error);
    return res.status(500).json({ message: 'Erreur serveur' });
  }
};

export const updateSettings = async (req: Request, res: Response) => {
  try {
    const {
      siteName, contactEmail, contactPhone, address, facebookUrl, linkedinUrl,
      headerTitle,
      heroTitle, heroSubtitle, heroImage, heroBadge, heroCta1Label, heroCta2Label,
      aboutSectionLabel, aboutTitle, aboutDescription, aboutCtaLabel,
      aboutImage1, aboutImage2, aboutPillars,
      presidentName, presidentTitle, presidentMessage, presidentImage,
      tenderStatuses, flashInfos,
      partners, projects, keyFigures, missions, services
    } = req.body;

    const data: any = {
      siteName, contactEmail, contactPhone, address, facebookUrl, linkedinUrl,
      headerTitle,
      heroTitle, heroSubtitle, heroImage, heroBadge, heroCta1Label, heroCta2Label,
      aboutSectionLabel, aboutTitle, aboutDescription, aboutCtaLabel,
      aboutImage1, aboutImage2,
      presidentName, presidentTitle, presidentMessage, presidentImage,
    };

    if (aboutPillars !== undefined) {
      data.aboutPillars = typeof aboutPillars === 'string'
        ? aboutPillars
        : JSON.stringify(aboutPillars);
    }
    
    if (tenderStatuses !== undefined) {
      data.tenderStatuses = typeof tenderStatuses === 'string'
        ? tenderStatuses
        : JSON.stringify(tenderStatuses);
    }

    if (flashInfos !== undefined) {
      data.flashInfos = typeof flashInfos === 'string'
        ? flashInfos
        : JSON.stringify(flashInfos);
    }

    const jsonFields = { partners, projects, keyFigures, missions, services };
    Object.entries(jsonFields).forEach(([key, value]) => {
      if (value !== undefined) {
        data[key] = typeof value === 'string' ? value : JSON.stringify(value);
      }
    });

    // Remove undefined fields so Prisma doesn't overwrite with null
    Object.keys(data).forEach(k => data[k] === undefined && delete data[k]);

    const settings = await prisma.settings.upsert({
      where: { id: 'global' },
      update: data,
      create: { id: 'global', aboutPillars: DEFAULT_PILLARS, ...data },
    });

    return res.json(settings);
  } catch (error) {
    console.error('Erreur settings PUT:', error);
    return res.status(500).json({ message: 'Erreur serveur' });
  }
};

export const uploadPresidentImage = async (req: Request, res: Response) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'Aucun fichier téléchargé' });
    return res.json({ url: `/uploads/${req.file.filename}` });
  } catch (error) {
    return res.status(500).json({ message: 'Erreur serveur' });
  }
};
