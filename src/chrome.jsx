/* Chrome CTD : header institutionnel + footer enrichi
   Commission Technique du Désengagement */

import React, { useState, useEffect, useRef } from 'react';
import { Icon } from './icons';

const INSTITUTION_SUBPAGES = [
  { id: 'institution-presentation', label: 'Présentation', desc: 'La CTD, son rôle et sa vision' },
  { id: 'institution-missions', label: 'Missions & Attributions', desc: '9 missions officielles' },
  { id: 'institution-structure', label: 'Organisation', desc: 'Organigramme institutionnel' },
  { id: 'institution-mot', label: 'Mot du Président', desc: 'Message officiel' },
  { id: 'institution-historique', label: 'Historique', desc: 'Contexte et création de la CTD' },
];

const NAV_ITEMS = [
  { id: 'home', label: 'Accueil' },
  { id: 'institution', label: "L'Institution", children: INSTITUTION_SUBPAGES },
  { id: 'appels-offres', label: "Appels d'offres" },
  { id: 'actualites', label: 'Actualités' },
  { id: 'documentation', label: 'Documents' },
];

const LANGS = [
  { code: 'FR', label: 'Français', flag: '🇫🇷' },
  { code: 'AR', label: 'العربية', flag: '🇹🇩' },
  { code: 'EN', label: 'English', flag: '🇬🇧' },
];

function LangDropdown({ lang, setLang }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('click', h);
    return () => document.removeEventListener('click', h);
  }, []);
  const current = LANGS.find(l => l.code === lang) || LANGS[0];
  return (
    <div className="nav-utility-item" ref={ref}>
      <button className="nav-utility-btn" onClick={() => setOpen(o => !o)} aria-haspopup="true" aria-expanded={open} aria-label="Choisir la langue">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="9"/>
          <line x1="3" y1="12" x2="21" y2="12"/>
          <path d="M12 3 a 14 14 0 0 1 0 18 a 14 14 0 0 1 0 -18 z"/>
        </svg>
        <span>{current.code}</span>
        <svg className="caret" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{transform: open ? 'rotate(180deg)' : 'rotate(0)'}}>
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </button>
      {open && (
        <div className="nav-utility-menu" style={{minWidth: 180}}>
          {LANGS.map(l => (
            <button key={l.code} className={`lang-row ${l.code === lang ? 'active' : ''}`}
                    onClick={() => { setLang(l.code); setOpen(false); }}>
              <span className="lang-flag" aria-hidden="true">{l.flag}</span>
              <span className="lang-label">{l.label}</span>
              <span className="lang-code">{l.code}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function AccessibilityDropdown({ contrast, setContrast, textSize, setTextSize }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('click', h);
    return () => document.removeEventListener('click', h);
  }, []);
  return (
    <div className="nav-utility-item" ref={ref}>
      <button className="nav-utility-btn" onClick={() => setOpen(o => !o)} aria-haspopup="true" aria-expanded={open} aria-label="Options d'accessibilité" title="Accessibilité">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="9"/>
          <circle cx="12" cy="6.5" r="1.5" fill="currentColor"/>
          <path d="M7 10.5h10"/>
          <path d="M12 10.5v6"/>
          <path d="M9 19l3-4 3 4"/>
        </svg>
        <span style={{fontSize:11}}>Aa</span>
      </button>
      {open && (
        <div className="nav-utility-menu" style={{minWidth: 260}}>
          <div className="acc-section-label">Taille du texte</div>
          <div className="acc-text-row">
            {[
              { id: 'base', label: 'A', desc: 'Standard' },
              { id: 'large', label: 'A+', desc: 'Agrandi' },
              { id: 'xlarge', label: 'A++', desc: 'Très agrandi' },
            ].map(t => (
              <button key={t.id}
                      className={`acc-text-btn ${textSize === t.id ? 'active' : ''}`}
                      onClick={() => setTextSize(t.id)}
                      title={t.desc}>
                <span className="acc-text-letter">{t.label}</span>
                <span className="acc-text-desc">{t.desc}</span>
              </button>
            ))}
          </div>
          <div className="acc-section-label">Contraste</div>
          <button className={`acc-toggle ${contrast === 'high' ? 'active' : ''}`}
                  onClick={() => setContrast(contrast === 'high' ? 'normal' : 'high')}>
            <span>Contraste élevé</span>
            <span className="acc-toggle-state">{contrast === 'high' ? '●' : '○'}</span>
          </button>
        </div>
      )}
    </div>
  );
}

function InternalSpacesDropdown({ go }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('click', h);
    return () => document.removeEventListener('click', h);
  }, []);
  return (
    <div className="nav-utility-item" ref={ref}>
      <button className="nav-utility-btn subtle" onClick={() => setOpen(o => !o)} aria-haspopup="true" aria-expanded={open} title="Accès administration">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <rect x="3" y="11" width="18" height="11" rx="2"/>
          <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
        </svg>
        <span>Espace interne</span>
        <svg className="caret" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{transform: open ? 'rotate(180deg)' : 'rotate(0)'}}>
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </button>
      {open && (
        <div className="nav-utility-menu" style={{minWidth: 300, right: 0, left: 'auto'}}>
          <a href="http://localhost:8080/admin/login" target="_blank" rel="noopener noreferrer" className="space-row">
            <div className="us-icon" style={{background:'#0E2A5E'}}>A</div>
            <div>
              <div className="us-name">Console d'administration</div>
              <div className="us-desc">Gérer le contenu du portail CTD</div>
            </div>
          </a>
          <a href="http://localhost:8080/admin" target="_blank" rel="noopener noreferrer" className="space-row">
            <div className="us-icon" style={{background:'#1F5C1F'}}>D</div>
            <div>
              <div className="us-name">Tableau de bord</div>
              <div className="us-desc">Statistiques & indicateurs</div>
            </div>
          </a>
        </div>
      )}
    </div>
  );
}

