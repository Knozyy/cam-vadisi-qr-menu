import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import cookieParser from 'cookie-parser';
import express from 'express';
import { ensureUploadDir, uploadDir } from './images.js';
import { adminRouter } from './routes/admin.js';
import { publicRouter } from './routes/public.js';

const here = path.dirname(fileURLToPath(import.meta.url));

export function createApp(db) {
  const app = express();

  // nginx arkasinda calisiyor: giris kilidi dogru IP'yi gorsun.
  app.set('trust proxy', 1);
  app.use(express.json({ limit: '1mb' }));
  app.use(cookieParser());

  ensureUploadDir();
  app.use('/uploads', express.static(uploadDir(), { maxAge: '30d', immutable: true }));

  app.use('/api', publicRouter(db));
  app.use('/api/admin', adminRouter(db));

  // Uretimde derlenmis arayuzler ayni origin'den servis edilir:
  // menu "/", panel "/panel/". Ayni origin sayesinde httpOnly cerez sorunsuz calisir.
  const menuDist = path.join(here, '..', 'dist');
  if (fs.existsSync(menuDist)) {
    app.use(express.static(menuDist));
  }
  const panelDist = process.env.PANEL_DIR;
  if (panelDist && fs.existsSync(panelDist)) {
    // Panel yolu /panel; ama /admin de akla yatkin bir tahmin oldugu icin yonlendirilir.
    app.get(['/admin', '/admin/', '/yonetim', '/yonetim/'], (req, res) => res.redirect(301, '/panel/'));
    app.use('/panel', express.static(panelDist));
    app.get('/panel/*splat', (req, res) => res.sendFile(path.join(panelDist, 'index.html')));
  }
  if (fs.existsSync(menuDist)) {
    app.get('/*splat', (req, res, next) => {
      if (req.path.startsWith('/api') || req.path.startsWith('/uploads')) return next();
      return res.sendFile(path.join(menuDist, 'index.html'));
    });
  }

  app.use((req, res) => res.status(404).json({ error: 'Bulunamadı' }));

  app.use((err, req, res, next) => {
    if (res.headersSent) return next(err);
    const status = err.status || 500;
    if (status >= 500) console.error(err);
    return res.status(status).json({ error: err.message || 'Beklenmeyen hata' });
  });

  return app;
}
