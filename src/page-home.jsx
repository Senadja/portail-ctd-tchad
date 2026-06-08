/* Page d'accueil — Portail CTD
   Commission Technique du Désengagement */

import React, { useState, useEffect } from 'react';
import { NEWS, SERVICES, QUICK, PARTNERS, PROJECTS, KEY_FIGURES } from './data';
import { getArticles, getTenders, getSettings, getPageContent, useApi } from './api';
import { Icon } from './icons';
import { Marquee } from './marquee';
import { TenderRadialProgress } from './tender-progress';

/* ─── Hero banner ─────────────────────────────────────────── */
function HeroSection({ go, openArticle, openTender, articles, tenders }) {
  const top3 = articles?.length ? articles.slice(0, 3) : NEWS.slice(0, 3);
  const topTenders = tenders?.length ? tenders.slice(0, 2) : [];
  
  const { data: page } = useApi(() => getPageContent('home'), []);
  const heroContent = page?.sections?.hero || {
    title: 'Piloter le désengagement, libérer la croissance.',
    subtitle: 'La Commission Technique du Désengagement accompagne la transformation économique du Tchad en facilitant la participation du secteur privé dans les entreprises publiques.',
  };

  return (
    <section className="hero" aria-label="Section d'accueil">
      <div className="container">
        <div className="hero-grid">
          {/* Colonne gauche : hero principal */}
          <article className="hero-feature">
            <div className="feature-img">
              <div className="placeholder-stripe"></div>
              <img className="feature-watermark" src="/assets/armoiries-tchad.png" alt="" />
            </div>
            <div className="hero-feature-content">

              <h1>{heroContent.title}</h1>
              <p>{heroContent.subtitle}</p>
              <div className="hero-actions">
                <button className="btn btn-gold" onClick={() => go('institution-presentation')}>
                  Voir plus <Icon.arrowRight />
                </button>
              </div>
            </div>
          </article>

          {/* Colonne droite : fil actualité */}
          <aside className="hero-news" aria-label="Dernières actualités">
            <div className="hero-news-head">
              <h2><span className="live-pulse" aria-hidden="true"></span>Fil d'actualité</h2>
              <span className="meta">En direct</span>
            </div>
            <div className="hero-news-list">
              {top3.map((n, idx) => (
                <a key={n.id || idx} className="news-item" href="#"
                   onClick={(e)=>{e.preventDefault(); openArticle(n.id || n.slug);}}
                   aria-label={`Lire l'actualité : ${n.title}`}>
                  <div className="ni-meta">
                    <span className={`ni-cat ${n.cat || 'communique'}`}>{n.catLabel || n.category || 'Actualité'}</span>
                    <span>{n.date || new Date(n.createdAt).toLocaleDateString('fr-FR', {day:'numeric', month:'long', year:'numeric'})}</span>
                  </div>
                  <h3>{n.title}</h3>
                  <Icon.arrowRight className="ni-arrow" style={{width:18, height:18}} />
                </a>
              ))}
            </div>
            <div className="hero-news-foot">
              <a href="#" onClick={(e)=>{e.preventDefault(); go('actualites');}}>
                Toutes les actualités <Icon.arrowRight style={{width:14, height:14}}/>
              </a>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}

/* ─── Chiffres-clés ────────────────────────────────────────── */
function KeyFiguresSection({ go, keyFigures }) {
  // On ignore les données de l'API pour cette section afin de garantir le style et le texte souhaités par l'utilisateur
  const aboutContent = {
    vision: <span style={{color: 'var(--gold)', textTransform: 'uppercase', fontSize: '0.85rem', fontWeight: 600, letterSpacing: '0.05em', display: 'block', marginBottom: '8px'}}>Notre Vision</span>,
    title: "Au cœur de la transformation économique du Tchad",
    description: "La Commission Technique du Désengagement de la République du Tchad est la structure chargée d'accompagner et de piloter le processus de désengagement de l'État du capital des entreprises publiques et parapubliques. Elle joue un rôle stratégique dans la mise en œuvre des politiques de privatisation, de restructuration et de partenariat avec le secteur privé.",
  };

  return (
    <section className="section" style={{paddingTop: 16}} aria-label="Chiffres-clés de la Commission">
      <div className="container">
        <div className="mission">
          <div className="mission-left">
            {aboutContent.vision}
            <h3>{aboutContent.title}</h3>
            <p>{aboutContent.description}</p>
            <button className="btn btn-outline" style={{marginTop:20}} onClick={() => go('institution-presentation')}>
              Voir plus <Icon.arrowRight />
            </button>
          </div>
          <div className="mission-right">
            {keyFigures.map((f, i) => (
              <div key={i} className="mission-stat">
                <div className="num">{f.num}<sup>{f.sup}</sup></div>
                <div className="lbl">{f.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── Appels d'offres récents ────────────────────────────────── */
function TendersSection({ go, openTender, tenders, settings }) {
  const displayTenders = tenders.slice(0, 3);
  let customStatuses = [
    { label: "En cours", color: "#10b981", percentage: 25 },
    { label: "Clôturé", color: "#6b7280", percentage: 50 },
    { label: "Attribué", color: "#3b82f6", percentage: 100 },
  ];
  try {
    if (settings?.tenderStatuses) {
      const parsed = typeof settings.tenderStatuses === 'string' ? JSON.parse(settings.tenderStatuses) : settings.tenderStatuses;
      if (Array.isArray(parsed) && parsed.length > 0) customStatuses = parsed;
    }
  } catch {}

  if (!displayTenders.length) return null;

  return (
    <section className="section" aria-label="Appels d'offres en cours">
      <div className="container">
        <div className="section-head">
          <div>

            <h2>Appels d'offres en cours.</h2>
          </div>
          <div className="right">
            <button className="btn btn-outline" onClick={() => go('appels-offres')}>
              Tous les AO <Icon.arrowRight />
            </button>
          </div>
        </div>
        <div className="tenders-list">
          {displayTenders.map((t, i) => {
            const st = customStatuses.find(s => s.label === t.status) || customStatuses[0];
            let stages = [];
            try { stages = t.customStatuses ? JSON.parse(t.customStatuses) : []; } catch {}

            return (
              <article key={t.id || i} className="tender-row" onClick={() => openTender && openTender(t.id)}>
                <div className="tender-progress-circle">
                   <TenderRadialProgress stages={stages} fallbackProgress={st?.percentage || 0} fallbackColor={st?.color || '#10b981'} size={60} strokeWidth={5} />
                </div>
                <div className="tender-body">
                  <div className="tender-ref">{t.reference || `AO-2026-00${i+1}`}</div>
                  <h3>{t.title}</h3>
                  <p>{t.description?.substring(0, 120)}…</p>
                </div>
                <div className="tender-meta" style={{alignItems: 'flex-end'}}>
                  <span className="tender-deadline">
                    Clôture : {t.deadline ? new Date(t.deadline).toLocaleDateString('fr-FR', {day:'numeric', month:'long', year:'numeric'}) : 'À préciser'}
                  </span>
                  <div style={{fontSize: 11, color: st?.color || 'var(--gold)', marginTop: 4, fontWeight: 500}}>
                    Statut : {st?.label || t.status}
                  </div>
                </div>
                <Icon.arrowRight style={{width:18, height:18, flexShrink:0, color:'var(--ink-mute)', marginLeft: 15}} />
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ─── Services en ligne ────────────────────────────────────── */
function ServicesSection({ go, services }) {
  const topServices = services.slice(0, 3);
  return (
    <section className="section" aria-label="Services en ligne">
      <div className="container">
        <div className="section-head">
          <div>

            <h2>Les démarches les plus consultées.</h2>
          </div>
          <div className="right">
            <button className="btn btn-outline" onClick={() => go('services')}>
              Tous les services <Icon.arrowRight />
            </button>
          </div>
        </div>
        <div className="svc-grid">
          {topServices.map(s => (
            <article key={s.n} className="svc-card" onClick={() => go('services')}>
              <span className="num">{s.n} / 06</span>
              <h3>{s.title}</h3>
              <span className="more" style={{marginTop: 4}}>Accéder au service <Icon.arrowRight style={{width:14, height:14}}/></span>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Cercle de progression SVG ─────────────────────────────── */
function CircleProgress({ value = 0, size = 80, stroke = 7 }) {
  const radius = (size - stroke) / 2;
  const circ = 2 * Math.PI * radius;
  const offset = circ - (value / 100) * circ;
  const color = value === 100 ? '#1F5C1F' : value >= 60 ? '#B5860D' : value >= 30 ? '#0E2A5E' : '#6B7280';
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-label={`${value}% d'avancement`}>
      {/* Piste */}
      <circle
        cx={size / 2} cy={size / 2} r={radius}
        fill="none" stroke="var(--cream-warm)" strokeWidth={stroke}
      />
      {/* Arc rempli */}
      <circle
        cx={size / 2} cy={size / 2} r={radius}
        fill="none"
        stroke={color}
        strokeWidth={stroke}
        strokeDasharray={circ}
        strokeDashoffset={offset}
        strokeLinecap="round"
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
        style={{ transition: 'stroke-dashoffset 0.9s cubic-bezier(.4,0,.2,1)' }}
      />
      {/* Pourcentage centré */}
      <text
        x="50%" y="50%"
        dominantBaseline="central" textAnchor="middle"
        fontSize={size * 0.18} fontWeight="800"
        fontFamily="var(--sans)" fill={color}
      >
        {value}%
      </text>
    </svg>
  );
}

/* ─── Portefeuille de désengagement ─────────────────────────── */
function PortefeuilleSection({ go, projects }) {
  const ongoingProjects = projects.filter(p => p.status === 'ongoing').slice(0, 3);
  return (
    <section className="section" aria-label="Portefeuille de désengagement">
      <div className="container">
        <div className="section-head">
          <div>
            <h2>Portefeuille de désengagement en cours.</h2>
          </div>
          <div className="right">
            <button className="btn btn-ghost" style={{padding:'8px 14px', fontSize:13}} onClick={() => go('institution-structure')}>
              Voir tout <Icon.arrowRight style={{width:14, height:14}}/>
            </button>
          </div>
        </div>
        <div className="projects-grid">
          {ongoingProjects.map(p => (
            <article key={p.id} className="project-card">
              <div className="project-head">
                <span className="status-pill progress">{p.statusLabel}</span>
                <span className="project-period">{p.sector}</span>
              </div>
              <h3>{p.title}</h3>
              <p className="justify">{p.desc}</p>
              {/* Progression en cercle */}
              <div className="project-progress-circle">
                <CircleProgress value={p.progress} size={84} stroke={7} />
                <div className="progress-circle-label">
                  <span>Avancement</span>
                  <strong>{p.progress === 100 ? 'Finalisé' : p.progress >= 60 ? 'Avancé' : p.progress >= 30 ? 'En cours' : 'Démarré'}</strong>
                </div>
              </div>
              <div className="project-meta">
                <div>
                  <div className="k">Partenaire</div>
                  <div className="v">{p.partner}</div>
                </div>
                <div>
                  <div className="k">Période</div>
                  <div className="v">{p.period}</div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Page d'accueil principale ──────────────────────────── */
export function HomePage({ go, openArticle, openTender }) {
  const { data: articlesData } = useApi(() => getArticles('?limit=6&published=true'), []);
  const { data: tendersData } = useApi(() => getTenders('?status=En cours&limit=3'), []);
  const { data: settingsData } = useApi(() => getSettings(), []);

  const articles = articlesData?.articles || articlesData || [];
  const tenders = tendersData?.tenders || tendersData || [];
  const settings = settingsData || {};

  const parseJson = (str, fallback) => {
    try {
      const parsed = typeof str === 'string' ? JSON.parse(str) : str;
      return Array.isArray(parsed) && parsed.length > 0 ? parsed : fallback;
    } catch { return fallback; }
  };

  const keyFigures = parseJson(settings.keyFigures, KEY_FIGURES);
  const projects = parseJson(settings.projects, PROJECTS);
  const partners = parseJson(settings.partners, PARTNERS);
  const services = parseJson(settings.services, SERVICES);

  return (
    <main id="main" className="page-enter">
      <HeroSection go={go} openArticle={openArticle} openTender={openTender} articles={articles} tenders={tenders} />
      <KeyFiguresSection go={go} keyFigures={keyFigures} />
      <TendersSection go={go} openTender={openTender} tenders={tenders} settings={settings} />
      <ServicesSection go={go} services={services} />
      <PortefeuilleSection go={go} projects={projects} />

      {/* Partenaires & Investisseurs */}
      <section className="marquee-section" aria-label="Partenaires et organismes">
        <div className="container">
          <div className="marquee-head">
            <div>

              <h3>Nos partenaires institutionnels et financiers.</h3>
            </div>
          </div>
        </div>
        <Marquee items={partners} speed={60} ariaLabel="Carrousel des partenaires de la CTD" />
      </section>
    </main>
  );
}
