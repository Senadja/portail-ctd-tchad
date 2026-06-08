import React, { useState, useEffect } from 'react';
import { getSettings, getTenders, useApi } from './api';
import { Icon } from './icons';
import { TenderRadialProgress } from './tender-progress';

const BACKEND_URL = import.meta.env.VITE_API_URL || 'http://localhost:5015';

export function TenderDetailPage({ go, tenderId }) {
  const { data, loading, error } = useApi(() => getTenders(), []);
  const { data: settingsData } = useApi(() => getSettings(), []);
  
  const tenders = data?.tenders || data || [];
  const tender = tenders.find(t => t.id === tenderId);

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

  if (loading) {
    return (
      <main id="main" className="page-enter" style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: 'var(--ink-mute)', fontSize: 'var(--fs-base)' }}>Chargement de l'appel d'offres...</div>
      </main>
    );
  }

  if (error || !tender) {
    return (
      <main id="main" className="page-enter" style={{ minHeight: '60vh', display: 'flex', flexCol: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ background: 'rgba(184,30,44,0.08)', border: '1px solid rgba(184,30,44,0.3)', borderRadius: 'var(--radius-lg)', padding: '20px 24px', textAlign: 'center' }}>
          <strong>Erreur :</strong> {error || "Appel d'offres introuvable."}
        </div>
        <button className="btn btn-outline" style={{ marginTop: 24 }} onClick={() => go('appels-offres')}>
          Retour à la liste
        </button>
      </main>
    );
  }

  const st = customStatuses.find(s => s.label === tender.status) || customStatuses[0];
  let stages = [];
  try { stages = tender.customStatuses ? JSON.parse(tender.customStatuses) : []; } catch {}
  
  let documents = [];
  try { documents = tender.documents ? JSON.parse(tender.documents) : []; } catch {}
  
  // Rétrocompatibilité si un seul fichier a été ajouté avec fileUrl
  if (tender.fileUrl && documents.length === 0) {
    documents.push({ name: "Document d'Appel d'Offres (DAO)", url: tender.fileUrl });
  }

  const formatDate = (d) => {
    if (!d) return 'À préciser';
    return new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  return (
    <main id="main" className="page-enter">
      {/* En-tête */}
      <section className="page-banner" style={{ paddingBottom: 40 }}>
        <div className="container">
          <button className="btn btn-ghost" style={{ padding: 0, marginBottom: 24, fontSize: 'var(--fs-sm)', color: 'rgba(255,255,255,0.7)' }} onClick={() => go('appels-offres')}>
            ← Retour aux appels d'offres
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
            <span style={{ fontFamily: 'var(--mono)', fontSize: 14, fontWeight: 700, letterSpacing: '0.1em', color: 'var(--navy-deep)', background: 'var(--gold)', padding: '4px 10px', borderRadius: 4 }}>
              {tender.reference}
            </span>
            <span style={{ fontSize: 13, fontWeight: 700, padding: '4px 12px', borderRadius: 4, background: st.color, color: 'white' }}>
              {tender.status}
            </span>
          </div>
          <h1>{tender.title}</h1>
          <div style={{ display: 'flex', gap: 32, marginTop: 24, flexWrap: 'wrap' }}>
            <div>
              <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.14em', color: 'rgba(255,255,255,0.5)', fontWeight: 700 }}>Date de publication</div>
              <div style={{ fontSize: 'var(--fs-base)', color: 'white', fontWeight: 600, marginTop: 4 }}>{formatDate(tender.createdAt)}</div>
            </div>
            <div>
              <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.14em', color: 'rgba(255,255,255,0.5)', fontWeight: 700 }}>Date limite de dépôt</div>
              <div style={{ fontSize: 'var(--fs-base)', color: 'var(--gold)', fontWeight: 600, marginTop: 4 }}>{formatDate(tender.deadline)}</div>
            </div>
          </div>
        </div>
      </section>

      {/* Contenu */}
      <section className="container" style={{ paddingTop: 48, paddingBottom: 80 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 48, alignItems: 'start' }} className="pres-grid">
          
          {/* Colonne Principale */}
          <div>
            <div className="eyebrow" style={{ marginBottom: 16 }}>Détails de l'opération</div>
            <div style={{ background: 'var(--paper)', border: '1px solid var(--rule)', borderRadius: 'var(--radius-lg)', padding: '32px 40px' }}>
              <h2 style={{ fontSize: 'var(--fs-xl)', marginBottom: 24, color: 'var(--navy)' }}>Description complète</h2>
              <div style={{ fontSize: 'var(--fs-md)', lineHeight: 1.7, color: 'var(--ink-soft)', whiteSpace: 'pre-wrap' }}>
                {tender.description || "Aucune description détaillée n'a été fournie pour cet appel d'offres."}
              </div>
            </div>
            
            {stages.length > 0 && (
              <div style={{ marginTop: 40 }}>
                <h3 style={{ fontSize: 'var(--fs-lg)', marginBottom: 24, color: 'var(--navy)' }}>Calendrier de l'opération</h3>
                <div className="timeline" role="list">
                  {stages.map((stage, i) => {
                    const now = new Date();
                    const start = new Date(stage.start);
                    const end = new Date(stage.end);
                    const isDone = now > end;
                    const isCurrent = now >= start && now <= end;
                    
                    return (
                      <div key={i} className={`step ${isDone ? 'done' : ''}`} role="listitem" style={{ paddingBottom: 24 }}>
                        <div className="dot" style={{ background: isDone ? 'var(--gold)' : isCurrent ? 'var(--navy)' : '#e5e7eb', color: 'white', fontFamily: 'var(--sans)', fontSize: 10, fontWeight: 800 }}>
                          {isDone ? '✓' : ''}
                        </div>
                        <div className="body">
                          <div style={{ fontSize: 'var(--fs-xs)', color: isCurrent ? 'var(--navy)' : 'var(--ink-mute)', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 4 }}>
                            {formatDate(stage.start)} — {formatDate(stage.end)}
                          </div>
                          <h4 style={{ color: isCurrent ? 'var(--navy)' : 'var(--ink)' }}>{stage.label}</h4>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Colonne Latérale */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {/* Progression */}
            <div style={{ background: 'var(--navy)', borderRadius: 'var(--radius-lg)', padding: '32px', textAlign: 'center', color: 'white' }}>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
                <TenderRadialProgress stages={stages} fallbackProgress={st?.percentage || 0} fallbackColor={st?.color || '#10b981'} size={120} strokeWidth={8} />
              </div>
              <h3 style={{ margin: 0, color: 'white' }}>{st?.label}</h3>
              <p style={{ fontSize: 'var(--fs-sm)', color: 'rgba(255,255,255,0.7)', margin: '8px 0 0' }}>Statut actuel de l'opération</p>
            </div>

            {/* Documents */}
            <div style={{ background: 'var(--cream-warm)', border: '1px solid var(--rule)', borderRadius: 'var(--radius-lg)', padding: '24px' }}>
              <h3 style={{ fontSize: 'var(--fs-base)', margin: '0 0 16px', color: 'var(--navy)' }}>Documents rattachés ({documents.length})</h3>
              {documents.length === 0 ? (
                <p style={{ fontSize: 'var(--fs-sm)', color: 'var(--ink-mute)', margin: 0 }}>Aucun document disponible en téléchargement.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {documents.map((doc, idx) => (
                    <a key={idx} href={`${BACKEND_URL}${doc.url}`} target="_blank" rel="noopener noreferrer"
                       style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', background: 'white', border: '1px solid var(--rule)', borderRadius: 'var(--radius)', textDecoration: 'none', transition: 'all 0.2s' }}
                       className="doc-link hover-shadow"
                    >
                      <Icon.download style={{ width: 18, height: 18, color: 'var(--gold)', flexShrink: 0 }} />
                      <span style={{ fontSize: 'var(--fs-sm)', color: 'var(--ink)', fontWeight: 500, lineHeight: 1.4 }}>{doc.name}</span>
                    </a>
                  ))}
                </div>
              )}
            </div>

            {/* Action */}
            {tender.acceptSubmissions && tender.status === 'En cours' && (
              <div style={{ background: 'rgba(31, 92, 31, 0.05)', border: '1px solid rgba(31, 92, 31, 0.2)', borderRadius: 'var(--radius-lg)', padding: '24px', textAlign: 'center' }}>
                <h3 style={{ fontSize: 'var(--fs-base)', color: '#1F5C1F', margin: '0 0 8px' }}>Soumission en ligne ouverte</h3>
                <p style={{ fontSize: 'var(--fs-sm)', color: 'var(--ink-soft)', margin: '0 0 16px' }}>Date limite : {formatDate(tender.submissionDeadline)}</p>
                <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                  Déposer mon offre
                </button>
              </div>
            )}
          </div>

        </div>
      </section>
    </main>
  );
}
