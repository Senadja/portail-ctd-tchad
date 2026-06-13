/* Page Appels d'Offres — Portail CTD
   Données dynamiques depuis le backend (GET /api/tenders) */

import React, { useState } from 'react';
import { getSettings, getTenders, useApi } from './api';
import { Icon } from './icons';
import { TenderRadialProgress } from './tender-progress';
import { getEffectiveStatus } from './lib/tenderStatus';

const BACKEND_URL = import.meta.env.VITE_API_URL || 'http://localhost:5015';

export function AppelsOffresPage({ go, openTender }) {
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  const { data, loading, error } = useApi(() => getTenders(), []);
  const { data: settingsData } = useApi(() => getSettings(), []);
  const tenders = data?.tenders || data || [];

  let customStatuses = [
    { label: "En cours", color: "#10b981", percentage: 25 },
    { label: "Clôturé", color: "#6b7280", percentage: 50 },
    { label: "Attribué", color: "#3b82f6", percentage: 100 },
  ];
  if (settingsData?.tenderStatuses) {
    try {
      const parsed = typeof settingsData.tenderStatuses === 'string' ? JSON.parse(settingsData.tenderStatuses) : settingsData.tenderStatuses;
      if (Array.isArray(parsed) && parsed.length > 0) customStatuses = parsed;
    } catch {}
  }

  const statuses = ['all', ...customStatuses.map(s => s.label)];

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

        <div className="projects-grid" style={{marginTop:8}}>
          {filtered.map((t, i) => {
            const eff = getEffectiveStatus(t, customStatuses);
            const expiring = isExpiringSoon(t.deadline);
            const stages = eff.phases;

            return (
              <article key={t.id || i} className="project-card"
                onClick={() => openTender && openTender(t.id)}
                style={{cursor: 'pointer'}}
              >
                <div className="project-head">
                  <span className="status-pill progress" style={{ backgroundColor: eff.color + '20', color: eff.color || '#333' }}>
                    {eff.label || 'En cours'}
                  </span>
                  <span className="project-period" style={{ fontFamily: 'var(--mono)', fontSize: 12 }}>
                    {t.reference || `AO-2026-00${i+1}`}
                  </span>
                </div>
                <h3>{t.title}</h3>
                <p className="justify">
                  {t.description?.substring(0, 150)}{t.description?.length > 150 ? '…' : ''}
                </p>
                
                {/* Progression en cercle */}
                <div className="project-progress-circle">
                  <TenderRadialProgress stages={stages} fallbackProgress={eff.percentage || 0} fallbackColor={eff.color || '#10b981'} color={eff.autoStatus ? eff.color : null} size={84} strokeWidth={7} textColor="#0D1F35" trackColor="rgba(13,31,53,0.10)" />
                  <div className="progress-circle-label">
                    <span>Avancement</span>
                    <strong>{eff.label}</strong>
                  </div>
                </div>

                <div className="project-meta">
                  <div>
                    <div className="k">Date de clôture</div>
                    <div className="v">{formatDate(t.deadline)}</div>
                  </div>
                  <div>
                    <div className="k">Soumission en ligne</div>
                    <div className="v" style={{color: t.acceptSubmissions ? '#10b981' : 'var(--ink-mute)'}}>
                      {t.acceptSubmissions ? 'Disponible' : 'Non'}
                    </div>
                  </div>
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
