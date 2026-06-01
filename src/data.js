/* ================================================================
   Portail CTD — Commission Technique du Désengagement
   Données statiques de base & fallbacks
   Les données dynamiques (actualités, AO, documents) sont chargées
   depuis l'API backend (visionary-blueprint/server — port 5015)
   ================================================================ */

/* ─── Actualités (fallback statique) ───────────────────────── */
export const NEWS = [
  {
    id: 'n1',
    cat: 'communique',
    catLabel: 'Communiqué',
    date: '21 mai 2026',
    dateShort: '21 MAI',
    title: 'Lancement du processus de cession de COTON TCHAD',
    excerpt: 'La Commission Technique du Désengagement a officiellement lancé le processus de privatisation de COTON TCHAD. Un avis d\'appel à manifestation d\'intérêt sera publié avant fin juin 2026, invitant les investisseurs nationaux et internationaux à soumettre leurs offres.',
    author: 'Secrétariat Technique CTD',
    readTime: '3 min de lecture',
    category: 'Actualité',
  },
  {
    id: 'n2',
    cat: 'evenement',
    catLabel: 'Événement',
    date: '18 mai 2026',
    dateShort: '18 MAI',
    title: 'Forum des Investisseurs — Opportunités de désengagement au Tchad',
    excerpt: 'La CTD a organisé un forum réunissant plus de 200 investisseurs nationaux et internationaux autour des opportunités de privatisation dans les secteurs de l\'agro-industrie, des télécommunications et des infrastructures de transport.',
    author: 'Direction des Partenariats et Investissements',
    readTime: '4 min de lecture',
    category: 'Événement',
  },
  {
    id: 'n3',
    cat: 'appel',
    catLabel: "Appel d'offres",
    date: '14 mai 2026',
    dateShort: '14 MAI',
    title: "Appel à manifestation d'intérêt — Privatisation de l'ONPT",
    excerpt: 'Dans le cadre du désengagement de l\'État du secteur des télécommunications, la CTD lance un appel à manifestation d\'intérêt pour la cession partielle ou totale de l\'Office National des Postes et Télécommunications.',
    author: 'Direction des Opérations de Cession',
    readTime: '5 min de lecture',
    category: "Appel d'offres",
  },
  {
    id: 'n4',
    cat: 'resultat',
    catLabel: 'Résultat',
    date: '10 mai 2026',
    dateShort: '10 MAI',
    title: 'Clôture réussie de la cession de la STT — Société Tchadienne de Transport',
    excerpt: 'La Commission annonce la finalisation de la cession de 70% du capital de la STT à un consortium d\'investisseurs régionaux. Cette opération s\'inscrit dans la dynamique de modernisation du secteur logistique national.',
    author: 'Présidence de la Commission',
    readTime: '3 min de lecture',
    category: 'Résultat',
  },
  {
    id: 'n5',
    cat: 'communique',
    catLabel: 'Communiqué',
    date: '05 mai 2026',
    dateShort: '05 MAI',
    title: 'Partenariat stratégique CTD — Banque Africaine de Développement',
    excerpt: 'La CTD et la BAD ont signé un accord de coopération technique visant à renforcer les capacités institutionnelles de la Commission et à accompagner le programme de réformes structurelles du secteur public tchadien.',
    author: 'Direction Administrative et Financière',
    readTime: '2 min de lecture',
    category: 'Actualité',
  },
  {
    id: 'n6',
    cat: 'evenement',
    catLabel: 'Événement',
    date: '28 avril 2026',
    dateShort: '28 AVR',
    title: 'Atelier de formation sur les procédures de soumission en ligne',
    excerpt: 'La Commission a organisé un atelier à destination des opérateurs économiques pour les accompagner dans l\'utilisation du nouveau portail de soumission électronique des offres. Près de 150 entreprises ont participé à cette formation.',
    author: 'Direction des Études et Stratégies',
    readTime: '3 min de lecture',
    category: 'Événement',
  },
];

