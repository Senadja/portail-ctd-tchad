/* Logique partagée (portail public + back-office) du statut d'un appel d'offres
   piloté par des phases datées et colorées.

   Stockage dans tender.customStatuses :
   - Ancien format (rétro-compatible) : tableau de phases  [{ id, label, start, end }]
   - Nouveau format                   : { autoStatus: bool, phases: [{ id, label, start, end, color }] }

   Quand autoStatus est actif, le statut/couleur affiché suit automatiquement
   la phase active selon la date du jour. Sinon, le statut manuel (tender.status)
   et la liste de statuts globaux (settings.tenderStatuses) s'appliquent. */

export function parseTenderConfig(raw) {
  try {
    const p = typeof raw === 'string' ? JSON.parse(raw) : raw;
    if (Array.isArray(p)) return { autoStatus: false, phases: p };
    if (p && typeof p === 'object' && Array.isArray(p.phases)) {
      return { autoStatus: !!p.autoStatus, phases: p.phases };
    }
  } catch (e) { /* ignore */ }
  return { autoStatus: false, phases: [] };
}

export function serializeTenderConfig(autoStatus, phases) {
  return JSON.stringify({ autoStatus: !!autoStatus, phases: phases || [] });
}

/* Renvoie la phase active (ou la plus pertinente) selon la date, avec son état :
   'upcoming' (avant la 1re), 'current' (en cours), 'done' (après la dernière). */
export function getActivePhase(phases, now = new Date()) {
  const valid = (phases || [])
    .filter((p) => p && p.start && p.end)
    .map((p) => ({ ...p, _s: new Date(p.start), _e: new Date(p.end) }))
    .filter((p) => !isNaN(p._s.getTime()) && !isNaN(p._e.getTime()))
    .sort((a, b) => a._s - b._s);

  if (!valid.length) return null;
  for (const p of valid) {
    if (now >= p._s && now <= p._e) return { ...p, state: 'current' };
  }
  if (now < valid[0]._s) return { ...valid[0], state: 'upcoming' };
  return { ...valid[valid.length - 1], state: 'done' };
}

/* Statut effectif affiché (label + couleur) : phase active si autoStatus, sinon
   statut manuel résolu depuis la liste de statuts globaux. */
export function getEffectiveStatus(tender, globalStatuses, now = new Date()) {
  const { autoStatus, phases } = parseTenderConfig(tender && tender.customStatuses);
  if (autoStatus) {
    const ap = getActivePhase(phases, now);
    if (ap) {
      return {
        label: ap.label || (tender && tender.status) || 'En cours',
        color: ap.color || '#6b7280',
        phases,
        autoStatus: true,
        activePhase: ap,
      };
    }
  }
  const list = globalStatuses || [];
  const manual =
    list.find((s) => s.label === (tender && tender.status)) ||
    list[0] || { label: (tender && tender.status) || 'En cours', color: '#6b7280', percentage: 0 };
  return {
    label: manual.label,
    color: manual.color,
    percentage: manual.percentage,
    phases,
    autoStatus: false,
    activePhase: null,
  };
}
