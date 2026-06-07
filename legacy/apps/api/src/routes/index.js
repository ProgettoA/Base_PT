import express from 'express';
import stripeRouter from './stripe.js';
import klarnaRouter from './klarna.js';

export default function routes() {
  const router = express.Router();
  router.use('/stripe', stripeRouter);
  router.use('/klarna', klarnaRouter);
  return router;
}