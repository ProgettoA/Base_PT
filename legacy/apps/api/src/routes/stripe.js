import express from 'express';
import Stripe from 'stripe';
import logger from '../utils/logger.js';
import pb from '../utils/pocketbaseClient.js';

const router = express.Router();

// Validate Stripe key on initialization
const validateStripeKey = () => {
  const key = process.env.STRIPE_SECRET_KEY;

  if (!key) {
    throw new Error(
      'STRIPE_SECRET_KEY environment variable is not set. Please check your .env file.'
    );
  }

  if (typeof key !== 'string' || key.trim() === '') {
    throw new Error(
      'STRIPE_SECRET_KEY is empty or invalid. Please check your .env file.'
    );
  }

  if (!key.startsWith('sk_test_') && !key.startsWith('sk_live_')) {
    throw new Error(
      'STRIPE_SECRET_KEY has invalid format. Must start with sk_test_ or sk_live_'
    );
  }

  // Check for common truncation issues
  if (key.length < 20) {
    throw new Error(
      'STRIPE_SECRET_KEY appears to be truncated. Stripe keys are typically 48+ characters long.'
    );
  }

  return key;
};

// Validate webhook secret on initialization
const validateWebhookSecret = () => {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!secret) {
    logger.warn(
      'STRIPE_WEBHOOK_SECRET is not set. Webhook signature verification will fail. ' +
      'Please set STRIPE_WEBHOOK_SECRET in .env file with the signing secret from Stripe Dashboard.'
    );
    return null;
  }

  if (typeof secret !== 'string' || secret.trim() === '') {
    logger.warn('STRIPE_WEBHOOK_SECRET is empty or invalid.');
    return null;
  }

  if (!secret.startsWith('whsec_')) {
    logger.warn(
      'STRIPE_WEBHOOK_SECRET does not start with "whsec_". ' +
      'This may indicate an incorrect secret. Verify in Stripe Dashboard → Webhooks.'
    );
  }

  return secret;
};

// Initialize Stripe with validated key
let stripe;
try {
  const stripeKey = validateStripeKey();
  stripe = new Stripe(stripeKey);
  logger.info('✓ Stripe client initialized successfully');
} catch (error) {
  logger.error('✗ Stripe initialization failed:', error.message);
  throw error;
}

// Validate and store webhook secret
const webhookSecret = validateWebhookSecret();
if (webhookSecret) {
  logger.info('✓ Stripe webhook secret validated successfully');
}