/* ─── Services en ligne ────────────────────────────────────── */
export const SERVICES = [
  {
    n: '01',
    title: "Consultation des appels d'offres",
    desc: "Accédez en temps réel à tous les avis d'appels d'offres ouverts et consultez les dossiers d'appel d'offres (DAO) disponibles au téléchargement.",
  },
  {
    n: '02',
    title: 'Téléchargement des DAO',
    desc: 'Téléchargez gratuitement les dossiers d\'appel d\'offres, les cahiers des charges et les documents techniques relatifs aux opérations de cession en cours.',
  },
  {
    n: '03',
    title: 'Inscription des investisseurs',
    desc: 'Créez votre profil investisseur et accédez à des informations privilégiées sur les opportunités de désengagement. Service réservé aux opérateurs enregistrés.',
  },
  {
    n: '04',
    title: "Soumission d'offres en ligne",
    desc: 'Déposez vos manifestations d\'intérêt et vos offres directement via notre plateforme sécurisée. Suivi en temps réel de l\'état de votre dossier.',
  },
  {
    n: '05',
    title: "Demande d'informations",
    desc: 'Formulez vos questions relatives aux opérations de privatisation, aux procédures de cession ou aux critères de participation. Réponse sous 48 heures ouvrables.',
  },
  {
    n: '06',
    title: 'Prise de rendez-vous',
    desc: 'Planifiez une réunion avec les équipes de la Commission pour discuter de vos projets d\'investissement ou pour obtenir des clarifications techniques.',
  },
];

/* ─── Accès rapides ────────────────────────────────────────── */
export const QUICK = [
  { ic: 'doc', title: 'Appels d\'offres', desc: 'Consulter les AO en cours' },
  { ic: 'form', title: 'Télécharger un DAO', desc: 'Dossiers d\'appel d\'offres' },
  { ic: 'pay', title: 'Espace investisseur', desc: 'Inscription & opportunités' },
  { ic: 'appoint', title: 'Prendre rendez-vous', desc: 'Rencontrer la Commission' },
];

/* ─── Dossiers de soumission (fallback démo) ─────────────── */
export const DOSSIERS = {
  'CTD-2026-00142': {
    type: "Manifestation d'intérêt — Privatisation ONPT",
    ref: 'CTD-2026-00142',
    deposit: '05 mai 2026',
    service: 'Direction des Opérations de Cession',
    deadline: '20 juin 2026',
    status: 'progress',
    statusLabel: 'En cours d\'évaluation',
    steps: [
      {
        state: 'done',
        title: 'Réception du dossier',
        desc: 'Votre manifestation d\'intérêt a été réceptionnée et enregistrée. Un accusé de réception électronique vous a été transmis.',
        date: '05 mai 2026 — 10:14',
      },
      {
        state: 'done',
        title: 'Vérification de conformité',
        desc: 'Le secrétariat technique a vérifié la complétude du dossier. Toutes les pièces requises sont présentes.',
        date: '07 mai 2026 — 14:30',
      },
      {
        state: 'current',
        title: 'Évaluation technique et financière',
        desc: 'Votre dossier est en cours d\'examen par la Direction des Opérations de Cession. L\'analyse technique et financière est en cours.',
        date: 'En cours depuis le 10 mai',
      },
      {
        state: 'pending',
        title: 'Délibération du Comité de pilotage',
        desc: 'Le Comité de pilotage statuera sur la liste des soumissionnaires retenus pour la phase suivante.',
        date: 'Prévu le 15 juin 2026',
      },
      {
        state: 'pending',
        title: 'Notification des résultats',
        desc: 'Les soumissionnaires seront notifiés par écrit des décisions du Comité.',
        date: 'Prévu le 20 juin 2026',
      },
    ],
  },
  'CTD-2026-00089': {
    type: "Offre de reprise — Société Tchadienne du Coton",
    ref: 'CTD-2026-00089',
    deposit: '15 avril 2026',
    service: 'Direction Juridique et Conformité',
    deadline: 'Complément requis',
    status: 'review',
    statusLabel: 'Complément requis',
    steps: [
      {
        state: 'done',
        title: 'Réception du dossier',
        desc: 'Dossier réceptionné au secrétariat technique.',
        date: '15 avril 2026 — 09:45',
      },
      {
        state: 'done',
        title: 'Vérification de conformité',
        desc: 'Contrôle administratif effectué.',
        date: '17 avril 2026 — 11:00',
      },
      {
        state: 'current',
        title: 'Demande de complément',
        desc: 'Un justificatif de capacité financière actualisé (bilan 2025 certifié) est requis. Merci de le transmettre dans un délai de 10 jours ouvrables.',
        date: '22 avril 2026 — 15:20',
      },
      {
        state: 'pending',
        title: 'Analyse technique',
        desc: 'Examen approfondi par les directions compétentes.',
        date: 'À venir',
      },
      {
        state: 'pending',
        title: 'Décision finale',
        desc: 'Notification de la décision au soumissionnaire.',
        date: 'À préciser',
      },
    ],
  },
  'CTD-2026-00203': {
    type: "Demande d'information — Partenariat Public-Privé ONEA",
    ref: 'CTD-2026-00203',
    deposit: '18 mai 2026',
    service: 'Direction des Partenariats et Investissements',
    deadline: 'Traité',
    status: 'done',
    statusLabel: 'Dossier traité',
    steps: [
      {
        state: 'done',
        title: 'Réception de la demande',
        desc: 'Demande d\'information enregistrée.',
        date: '18 mai 2026 — 08:55',
      },
      {
        state: 'done',
        title: 'Prise en charge',
        desc: 'Demande attribuée à la Direction des Partenariats.',
        date: '19 mai 2026 — 10:00',
      },
      {
        state: 'done',
        title: 'Préparation de la réponse',
        desc: 'Documentation et note d\'information rédigées.',
        date: '20 mai 2026 — 16:30',
      },
      {
        state: 'done',
        title: 'Envoi de la réponse',
        desc: 'Réponse transmise par courriel avec les documents annexes.',
        date: '21 mai 2026 — 09:15',
      },
    ],
  },
};

