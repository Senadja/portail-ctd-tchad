/* Page d'accueil — Portail CTD
   Commission Technique du Désengagement */

import React, { useState, useEffect } from 'react';
import { NEWS, SERVICES, QUICK, PARTNERS, PROJECTS, KEY_FIGURES } from './data';
import { getArticles, getTenders, getSettings, getPageContent, useApi } from './api';
import { Icon } from './icons';
import { Marquee } from './marquee';

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
                <button className="btn btn-gold" onClick={() => go('appels-offres')}>
                  Appels d'offres <Icon.arrowRight />
                </button>
                <button className="btn btn-outline" style={{borderColor:'rgba(255,255,255,0.5)', color:'white', background:'transparent'}} onClick={() => go('investisseurs')}>
                  Espace Investisseurs
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

/* ─── Accès rapides ────────────────────────────────────────── */
function QuickServicesSection({ go }) {
  return (
    <section className="qservices" aria-label="Services en accès rapide">
      <div className="container">
        <div className="qservices-grid">
          {QUICK.map((q, i) => (
            <button key={i} className="qsvc"
              onClick={() => {
                if (q.ic === 'track') go('tracker');
                else if (q.ic === 'doc') go('appels-offres');
                else if (q.ic === 'pay') go('investisseurs');
                else if (q.ic === 'appoint') go('contact');
                else go('services');
              }}>
              <div className="qsvc-ic">{Icon[q.ic] && Icon[q.ic]()}</div>
              <div>
                <h3>{q.title}</h3>
                <p>{q.desc}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Chiffres-clés ────────────────────────────────────────── */
function KeyFiguresSection({ go }) {
  const { data: page } = useApi(() => getPageContent('home'), []);
  const aboutContent = page?.sections?.about || {
    title: 'Au cœur de la transformation économique du Tchad',
    content: 'La CTD piloté le désengagement de l\'État en favorisant la compétitivité économique et l\'attractivité du Tchad pour les investisseurs.',
  };

  return (
    <section className="section" style={{paddingTop: 16}} aria-label="Chiffres-clés de la CTD">
      <div className="container">
        <div className="mission">
          <div className="mission-left">

            <h3>{aboutContent.title}</h3>
            <p>{aboutContent.content}</p>
            <button className="btn btn-outline" style={{marginTop:20}} onClick={() => go('institution-presentation')}>
              Découvrir la CTD <Icon.arrowRight />
            </button>
          </div>
          <div className="mission-right">
            {KEY_FIGURES.map((f, i) => (
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

/* ─── Appels d'offres en cours ──────────────────────────────── */
function TendersSection({ go, tenders }) {
  const displayTenders = tenders?.length ? tenders.slice(0, 3) : [];

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
          {displayTenders.map((t, i) => (
            <article key={t.id || i} className="tender-row" onClick={() => go('appels-offres')}>
              <div className="tender-ref">{t.reference || `AO-2026-00${i+1}`}</div>
              <div className="tender-body">
                <h3>{t.title}</h3>
                <p>{t.description?.substring(0, 120)}…</p>
              </div>
              <div className="tender-meta">
                <span className={`status-pill ${t.status === 'En cours' ? 'progress' : 'done'}`}>
                  {t.status || 'En cours'}
                </span>
                <span className="tender-deadline">
                  Clôture : {t.deadline ? new Date(t.deadline).toLocaleDateString('fr-FR', {day:'numeric', month:'long', year:'numeric'}) : 'À préciser'}
                </span>
              </div>
              <Icon.arrowRight style={{width:18, height:18, flexShrink:0, color:'var(--ink-mute)'}} />
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Services en ligne ────────────────────────────────────── */
function ServicesSection({ go }) {
  const topServices = SERVICES.slice(0, 3);
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

/* ─── Portefeuille de désengagement ─────────────────────────── */
function PortefeuilleSection({ go }) {
  const ongoingProjects = PROJECTS.filter(p => p.status === 'ongoing').slice(0, 3);
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
              <div className="project-progress">
                <div className="bar"><div className="fill" style={{width: `${p.progress}%`}}></div></div>
                <div className="progress-label">{p.progress}% avancement</div>
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

  const articles = articlesData?.articles || articlesData || [];
  const tenders = tendersData?.tenders || tendersData || [];

  return (
    <main id="main" className="page-enter">
      <HeroSection go={go} openArticle={openArticle} openTender={openTender} articles={articles} tenders={tenders} />
      <QuickServicesSection go={go} />
      <KeyFiguresSection go={go} />
      <TendersSection go={go} tenders={tenders} />
      <ServicesSection go={go} />
      <PortefeuilleSection go={go} />

      {/* Partenaires & Investisseurs */}
      <section className="marquee-section" aria-label="Partenaires et organismes">
        <div className="container">
          <div className="marquee-head">
            <div>

              <h3>Nos partenaires institutionnels et financiers.</h3>
            </div>
          </div>
        </div>
        <Marquee items={PARTNERS} speed={60} ariaLabel="Carrousel des partenaires de la CTD" />
      </section>
    </main>
  );
}