/**
 * WEBHOOK ENDPOINT - Receives Stripe events
 * This endpoint handles checkout.session.completed events and creates subscription records
 */
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  logger.info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  logger.info('POST /stripe/webhook - Webhook received from Stripe');
  logger.info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  // STEP 1: Verify webhook secret is configured
  if (!webhookSecret) {
    logger.error(
      'STRIPE_WEBHOOK_SECRET is not configured. Cannot verify webhook signature. ' +
      'Please set STRIPE_WEBHOOK_SECRET in .env file.'
    );
    // ✅ FIX 2: res.status(400) invece di throw — Stripe richiede un 400
    // esplicito per capire che c'è un errore. Con throw Express risponde 500
    // e Stripe riprova il webhook a ripetizione per giorni.
    return res.status(400).send('Webhook secret not configured. Set STRIPE_WEBHOOK_SECRET in .env file.');
  }

  // STEP 2: Extract and validate Stripe signature header
  const sig = req.headers['stripe-signature'];
  logger.info('Stripe signature header:', { present: !!sig });

  if (!sig) {
    logger.error('Missing stripe-signature header in webhook request');
    return res.status(400).send('Missing stripe-signature header'); // ✅ FIX 2
  }

  // STEP 3: Verify webhook signature and construct event
  let event;
  try {
    logger.info('Verifying webhook signature with Stripe...');
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    logger.info('✓ Webhook signature verified successfully');
    logger.info('Event details:', { type: event.type, eventId: event.id });
  } catch (err) {
    logger.error('✗ Webhook signature verification failed:', {
      error: err.message,
      signaturePresent: !!sig,
      secretConfigured: !!webhookSecret,
    });
    // ✅ FIX 2: 400 esplicito richiesto da Stripe per firma non valida
    return res.status(400).send(`Webhook signature verification failed: ${err.message}`);
  }

  // STEP 4: Handle checkout.session.completed event
  if (event.type === 'checkout.session.completed') {
    logger.info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    logger.info('EVENT TYPE: checkout.session.completed - Processing payment');
    logger.info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    const session = event.data.object;
    logger.info('Session object received:', {
      sessionId: session.id,
      paymentStatus: session.payment_status,
      customerId: session.customer,
      customerEmail: session.customer_details?.email,
      subscriptionId: session.subscription,
      metadata: session.metadata,
    });

    // STEP 5: Verify payment was successful
    if (session.payment_status !== 'paid') {
      logger.warn('Payment not completed for session:', {
        sessionId: session.id,
        status: session.payment_status,
      });
      // ✅ FIX 2: res.status(400) invece di throw
      return res.status(400).send(`Payment status is '${session.payment_status}', expected 'paid'.`);
    }
    logger.info('✓ Payment status verified as "paid"');

    // STEP 6: Extract and validate metadata (userId and planId)
    const metadata = session.metadata || {};
    logger.info('Metadata extracted from session:', metadata);

    const userId = metadata.userId;
    const planId = metadata.planId;

    if (!userId) {
      logger.error('Missing userId in session metadata', {
        sessionId: session.id,
        metadata: session.metadata,
      });
      // ✅ FIX 2: res.status(400) invece di throw
      return res.status(400).send('Missing userId in session metadata.');
    }
    logger.info('✓ userId extracted from metadata:', { userId });

    if (!planId) {
      logger.error('Missing planId in session metadata', {
        sessionId: session.id,
        metadata: session.metadata,
      });
      // ✅ FIX 2: res.status(400) invece di throw
      return res.status(400).send('Missing planId in session metadata.');
    }
    logger.info('✓ planId extracted from metadata:', { planId });

    // STEP 7: Prepare subscription data
    const stripeSubscriptionId = session.subscription || session.id;
    const amountTotal = session.amount_total;
    const customerEmail = session.customer_details?.email;
    const today = new Date().toISOString().split('T')[0];

    logger.info('Subscription data prepared:', {
      userId,
      planId,
      stripeSubscriptionId,
      amountTotal,
      customerEmail,
      startDate: today,
    });

    // STEP 8: Create subscription record in PocketBase
    logger.info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    logger.info('STEP 8: Creating subscription record in PocketBase');
    logger.info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    let subscriptionRecord;
    try {
      const subscriptionPayload = {
        userId,
        planId,
        stripeSubscriptionId,
        status: 'active',
        startDate: today,
        paymentDate: today,
        lessonsUsed: 0,
        amountPaid: amountTotal,
      };

      logger.info('Calling pb.collection("subscriptions").create() with payload:', subscriptionPayload);

      subscriptionRecord = await pb.collection('subscriptions').create(subscriptionPayload);

      logger.info('✓ Subscription record created successfully in PocketBase:', {
        subscriptionId: subscriptionRecord.id,
        userId: subscriptionRecord.userId,
        planId: subscriptionRecord.planId,
        status: subscriptionRecord.status,
        startDate: subscriptionRecord.startDate,
        paymentDate: subscriptionRecord.paymentDate,
        lessonsUsed: subscriptionRecord.lessonsUsed,
        amountPaid: subscriptionRecord.amountPaid,
      });
    } catch (pbError) {
      logger.error('✗ Failed to create subscription record in PocketBase:', {
        error: pbError.message,
        status: pbError.status,
        response: pbError.response,
        userId,
        planId,
        stripeSubscriptionId,
      });
      // ✅ FIX 2: res.status(500) per errori PocketBase interni
      return res.status(500).send(`PocketBase error: ${pbError.message}`);
    }
  } else {
    logger.info(`Event type '${event.type}' is not handled by this webhook. Ignoring.`);
  }

  // STEP 9: Return 200 status to acknowledge receipt
  logger.info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  logger.info('✓ Webhook processed successfully. Returning 200 status to Stripe.');
  logger.info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  res.json({ received: true });
});