/* ─── Documents officiels (fallback statique) ───────────────── */
export const DOCUMENTS = [
  {
    id: 'd1',
    type: 'decret',
    typeLabel: 'Décret',
    ref: 'N°2026-0112/PR/PM',
    date: '12 mai 2026',
    title: 'Décret portant organisation et attributions de la CTD',
    summary: 'Définit le cadre légal, les missions, la composition et le fonctionnement de la Commission Technique du Désengagement.',
    pages: 18,
    size: '980 Ko',
    category: 'Textes réglementaires',
  },
  {
    id: 'd2',
    type: 'rapport',
    typeLabel: 'Rapport',
    ref: 'RAP-CTD-2025-ANNUEL',
    date: '30 avril 2026',
    title: "Rapport annuel d'activités CTD — Exercice 2025",
    summary: 'Bilan complet des opérations de désengagement, indicateurs de performance et perspectives pour 2026.',
    pages: 96,
    size: '5.2 Mo',
    category: 'Rapports',
  },
  {
    id: 'd3',
    type: 'guide',
    typeLabel: 'Guide',
    ref: 'GUIDE-INV-2026-V2',
    date: '15 avril 2026',
    title: "Guide de l'investisseur — Procédures de privatisation au Tchad",
    summary: 'Manuel complet des procédures, critères de participation et étapes clés pour les investisseurs souhaitant participer aux opérations de cession.',
    pages: 42,
    size: '2.1 Mo',
    category: 'Guides investisseurs',
  },
  {
    id: 'd4',
    type: 'dao',
    typeLabel: 'DAO',
    ref: 'DAO-ONPT-2026-001',
    date: '14 mai 2026',
    title: "Dossier d'appel d'offres — Cession de l'ONPT",
    summary: 'Dossier complet incluant le cahier des charges technique, les conditions financières de participation et le calendrier de la procédure.',
    pages: 74,
    size: '3.8 Mo',
    category: 'DAO',
  },
  {
    id: 'd5',
    type: 'etude',
    typeLabel: 'Étude',
    ref: 'ETU-SECT-2026-T1',
    date: '05 avril 2026',
    title: 'Étude sectorielle — Potentiel de privatisation des entreprises agro-industrielles',
    summary: 'Analyse du potentiel de désengagement dans le secteur agro-industriel, avec cartographie des entreprises et recommandations stratégiques.',
    pages: 58,
    size: '4.4 Mo',
    category: 'Études sectorielles',
  },
  {
    id: 'd6',
    type: 'formulaire',
    typeLabel: 'Formulaire',
    ref: 'FORM-MI-2026',
    date: '01 mars 2026',
    title: "Formulaire de manifestation d'intérêt standard",
    summary: 'Formulaire officiel à remplir pour toute manifestation d\'intérêt dans le cadre des opérations de privatisation.',
    pages: 8,
    size: '380 Ko',
    category: 'Formulaires',
  },
  {
    id: 'd7',
    type: 'loi',
    typeLabel: 'Loi',
    ref: 'LOI-N°008/PR/2022',
    date: '20 mars 2022',
    title: 'Loi portant cadre général du désengagement de l\'État des entreprises publiques',
    summary: 'Texte fondateur définissant les principes, les modalités et les garanties applicables aux opérations de privatisation au Tchad.',
    pages: 34,
    size: '1.6 Mo',
    category: 'Textes réglementaires',
  },
  {
    id: 'd8',
    type: 'rapport',
    typeLabel: 'Rapport',
    ref: 'RAP-CTD-2026-T1',
    date: '31 mars 2026',
    title: 'Rapport trimestriel — Avancement des opérations T1 2026',
    summary: 'État d\'avancement des opérations de désengagement en cours au premier trimestre 2026.',
    pages: 28,
    size: '1.9 Mo',
    category: 'Rapports',
  },
];

