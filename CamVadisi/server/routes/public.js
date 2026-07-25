import express from 'express';
import { buildMenu, readSnapshot } from '../menu.js';

const STAT_KINDS = new Set(['open', 'category', 'lang']);

export function publicRouter(db) {
  const router = express.Router();

  router.get('/menu', (req, res) => {
    let payload;
    let source = 'db';
    try {
      payload = buildMenu(db);
    } catch {
      // Emniyet katmani: veritabani okunamiyorsa son iyi hali sun.
      payload = readSnapshot();
      source = 'snapshot';
      if (!payload) return res.status(503).json({ error: 'Menü şu anda okunamıyor' });
    }

    if (req.headers['if-none-match'] === payload.etag) {
      res.set('ETag', payload.etag);
      return res.status(304).end();
    }
    res.set('ETag', payload.etag);
    res.set('Cache-Control', 'no-cache');
    res.set('X-Menu-Source', source);
    return res.json(payload);
  });

  // Kisisel veri toplamaz: yalnizca gun bazinda sayac artirir.
  router.post('/stats/view', (req, res) => {
    const kind = String(req.body?.kind ?? '');
    const value = String(req.body?.value ?? '').slice(0, 40);
    if (!STAT_KINDS.has(kind)) return res.status(400).json({ error: 'Geçersiz sayaç türü' });

    const day = new Date().toISOString().slice(0, 10);
    db.prepare(
      `INSERT INTO visit_stats (day, kind, value, count) VALUES (?, ?, ?, 1)
       ON CONFLICT(day, kind, value) DO UPDATE SET count = count + 1`,
    ).run(day, kind, value);
    return res.status(204).end();
  });

  return router;
}
