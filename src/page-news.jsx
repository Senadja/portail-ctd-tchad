/* Page Actualités — Portail CTD
   Données dynamiques depuis API backend + fallback statique */

import React, { useState } from 'react';
import { NEWS, DOCUMENTS } from './data';
import { getArticles, useApi } from './api';
import { Icon } from './icons';

const CATEGORIES_NEWS = [
  { id: 'all', label: 'Toutes' },
  { id: 'communique', label: 'Communiqués' },
  { id: 'evenement', label: 'Événements' },
  { id: 'appel', label: "Appels d'offres" },
  { id: 'resultat', label: 'Résultats' },
];

function normalizeArticle(a) {
  if (a.slug) {
    // Vient du backend
    const cat = (a.category || 'Actualité').toLowerCase().replace(/\s+/g, '').replace(/[éèê]/g, 'e').replace(/'/g, '');
    return {
      id: a.slug,
      cat: cat,
      catLabel: a.category || 'Actualité',
      date: new Date(a.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }),
      title: a.title,
      excerpt: a.content?.substring(0, 240) + '…',
      author: 'Secrétariat CTD',
      readTime: '3 min de lecture',
      image: a.image,
    };
  }
  return a; // Déjà normalisé (données statiques)
}

export function NewsListPage({ go, openArticle }) {
  const [filter, setFilter] = useState('all');
  const [query, setQuery] = useState('');

  const { data: apiData, loading } = useApi(() => getArticles('?published=true&limit=20'), []);
  const rawArticles = apiData?.articles || apiData || [];
  const articles = rawArticles.length ? rawArticles.map(normalizeArticle) : NEWS;

  const filtered = articles.filter(n => {
    const matchCat = filter === 'all' || n.cat === filter;
    const matchQ = !query || n.title.toLowerCase().includes(query.toLowerCase()) || (n.excerpt || '').toLowerCase().includes(query.toLowerCase());
    return matchCat && matchQ;
  });

  return (
    <main id="main" className="page-enter">
      <section className="page-banner" style={{paddingBottom: 40}}>
        <div className="container">
          <h1>Actualités & Communiqués de la CTD</h1>
          <p className="lead">
            Retrouvez toutes les communications officielles de la Commission Technique du Désengagement : résultats de cessions, nouveaux appels d'offres, partenariats et événements institutionnels.
          </p>
        </div>
      </section>

      <section className="container" style={{paddingTop: 32}}>
        <div className="news-search-bar">
          <label className="news-search">
            <Icon.search style={{width:18, height:18, color:'var(--ink-mute)'}} />
            <input type="search" placeholder="Rechercher par titre, mot-clé…"
                   value={query} onChange={e => setQuery(e.target.value)}
                   aria-label="Rechercher dans les actualités" />
            {query && (
              <button type="button" className="news-search-clear" onClick={() => setQuery('')} aria-label="Effacer">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><line x1="6" y1="6" x2="18" y2="18"/><line x1="18" y1="6" x2="6" y2="18"/></svg>
              </button>
            )}
          </label>
        </div>

        <div className="news-toolbar">
          <div className="filters" role="tablist" aria-label="Filtrer par catégorie">
            {CATEGORIES_NEWS.map(f => (
              <button key={f.id}
                className={`chip ${filter === f.id ? 'active' : ''}`}
                onClick={() => setFilter(f.id)}
                role="tab"
                aria-selected={filter === f.id}>
                {f.label}
              </button>
            ))}
          </div>
          <div className="total">
            {loading ? 'Chargement…' : `${filtered.length} publication${filtered.length > 1 ? 's' : ''}`}
          </div>
        </div>

        <div className="news-list">
          <div className="main">
            {filtered.length === 0 && !loading && (
              <div style={{background:'var(--paper)', border:'1px solid var(--rule)', borderRadius:'var(--radius-lg)', padding:'40px 28px', textAlign:'center', color:'var(--ink-mute)'}}>
                Aucune publication ne correspond à votre recherche.
              </div>
            )}
            {filtered.map(n => (
              <article key={n.id} className="news-card" onClick={() => openArticle(n.id)}>
                <div className="img">
                  {n.image ? (
                    <img src={`http://localhost:5015${n.image}`} alt={n.title} style={{width:'100%', height:'100%', objectFit:'cover', position:'absolute', inset:0}} loading="lazy" />
                  ) : (
                    <span className="tag">[ {n.catLabel?.toLowerCase() || 'actualité'} · CTD ]</span>
                  )}
                </div>
                <div className="body">
                  <div className="ni-meta">
                    <span className={`ni-cat ${n.cat}`}>{n.catLabel}</span>
                    <span>{n.date}</span>
                    {n.readTime && <><span style={{opacity:0.5}}>·</span><span>{n.readTime}</span></>}
                  </div>
                  <h3>{n.title}</h3>
                  <p className="justify">{n.excerpt}</p>
                  <span className="read-more">
                    Lire l'article complet <Icon.arrowRight style={{width:12, height:12}}/>
                  </span>
                </div>
              </article>
            ))}
          </div>

          <aside className="side">
            <div className="side-card dark">
              <h3>À la une cette semaine</h3>
              <ul>
                {articles.slice(0, 4).map((n, i) => (
                  <li key={n.id}>
                    <div className="num">0{i+1}</div>
                    <div className="t" onClick={() => openArticle(n.id)}>{n.title}</div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="side-card">
              <h3>S'abonner aux alertes CTD</h3>
              <p style={{fontSize:'var(--fs-sm)', color:'var(--ink-soft)', margin:'0 0 14px', lineHeight:1.55}}>
                Recevez en avant-première les nouveaux appels d'offres et communications officielles.
              </p>
              <input type="email" placeholder="votre@email.com"
                style={{width:'100%', padding:'12px 14px', border:'1px solid var(--rule)', borderRadius:4, marginBottom:10, fontFamily:'var(--sans)', fontSize:'var(--fs-sm)'}} />
              <button className="btn btn-primary" style={{width:'100%', justifyContent:'center'}}>
                Je m'abonne
              </button>
            </div>

            <div className="side-card">
              <h3>Appels d'offres ouverts</h3>
              <p style={{fontSize:'var(--fs-sm)', color:'var(--ink-soft)', lineHeight:1.55, marginBottom:16}}>
                Consultez tous nos AO en cours et téléchargez les dossiers.
              </p>
              <button className="btn btn-outline" style={{width:'100%', justifyContent:'center'}} onClick={() => go('appels-offres')}>
                Voir les AO <Icon.arrowRight style={{width:14, height:14}}/>
              </button>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}

export function ArticlePage({ go, articleId, openArticle }) {
  const n = NEWS.find(x => x.id === articleId) || NEWS[0];
  const related = NEWS.filter(x => x.id !== n.id).slice(0, 3);

  return (
    <main id="main" className="page-enter">
      <div className="container">
        <div className="article-wrap">
          <article className="article">
            <div className="article-hero" style={{marginTop: 16}}>
              <span className="tag">[ {n.catLabel?.toLowerCase()} · CTD ]</span>
            </div>

            <h1>{n.title}</h1>

            <div className="article-meta">
              <span className={`ni-cat ${n.cat}`}>{n.catLabel}</span>
              <span>Publié le {n.date}</span>
              <span style={{opacity:0.5}}>·</span>
              <span>Par {n.author}</span>
              <span style={{opacity:0.5}}>·</span>
              <span>{n.readTime}</span>
            </div>

            <p className="lead">{n.excerpt}</p>

            <p className="justify">
              La Commission Technique du Désengagement s'engage à mener chaque opération dans le respect des principes de transparence, d'équité et d'efficacité, conformément aux standards internationaux en matière de privatisation et de cession d'actifs publics.
            </p>

            <p className="justify">
              Les parties prenantes concernées ont été consultées dans le cadre d'un processus participatif, garantissant la pertinence et l'équité des décisions prises. La Direction des Opérations de Cession et la Direction Juridique et Conformité ont assuré le suivi rigoureux de toutes les étapes.
            </p>

            <blockquote>
              « La Commission Technique du Désengagement œuvre pour une transformation structurelle de l'économie tchadienne, en favorisant une participation accrue du secteur privé et en garantissant la transparence de chaque opération. »
            </blockquote>

            <h2>Prochaines étapes</h2>
            <p className="justify">
              Les parties intéressées sont invitées à consulter les documents détaillés disponibles dans la section Documents officiels du portail. Pour toute question, la Direction des Partenariats et Investissements reste disponible via le formulaire de contact.
            </p>

            <div className="share">
              <span>Partager</span>
              <button aria-label="Partager"><Icon.share /></button>
              <button aria-label="Imprimer"><Icon.printer /></button>
            </div>
          </article>

          <aside className="article-side">
            <div className="side-card">
              <h3>Articles liés</h3>
              <ul style={{listStyle:'none', margin:0, padding:0, display:'flex', flexDirection:'column', gap:16}}>
                {related.map(r => (
                  <li key={r.id} style={{paddingBottom:14, borderBottom:'1px solid var(--rule-soft)', cursor:'pointer'}}
                      onClick={() => openArticle(r.id)}>
                    <div style={{fontSize:11, textTransform:'uppercase', letterSpacing:'0.12em', color:'var(--red)', fontWeight:700, marginBottom:6}}>{r.catLabel}</div>
                    <div style={{fontFamily:'var(--serif)', fontSize:'var(--fs-base)', color:'var(--ink)', lineHeight:1.3}}>{r.title}</div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="side-card dark">
              <h3>Contact presse CTD</h3>
              <p style={{color:'rgba(255,255,255,0.78)', fontSize:'var(--fs-sm)', lineHeight:1.6, margin:'0 0 16px'}}>
                Pour toute demande d'accréditation ou d'information complémentaire, contactez la CTD.
              </p>
              <div style={{display:'flex', flexDirection:'column', gap:8, fontSize:'var(--fs-sm)'}}>
                <div style={{color:'var(--gold-soft)', display:'flex', gap:8, alignItems:'center'}}>
                  <Icon.mail style={{width:14, height:14}}/> contact@ctd.td
                </div>
              </div>
            </div>

            <button className="btn btn-outline" style={{width:'100%', justifyContent:'center'}} onClick={() => go('appels-offres')}>
              Voir les appels d'offres <Icon.arrowRight />
            </button>
          </aside>
        </div>
      </div>
    </main>
  );
}
