import 'dotenv/config';
import app from './app';

const PORT = process.env.PORT || 3001;

// Bind to 0.0.0.0 so the platform router can reach us. PORT must match the
// public-domain target port (a mismatch surfaces as a 502 "Application failed
// to respond").
app.listen(Number(PORT), '0.0.0.0', () => {
  console.log(`
  ╔═══════════════════════════════════════════════╗
  ║     UNHOLY RODENTS API                        ║
  ║     Running on port ${PORT}                        ║
  ╚═══════════════════════════════════════════════╝
  `);
});
