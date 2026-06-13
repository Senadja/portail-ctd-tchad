import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import path from 'path';
import fs from 'fs';

import authRoutes from './routes/auth.routes';
import articleRoutes from './routes/article.routes';
import documentRoutes from './routes/document.routes';
import tenderRoutes from './routes/tender.routes';
import formRoutes from './routes/form.routes';
import settingsRoutes from './routes/settings.routes';
import trackerRoutes from './routes/tracker.routes';
import mediaRoutes from './routes/media.routes';
import pageContentRoutes from './routes/page-content.routes';
import organismeRoutes from './routes/organisme.routes';
import translateRoutes from './routes/translate.routes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5015;

// ─── Origines autorisées ────────────────────────────────────────────────────
// Support de plusieurs domaines via la variable FRONTEND_URL (séparés par des virgules)
const rawOrigins = process.env.FRONTEND_URL || 'http://localhost:8080';
const allowedOrigins = rawOrigins.split(',').map((o) => o.trim());

// Toujours autoriser localhost en développement
if (process.env.NODE_ENV !== 'production') {
  allowedOrigins.push('http://localhost:8080', 'http://localhost:3000', 'http://localhost:5173');
}

console.log('[CORS] Origines configurées :', allowedOrigins);

app.use(
  cors({
    origin: (origin, callback) => {
      // En mode proxy Vercel, on laisse passer pour éviter les blocages 502/500
      // L'idéal en production stricte est de lister exactement l'URL Vercel
      callback(null, true); 
    },
    credentials: true,
  })
);

// ─── Middlewares ────────────────────────────────────────────────────────────
app.use(express.json());
app.use(cookieParser());

// ─── Fichiers statiques (uploads) ───────────────────────────────────────────
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use('/uploads', express.static(uploadsDir));

// ─── Routes ─────────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/articles', articleRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/tenders', tenderRoutes);
app.use('/api/forms', formRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/tracker', trackerRoutes);
app.use('/api/media', mediaRoutes);
app.use('/api/page-content', pageContentRoutes);
app.use('/api/organismes', organismeRoutes);
app.use('/api/translate', translateRoutes);

// ─── Santé ──────────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Backend CTD opérationnel', timestamp: new Date().toISOString() });
});

// ─── Lancement ──────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`[server]: Serveur démarré sur http://0.0.0.0:${PORT}`);
});
