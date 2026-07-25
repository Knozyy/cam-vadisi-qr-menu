import 'dotenv/config';
import { createApp } from './app.js';
import { openDb } from './db.js';
import { writeSnapshot } from './menu.js';

const port = Number(process.env.PORT || 3001);
const db = openDb();

// Acilista bir anlik goruntu yaz: sunucu yeniden basladiginda emniyet dosyasi taze olsun.
writeSnapshot(db);

const app = createApp(db);
const server = app.listen(port, () => {
  console.log(`Çam Vadisi API hazır → http://localhost:${port}`);
});

for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => {
    server.close(() => {
      db.close();
      process.exit(0);
    });
  });
}