/**
 * CREATE CHECKOUT SESSION
 * Creates a Stripe Checkout Session for one-time payment
 * Required fields: amount (cents), productName, successUrl, cancelUrl, userId, planId
 */
router.post('/create-checkout', async (req, res) => {
  logger.info('POST /stripe/create-checkout - Incoming request');
  logger.info('Request body:', req.body);

  const { amount, productName, successUrl, cancelUrl, userId, planId } = req.body;

  // Validate all required fields
  if (amount === undefined || amount === null) {
    logger.warn('Missing required field: amount');
    return res.status(400).json({
      error: 'Missing required field: amount (must be a positive integer in cents)',
    });
  }

  if (!productName) {
    logger.warn('Missing required field: productName');
    return res.status(400).json({
      error: 'Missing required field: productName (string)',
    });
  }

  if (!successUrl) {
    logger.warn('Missing required field: successUrl');
    return res.status(400).json({
      error: 'Missing required field: successUrl (string)',
    });
  }

  if (!cancelUrl) {
    logger.warn('Missing required field: cancelUrl');
    return res.status(400).json({
      error: 'Missing required field: cancelUrl (string)',
    });
  }

  if (!userId) {
    logger.warn('Missing required field: userId');
    return res.status(400).json({
      error: 'Missing required field: userId (string) - needed for webhook metadata',
    });
  }

  if (!planId) {
    logger.warn('Missing required field: planId');
    return res.status(400).json({
      error: 'Missing required field: planId (string) - needed for webhook metadata',
    });
  }

  // Validate amount is a positive integer (cents)
  if (typeof amount !== 'number' || !Number.isInteger(amount) || amount <= 0) {
    logger.warn('Invalid amount value:', amount);
    return res.status(400).json({
      error: 'amount must be a positive integer (in cents). Example: 2999 for $29.99',
    });
  }

  // Validate productName is a string
  if (typeof productName !== 'string' || productName.trim() === '') {
    logger.warn('Invalid productName value:', productName);
    return res.status(400).json({
      error: 'productName must be a non-empty string',
    });
  }

  // Validate URLs are strings
  if (typeof successUrl !== 'string' || successUrl.trim() === '') {
    logger.warn('Invalid successUrl value:', successUrl);
    return res.status(400).json({
      error: 'successUrl must be a non-empty string',
    });
  }

  if (typeof cancelUrl !== 'string' || cancelUrl.trim() === '') {
    logger.warn('Invalid cancelUrl value:', cancelUrl);
    return res.status(400).json({
      error: 'cancelUrl must be a non-empty string',
    });
  }

  logger.info('All validation passed. Creating Stripe Checkout Session with:', {
    amount,
    productName,
    successUrl,
    cancelUrl,
    userId,
    planId,
  });

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [
      {
        price_data: {
          currency: 'eur', // ✅ FIX 5: corretto da 'usd' a 'eur'
          product_data: {
            name: productName,
          },
          unit_amount: amount, // Already in cents
        },
        quantity: 1,
      },
    ],
    mode: 'payment',
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: {
      userId,
      planId,
    },
  });

  logger.info('✓ Stripe Checkout Session created successfully:', {
    sessionId: session.id,
    url: session.url,
  });

  res.json({ url: session.url });
});

/**
 * RETRIEVE SESSION
 * Gets the status and details of a Checkout Session
 */
