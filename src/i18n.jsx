/* i18n.jsx — Traduction automatique du portail public CTD (FR -> AR / EN)
   --------------------------------------------------------------------
   Principe : le site est rédigé en français (source). Quand l'utilisateur
   choisit AR ou EN, un moteur parcourt le DOM rendu et traduit à la volée
   TOUT le texte visible (interface fixe ET contenu saisi par l'admin).

   La traduction passe par NOTRE backend (/api/translate), qui met en cache
   PARTAGÉ : chaque texte n'est traduit qu'une fois pour l'ensemble des
   visiteurs (le quota du service amont devient négligeable). Le backend peut
   utiliser MyMemory (gratuit) ou un LibreTranslate auto-hébergé (illimité).

   Sécurité React : on ne modifie QUE `node.nodeValue` de nœuds texte
   existants (jamais la structure DOM) -> pas de crash de réconciliation. */

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';

const STORAGE_KEY = 'ctd_lang';
const CACHE_KEY = 'ctd_i18n_cache_v1';
const LANG_ISO = { FR: 'fr', AR: 'ar', EN: 'en' };

// La traduction passe par notre backend (/api/translate) — cache partagé serveur.
const API_BASE = import.meta.env.VITE_API_URL || '';

/* ─── Cache navigateur { ar: { "source": "trad" }, en: {...} } ─────────── */
let cache = {};
try { cache = JSON.parse(localStorage.getItem(CACHE_KEY) || '{}') || {}; } catch { cache = {}; }
let saveTimer = null;
const persistCache = () => {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    try { localStorage.setItem(CACHE_KEY, JSON.stringify(cache)); } catch { /* quota */ }
  }, 800);
};
const getCached = (target, src) => (cache[target] && cache[target][src]) || null;
const setCached = (target, src, val) => {
  if (!cache[target]) cache[target] = {};
  cache[target][src] = val;
  persistCache();
};

/* ─── Nœuds : on retient le français d'origine et la dernière traduction ── */
const originalText = new WeakMap(); // Text -> nodeValue français complet
const appliedText = new WeakMap();  // Text -> dernière valeur traduite posée

const SKIP_TAGS = new Set(['SCRIPT', 'STYLE', 'NOSCRIPT', 'TEXTAREA', 'INPUT', 'CODE', 'PRE', 'SVG']);

const isTranslatable = (s) => {
  if (!s || s.length < 2) return false;
  if (!/[A-Za-zÀ-ÿ؀-ۿ]/.test(s)) return false;                       // au moins une lettre
  if (/^[\d\s.,:/%°€$£()+\-–—_'"]+$/.test(s)) return false;          // chiffres/symboles seuls
  if (/^https?:\/\//i.test(s) || /^\S+@\S+\.\S+$/.test(s)) return false; // url / email
  return true;
};

const shouldSkipNode = (node) => {
  let el = node.parentElement;
  while (el) {
    if (SKIP_TAGS.has(el.tagName)) return true;
    if (el.getAttribute && (el.getAttribute('translate') === 'no' || el.hasAttribute('data-no-translate'))) return true;
    el = el.parentElement;
  }
  return false;
};

/* ─── Appel GROUPÉ à notre backend (/api/translate) ─────────────────────
   Une seule requête pour tous les textes en attente. */
const inFlight = new Set();
async function processQueue(cores, target, onDone) {
  const list = [...cores].filter((c) => !inFlight.has(target + ' ' + c) && getCached(target, c) == null);
  if (!list.length) { onDone(false); return; }
  list.forEach((c) => inFlight.add(target + ' ' + c));
  try {
    const res = await fetch(`${API_BASE}/api/translate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ q: list, target }),
    });
    if (res.ok) {
      const data = await res.json();
      const translations = (data && data.translations) || [];
      list.forEach((src, i) => {
        const val = translations[i];
        if (val && val !== src) setCached(target, src, val);
      });
    }
  } catch {
    /* repli : on garde le français */
  } finally {
    list.forEach((c) => inFlight.delete(target + ' ' + c));
  }
  onDone(true);
}

const splitWs = (raw) => {
  const m = raw.match(/^(\s*)([\s\S]*?)(\s*)$/);
  return { lead: m[1], core: m[2], trail: m[3] };
};

/* ─── Parcours du DOM et application des traductions ───────────────────── */
function translateDom(root, target, requestRerun) {
  if (!root) return;
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null);
  const pending = new Set();
  let n;
  while ((n = walker.nextNode())) {
    const raw = n.nodeValue;
    if (!raw) continue;
    if (appliedText.get(n) === raw) continue;          // déjà traduit, on n'y touche plus
    const { lead, core, trail } = splitWs(raw);
    if (!isTranslatable(core)) continue;
    if (shouldSkipNode(n)) continue;
    originalText.set(n, raw);                            // mémorise le français
    const cached = getCached(target, core);
    if (cached != null) {
      const out = lead + cached + trail;
      appliedText.set(n, out);
      if (n.nodeValue !== out) n.nodeValue = out;
    } else {
      pending.add(core);
    }
  }
  if (pending.size) processQueue(pending, target, (changed) => { if (changed) requestRerun(); });
}

function restoreOriginals(root) {
  if (!root) return;
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null);
  let n;
  while ((n = walker.nextNode())) {
    if (appliedText.get(n) === n.nodeValue && originalText.has(n)) {
      n.nodeValue = originalText.get(n);
    }
    appliedText.delete(n);
  }
}

/* ─── Contexte React ───────────────────────────────────────────────────── */
const LangContext = createContext({ lang: 'FR', setLang: () => {} });
export const useLang = () => useContext(LangContext);

export function LangProvider({ children }) {
  const [lang, setLangState] = useState(() => {
    try { return localStorage.getItem(STORAGE_KEY) || 'FR'; } catch { return 'FR'; }
  });

  const setLang = useCallback((l) => {
    try { localStorage.setItem(STORAGE_KEY, l); } catch { /* ignore */ }
    setLangState(l);
  }, []);

  // Attribut lang + sens d'écriture (RTL pour l'arabe)
  useEffect(() => {
    const el = document.documentElement;
    el.lang = LANG_ISO[lang] || 'fr';
    el.dir = lang === 'AR' ? 'rtl' : 'ltr';
  }, [lang]);

  // Moteur de traduction automatique
  useEffect(() => {
    const root = document.getElementById('root');
    if (lang === 'FR') { restoreOriginals(root); return; }
    const target = LANG_ISO[lang];
    let raf = 0;
    let stopped = false;
    let debounceTimer = null;
    const run = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => { if (!stopped) translateDom(root, target, schedule); });
    };
    const schedule = () => { clearTimeout(debounceTimer); debounceTimer = setTimeout(run, 120); };
    schedule();
    const observer = new MutationObserver(schedule);
    observer.observe(root, { childList: true, subtree: true, characterData: true });
    return () => {
      stopped = true;
      observer.disconnect();
      clearTimeout(debounceTimer);
      cancelAnimationFrame(raf);
    };
  }, [lang]);

  return <LangContext.Provider value={{ lang, setLang }}>{children}</LangContext.Provider>;
}