/* ─── Partenaires & Investisseurs ──────────────────────────── */
export const PARTNERS = [
  { name: 'Banque Africaine de Développement', short: 'BAD', url: 'https://www.afdb.org', color: '#1F5C1F', mark: 'acacia' },
  { name: 'Banque Mondiale', short: 'BM', url: 'https://www.worldbank.org', color: '#0E2A5E', mark: 'tower' },
  { name: 'Société Financière Internationale', short: 'IFC', url: 'https://www.ifc.org', color: '#B81E2C', mark: 'globe' },
  { name: 'Agence Française de Développement', short: 'AFD', url: 'https://www.afd.fr', color: '#0E2A5E', mark: 'tricolor' },
  { name: 'Fonds Monétaire International', short: 'FMI', url: 'https://www.imf.org', color: '#3A3A3A', mark: 'scale' },
  { name: 'Union Africaine', short: 'UA', url: 'https://au.int', color: '#1F5C1F', mark: 'globe' },
  { name: 'Communauté Économique des États d\'Afrique Centrale', short: 'CEEAC', url: 'https://www.ceeac-eccas.org', color: '#7A5A0E', mark: 'circle' },
  { name: 'CEMAC', short: 'CEMAC', url: 'https://www.cemac.int', color: '#1F5C1F', mark: 'circle' },
  { name: 'Agence Nationale des Investissements', short: 'ANIE', url: '#', color: '#C8961E', mark: 'growth' },
  { name: 'Programme des Nations Unies pour le Développement', short: 'PNUD', url: 'https://www.undp.org', color: '#1F5C8C', mark: 'olive' },
  { name: 'GIZ Coopération Allemande', short: 'GIZ', url: 'https://www.giz.de', color: '#3A3A3A', mark: 'gear' },
  { name: 'USAID', short: 'USAID', url: 'https://www.usaid.gov', color: '#1F5C8C', mark: 'hands' },
];