export function GovHeader({ route, go, contrast, setContrast, textSize, setTextSize, lang, setLang }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openItem, setOpenItem] = useState(null);
  const dropdownRef = useRef(null);

  useEffect(() => { setMobileOpen(false); setOpenItem(null); }, [route]);

  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpenItem(null);
      }
    };
    document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, []);

  const isActive = (item) => {
    if (item.id === route) return true;
    if (item.children) return item.children.some(c => c.id === route);
    return false;
  };

  return (
    <header className="gov-header" role="banner">
      <div className="gov-header-top">
        <div className="container">
          <a href="#" onClick={(e)=>{e.preventDefault(); go('home');}} className="brand" aria-label="Retour à l'accueil">
            <img src="/assets/armoiries-tchad.png" alt="Armoiries de la République du Tchad" />
            <div className="brand-text">
              <div className="l1">Commission Technique<br/>du Désengagement</div>
            </div>
          </a>
          <label className="header-search" aria-label="Recherche dans le portail">
            <Icon.search style={{width:16, height:16}} />
            <input type="search" placeholder="Rechercher un appel d'offres, document…" />
          </label>
          <button className="mobile-toggle" onClick={() => setMobileOpen(o => !o)} aria-label="Menu" aria-expanded={mobileOpen}>
            {mobileOpen ? (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><line x1="6" y1="6" x2="18" y2="18"/><line x1="18" y1="6" x2="6" y2="18"/></svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><line x1="4" y1="7" x2="20" y2="7"/><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="17" x2="20" y2="17"/></svg>
            )}
            Menu
          </button>
        </div>
      </div>
      <nav className={`gov-nav ${mobileOpen ? 'open' : ''}`} role="navigation" aria-label="Navigation principale" ref={dropdownRef}>
        <div className="container">
          {NAV_ITEMS.map(item => (
            item.children ? (
              <div key={item.id} className={`nav-item ${openItem === item.id ? 'open' : ''}`}>
                <a href="#" onClick={(e)=>{e.preventDefault(); setOpenItem(o => o === item.id ? null : item.id);}}
                   className={isActive(item) ? 'active' : ''}
                   aria-haspopup="true" aria-expanded={openItem === item.id}>
                  {item.label}
                  <svg className="nav-caret" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="6 9 12 15 18 9"/>
                  </svg>
                </a>
                <div className="gov-dropdown" role="menu">
                  {item.children.map(c => (
                    <a key={c.id} href="#" onClick={(e)=>{e.preventDefault(); go(c.id); setOpenItem(null);}}
                       className={route === c.id ? 'active' : ''} role="menuitem">
                      {c.label}
                      <span className="dd-desc">{c.desc}</span>
                    </a>
                  ))}
                </div>
              </div>
            ) : (
              <a key={item.id} href="#" onClick={(e)=>{e.preventDefault(); go(item.id);}}
                 className={route === item.id ? 'active' : ''}
                 aria-current={route === item.id ? 'page' : undefined}>
                {item.label}
              </a>
            )
          ))}
          <div className="spacer"></div>
          {/* CTA Investisseur */}
          <button className="btn btn-gold" style={{padding:'8px 18px', fontSize:13, marginRight:8}} onClick={() => go('investisseurs')}>
            Espace Investisseurs
          </button>
          <div className="nav-utility">
            <AccessibilityDropdown contrast={contrast} setContrast={setContrast} textSize={textSize} setTextSize={setTextSize} />
            <span className="nav-utility-sep" aria-hidden="true"></span>
            <InternalSpacesDropdown go={go} />
            <span className="nav-utility-sep" aria-hidden="true"></span>
            <LangDropdown lang={lang} setLang={setLang} />
          </div>
        </div>
      </nav>
    </header>
  );
}

