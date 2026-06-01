/* Bande Flash Infos — chargée depuis l'API backend
   + Bulle Chat IA avec suggestions CTD */

import React, { useState, useEffect, useRef } from 'react';
import { Icon } from './icons';
import { FLASH_INFOS as FLASH_FALLBACK } from './data';
import { getSettings } from './api';

/* ─── FlashInfoBand ────────────────────────────────────────── */
export function FlashInfoBand() {
  const [idx, setIdx] = useState(0);
  const [paused, setPaused] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [infos, setInfos] = useState(FLASH_FALLBACK);

  // Charger les flash infos depuis l'API
  useEffect(() => {
    getSettings()
      .then(s => {
        if (s?.flashInfos) {
          try {
            const parsed = typeof s.flashInfos === 'string' ? JSON.parse(s.flashInfos) : s.flashInfos;
            if (Array.isArray(parsed) && parsed.length > 0) setInfos(parsed);
          } catch {
            // Utiliser le fallback statique
          }
        }
      })
      .catch(() => { /* Utiliser le fallback statique */ });
  }, []);

  useEffect(() => {
    if (paused || infos.length === 0) return;
    const t = setTimeout(() => setIdx(i => (i + 1) % infos.length), 5500);
    return () => clearTimeout(t);
  }, [idx, paused, infos.length]);

  useEffect(() => {
    const footer = document.querySelector('.gov-footer');
    if (!footer) return;
    const obs = new IntersectionObserver(
      (entries) => setHidden(entries[0].isIntersecting),
      { threshold: 0, rootMargin: '0px 0px -50px 0px' }
    );
    obs.observe(footer);
    return () => obs.disconnect();
  }, []);

  if (!infos.length) return null;
  const current = infos[idx] || infos[0];

  return (
    <div className={`flash-band severity-${current.severity} ${hidden ? 'is-hidden' : ''}`}
         role="region" aria-live="polite" aria-label="Bande d'informations en flash"
         onMouseEnter={() => setPaused(true)}
         onMouseLeave={() => setPaused(false)}>
      <div className="container flash-container">
        <div className="flash-tag">
          <span className="flash-dot" aria-hidden="true"></span>
          <span className="flash-label">FLASH CTD</span>
        </div>
        <div className="flash-stage" aria-hidden="true">
          {infos.map((it, i) => (
            <div key={i} className={`flash-item ${i === idx ? 'is-current' : ''}`}>
              <span className="flash-severity">{it.label}</span>
              <span className="flash-text">{it.text}</span>
            </div>
          ))}
        </div>
        <div className="flash-controls">
          <span className="flash-counter">{String(idx + 1).padStart(2,'0')} / {String(infos.length).padStart(2,'0')}</span>
          <button onClick={() => setIdx(i => (i - 1 + infos.length) % infos.length)} aria-label="Précédent">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
          </button>
          <button onClick={() => setPaused(p => !p)} aria-label={paused ? 'Reprendre' : 'Pause'}>
            {paused ? (
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><polygon points="6 4 20 12 6 20"/></svg>
            ) : (
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
            )}
          </button>
          <button onClick={() => setIdx(i => (i + 1) % infos.length)} aria-label="Suivant">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Markdown Renderer ─────────────────────────────────────── */
function renderInline(text, keyPrefix = '') {
  const out = [];
  let i = 0; let cursor = 0; let key = 0;
  const push = (node) => out.push(node);
  const flush = (upTo) => { if (upTo > cursor) { push(text.slice(cursor, upTo)); cursor = upTo; } };
  while (i < text.length) {
    if (text.startsWith('**', i)) {
      const end = text.indexOf('**', i + 2);
      if (end !== -1 && end > i + 2) {
        flush(i);
        push(<strong key={`${keyPrefix}b${key++}`}>{text.slice(i+2, end)}</strong>);
        i = cursor = end + 2; continue;
      }
    }
    if (text[i] === '*' && text[i+1] !== '*') {
      const end = text.indexOf('*', i + 1);
      if (end !== -1 && end > i + 1) {
        flush(i);
        push(<em key={`${keyPrefix}i${key++}`}>{text.slice(i+1, end)}</em>);
        i = cursor = end + 1; continue;
      }
    }
    i++;
  }
  flush(text.length);
  return out;
}

function renderMarkdown(text) {
  const lines = text.split('\n');
  const blocks = [];
  let listItems = null;
  let listType = null;
  let key = 0;
  const flushList = () => {
    if (listItems) {
      const Tag = listType === 'ol' ? 'ol' : 'ul';
      blocks.push(<Tag key={`l${key++}`} className="chat-list">{listItems}</Tag>);
      listItems = null; listType = null;
    }
  };
  for (let raw of lines) {
    const line = raw.replace(/\s+$/, '');
    if (!line.trim()) { flushList(); continue; }
    if (line.startsWith('## ')) { flushList(); blocks.push(<h3 key={`h${key++}`} className="chat-h3">{renderInline(line.slice(3))}</h3>); continue; }
    if (/^\s*[-*•]\s+/.test(line)) {
      if (listType !== 'ul') { flushList(); listType = 'ul'; listItems = []; }
      listItems.push(<li key={`li${key++}`}>{renderInline(line.replace(/^\s*[-*•]\s+/, ''))}</li>);
      continue;
    }
    flushList();
    blocks.push(<p key={`p${key++}`} className="chat-p">{renderInline(line)}</p>);
  }
  flushList();
  return blocks;
}

/* ─── ChatBubble CTD ────────────────────────────────────────── */
export function ChatBubble() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'bot', text: "Bonjour 👋 Je suis l'assistant virtuel de la CTD. Comment puis-je vous aider ? Je peux vous informer sur nos appels d'offres, le suivi de dossier ou les procédures de désengagement." },
  ]);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const endRef = useRef(null);

  useEffect(() => {
    if (endRef.current) endRef.current.scrollIntoView({ block: 'end' });
  }, [messages, thinking]);

  const suggestions = [
    "Consulter les appels d'offres",
    "Suivre un dossier",
    "Comment soumettre une offre ?",
    "Contacter la CTD",
  ];

  const send = (txt) => {
    const q = (txt || input).trim();
    if (!q || thinking) return;
    setMessages(m => [...m, { role: 'user', text: q }]);
    setInput("");
    setThinking(true);

    setTimeout(() => {
      const low = q.toLowerCase();
      let reply = "Je suis l'assistant virtuel de la CTD. Pour toute assistance personnalisée, contactez-nous à **contact@ctd.td** ou via le formulaire de contact.";

      if (low.includes('appel') || low.includes('offre') || low.includes('ao')) {
        reply = "Nos appels d'offres sont disponibles dans la section **Appels d'offres** du portail.\n\n- Vous pouvez y consulter tous les AO ouverts\n- Télécharger les DAO gratuitement\n- Soumettre votre offre en ligne";
      } else if (low.includes('suivre') || low.includes('dossier') || low.includes('soumission')) {
        reply = "Pour suivre votre dossier, munissez-vous de votre numéro de référence au format **CTD-2026-XXXXX** et rendez-vous dans la section **Suivre mon dossier**.";
      } else if (low.includes('soumettre') || low.includes('participer') || low.includes('candidater')) {
        reply = "Pour soumettre une offre :\n\n1. Consultez l'appel d'offres correspondant\n2. Téléchargez le DAO complet\n3. Préparez votre dossier selon les exigences\n4. Soumettez en ligne ou déposez au siège de la CTD avant la date de clôture";
      } else if (low.includes('contact') || low.includes('rendez-vous') || low.includes('rdv')) {
        reply = "Vous pouvez nous contacter :\n- Par email : **contact@ctd.td**\n- Via le formulaire de **contact** du portail\n- En personne à notre siège à N'Djamena (07h30 — 15h30)";
      } else if (low.includes('investisseur') || low.includes('investir') || low.includes('privatisation')) {
        reply = "Pour les opportunités d'investissement, rendez-vous dans notre **Espace Investisseurs**. Vous y trouverez le portefeuille de désengagement en cours et pourrez vous inscrire pour recevoir nos alertes.";
      }

      setMessages(m => [...m, { role: 'bot', text: reply }]);
      setThinking(false);
    }, 900);
  };

  return (
    <>
      <button className={`chat-launcher ${open ? 'hidden' : ''}`}
              onClick={() => setOpen(true)}
              aria-label="Ouvrir l'assistant virtuel CTD">
        <span className="chat-launcher-dot" aria-hidden="true"></span>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 12a8 8 0 0 1-12.8 6.4L3 20l1.6-5.2A8 8 0 1 1 21 12z"/>
          <circle cx="9" cy="12" r="1" fill="currentColor"/>
          <circle cx="12" cy="12" r="1" fill="currentColor"/>
          <circle cx="15" cy="12" r="1" fill="currentColor"/>
        </svg>
        <span className="chat-launcher-label">Assistant&nbsp;CTD</span>
      </button>

      {open && (
        <div className="chat-panel" role="dialog" aria-label="Assistant virtuel CTD">
          <div className="chat-head">
            <div className="chat-avatar">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="4" y="6" width="16" height="14" rx="2"/>
                <circle cx="9" cy="13" r="1.2" fill="currentColor"/>
                <circle cx="15" cy="13" r="1.2" fill="currentColor"/>
                <line x1="12" y1="2" x2="12" y2="6"/>
                <circle cx="12" cy="2" r="1" fill="currentColor"/>
              </svg>
            </div>
            <div className="chat-meta">
              <div className="chat-title">Assistant CTD</div>
              <div className="chat-status"><span className="dot"></span> En ligne · Commission Technique du Désengagement</div>
            </div>
            <button className="chat-close" onClick={() => setOpen(false)} aria-label="Fermer">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><line x1="6" y1="6" x2="18" y2="18"/><line x1="18" y1="6" x2="6" y2="18"/></svg>
            </button>
          </div>
          <div className="chat-body">
            {messages.map((m, i) => (
              <div key={i} className={`chat-msg ${m.role}`}>
                {m.role === 'bot' && <div className="chat-msg-avatar">CTD</div>}
                <div className="chat-msg-bubble">
                  {m.role === 'bot' ? renderMarkdown(m.text) : m.text}
                </div>
              </div>
            ))}
            {thinking && (
              <div className="chat-msg bot">
                <div className="chat-msg-avatar">CTD</div>
                <div className="chat-msg-bubble">
                  <div className="typing"><span></span><span></span><span></span></div>
                </div>
              </div>
            )}
            <div ref={endRef}></div>
          </div>
          {messages.length <= 1 && (
            <div className="chat-suggestions">
              {suggestions.map((s, i) => (
                <button key={i} onClick={() => send(s)}>{s}</button>
              ))}
            </div>
          )}
          <form className="chat-input" onSubmit={(e) => { e.preventDefault(); send(); }}>
            <input value={input} onChange={e => setInput(e.target.value)}
                   placeholder="Posez votre question…"
                   aria-label="Message" />
            <button type="submit" disabled={!input.trim() || thinking} aria-label="Envoyer">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13"/>
                <polygon points="22 2 15 22 11 13 2 9 22 2"/>
              </svg>
            </button>
          </form>
          <div className="chat-foot">
            Réponses automatiques. Pour assistance officielle : <strong>contact@ctd.td</strong>
          </div>
        </div>
      )}
    </>
  );
}
