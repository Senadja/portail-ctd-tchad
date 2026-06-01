import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('admin123', 10);
  
  // 1. Admin
  const admin = await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      email: 'admin@ctd.td',
      password: hashedPassword,
      role: 'ADMIN',
    },
  });

  // 2. Settings
  await prisma.settings.upsert({
    where: { id: 'global' },
    update: {},
    create: {
      id: 'global',
      siteName: 'Commission Technique du Désengagement',
      contactEmail: 'contact@ctd.td',
      contactPhone: '+235 22 52 12 34',
      address: "Avenue Charles de Gaulle, BP 456, N'Djamena, Tchad",
      facebookUrl: 'https://facebook.com/ctdtchad',
      linkedinUrl: 'https://linkedin.com/company/ctdtchad',
    },
  });

  // 3. Articles (Actualités)
  const articles = [
    {
      title: "Lancement du Plan Stratégique 2026-2030",
      slug: "lancement-plan-strategique-2026-2030",
      content: "La CTD a officiellement présenté son nouveau plan stratégique visant à accélérer le désengagement de l'État des secteurs non régaliens. Ce plan prévoit la cession de 15 entités publiques sur 4 ans.",
      category: "Actualité",
      published: true,
    },
    {
      title: "Opportunités dans le secteur des Télécoms",
      slug: "opportunites-telecoms-tchad",
      content: "Une étude récente montre un potentiel de croissance de 15% par an dans le secteur numérique tchadien. La CTD recherche des partenaires stratégiques pour la modernisation des infrastructures.",
      category: "Opportunité",
      published: true,
    },
    {
      title: "Résultats de la cession de l'Hôtel du Chari",
      slug: "resultats-cession-hotel-chari",
      content: "Le processus de privatisation de l'Hôtel du Chari s'est clôturé avec succès. Le consortium retenu s'est engagé à investir 5 milliards de FCFA dans la rénovation complète du site.",
      category: "Résultat",
      published: true,
    },
    {
      title: "Partenariat avec la Banque Mondiale",
      slug: "partenariat-banque-mondiale-2026",
      content: "Un nouvel accord de support technique a été signé pour garantir la transparence totale des futures opérations de vente d'actifs de l'État.",
      category: "Actualité",
      published: true,
    },
  ];

  for (const a of articles) {
    await prisma.article.upsert({
      where: { slug: a.slug },
      update: {},
      create: a,
    });
  }

  // 4. Tenders (Appels d'offres)
  const tenders = [
    {
      reference: "AO-2026-001",
      title: "Cession des parts de l'État dans la Société Nationale des Transports",
      description: "Appel d'offres international pour la reprise de 60% du capital social de la SNT. Dossier complet disponible au siège de la CTD.",
      status: "Ouvert",
      deadline: new Date("2026-05-15"),
    },
    {
      reference: "AO-2026-002",
      title: "Privatisation de l'Huilerie de Moundou",
      description: "Vente d'unité de production industrielle incluant les équipements de transformation et le foncier rattaché.",
      status: "Ouvert",
      deadline: new Date("2026-06-30"),
    },
    {
      reference: "AO-2025-012",
      title: "Audit financier des actifs immobiliers de l'État",
      description: "Sélection d'un cabinet pour l'évaluation et l'audit du patrimoine immobilier destiné à la cession.",
      status: "Fermé",
      deadline: new Date("2026-01-10"),
    },
  ];

  for (const t of tenders) {
    await prisma.tender.upsert({
      where: { reference: t.reference },
      update: {},
      create: t,
    });
  }

  // 5. Documents
  const docs = [
    {
      title: "Loi de Privatisation du Tchad",
      category: "Textes",
      fileUrl: "/uploads/loi-privatisation.pdf",
      fileType: "application/pdf",
      fileSize: "1.5 MB",
    },
    {
      title: "Guide de l'Investisseur Étranger",
      category: "Guide",
      fileUrl: "/uploads/guide-investisseur.pdf",
      fileType: "application/pdf",
      fileSize: "2.8 MB",
    },
    {
      title: "Rapport Annuel CTD 2025",
      category: "Rapport",
      fileUrl: "/uploads/rapport-2025.pdf",
      fileType: "application/pdf",
      fileSize: "4.2 MB",
    },
  ];

  for (const d of docs) {
    await prisma.document.create({
      data: d
    });
  }

  console.log('Seed completed successfully');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