export function GovFooter({ go }) {
  return (
    <footer className="gov-footer" role="contentinfo">
      <div className="container">
        {/* Bloc infos pratiques */}
        <div className="footer-info-grid" style={{paddingBottom: 36, borderBottom:'1px solid rgba(255,255,255,0.12)'}}>
          <div className="footer-info">
            <div className="ic"><Icon.pin /></div>
            <div>
              <div className="k">Localisation</div>
              <span className="v">N'Djamena, Tchad<br/>Avenue Charles de Gaulle</span>
            </div>
          </div>
          <div className="footer-info">
            <div className="ic"><Icon.phone /></div>
            <div>
              <div className="k">Téléphone</div>
              <a href="tel:+23522000000">+235 22 00 00 00</a>
              <span style={{fontSize:12, color:'var(--gold-soft)', display:'block', marginTop:4}}>À préciser</span>
            </div>
          </div>
          <div className="footer-info">
            <div className="ic"><Icon.mail /></div>
            <div>
              <div className="k">Email</div>
              <a href="mailto:contact@ctd.td">contact@ctd.td</a>
              <span style={{fontSize:12, color:'rgba(255,255,255,0.4)', display:'block', marginTop:4}}>À préciser</span>
            </div>
          </div>
          <div className="footer-info">
            <div className="ic"><Icon.clock /></div>
            <div>
              <div className="k">Horaires d'ouverture</div>
              <span className="v">Lundi — Vendredi<br/>07h30 — 15h30</span>
              <div className="footer-socials-row" aria-label="Réseaux sociaux officiels" style={{marginTop:12, display: 'flex', gap: 10}}>
                <a href="#" aria-label="LinkedIn — CTD Tchad" target="_blank" rel="noopener noreferrer"
                   style={{display:'inline-flex', alignItems:'center', justifyContent:'center', width: 32, height: 32, borderRadius: '50%', background: 'rgba(255,255,255,0.05)', color:'var(--gold-soft)', transition: 'background 0.2s'}}
                   onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                   onMouseOut={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M4 4h4v4H4zM4 10h4v10H4zM10 10h4v2c.6-1.2 2-2.3 4-2.3 3.5 0 4 2.3 4 5.3V20h-4v-4c0-1.5-.5-2.5-2-2.5s-2 1-2 2.5V20h-4z"/></svg>
                </a>
                <a href="#" aria-label="Facebook — CTD Tchad" target="_blank" rel="noopener noreferrer"
                   style={{display:'inline-flex', alignItems:'center', justifyContent:'center', width: 32, height: 32, borderRadius: '50%', background: 'rgba(255,255,255,0.05)', color:'rgba(255,255,255,0.6)', transition: 'background 0.2s'}}
                   onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                   onMouseOut={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M14 9h3V5h-3a4 4 0 0 0-4 4v2H7v4h3v8h4v-8h3l1-4h-4V9z"/></svg>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Colonnes footer */}
        <div style={{display:'grid', gridTemplateColumns:'1.4fr 1fr 1fr', gap: 40, padding: '36px 0 0'}} className="footer-cols">
          <div className="footer-brand">
            <img src="/assets/armoiries-tchad.png" alt="Armoiries du Tchad" />
            <div>
              <div className="l2" style={{ marginTop: 4 }}>Commission Technique<br/>du Désengagement</div>
            </div>
          </div>
          <div className="footer-col">
            <h4>Navigation</h4>
            <ul>
              <li><a href="#" onClick={(e)=>{e.preventDefault(); go('institution-presentation');}}>L'Institution</a></li>
              <li><a href="#" onClick={(e)=>{e.preventDefault(); go('appels-offres');}}>Appels d'offres</a></li>
              <li><a href="#" onClick={(e)=>{e.preventDefault(); go('actualites');}}>Actualités</a></li>
              <li><a href="#" onClick={(e)=>{e.preventDefault(); go('documentation');}}>Documents officiels</a></li>
              <li><a href="#" onClick={(e)=>{e.preventDefault(); go('investisseurs');}}>Espace Investisseurs</a></li>
              <li><a href="#" onClick={(e)=>{e.preventDefault(); go('contact');}}>Contact</a></li>
            </ul>
          </div>
          <div className="footer-col">
            <h4>Liens utiles</h4>
            <ul>
              <li><a href="https://www.presidence.td" target="_blank" rel="noopener noreferrer">Présidence de la République</a></li>
              <li><a href="#" target="_blank" rel="noopener noreferrer">Primature</a></li>
              <li><a href="#" target="_blank" rel="noopener noreferrer">Ministère du Commerce et de l'Industrie</a></li>
              <li><a href="#" target="_blank" rel="noopener noreferrer">Ministère des Finances et du Budget</a></li>
              <li><a href="#" target="_blank" rel="noopener noreferrer">Gouvernement du Tchad</a></li>
              <li><a href="#" target="_blank" rel="noopener noreferrer">Agence Nationale des Investissements</a></li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom" style={{marginTop: 32, marginBottom: 64, textAlign: 'center'}}>
          <div>
            © {new Date().getFullYear()} Commission Technique du Désengagement.
            &nbsp;·&nbsp; <a href="#" style={{color:'rgba(255,255,255,0.55)', textDecoration:'underline'}}>Mentions légales</a>
            &nbsp;·&nbsp; <a href="#" style={{color:'rgba(255,255,255,0.55)', textDecoration:'underline'}}>Accessibilité (RGAA)</a>
            &nbsp;·&nbsp; <a href="#" style={{color:'rgba(255,255,255,0.55)', textDecoration:'underline'}}>Données personnelles</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