/* ─── Portefeuille de désengagement (projets) ──────────────── */
export const PROJECTS = [
  {
    id: 'p1',
    status: 'ongoing',
    statusLabel: 'En cours',
    title: 'Privatisation de l\'ONPT — Office National des Postes et Télécommunications',
    period: '2025 — 2027',
    budget: 'N/A',
    partner: 'Banque Mondiale',
    progress: 35,
    sector: 'Télécommunications',
    desc: 'Processus de désengagement partiel de l\'État dans le capital de l\'ONPT pour ouvrir le secteur à la concurrence et attirer des investissements technologiques.',
  },
  {
    id: 'p2',
    status: 'ongoing',
    statusLabel: 'En cours',
    title: 'Concession de la gestion des aéroports régionaux',
    period: '2026 — 2028',
    budget: 'N/A',
    partner: 'IFC',
    progress: 18,
    sector: 'Infrastructures',
    desc: 'Mise en concession de 5 aéroports régionaux à des opérateurs privés spécialisés pour améliorer la qualité de service et désengorger le budget de l\'État.',
  },
  {
    id: 'p3',
    status: 'completed',
    statusLabel: 'Achevé',
    title: 'Cession de la Société Tchadienne de Transport (STT)',
    period: '2023 — 2026',
    budget: 'N/A',
    partner: 'BAD',
    progress: 100,
    sector: 'Logistique & Transport',
    desc: 'Transfert réussi de 70% du capital de la STT à un consortium d\'investisseurs régionaux. Opération finalisée en mai 2026.',
  },
  {
    id: 'p4',
    status: 'ongoing',
    statusLabel: 'En cours',
    title: 'Restructuration de COTON TCHAD',
    period: '2025 — 2028',
    budget: 'N/A',
    partner: 'AFD',
    progress: 42,
    sector: 'Agro-industrie',
    desc: 'Processus de privatisation de la filière coton incluant une phase d\'audit, la valorisation des actifs et la sélection d\'un investisseur stratégique.',
  },
  {
    id: 'p5',
    status: 'planned',
    statusLabel: 'Programmé',
    title: 'Partenariat Public-Privé — Distribution d\'eau potable (ONEA)',
    period: 'Lancement 2027',
    budget: 'N/A',
    partner: 'PNUD',
    progress: 0,
    sector: 'Services publics',
    desc: 'Étude de faisabilité en cours pour un PPP dans la distribution d\'eau potable, visant à étendre l\'accès aux zones rurales.',
  },
  {
    id: 'p6',
    status: 'ongoing',
    statusLabel: 'En cours',
    title: 'Désengagement du secteur hôtelier — Hôtels publics',
    period: '2024 — 2026',
    budget: 'N/A',
    partner: 'ANIE',
    progress: 68,
    sector: 'Tourisme & Hôtellerie',
    desc: 'Cession des établissements hôteliers publics à des opérateurs privés spécialisés dans le cadre de la stratégie de développement touristique.',
  },
];

/* ─── Chiffres-clés CTD ────────────────────────────────────── */
export const KEY_FIGURES = [
  { num: '6', sup: '+', label: 'Opérations en cours' },
  { num: '14', sup: '', label: 'Secteurs concernés' },
  { num: '3', sup: '+', label: 'Cessions finalisées' },
  { num: '85', sup: 'M$', label: 'Investissements mobilisés' },
];

/* ─── Missions CTD ─────────────────────────────────────────── */
export const MISSIONS_CTD = [
  { n: '01', title: 'Identification des entreprises', desc: 'Identifier et cartographier les entreprises publiques et parapubliques concernées par le processus de désengagement de l\'État.' },
  { n: '02', title: 'Stratégies de privatisation', desc: 'Élaborer et mettre en œuvre les stratégies adaptées à chaque opération de privatisation, de concession ou de partenariat.' },
  { n: '03', title: 'Audits techniques, financiers & juridiques', desc: 'Conduire les audits nécessaires à la valorisation exacte des entreprises et à la sécurisation des transactions.' },
  { n: '04', title: "Organisation des appels d'offres", desc: "Organiser les appels d'offres pour la cession des actifs publics dans le respect des procédures de transparence et de mise en concurrence." },
  { n: '05', title: 'Transparence des procédures', desc: 'Assurer la transparence, la régularité et l\'équité de toutes les procédures de désengagement conformément aux standards internationaux.' },
  { n: '06', title: 'Supervision des transferts', desc: 'Superviser les opérations de transfert de propriété et garantir le respect des engagements des acquéreurs.' },
  { n: '07', title: 'Suivi post-cession', desc: 'Assurer le suivi des engagements contractuels post-cession et veiller à la bonne exécution des cahiers des charges.' },
  { n: '08', title: 'Conseil au Gouvernement', desc: 'Conseiller le Gouvernement sur les politiques de désengagement et contribuer à l\'amélioration du cadre réglementaire.' },
  { n: '09', title: 'Promotion des PPP', desc: 'Promouvoir les partenariats public-privé (PPP) comme modèle de développement des infrastructures et des services publics.' },
];

