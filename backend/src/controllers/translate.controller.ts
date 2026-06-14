import { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';

/* Traduction côté serveur avec CACHE PARTAGÉ.
   Chaque texte unique n'est traduit qu'UNE fois pour tout le site : tous les
   visiteurs suivants reçoivent la version en cache (gratuit, instantané).
   Le quota du service amont n'est donc consommé qu'à la première rencontre
   d'un texte, ce qui le rend négligeable.

   Provider configurable via variables d'environnement :
   - TRANSLATE_PROVIDER = "mymemory" (défaut, gratuit, sans clé) | "libretranslate"
   - LIBRETRANSLATE_URL = "http://localhost:5000" (instance auto-hébergée → illimité)
   - LIBRETRANSLATE_API_KEY = "" (si l'instance en exige une)
   - MYMEMORY_EMAIL = "" (optionnel : relève le quota MyMemory à 50k mots/jour) */

const CACHE_FILE = path.join(__dirname, '../../translations-cache.json');
let cache: Record<string, Record<string, string>> = {};
try { cache = JSON.parse(fs.readFileSync(CACHE_FILE, 'utf-8')); } catch { cache = {}; }

let saveTimer: NodeJS.Timeout | null = null;
function persistCache() {
  if (saveTimer) clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    fs.writeFile(CACHE_FILE, JSON.stringify(cache), () => { /* best-effort */ });
  }, 1000);
}

const PROVIDER = process.env.TRANSLATE_PROVIDER || 'mymemory';
const LIBRE_URL = (process.env.LIBRETRANSLATE_URL || 'http://localhost:5000').replace(/\/$/, '');
const LIBRE_KEY = process.env.LIBRETRANSLATE_API_KEY || '';
const MYMEMORY_EMAIL = process.env.MYMEMORY_EMAIL || '';

// fetch avec timeout : une requête amont qui traîne ne doit jamais bloquer
// la réponse (sinon la passerelle Vercel renvoie 502).
async function fetchWithTimeout(url: string, init: any = {}, ms = 4000): Promise<any> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

async function translateOne(text: string, source: string, target: string): Promise<string> {
  if (PROVIDER === 'libretranslate') {
    const res = await fetchWithTimeout(`${LIBRE_URL}/translate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ q: text, source, target, format: 'text', api_key: LIBRE_KEY }),
    });
    if (!res.ok) throw new Error('libretranslate http ' + res.status);
    const data: any = await res.json();
    if (!data || !data.translatedText) throw new Error('libretranslate empty');
    return data.translatedText;
  }
  // MyMemory (défaut)
  const email = MYMEMORY_EMAIL ? `&de=${encodeURIComponent(MYMEMORY_EMAIL)}` : '';
  const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${source}|${target}${email}`;
  const res = await fetchWithTimeout(url);
  if (!res.ok) throw new Error('mymemory http ' + res.status);
  const data: any = await res.json();
  const out = data && data.responseData && data.responseData.translatedText;
  if (!out || /MYMEMORY WARNING|QUERY LENGTH LIMIT|INVALID/i.test(out)) throw new Error('mymemory limit');
  return out;
}

export const translate = async (req: Request, res: Response) => {
  try {
    const { q, target, source = 'fr' } = req.body || {};
    if (!target || q == null) return res.status(400).json({ message: 'Paramètres "q" et "target" requis' });

    const items: string[] = Array.isArray(q) ? q : [q];
    if (!cache[target]) cache[target] = {};

    // Ne traduire que les textes inconnus (uniques). BUDGET de 5 s : on renvoie
    // ce qui a pu être traduit, le reste sera redemandé (puis servi du cache).
    // Garantit une réponse < ~9 s -> jamais de timeout de passerelle Vercel.
    const unique = [...new Set(items.filter((t) => typeof t === 'string' && t && cache[target][t] == null))];
    const deadline = Date.now() + 5000;
    let changed = false;
    let idx = 0;
    const worker = async () => {
      while (idx < unique.length && Date.now() < deadline) {
        const text = unique[idx++];
        try {
          cache[target][text] = await translateOne(text, source, target);
          changed = true;
        } catch {
          /* on laisse le texte source (français) en repli */
        }
      }
    };
    await Promise.all(Array.from({ length: 5 }, () => worker()));
    if (changed) persistCache();

    const translations = items.map((t) => (typeof t === 'string' && cache[target][t]) || t);
    return res.json({ translations });
  } catch (error) {
    console.error('[translate] error:', error);
    return res.status(500).json({ message: 'Erreur de traduction' });
  }
};
