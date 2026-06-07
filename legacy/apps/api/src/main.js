import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import globalRateLimiter from './middleware/global-rate-limit.js';
import routes from './routes/index.js';
import errorMiddleware from './middleware/error.js';
import logger from './utils/logger.js';

const app = express();
const PORT = process.env.PORT || 3001;

// ─────────────────────────────────────────────────────────────
// VALIDAZIONE VARIABILI D'AMBIENTE
// ─────────────────────────────────────────────────────────────
const validateEnvironment = () => {
  logger.info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  logger.info('Validazione variabili d\'ambiente in corso...');

  const requiredVars = [
    'STRIPE_SECRET_KEY',
    'PB_SUPERUSER_EMAIL',
    'PB_SUPERUSER_PASSWORD',
  ];

  const missing = requiredVars.filter(v => !process.env[v]);
  if (missing.length > 0) {
    logger.fatal(`✗ Variabili mancanti: ${missing.join(', ')} — controlla il file .env`);
    process.exit(1);
  }

  const stripeKey = process.env.STRIPE_SECRET_KEY;
  if (!stripeKey.startsWith('sk_test_') && !stripeKey.startsWith('sk_live_')) {
    logger.fatal('✗ STRIPE_SECRET_KEY non valida: deve iniziare con sk_test_ o sk_live_');
    process.exit(1);
  }
  if (stripeKey.length < 20) {
    logger.fatal('✗ STRIPE_SECRET_KEY sembra troncata o malformata.');
    process.exit(1);
  }

  // Avvisa se le chiavi Stripe sono di ambienti diversi
  const publishableKey = process.env.STRIPE_PUBLISHABLE_KEY || '';
  const secretIsTest = stripeKey.startsWith('sk_test_');
  const publishableIsTest = publishableKey.startsWith('pk_test_');
  if (publishableKey && secretIsTest !== publishableIsTest) {
    logger.warn('⚠ STRIPE_SECRET_KEY e STRIPE_PUBLISHABLE_KEY sono di ambienti diversi (test vs live)!');
  }

  // Avvisa se webhook secret è placeholder
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';
  if (!webhookSecret) {
    logger.warn('⚠ STRIPE_WEBHOOK_SECRET non impostato — i webhook non verranno verificati.');
  } else if (webhookSecret.includes('placeholder') || webhookSecret.includes('replace')) {
    logger.warn('⚠ STRIPE_WEBHOOK_SECRET sembra ancora un placeholder.');
  } else {
    logger.info(`✓ STRIPE_WEBHOOK_SECRET presente (${webhookSecret.substring(0, 12)}...)`);
  }

  logger.info(`✓ STRIPE_SECRET_KEY: ${stripeKey.substring(0, 12)}... (${secretIsTest ? 'TEST' : 'LIVE'})`);
  logger.info(`✓ PB_SUPERUSER_EMAIL: ${process.env.PB_SUPERUSER_EMAIL}`);
  logger.info('✓ Validazione completata');
  logger.info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
};

validateEnvironment();

// ─────────────────────────────────────────────────────────────
// MIDDLEWARE
// ─────────────────────────────────────────────────────────────
app.use(cors());
app.set('trust proxy', 1);
app.use(express.json());
app.use(globalRateLimiter);

// Log di ogni richiesta in entrata
app.use((req, _res, next) => {
  logger.info(`→ ${req.method} ${req.path}`, {
    ip: req.ip,
    contentType: req.headers['content-type'] || 'N/A',
  });
  next();
});

// ─────────────────────────────────────────────────────────────
// ROUTE
// ─────────────────────────────────────────────────────────────
app.use(routes());

// ─────────────────────────────────────────────────────────────
// ERROR MIDDLEWARE
// DEVE stare DOPO le route e avere ESATTAMENTE 4 parametri.
// Cattura tutti i throw/next(err) e risponde con JSON strutturato
// invece del 500 generico che causa i problemi con Stripe.
// NON RIMUOVERE — necessario per il corretto funzionamento dei webhook.
// ─────────────────────────────────────────────────────────────
app.use(errorMiddleware);

// ─────────────────────────────────────────────────────────────
// SAFETY NET — errori asincroni non catturati
// ─────────────────────────────────────────────────────────────
process.on('unhandledRejection', (reason) => {
  logger.error('✗ Unhandled Promise Rejection:', {
    reason: reason instanceof Error ? reason.message : String(reason),
    stack: reason instanceof Error ? reason.stack : 'N/A',
  });
});

process.on('uncaughtException', (err) => {
  logger.fatal('✗ Uncaught Exception — il server si ferma:', {
    message: err.message,
    stack: err.stack,
  });
  setTimeout(() => process.exit(1), 500);
});

// ─────────────────────────────────────────────────────────────
// AVVIO
// ─────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  logger.info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  logger.info(`✓ API server avviato sulla porta ${PORT}`);
  logger.info(`  Stripe: ${process.env.STRIPE_SECRET_KEY?.startsWith('sk_test_') ? 'TEST MODE' : 'LIVE MODE'}`);
  logger.info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
});