/* Page Documentation — Portail CTD
   Documents officiels avec catégories CTD + données dynamiques */

import React, { useState } from 'react';
import { DOCUMENTS } from './data';
import { getDocuments, useApi } from './api';
import { Icon } from './icons';

const BACKEND_URL = import.meta.env.VITE_API_URL || 'http://localhost:5015';

const TYPE_COLORS = {
  decret: { bg: 'rgba(14, 42, 94, 0.1)', text: '#0E2A5E', label: 'Décret' },
  loi: { bg: 'rgba(14, 42, 94, 0.12)', text: '#081A3D', label: 'Loi' },
  arrete: { bg: 'rgba(184, 30, 44, 0.08)', text: '#B81E2C', label: 'Arrêté' },
  rapport: { bg: 'rgba(122, 90, 14, 0.1)', text: '#7A5A0E', label: 'Rapport' },
  guide: { bg: 'rgba(31, 92, 31, 0.1)', text: '#1F5C1F', label: 'Guide' },
  etude: { bg: 'rgba(31, 92, 140, 0.1)', text: '#1F5C8C', label: 'Étude' },
  dao: { bg: 'rgba(200, 150, 30, 0.12)', text: '#8A6010', label: 'DAO' },
  circulaire: { bg: 'rgba(90, 90, 90, 0.1)', text: '#3A3A3A', label: 'Circulaire' },
  formulaire: { bg: 'rgba(31, 92, 31, 0.08)', text: '#1F5C1F', label: 'Formulaire' },
};

const CATEGORIES = [
  { id: 'all', label: 'Tous' },
  { id: 'Textes réglementaires', label: 'Textes réglementaires' },
  { id: 'DAO', label: 'Dossiers d\'appel d\'offres' },
  { id: 'Rapports', label: 'Rapports' },
  { id: 'Études sectorielles', label: 'Études sectorielles' },
  { id: 'Guides investisseurs', label: 'Guides investisseurs' },
  { id: 'Formulaires', label: 'Formulaires' },
];

function normalizeDocument(d) {
  if (d.fileUrl !== undefined && !d.type) {
    // Document backend
    const ext = d.fileUrl?.split('.').pop()?.toUpperCase() || 'PDF';
    return {
      id: d.id,
      type: d.category?.toLowerCase().replace(/\s+/g, '-') || 'rapport',
      typeLabel: d.fileType || ext,
      ref: `DOC-${d.id?.substring(0, 6).toUpperCase()}`,
      date: new Date(d.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }),
      title: d.title,
      summary: d.description || '',
      pages: null,
      size: d.fileSize || '',
      category: d.category || 'Public',
      fileUrl: d.fileUrl,
    };
  }
  return d;
}

