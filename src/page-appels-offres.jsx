/* Page Appels d'Offres — Portail CTD
   Données dynamiques depuis le backend (GET /api/tenders) */

import React, { useState } from 'react';
import { getTenders, useApi } from './api';
import { Icon } from './icons';

const BACKEND_URL = import.meta.env.VITE_API_URL || 'http://localhost:5015';

const STATUS_COLORS = {
  'En cours': { bg: 'rgba(31, 92, 31, 0.1)', text: '#1F5C1F', border: 'rgba(31, 92, 31, 0.3)' },
  'Clôturé': { bg: 'rgba(90, 90, 90, 0.1)', text: '#3A3A3A', border: 'rgba(90, 90, 90, 0.3)' },
  'Résultat publié': { bg: 'rgba(14, 42, 94, 0.1)', text: '#0E2A5E', border: 'rgba(14, 42, 94, 0.3)' },
  'Suspendu': { bg: 'rgba(184, 30, 44, 0.1)', text: '#B81E2C', border: 'rgba(184, 30, 44, 0.3)' },
};

export function AppelsOffresPage({ go, openTender }) {
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  const { data, loading, error } = useApi(() => getTenders(), []);
  const tenders = data?.tenders || data || [];

  const statuses = ['all', 'En cours', 'Clôturé', 'Résultat publié', 'Suspendu'];

  const filtered = tenders.filter(t => {
    const matchStatus = filter === 'all' || t.status === filter;
    const matchSearch = !search || t.title.toLowerCase().includes(search.toLowerCase()) || t.reference?.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  const formatDate = (d) => {
    if (!d) return 'À préciser';
    return new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  const isExpiringSoon = (deadline) => {
    if (!deadline) return false;
    const diff = new Date(deadline) - new Date();
    return diff > 0 && diff < 7 * 24 * 60 * 60 * 1000;
  };

  return (
    <main id="main" className="page-enter">
      {/* Bannière */}
      <section className="page-banner" style={{paddingBottom: 40}}>
        <div className="container">
          <h1>Appels d'offres & Manifestations d'intérêt</h1>
          <p className="lead">Consultez en temps réel tous les avis d'appels d'offres ouverts par la Commission Technique du Désengagement. Téléchargez les dossiers d'appel d'offres (DAO) et soumettez vos offres en ligne.</p>
        </div>
      </section>

      {/* Toolbar */}
      <section className="container" style={{paddingTop: 24, paddingBottom: 12}}>
        <div className="news-toolbar">
          <div className="filters" role="group" aria-label="Filtrer par statut">
            {statuses.map(s => (
              <button key={s} className={`chip ${filter === s ? 'active' : ''}`} onClick={() => setFilter(s)}>
                {s === 'all' ? 'Tous' : s}
              </button>
            ))}
          </div>
          <label className="header-search" style={{maxWidth:280, height:38}} aria-label="Rechercher un appel d'offres">
            <Icon.search style={{width:15, height:15}} />
            <input type="search" placeholder="Référence, titre…" value={search} onChange={e => setSearch(e.target.value)} />
          </label>
        </div>
      </section>

      {/* Liste des AO */}
      <section className="container" style={{paddingBottom: 80}}>
        {loading && (
          <div style={{textAlign:'center', padding:'48px 0', color:'var(--ink-mute)'}}>
            <div style={{fontSize:'var(--fs-base)'}}>Chargement des appels d'offres…</div>
          </div>
        )}
        {error && (
          <div style={{background:'rgba(184,30,44,0.08)', border:'1px solid rgba(184,30,44,0.3)', borderRadius:'var(--radius-lg)', padding:'20px 24px', marginBottom:24}}>
            <strong>Erreur de chargement :</strong> {error}
            <div style={{marginTop:8, fontSize:'var(--fs-sm)', color:'var(--ink-mute)'}}>Vérifiez que le serveur backend est démarré sur le port 5015.</div>
          </div>
        )}

        {!loading && filtered.length === 0 && (
          <div style={{textAlign:'center', padding:'64px 0', color:'var(--ink-mute)'}}>
            <div style={{fontSize:'var(--fs-lg)', marginBottom:8}}>Aucun résultat</div>
            <p>Aucun appel d'offres ne correspond à votre recherche.</p>
          </div>
        )}

        <div style={{display:'flex', flexDirection:'column', gap:16, marginTop:8}}>
          {filtered.map((t, i) => {
            const colors = STATUS_COLORS[t.status] || STATUS_COLORS['En cours'];
            const expiring = isExpiringSoon(t.deadline);
            return (
              <article key={t.id || i} style={{
                background:'var(--paper)', border:'1px solid var(--rule)',
                borderRadius:'var(--radius-lg)', padding:'24px 28px',
                display:'grid', gridTemplateColumns:'1fr auto',
                gap:16, alignItems:'start',
                transition:'box-shadow 0.15s, transform 0.15s',
                cursor:'pointer',
              }}
              className="tender-card"
              onClick={() => openTender && openTender(t.id)}
              >
                <div>
                  <div style={{display:'flex', alignItems:'center', gap:12, marginBottom:10, flexWrap:'wrap'}}>
                    <span style={{
                      fontFamily:'var(--mono)', fontSize:12, fontWeight:700, letterSpacing:'0.1em',
                      color:'var(--ink-mute)', background:'var(--cream-warm)',
                      padding:'3px 8px', borderRadius:2
                    }}>{t.reference || `AO-2026-00${i+1}`}</span>
                    <span style={{
                      fontSize:12, fontWeight:700, padding:'3px 10px', borderRadius:2,
                      background: colors.bg, color: colors.text, border: `1px solid ${colors.border}`
                    }}>{t.status || 'En cours'}</span>
                    {expiring && (
                      <span style={{fontSize:11, fontWeight:700, color:'var(--red)', background:'rgba(184,30,44,0.08)', padding:'2px 8px', borderRadius:2}}>
                        ⚠ Clôture imminente
                      </span>
                    )}
                  </div>
                  <h3 style={{fontSize:'var(--fs-base)', color:'var(--ink)', margin:'0 0 8px', fontFamily:'var(--serif)'}}>{t.title}</h3>
                  <p style={{fontSize:'var(--fs-sm)', color:'var(--ink-soft)', margin:'0 0 16px', lineHeight:1.55}}>
                    {t.description?.substring(0, 180)}{t.description?.length > 180 ? '…' : ''}
                  </p>
                  <div style={{display:'flex', gap:20, flexWrap:'wrap'}}>
                    <div>
                      <span style={{fontSize:11, textTransform:'uppercase', letterSpacing:'0.14em', color:'var(--ink-mute)', fontWeight:700}}>Date de clôture</span>
                      <div style={{fontSize:'var(--fs-sm)', color:'var(--navy)', fontWeight:600, marginTop:2}}>{formatDate(t.deadline)}</div>
                    </div>
                    {t.acceptSubmissions && (
                      <div>
                        <span style={{fontSize:11, textTransform:'uppercase', letterSpacing:'0.14em', color:'var(--ink-mute)', fontWeight:700}}>Soumission en ligne</span>
                        <div style={{fontSize:'var(--fs-sm)', color:'#1F5C1F', fontWeight:600, marginTop:2}}>✓ Disponible</div>
                      </div>
                    )}
                    {t.submissionDeadline && (
                      <div>
                        <span style={{fontSize:11, textTransform:'uppercase', letterSpacing:'0.14em', color:'var(--ink-mute)', fontWeight:700}}>Limite soumission</span>
                        <div style={{fontSize:'var(--fs-sm)', color:'var(--navy)', fontWeight:600, marginTop:2}}>{formatDate(t.submissionDeadline)}</div>
                      </div>
                    )}
                  </div>
                </div>
                <div style={{display:'flex', flexDirection:'column', gap:8, alignItems:'flex-end'}}>
                  {t.fileUrl && (
                    <a href={`${BACKEND_URL}${t.fileUrl}`} target="_blank" rel="noopener noreferrer"
                       className="btn btn-outline"
                       style={{padding:'8px 14px', fontSize:13, whiteSpace:'nowrap'}}
                       onClick={e => e.stopPropagation()}
                       aria-label={`Télécharger le DAO : ${t.title}`}>
                      <Icon.download style={{width:14, height:14}} /> Télécharger DAO
                    </a>
                  )}
                  {t.acceptSubmissions && t.status === 'En cours' && (
                    <button className="btn btn-primary"
                            style={{padding:'8px 14px', fontSize:13, whiteSpace:'nowrap'}}
                            onClick={e => { e.stopPropagation(); openTender && openTender(t.id); }}>
                      Soumettre une offre <Icon.arrowRight style={{width:14, height:14}} />
                    </button>
                  )}
                </div>
              </article>
            );
          })}
        </div>

        {/* Encart info */}
        {!loading && (
          <div style={{
            background:'var(--cream-warm)', border:'1px solid var(--rule)',
            borderRadius:'var(--radius-lg)', padding:'24px 28px',
            marginTop:40, display:'grid', gridTemplateColumns:'1fr auto',
            gap:20, alignItems:'center'
          }}>
            <div>
              <h4 style={{fontSize:'var(--fs-base)', color:'var(--navy)', margin:'0 0 8px'}}>Besoin du dossier d'appel d'offres complet ?</h4>
              <p style={{fontSize:'var(--fs-sm)', color:'var(--ink-soft)', margin:0}}>
                Les DAO sont disponibles en téléchargement direct depuis chaque fiche d'appel d'offres. Pour toute question, contactez la Direction des Opérations de Cession.
              </p>
            </div>
            <button className="btn btn-primary" onClick={() => go('contact')} style={{whiteSpace:'nowrap'}}>
              Nous contacter <Icon.arrowRight />
            </button>
          </div>
        )}
      </section>
    </main>
  );
}
