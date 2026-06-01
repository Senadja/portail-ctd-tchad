/* Client API — Portail CTD
   Proxy Vite configuré → /api/* redirigé vers http://localhost:5015
   En production, VITE_API_URL doit pointer vers le backend déployé */

const BASE = import.meta.env.VITE_API_URL || '';

async function fetchJSON(path, opts = {}) {
  const res = await fetch(`${BASE}${path}`, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...opts.headers },
    ...opts,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(err.message || 'Erreur réseau');
  }
  return res.json();
}

/* ─── Actualités ───────────────────────────────────────────── */
export const getArticles = (params = '') =>
  fetchJSON(`/api/articles${params}`);

export const getArticleBySlug = (slug) =>
  fetchJSON(`/api/articles/${slug}`);

/* ─── Appels d'offres ─────────────────────────────────────── */
export const getTenders = (params = '') =>
  fetchJSON(`/api/tenders${params}`);

export const getTenderById = (id) =>
  fetchJSON(`/api/tenders/${id}`);

/* ─── Documents ───────────────────────────────────────────── */
export const getDocuments = (params = '') =>
  fetchJSON(`/api/documents${params}`);

/* ─── Paramètres / Settings ───────────────────────────────── */
export const getSettings = () =>
  fetchJSON(`/api/settings`);

export const getPageContent = (id) =>
  fetchJSON(`/api/page-content/${id}`);

/* ─── Tracker de dossier ──────────────────────────────────── */
export const lookupDossier = (ref) =>
  fetchJSON(`/api/tracker/${encodeURIComponent(ref)}`);

/* ─── Formulaires ─────────────────────────────────────────── */
export const submitForm = (type, data) =>
  fetchJSON(`/api/forms`, {
    method: 'POST',
    body: JSON.stringify({ type, data }),
  });

/* ─── Auth ────────────────────────────────────────────────── */
export const login = (username, password) =>
  fetchJSON(`/api/auth/login`, {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  });

export const logout = () =>
  fetchJSON(`/api/auth/logout`, { method: 'POST' });

export const getMe = () =>
  fetchJSON(`/api/auth/me`);

/* Hook utilitaire pour usage dans les composants */
export function useApi(fetcher, deps = []) {
  const [data, setData] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);

  React.useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetcher()
      .then(d => { if (!cancelled) { setData(d); setLoading(false); } })
      .catch(e => { if (!cancelled) { setError(e.message); setLoading(false); } });
    return () => { cancelled = true; };
  }, deps); // eslint-disable-line

  return { data, loading, error };
}

import React from 'react';