export function DocumentationPage({ go }) {
  const [catFilter, setCatFilter] = useState('all');
  const [query, setQuery] = useState('');

  const { data: apiData, loading } = useApi(() => getDocuments(), []);
  const rawDocs = apiData?.documents || apiData || [];
  const docs = rawDocs.length ? rawDocs.map(normalizeDocument) : DOCUMENTS;

  const filtered = docs.filter(d => {
    const matchCat = catFilter === 'all' || d.category === catFilter;
    const matchQ = !query || d.title.toLowerCase().includes(query.toLowerCase()) || (d.ref || '').toLowerCase().includes(query.toLowerCase());
    return matchCat && matchQ;
  });

  return (
    <main id="main" className="page-enter">
      <section className="page-banner" style={{paddingBottom: 40}}>
        <div className="container">
          <h1>Documents officiels de la CTD</h1>
          <p className="lead">
            Accédez à l'ensemble des textes réglementaires, dossiers d'appel d'offres (DAO), rapports d'activités, études sectorielles, guides investisseurs et formulaires officiels publiés par la Commission Technique du Désengagement.
          </p>
        </div>
      </section>

      {/* Catégories */}
      <section className="container" style={{paddingTop: 32}}>
        <div className="news-toolbar">
          <div className="filters" role="group" aria-label="Filtrer par catégorie">
            {CATEGORIES.map(c => (
              <button key={c.id}
                className={`chip ${catFilter === c.id ? 'active' : ''}`}
                onClick={() => setCatFilter(c.id)}>
                {c.label}
              </button>
            ))}
          </div>
          <label className="header-search" style={{maxWidth:260, height:38}} aria-label="Rechercher un document">
            <Icon.search style={{width:15, height:15}} />
            <input type="search" placeholder="Titre, référence…" value={query} onChange={e => setQuery(e.target.value)} />
          </label>
        </div>

        {/* Liste des documents */}
        <div style={{marginTop:24}}>
          {loading && (
            <div style={{textAlign:'center', padding:'32px 0', color:'var(--ink-mute)'}}>Chargement des documents…</div>
          )}
          {!loading && filtered.length === 0 && (
            <div style={{background:'var(--paper)', border:'1px solid var(--rule)', borderRadius:'var(--radius-lg)', padding:'32px 28px', textAlign:'center', color:'var(--ink-mute)'}}>
              Aucun document ne correspond à votre recherche.
            </div>
          )}
          <div style={{display:'flex', flexDirection:'column', gap:12}}>
            {filtered.map(d => {
              const style = TYPE_COLORS[d.type] || TYPE_COLORS['rapport'];
              const downloadUrl = d.fileUrl
                ? (d.fileUrl.startsWith('http') ? d.fileUrl : `${BACKEND_URL}${d.fileUrl}`)
                : null;
              return (
                <div key={d.id} style={{
                  background:'var(--paper)', border:'1px solid var(--rule)',
                  borderRadius:'var(--radius-lg)', padding:'20px 24px',
                  display:'grid', gridTemplateColumns:'auto 1fr auto',
                  gap:20, alignItems:'center',
                }}>
                  {/* Type badge */}
                  <div style={{
                    width:56, height:56, borderRadius:'var(--radius)',
                    background: style.bg,
                    display:'flex', flexDirection:'column',
                    alignItems:'center', justifyContent:'center',
                    flexShrink:0,
                  }}>
                    <div style={{fontSize:10, fontWeight:800, letterSpacing:'0.1em', textTransform:'uppercase', color: style.text}}>{d.typeLabel || style.label}</div>
                  </div>

                  {/* Info */}
                  <div>
                    <div style={{display:'flex', gap:10, alignItems:'center', flexWrap:'wrap', marginBottom:6}}>
                      {d.ref && <span style={{fontFamily:'var(--mono)', fontSize:11, color:'var(--ink-mute)', letterSpacing:'0.08em'}}>{d.ref}</span>}
                      <span style={{width:1, height:12, background:'var(--rule)'}}></span>
                      <span style={{fontSize:12, color:'var(--ink-mute)'}}>{d.date}</span>
                      {d.category && (
                        <>
                          <span style={{width:1, height:12, background:'var(--rule)'}}></span>
                          <span style={{fontSize:12, color:'var(--ink-mute)'}}>{d.category}</span>
                        </>
                      )}
                    </div>
                    <h3 style={{fontFamily:'var(--serif)', fontSize:'var(--fs-base)', color:'var(--ink)', margin:'0 0 4px', fontWeight:600}}>{d.title}</h3>
                    {d.summary && <p style={{fontSize:'var(--fs-sm)', color:'var(--ink-soft)', margin:0, lineHeight:1.5}}>{d.summary}</p>}
                    {(d.pages || d.size) && (
                      <div style={{display:'flex', gap:16, marginTop:6, fontSize:12, color:'var(--ink-mute)'}}>
                        {d.pages && <span>{d.pages} pages</span>}
                        {d.size && <span>{d.size}</span>}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div style={{display:'flex', flexDirection:'column', gap:8, alignItems:'flex-end', flexShrink:0}}>
                    {downloadUrl ? (
                      <a href={downloadUrl} target="_blank" rel="noopener noreferrer"
                         className="btn btn-outline"
                         style={{padding:'8px 16px', fontSize:13, whiteSpace:'nowrap'}}
                         aria-label={`Télécharger : ${d.title}`}>
                        <Icon.download style={{width:14, height:14}} /> Télécharger
                      </a>
                    ) : (
                      <button className="btn btn-ghost" style={{padding:'8px 16px', fontSize:13, opacity:0.5}} disabled>
                        <Icon.download style={{width:14, height:14}} /> Non disponible
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Encart guide investisseur */}
        <div style={{
          background:'var(--navy)', borderRadius:'var(--radius-lg)',
          padding:'32px 36px', marginTop:40,
          display:'grid', gridTemplateColumns:'1fr auto', gap:24, alignItems:'center'
        }}>
          <div>
            <h3 style={{color:'white', fontSize:'var(--fs-xl)', margin:'0 0 10px'}}>Guide de l'investisseur — Procédures CTD</h3>
            <p style={{color:'rgba(255,255,255,0.78)', fontSize:'var(--fs-sm)', margin:0, lineHeight:1.6}}>
              Téléchargez notre guide complet pour comprendre les procédures de participation aux opérations de désengagement, les critères d'éligibilité et les étapes clés du processus.
            </p>
          </div>
          <button className="btn btn-gold" style={{whiteSpace:'nowrap'}}>
            <Icon.download /> Télécharger le guide
          </button>
        </div>
      </section>
    </main>
  );
}