router.get('/session/:sessionId', async (req, res) => {
  const { sessionId } = req.params;

  if (!sessionId) {
    return res.status(400).json({ error: 'sessionId is required' });
  }

  logger.info('GET /stripe/session/:sessionId - Retrieving session:', { sessionId });

  const session = await stripe.checkout.sessions.retrieve(sessionId);

  logger.info('Session retrieved successfully:', {
    sessionId: session.id,
    paymentStatus: session.payment_status,
    amountTotal: session.amount_total,
  });

  res.json({
    id: session.id,
    status: session.payment_status,
    amountTotal: session.amount_total,
    customerEmail: session.customer_details?.email || null,
    subscriptionId: session.subscription || null,
  });
});

/**
 * SUCCESS ENDPOINT (DEPRECATED - Use webhook instead)
 * This endpoint is kept for backward compatibility but the webhook is the primary method
 * The webhook (checkout.session.completed) is more reliable and handles all payment scenarios
 */
router.post('/success', async (req, res) => {
  logger.info('POST /stripe/success - Incoming request (DEPRECATED - use webhook instead)');
  logger.info('Request body:', req.body);

  const { sessionId, planId } = req.body;

  // Validate required fields
  if (!sessionId) {
    logger.warn('Missing required field: sessionId');
    return res.status(400).json({
      error: 'Missing required field: sessionId (string)',
    });
  }

  if (!planId) {
    logger.warn('Missing required field: planId');
    return res.status(400).json({
      error: 'Missing required field: planId (string)',
    });
  }

  logger.info('Retrieving Stripe session:', { sessionId });

  // Retrieve session from Stripe
  const session = await stripe.checkout.sessions.retrieve(sessionId);

  // Verify payment was successful
  if (session.payment_status !== 'paid') {
    logger.warn('Payment not completed for session:', { sessionId, status: session.payment_status });
    return res.status(400).json({ error: `Payment status is '${session.payment_status}', expected 'paid'` }); // ✅ FIX: res invece di throw
  }

  // Extract session details
  const amountTotal = session.amount_total;
  const customerEmail = session.customer_details?.email;

  if (!customerEmail) {
    logger.warn('No customer email found in session:', { sessionId });
    return res.status(400).json({ error: 'Customer email not found in Stripe session' }); // ✅ FIX: res invece di throw
  }

  logger.info('Session verified:', { sessionId, amountTotal, customerEmail });

  // Query PocketBase users collection to find user by email
  logger.info('Querying PocketBase users collection for email:', { customerEmail });

  const users = await pb.collection('users').getFullList({
    filter: `email = "${customerEmail}"`,
  });

  if (users.length === 0) {
    logger.warn('No user found with email:', { customerEmail });
    return res.status(404).json({ error: `User not found with email: ${customerEmail}` }); // ✅ FIX: res invece di throw
  }

  const user = users[0];
  const userId = user.id;

  logger.info('User found:', { userId, email: customerEmail });

  // Get today's date in ISO format
  const today = new Date().toISOString().split('T')[0];

  // Create subscription record in PocketBase
  logger.info('Creating subscription record in PocketBase:', {
    userId,
    planId,
    stripeSessionId: sessionId,
    amountTotal,
  });

  const subscriptionRecord = await pb.collection('subscriptions').create({
    userId,
    planId,
    stripeSubscriptionId: sessionId,
    status: 'active',
    startDate: today,
    paymentDate: today,
    lessonsUsed: 0,
    amountPaid: amountTotal,
  });

  logger.info('✓ Subscription record created successfully:', {
    subscriptionId: subscriptionRecord.id,
    userId,
    planId,
  });

  res.json({
    success: true,
    subscription: {
      id: subscriptionRecord.id,
      userId: subscriptionRecord.userId,
      planId: subscriptionRecord.planId,
      stripeSubscriptionId: subscriptionRecord.stripeSubscriptionId,
      status: subscriptionRecord.status,
      startDate: subscriptionRecord.startDate,
      paymentDate: subscriptionRecord.paymentDate,
      lessonsUsed: subscriptionRecord.lessonsUsed,
      amountPaid: subscriptionRecord.amountPaid,
    },
  });
});

export default router;