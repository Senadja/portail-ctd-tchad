/* Page Tracker — Suivi de dossier CTD
   Branché sur l'API backend : GET /api/tracker/:ref
   Fallback sur données démo (DOSSIERS statiques) */

import React, { useState } from 'react';
import { DOSSIERS } from './data';
import { lookupDossier } from './api';
import { Icon } from './icons';

export function TrackerPage({ go }) {
  const [ref, setRef] = useState('');
  const [dateDepot, setDateDepot] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e && e.preventDefault();
    setError('');
    const refNorm = ref.trim().toUpperCase();
    if (!refNorm) {
      setError('Veuillez saisir un numéro de dossier.');
      return;
    }
    setLoading(true);
    try {
      // Essai backend d'abord
      const data = await lookupDossier(refNorm);
      setResult(data);
      setError('');
    } catch {
      // Fallback sur les données démo statiques
      const found = DOSSIERS[refNorm];
      if (found) {
        setResult(found);
        setError('');
      } else {
        setResult(null);
        setError(`Aucun dossier correspondant au numéro « ${refNorm} ».\nVérifiez la référence sur votre récépissé de dépôt. Format attendu : CTD-2026-XXXXX`);
      }
    } finally {
      setLoading(false);
    }
  };

  const tryExample = (k) => {
    setRef(k);
    setDateDepot('');
    setTimeout(() => {
      const found = DOSSIERS[k];
      if (found) { setResult(found); setError(''); }
    }, 100);
  };

  return (
    <main id="main" className="page-enter">
      <section className="page-banner">
        <div className="container">
          <h1>Suivez l'état d'avancement de votre dossier.</h1>
          <p className="lead">
            Saisissez le numéro de référence figurant sur votre accusé de réception. Toutes les étapes du traitement, les services en charge et les délais prévisionnels s'affichent ci-dessous, en toute transparence.
          </p>
        </div>
      </section>

      <section className="container tracker">
        <div className="tracker-card">
          <h2>Numéro de dossier</h2>
          <p className="help">
            Votre numéro de dossier se compose de 14 caractères au format <strong>CTD-AAAA-NNNNN</strong>.
            Il figure sur l'accusé de réception transmis par courriel lors de votre soumission.
          </p>
          <form className="tracker-form" onSubmit={handleSubmit}>
            <div className="field">
              <label htmlFor="ref">Numéro de dossier</label>
              <input
                id="ref"
                type="text"
                placeholder="CTD-2026-XXXXX"
                value={ref}
                onChange={e => setRef(e.target.value.toUpperCase())}
                autoComplete="off"
                spellCheck="false"
                aria-describedby="ref-help"
              />
            </div>
            <div className="field">
              <label htmlFor="dateDepot">Date de soumission (facultatif)</label>
              <input
                id="dateDepot"
                type="text"
                placeholder="JJ/MM/AAAA"
                value={dateDepot}
                onChange={e => setDateDepot(e.target.value)}
                autoComplete="off"
              />
            </div>
            <button className="btn btn-primary" type="submit" disabled={loading}>
              {loading ? 'Recherche…' : (<>Consulter <Icon.arrowRight /></>)}
            </button>
          </form>

          {/* Exemples de démonstration */}
          <div className="tracker-examples">
            <strong>Essayer avec un dossier de démonstration :</strong>
            <button type="button" onClick={() => tryExample('CTD-2026-00142')}>CTD-2026-00142</button>
            <button type="button" onClick={() => tryExample('CTD-2026-00089')}>CTD-2026-00089</button>
            <button type="button" onClick={() => tryExample('CTD-2026-00203')}>CTD-2026-00203</button>
          </div>

          {error && (
            <div role="alert" style={{
              marginTop: 20, padding: '14px 18px',
              background: 'rgba(184,30,44,0.08)',
              border: '1px solid rgba(184,30,44,0.3)',
              borderRadius: 4,
              color: 'var(--red-deep)',
              display: 'flex',
              gap: 12,
              alignItems: 'flex-start',
              fontSize: 'var(--fs-sm)',
            }}>
              <Icon.warn style={{width:20, height:20, flexShrink:0, marginTop:2}} />
              <div style={{whiteSpace:'pre-line'}}>{error}</div>
            </div>
          )}
        </div>

        {result && (
          <div className="tracker-result page-enter" role="region" aria-label="Résultat du suivi">
            <div className="tr-head">
              <div>
                <h3>{result.type}</h3>
                <div className="ref">Référence : {result.ref}</div>
              </div>
              <span className={`status-pill ${result.status}`}>{result.statusLabel}</span>
            </div>

            <div className="tr-meta">
              <div className="it">
                <div className="k">Date de dépôt</div>
                <div className="v">{result.deposit}</div>
              </div>
              <div className="it">
                <div className="k">Service instructeur</div>
                <div className="v">{result.service}</div>
              </div>
              <div className="it">
                <div className="k">Échéance</div>
                <div className="v">{result.deadline}</div>
              </div>
              <div className="it">
                <div className="k">Progression</div>
                <div className="v">
                  {result.steps ? `${result.steps.filter(s=>s.state==='done').length} / ${result.steps.length} étapes` : 'N/A'}
                </div>
              </div>
            </div>

            {result.steps && (
              <div className="timeline" role="list">
                {result.steps.map((s, i) => (
                  <div key={i} className={`step ${s.state}`} role="listitem">
                    <div className="dot">
                      {s.state === 'done' && <Icon.check style={{width:16, height:16}}/>}
                      {s.state === 'current' && <Icon.dot style={{width:14, height:14}}/>}
                      {s.state === 'rejected' && (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><line x1="6" y1="6" x2="18" y2="18"/><line x1="18" y1="6" x2="6" y2="18"/></svg>
                      )}
                      {s.state === 'pending' && <span style={{fontSize:13, fontWeight:700}}>{i+1}</span>}
                    </div>
                    <div className="body">
                      <h4>{s.title}</h4>
                      <p className="justify">{s.desc}</p>
                    </div>
                    <div className="date">{s.date}</div>
                  </div>
                ))}
              </div>
            )}

            <div style={{
              marginTop: 32, paddingTop: 24,
              borderTop: '1px solid var(--rule)',
              display: 'flex', gap: 12, flexWrap: 'wrap',
              justifyContent: 'space-between', alignItems: 'center'
            }}>
              <div style={{fontSize:'var(--fs-sm)', color:'var(--ink-mute)'}}>
                Besoin d'aide ? Contactez la CTD à <strong style={{color:'var(--navy)'}}>contact@ctd.td</strong> ou via <a href="#" onClick={(e)=>{e.preventDefault(); go('contact');}} style={{color:'var(--red)', fontWeight:600}}>le formulaire de contact</a>.
              </div>
              <div style={{display:'flex', gap:10}}>
                <button className="btn btn-ghost"><Icon.printer /> Imprimer</button>
              </div>
            </div>
          </div>
        )}

        {!result && !error && (
          <div style={{
            marginTop: 28,
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 20,
          }}>
            {[
              { ic: <Icon.clock />, t: 'Suivi 24h/24', d: 'Consultez l\'avancement de votre dossier à tout moment depuis n\'importe quel appareil connecté.' },
              { ic: <Icon.doc />, t: 'Transparence totale', d: 'Chaque étape du processus d\'instruction est documentée et visible par le soumissionnaire.' },
              { ic: <Icon.share />, t: 'Données sécurisées', d: 'Vos informations sont protégées et l\'accès à votre dossier est sécurisé par votre référence unique.' },
            ].map((b, i) => (
              <div key={i} style={{
                background: 'var(--paper)',
                border: '1px solid var(--rule)',
                borderRadius: 'var(--radius-lg)',
                padding: '24px 26px',
              }}>
                <div style={{
                  width: 40, height: 40, borderRadius: 'var(--radius)',
                  background: 'var(--cream-warm)', color: 'var(--navy)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginBottom: 14,
                }}>{b.ic}</div>
                <h4 style={{fontFamily:'var(--sans)', fontSize:'var(--fs-base)', fontWeight:700, color:'var(--navy)', marginBottom:6}}>{b.t}</h4>
                <p style={{fontSize:'var(--fs-sm)', color:'var(--ink-soft)', margin:0, lineHeight:1.55}}>{b.d}</p>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
