import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const pages = [
  {
    id: 'home',
    title: 'Page d\'Accueil',
    sections: {
      hero: {
        title: 'Piloter le désengagement, libérer la croissance.',
        subtitle: 'La Commission Technique du Désengagement accompagne la transformation économique du Tchad en facilitant la participation du secteur privé dans les entreprises publiques.',
      },
      about: {
        title: 'Au cœur de la transformation économique du Tchad',
        content: 'La Commission Technique du Désengagement (CTD) de la République du Tchad est la structure chargée d\'accompagner et de piloter le processus de désengagement de l\'État du capital des entreprises publiques et parapubliques. Elle joue un rôle stratégique dans la mise en œuvre des politiques de privatisation, de restructuration et de partenariat avec le secteur privé.',
      },
    },
  },
  {
    id: 'institution-presentation',
    title: 'Présentation de la CTD',
    sections: {
      banner: {
        title: 'Présentation de la CTD',
        lead: 'La Commission Technique du Désengagement, structure pivot de la modernisation économique du secteur public.',
      },
      content: '<p>La <strong>Commission Technique du Désengagement (CTD)</strong> est la structure chargée d\'accompagner et de piloter le processus de désengagement de l\'État du capital des entreprises publiques et parapubliques.</p>',
    },
  },
  {
    id: 'institution-missions',
    title: 'Missions & Attributions',
    sections: {
      banner: {
        title: 'Missions & Attributions',
        lead: 'Une mission claire pour la performance économique et la gouvernance.',
      },
      missions: [
        { title: 'Conception stratégique', desc: 'Concevoir et proposer au Gouvernement la politique générale en matière de désengagement de l\'État.' },
        { title: 'Évaluation des entreprises', desc: 'Réaliser ou faire réaliser l\'évaluation des entreprises publiques et parapubliques inscrites au programme de désengagement.' },
        { title: 'Élaboration des cahiers des charges', desc: 'Élaborer les dossiers d\'appels d\'offres et les cahiers des charges relatifs aux opérations de privatisation.' }
      ],
    },
  },
  {
    id: 'institution-organisation',
    title: 'Organisation',
    sections: {
      banner: {
        title: 'Structure & Organisation',
        lead: 'Une organisation agile, transparente et orientée vers les résultats.',
      },
      directions: [
        { name: 'Direction Générale', desc: 'Pilote la stratégie globale et coordonne l\'ensemble des opérations de désengagement.' },
        { name: 'Direction des Évaluations', desc: 'En charge des audits et de la valorisation financière des entreprises publiques.' }
      ]
    },
  },
  {
    id: 'institution-mot',
    title: 'Mot du Président',
    sections: {
      banner: {
        title: 'Mot du Président',
        lead: 'Message du Président de la Commission Technique du Désengagement.',
      },
      president: {
        name: 'Prénom Nom',
        title: 'Président de la CTD',
        message: '<p>Bienvenue sur le portail officiel de la Commission Technique du Désengagement.</p>',
        image: ''
      }
    },
  },
  {
    id: 'institution-historique',
    title: 'Historique',
    sections: {
      banner: {
        title: 'Notre Historique',
        lead: 'Les grandes étapes du processus de désengagement au Tchad.',
      },
      timeline: [
        { year: '1992', title: 'Création', desc: 'Mise en place des premières structures dédiées à la réforme des entreprises publiques.' },
        { year: '2024', title: 'Modernisation', desc: 'Lancement du nouveau portail et digitalisation complète des processus.' }
      ]
    },
  },
  {
    id: 'investisseurs',
    title: 'Espace Investisseurs',
    sections: {
      banner: {
        title: 'Espace Investisseurs - Opportunités',
      },
      content: 'La Commission Technique du Désengagement vous invite à découvrir les opportunités offertes par le programme national de privatisation.'
    },
  }
];

async function main() {
  console.log('Seeding page content...');
  for (const page of pages) {
    await prisma.pageContent.upsert({
      where: { id: page.id },
      update: {}, // Don't override if already exists
      create: {
        id: page.id,
        title: page.title,
        sections: page.sections,
      },
    });
  }
  console.log('Page content seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
