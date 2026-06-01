/* Pages secondaires CTD : Services, Contact, Espace Investisseurs */

import React, { useState } from 'react';
import { SERVICES } from './data';
import { submitForm } from './api';
import { Icon } from './icons';

/* ─── Services en ligne ────────────────────────────────────── */
export function ServicesPage({ go }) {
  return (
    <main id="main" className="page-enter">
      <section className="page-banner" style={{paddingBottom: 40}}>
        <div className="container">
          <h1>Services en ligne aux investisseurs et partenaires</h1>
          <p className="lead">
            Catalogue complet des services numériques offerts par la Commission Technique du Désengagement. Consultez les appels d'offres, téléchargez les DAO, inscrivez-vous en tant qu'investisseur ou prenez rendez-vous avec nos équipes.
          </p>
        </div>
      </section>

      <section className="container" style={{paddingTop: 48, paddingBottom: 80}}>
        <div className="svc-grid">
          {SERVICES.map(s => (
            <article key={s.n} className="svc-card"
              onClick={() => {
                if (s.n === '01' || s.n === '02') go('appels-offres');
                else if (s.n === '03' || s.n === '04') go('investisseurs');
                else if (s.n === '06') go('contact');
              }}>
              <span className="num">{s.n} / 06</span>
              <h3>{s.title}</h3>
              <p className="justify">{s.desc}</p>
              <div style={{display:'flex', gap:10, marginTop: 8}}>
                <button className="btn btn-primary" style={{padding:'10px 16px', fontSize:'var(--fs-xs)'}}>
                  Accéder <Icon.arrowRight style={{width:14, height:14}}/>
                </button>
              </div>
            </article>
          ))}
        </div>

        {/* Bandeaux info */}
        <div style={{marginTop: 40, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20}}>
          <div style={{
            background: 'var(--navy)', color: 'white',
            padding: '32px 36px', borderRadius: 'var(--radius-lg)',
            display: 'flex', gap: 24, alignItems: 'center',
          }}>
            <div style={{
              width: 56, height: 56, background: 'var(--gold)', color: 'var(--navy-deep)',
              borderRadius: 'var(--radius)', display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}>
              <Icon.track style={{width:28, height:28}} />
            </div>
            <div style={{flex:1}}>
              <h3 style={{color:'white', fontSize:'var(--fs-lg)', marginBottom:6}}>Vous avez soumis un dossier ?</h3>
              <p style={{color:'rgba(255,255,255,0.78)', margin:0, fontSize:'var(--fs-sm)', lineHeight:1.5}}>
                Consultez l'état d'avancement en saisissant votre référence CTD.
              </p>
            </div>
            <button className="btn btn-gold" onClick={() => go('tracker')}>
              Suivre mon dossier <Icon.arrowRight />
            </button>
          </div>

          <div style={{
            background: 'var(--cream-warm)',
            padding: '32px 36px', borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--rule)',
            display: 'flex', gap: 24, alignItems: 'center',
          }}>
            <div style={{
              width: 56, height: 56, background: 'var(--navy)', color: 'white',
              borderRadius: 'var(--radius)', display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}>
              <Icon.phone style={{width:26, height:26}} />
            </div>
            <div style={{flex:1}}>
              <h3 style={{color:'var(--navy)', fontSize:'var(--fs-lg)', marginBottom:6}}>Besoin d'assistance ?</h3>
              <p style={{color:'var(--ink-soft)', margin:0, fontSize:'var(--fs-sm)', lineHeight:1.5}}>
                Nos équipes vous accompagnent du lundi au vendredi, 07h30 — 15h30.
              </p>
            </div>
            <div style={{textAlign:'right'}}>
              <div style={{fontFamily:'var(--serif)', fontSize:'var(--fs-xl)', color:'var(--navy)', fontWeight:600}}>CTD</div>
              <div style={{fontSize:11, color:'var(--ink-mute)', letterSpacing:'0.12em', textTransform:'uppercase'}}>N'Djamena</div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

/* ─── Contact ──────────────────────────────────────────────── */
export function ContactPage({ go }) {
  const [form, setForm] = useState({ nom: '', prenom: '', email: '', telephone: '', objet: '', message: '' });
  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.nom || !form.email || !form.objet || !form.message) {
      setError('Veuillez remplir tous les champs obligatoires.');
      return;
    }
    setSending(true);
    setError('');
    try {
      await submitForm('CONTACT', form);
      setSuccess(true);
      setForm({ nom: '', prenom: '', email: '', telephone: '', objet: '', message: '' });
    } catch (err) {
      setError('Erreur lors de l\'envoi. Veuillez réessayer ou nous contacter directement par email.');
    } finally {
      setSending(false);
    }
  };

  return (
    <main id="main" className="page-enter">
      <section className="page-banner" style={{paddingBottom: 40}}>
        <div className="container">
          <h1>Nous contacter</h1>
          <p className="lead">
            Contactez la Commission Technique du Désengagement pour toute demande d'information, de rendez-vous ou de précision relative à une opération de désengagement. Nous nous engageons à vous répondre sous 5 jours ouvrables.
          </p>
        </div>
      </section>

      <section className="container" style={{paddingTop: 48, paddingBottom: 80}}>
        <div className="contact-grid">
          <div className="contact-info">
            <h2>Coordonnées officielles</h2>
            <div className="ci-row">
              <div className="ic"><Icon.pin /></div>
              <div>
                <div className="k">Adresse</div>
                <div className="v">N'Djamena, Tchad<br /><span style={{fontSize:'var(--fs-sm)', color:'rgba(255,255,255,0.5)'}}>Adresse complète à préciser</span></div>
              </div>
            </div>
            <div className="ci-row">
              <div className="ic"><Icon.phone /></div>
              <div>
                <div className="k">Téléphone</div>
                <div className="v"><span style={{color:'rgba(255,255,255,0.55)'}}>À préciser</span></div>
              </div>
            </div>
            <div className="ci-row">
              <div className="ic"><Icon.mail /></div>
              <div>
                <div className="k">Email</div>
                <div className="v">contact@ctd.td<br /><span style={{color:'rgba(255,255,255,0.55)', fontSize:'var(--fs-sm)'}}>À préciser</span></div>
              </div>
            </div>
            <div className="ci-row">
              <div className="ic"><Icon.clock /></div>
              <div>
                <div className="k">Horaires d'ouverture</div>
                <div className="v">Lundi à vendredi<br />07h30 — 15h30 (sauf jours fériés)</div>
              </div>
            </div>

            {/* Réseaux sociaux */}
            <div style={{marginTop:24, paddingTop:24, borderTop:'1px solid rgba(255,255,255,0.12)'}}>
              <div style={{fontSize:'var(--fs-xs)', letterSpacing:'0.16em', textTransform:'uppercase', color:'rgba(255,255,255,0.5)', marginBottom:12}}>Réseaux sociaux</div>
              <a href="#" style={{display:'flex', alignItems:'center', gap:10, color:'var(--gold-soft)', fontSize:'var(--fs-sm)', marginBottom:10}}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M4 4h4v4H4zM4 10h4v10H4zM10 10h4v2c.6-1.2 2-2.3 4-2.3 3.5 0 4 2.3 4 5.3V20h-4v-4c0-1.5-.5-2.5-2-2.5s-2 1-2 2.5V20h-4z"/></svg>
                LinkedIn — CTD Tchad (prioritaire)
              </a>
              <a href="#" style={{display:'flex', alignItems:'center', gap:10, color:'rgba(255,255,255,0.6)', fontSize:'var(--fs-sm)'}}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M14 9h3V5h-3a4 4 0 0 0-4 4v2H7v4h3v8h4v-8h3l1-4h-4V9z"/></svg>
                Facebook — CTD Officiel
              </a>
            </div>
          </div>

          <form className="contact-form" onSubmit={handleSubmit}>
            <h2>Envoyer un message</h2>
            {success ? (
              <div style={{background:'rgba(31,92,31,0.1)', border:'1px solid rgba(31,92,31,0.3)', borderRadius:'var(--radius-lg)', padding:'20px 24px', marginBottom:16}}>
                <strong style={{color:'#1F5C1F'}}>✓ Message envoyé avec succès !</strong>
                <p style={{margin:'8px 0 0', fontSize:'var(--fs-sm)', color:'var(--ink-soft)'}}>Nous vous répondrons dans les 5 jours ouvrables.</p>
                <button type="button" className="btn btn-ghost" style={{marginTop:14, padding:'8px 14px', fontSize:13}} onClick={() => setSuccess(false)}>
                  Envoyer un autre message
                </button>
              </div>
            ) : (
              <>
                <p style={{margin:'0 0 20px', color:'var(--ink-mute)', fontSize:'var(--fs-sm)'}}>
                  Champs marqués (*) obligatoires.
                </p>
                {error && (
                  <div style={{background:'rgba(184,30,44,0.08)', border:'1px solid rgba(184,30,44,0.3)', borderRadius:4, padding:'12px 16px', marginBottom:16, color:'var(--red-deep)', fontSize:'var(--fs-sm)'}}>
                    {error}
                  </div>
                )}
                <div className="row">
                  <div className="field">
                    <label htmlFor="c-nom">Nom *</label>
                    <input id="c-nom" name="nom" type="text" placeholder="Votre nom" value={form.nom} onChange={handleChange} required />
                  </div>
                  <div className="field">
                    <label htmlFor="c-prenom">Prénom</label>
                    <input id="c-prenom" name="prenom" type="text" placeholder="Votre prénom" value={form.prenom} onChange={handleChange} />
                  </div>
                </div>
                <div className="row">
                  <div className="field">
                    <label htmlFor="c-email">Email *</label>
                    <input id="c-email" name="email" type="email" placeholder="vous@email.com" value={form.email} onChange={handleChange} required />
                  </div>
                  <div className="field">
                    <label htmlFor="c-tel">Téléphone</label>
                    <input id="c-tel" name="telephone" type="tel" placeholder="+235 …" value={form.telephone} onChange={handleChange} />
                  </div>
                </div>
                <div className="field">
                  <label htmlFor="c-objet">Objet *</label>
                  <select id="c-objet" name="objet" value={form.objet} onChange={handleChange} required>
                    <option value="">— Sélectionner —</option>
                    <option>Information sur une opération de désengagement</option>
                    <option>Appel d'offres — Questions techniques</option>
                    <option>Inscription investisseur</option>
                    <option>Suivi d'un dossier soumis</option>
                    <option>Demande de rendez-vous</option>
                    <option>Partenariat institutionnel</option>
                    <option>Presse / Communication</option>
                    <option>Autre demande</option>
                  </select>
                </div>
                <div className="field">
                  <label htmlFor="c-message">Message *</label>
                  <textarea id="c-message" name="message" placeholder="Décrivez votre demande de manière précise…" value={form.message} onChange={handleChange} required></textarea>
                </div>
                <button className="btn btn-primary" type="submit" style={{alignSelf:'flex-start'}} disabled={sending}>
                  {sending ? 'Envoi en cours…' : (<>Envoyer ma demande <Icon.arrowRight /></>)}
                </button>
              </>
            )}
          </form>
        </div>
      </section>
    </main>
  );
}

/* ─── Espace Investisseurs ─────────────────────────────────── */
export function InvestisseursPage({ go }) {
  const [form, setForm] = useState({ societe: '', pays: '', secteur: '', email: '', nom: '', message: '' });
  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.societe || !form.email || !form.nom) {
      setError('Veuillez remplir tous les champs obligatoires.');
      return;
    }
    setSending(true);
    setError('');
    try {
      await submitForm('INVESTOR', form);
      setSuccess(true);
    } catch (err) {
      setError('Erreur lors de l\'inscription. Veuillez réessayer.');
    } finally {
      setSending(false);
    }
  };

  const opportunites = [
    { secteur: 'Télécommunications', entreprise: 'ONPT', type: 'Cession partielle / totale', statut: 'Manifestation d\'intérêt ouverte' },
    { secteur: 'Agro-industrie', entreprise: 'COTON TCHAD', type: 'Privatisation', statut: 'Phase d\'audit en cours' },
    { secteur: 'Transport & Logistique', entreprise: 'Aéroports régionaux', type: 'Concession de gestion', statut: 'Étude de faisabilité' },
    { secteur: 'Hôtellerie & Tourisme', entreprise: 'Hôtels publics', type: 'Cession d\'actifs', statut: 'Appel d\'offres imminent' },
    { secteur: 'Services publics', entreprise: 'ONEA', type: 'Partenariat Public-Privé', statut: 'Programmé 2027' },
  ];

  return (
    <main id="main" className="page-enter">
      <section className="page-banner" style={{paddingBottom: 40}}>
        <div className="container">
          <h1>Espace Investisseurs — Opportunités de désengagement</h1>
          <p className="lead">
            La Commission Technique du Désengagement vous invite à découvrir les opportunités offertes par le programme national de privatisation. Inscrivez-vous pour recevoir des informations privilégiées sur les opérations en cours et à venir.
          </p>
        </div>
      </section>

      <section className="container" style={{paddingTop: 48, paddingBottom: 80}}>
        {/* Tableau des opportunités */}

        <div style={{overflowX:'auto', marginBottom:48}}>
          <table style={{width:'100%', borderCollapse:'collapse', fontSize:'var(--fs-sm)'}}>
            <thead>
              <tr style={{background:'var(--navy)', color:'white'}}>
                {['Secteur', 'Entreprise', 'Type d\'opération', 'Statut'].map(h => (
                  <th key={h} style={{padding:'12px 16px', textAlign:'left', fontWeight:700, fontSize:12, letterSpacing:'0.1em', textTransform:'uppercase'}}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {opportunites.map((o, i) => (
                <tr key={i} style={{background: i % 2 === 0 ? 'var(--paper)' : 'var(--cream)', borderBottom:'1px solid var(--rule-soft)'}}>
                  <td style={{padding:'14px 16px', fontWeight:600, color:'var(--navy)'}}>{o.secteur}</td>
                  <td style={{padding:'14px 16px'}}>{o.entreprise}</td>
                  <td style={{padding:'14px 16px', color:'var(--ink-soft)'}}>{o.type}</td>
                  <td style={{padding:'14px 16px'}}>
                    <span style={{
                      fontSize:12, fontWeight:700, padding:'3px 10px', borderRadius:2,
                      background: o.statut.includes('ouverte') ? 'rgba(31,92,31,0.1)' : 'rgba(14,42,94,0.08)',
                      color: o.statut.includes('ouverte') ? '#1F5C1F' : '#0E2A5E',
                    }}>{o.statut}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Formulaire inscription */}
        <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:48, alignItems:'start'}} className="inv-grid">
          <div>
            <div className="eyebrow" style={{marginBottom:16}}>Rejoindre la base investisseurs</div>
            <h2 style={{fontSize:'var(--fs-xl)', marginBottom:16}}>Inscrivez-vous pour un accès privilégié</h2>
            <p style={{color:'var(--ink-soft)', lineHeight:1.65, marginBottom:24}}>
              En vous inscrivant dans notre base d'investisseurs, vous recevrez en avant-première les nouvelles opportunités de désengagement, les avis d'appels d'offres et les invitations aux forums d'investisseurs organisés par la CTD.
            </p>
            {[
              { ic: '📩', t: 'Alertes personnalisées', d: 'Recevez les AO correspondant à votre secteur d\'intérêt dès leur publication.' },
              { ic: '📋', t: 'Accès aux DAO', d: 'Téléchargement simplifié des dossiers d\'appel d\'offres.' },
              { ic: '🤝', t: 'Rencontres directes', d: 'Invitations aux forums et réunions d\'investisseurs organisés par la CTD.' },
            ].map((b, i) => (
              <div key={i} style={{display:'flex', gap:14, marginBottom:16, alignItems:'flex-start'}}>
                <span style={{fontSize:24}}>{b.ic}</span>
                <div>
                  <strong style={{color:'var(--navy)', display:'block', marginBottom:4}}>{b.t}</strong>
                  <span style={{fontSize:'var(--fs-sm)', color:'var(--ink-soft)'}}>{b.d}</span>
                </div>
              </div>
            ))}
          </div>

          <form className="contact-form" onSubmit={handleSubmit} style={{background:'var(--paper)', border:'1px solid var(--rule)', borderRadius:'var(--radius-lg)', padding:'32px 36px'}}>
            <h3 style={{marginBottom:20}}>Inscription investisseur</h3>
            {success ? (
              <div style={{background:'rgba(31,92,31,0.1)', border:'1px solid rgba(31,92,31,0.3)', borderRadius:'var(--radius-lg)', padding:'20px 24px'}}>
                <strong style={{color:'#1F5C1F', display:'block', marginBottom:8}}>✓ Inscription enregistrée !</strong>
                <p style={{margin:0, fontSize:'var(--fs-sm)', color:'var(--ink-soft)'}}>Vous recevrez un email de confirmation et serez contacté par nos équipes dans les 48 heures.</p>
              </div>
            ) : (
              <>
                {error && <div style={{background:'rgba(184,30,44,0.08)', border:'1px solid rgba(184,30,44,0.3)', borderRadius:4, padding:'12px 16px', marginBottom:16, color:'var(--red-deep)', fontSize:'var(--fs-sm)'}}>{error}</div>}
                <div className="field">
                  <label htmlFor="i-nom">Nom complet *</label>
                  <input id="i-nom" name="nom" type="text" placeholder="Nom du représentant" value={form.nom} onChange={handleChange} required />
                </div>
                <div className="field">
                  <label htmlFor="i-societe">Structure / Société *</label>
                  <input id="i-societe" name="societe" type="text" placeholder="Raison sociale" value={form.societe} onChange={handleChange} required />
                </div>
                <div className="field">
                  <label htmlFor="i-pays">Pays d'origine</label>
                  <input id="i-pays" name="pays" type="text" placeholder="Tchad, France, Cameroun…" value={form.pays} onChange={handleChange} />
                </div>
                <div className="field">
                  <label htmlFor="i-secteur">Secteur d'intérêt</label>
                  <select id="i-secteur" name="secteur" value={form.secteur} onChange={handleChange}>
                    <option value="">— Tous les secteurs —</option>
                    <option>Télécommunications</option>
                    <option>Agro-industrie</option>
                    <option>Transport & Logistique</option>
                    <option>Énergie</option>
                    <option>Hôtellerie & Tourisme</option>
                    <option>Services publics / PPP</option>
                    <option>Autre</option>
                  </select>
                </div>
                <div className="field">
                  <label htmlFor="i-email">Email professionnel *</label>
                  <input id="i-email" name="email" type="email" placeholder="contact@societe.com" value={form.email} onChange={handleChange} required />
                </div>
                <div className="field">
                  <label htmlFor="i-message">Message (facultatif)</label>
                  <textarea id="i-message" name="message" placeholder="Précisez votre intérêt ou vos questions…" value={form.message} onChange={handleChange} style={{height:80}}></textarea>
                </div>
                <button className="btn btn-primary" type="submit" style={{width:'100%', justifyContent:'center'}} disabled={sending}>
                  {sending ? 'Inscription en cours…' : (<>S'inscrire à la base investisseurs <Icon.arrowRight /></>)}
                </button>
              </>
            )}
          </form>
        </div>
      </section>
    </main>
  );
}