/* ─── Directions CTD ───────────────────────────────────────── */
export const DIRECTIONS = [
  {
    name: 'Président de la Commission',
    role: 'Direction stratégique',
    desc: 'Pilote l\'ensemble des activités de la Commission et représente la CTD auprès du Gouvernement et des partenaires.',
    isTop: true,
  },
  {
    name: 'Comité de Pilotage',
    role: 'Gouvernance',
    desc: 'Organe de décision stratégique qui valide les orientations, les procédures et les résultats des opérations de désengagement.',
  },
  {
    name: 'Secrétariat Technique',
    role: 'Coordination opérationnelle',
    desc: 'Assure la coordination quotidienne des activités de la Commission et le suivi administratif des dossiers.',
  },
  {
    name: 'Direction des Études et Stratégies',
    role: 'Études & Prospective',
    desc: 'Élabore les politiques de désengagement, réalise les études préalables et propose les modèles de cession adaptés à chaque secteur.',
  },
  {
    name: 'Direction des Opérations de Cession',
    role: 'Opérations',
    desc: "Organise et supervise les processus de privatisation et de cession des actifs, de l'appel d'offres jusqu'au transfert de propriété.",
  },
  {
    name: 'Direction Juridique et Conformité',
    role: 'Juridique',
    desc: 'Garantit la conformité juridique de toutes les opérations et sécurise les transactions par une veille réglementaire permanente.',
  },
  {
    name: 'Direction des Partenariats et Investissements',
    role: 'Partenariats',
    desc: 'Développe les relations avec les investisseurs nationaux et internationaux et promeut les opportunités de partenariat public-privé.',
  },
  {
    name: 'Direction Administrative et Financière',
    role: 'Administration',
    desc: 'Assure la gestion interne des ressources humaines, financières et logistiques de la Commission.',
  },
];

/* ─── Flash Infos (fallback — à terme depuis API/CMS) ─────── */
export const FLASH_INFOS = [
  {
    severity: 'info',
    label: 'Appel d\'offres',
    text: 'Ouverture des offres — AO ONPT : La séance publique d\'ouverture des plis aura lieu le 15 juin 2026 au siège de la CTD.',
  },
  {
    severity: 'success',
    label: 'Résultat',
    text: 'Privatisation STT finalisée : La cession de 70% du capital de la Société Tchadienne de Transport a été officiellement clôturée.',
  },
  {
    severity: 'warning',
    label: 'Date limite',
    text: 'Clôture des manifestations d\'intérêt — COTON TCHAD : Date limite de dépôt fixée au 30 juin 2026 à 16h00.',
  },
  {
    severity: 'info',
    label: 'Nouveau guide',
    text: 'Mise à jour du Guide de l\'investisseur (V2) disponible en téléchargement dans la section Documents.',
  },
  {
    severity: 'danger',
    label: 'Avis important',
    text: 'Report de la séance publique AO-2026-004 au 25 juin 2026 pour raisons techniques. Les soumissionnaires seront notifiés par voie officielle.',
  },
];

/* ─── Export groupé ────────────────────────────────────────── */
export const PortalData = {
  NEWS,
  SERVICES,
  QUICK,
  DOSSIERS,
  DOCUMENTS,
  PARTNERS,
  PROJECTS,
  KEY_FIGURES,
  MISSIONS_CTD,
  DIRECTIONS,
  FLASH_INFOS,
};
