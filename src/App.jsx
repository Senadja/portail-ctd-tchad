/* App.jsx — Portail CTD
   Commission Technique du Désengagement */

import React, { useState, useEffect } from 'react';
import { GovHeader, GovFooter } from './chrome';
import { HomePage } from './page-home';
import { TrackerPage } from './page-tracker';
import { NewsListPage, ArticlePage } from './page-news';
import { DocumentationPage } from './page-documentation';
import { AppelsOffresPage } from './page-appels-offres';
import { ServicesPage, ContactPage, InvestisseursPage } from './page-other';
import {
  PresentationPage,
  MotPresidentPage,
  MissionsPage,
  StructurePage,
  HistoriquePage,
} from './page-institution';
import { FlashInfoBand, ChatBubble } from './flash-chat';

function App() {
  const [route, setRoute] = useState('home');
  const [articleId, setArticleId] = useState(null);
  const [tenderId, setTenderId] = useState(null);
  const [contrast, setContrast] = useState('normal');
  const [textSize, setTextSize] = useState('base');
  const [lang, setLang] = useState('FR');

  useEffect(() => { document.documentElement.setAttribute('data-contrast', contrast); }, [contrast]);
  useEffect(() => { document.documentElement.setAttribute('data-text', textSize); }, [textSize]);

  // Met à jour le titre de la page selon la route
  useEffect(() => {
    const titles = {
      home: 'Accueil',
      'institution-presentation': 'Présentation',
      'institution-missions': 'Missions & Attributions',
      'institution-structure': 'Organisation',
      'institution-mot': 'Mot du Président',
      'institution-historique': 'Historique',
      'appels-offres': "Appels d'offres",
      actualites: 'Actualités',
      article: 'Article',
      documentation: 'Documents officiels',
      services: 'Services en ligne',
      investisseurs: 'Espace Investisseurs',
      contact: 'Contact',
      tracker: 'Suivre mon dossier',
    };
    const label = titles[route] || '';
    document.title = label
      ? `${label} | Commission Technique du Désengagement — Tchad`
      : 'Commission Technique du Désengagement | République du Tchad';
  }, [route]);

  const go = (r) => {
    if (r === 'institution') r = 'institution-presentation';
    setRoute(r);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const openArticle = (id) => {
    setArticleId(id);
    setRoute('article');
    window.scrollTo({ top: 0 });
  };

  const openTender = (id) => {
    setTenderId(id);
    setRoute('tender-detail');
    window.scrollTo({ top: 0 });
  };

  return (
    <>
      <a className="skip-link" href="#main">Aller au contenu principal</a>
      <GovHeader
        route={route}
        go={go}
        contrast={contrast}
        setContrast={setContrast}
        textSize={textSize}
        setTextSize={setTextSize}
        lang={lang}
        setLang={setLang}
      />

      {/* Pages publiques */}
      {route === 'home'                   && <HomePage go={go} openArticle={openArticle} openTender={openTender} />}
      {route === 'tracker'                && <TrackerPage go={go} />}
      {route === 'appels-offres'          && <AppelsOffresPage go={go} openTender={openTender} />}
      {route === 'actualites'             && <NewsListPage go={go} openArticle={openArticle} />}
      {route === 'article'                && <ArticlePage go={go} articleId={articleId} openArticle={openArticle} />}
      {route === 'documentation'          && <DocumentationPage go={go} />}
      {route === 'services'               && <ServicesPage go={go} />}
      {route === 'investisseurs'          && <InvestisseursPage go={go} />}
      {route === 'contact'                && <ContactPage go={go} />}

      {/* Pages institution CTD */}
      {route === 'institution-presentation' && <PresentationPage go={go} />}
      {route === 'institution-missions'     && <MissionsPage go={go} />}
      {route === 'institution-structure'    && <StructurePage go={go} />}
      {route === 'institution-mot'          && <MotPresidentPage go={go} />}
      {route === 'institution-historique'   && <HistoriquePage go={go} />}

      <GovFooter go={go} />
      <FlashInfoBand />
      <ChatBubble />
    </>
  );
}

export default App;
