import 'dotenv/config';
import express from 'express';
import fetch from 'node-fetch';

const router = express.Router();

// Klarna API configuration
const KLARNA_API_BASE = 'https://api.klarna.com/checkout/v3';
const KLARNA_API_KEY = process.env.KLARNA_API_KEY;
const KLARNA_SECRET_KEY = process.env.KLARNA_SECRET_KEY;

// Validate Klarna credentials on initialization
const validateKlarnaCredentials = () => {
  if (!KLARNA_API_KEY || !KLARNA_SECRET_KEY) {
    throw new Error(
      'Missing Klarna credentials. Please set KLARNA_API_KEY and KLARNA_SECRET_KEY in .env file.'
    );
  }

  if (typeof KLARNA_API_KEY !== 'string' || KLARNA_API_KEY.trim() === '') {
    throw new Error('KLARNA_API_KEY is empty or invalid.');
  }

  if (typeof KLARNA_SECRET_KEY !== 'string' || KLARNA_SECRET_KEY.trim() === '') {
    throw new Error('KLARNA_SECRET_KEY is empty or invalid.');
  }
};

// Initialize and validate credentials
try {
  validateKlarnaCredentials();
  console.log('✓ Klarna credentials validated successfully');
} catch (error) {
  console.error('✗ Klarna initialization failed:', error.message);
  throw error;
}

// Create Basic Auth header for Klarna API
const createAuthHeader = () => {
  const credentials = Buffer.from(`${KLARNA_API_KEY}:${KLARNA_SECRET_KEY}`).toString('base64');
  return `Basic ${credentials}`;
};

// Create Klarna Checkout Session
router.post('/create-session', async (req, res) => {
  const { planId, planName, price, successUrl, cancelUrl } = req.body;

  // Validate required fields
  if (!planId || !planName || typeof price !== 'number' || !successUrl || !cancelUrl) {
    return res.status(400).json({
      error: 'Missing or invalid required fields: planId, planName, price (number), successUrl, cancelUrl',
    });
  }

  if (price <= 0) {
    return res.status(400).json({
      error: 'price must be a positive number',
    });
  }

  // Prepare order data for Klarna
  const orderAmount = Math.round(price * 100); // Convert to cents
  const orderData = {
    order_amount: orderAmount,
    order_lines: [
      {
        type: 'physical',
        reference: planId,
        name: planName,
        quantity: 1,
        quantity_unit: 'pcs',
        unit_price: orderAmount,
        total_amount: orderAmount,
        total_tax_amount: 0,
        tax_rate: 0,
      },
    ],
    purchase_country: 'SE',
    purchase_currency: 'SEK',
    locale: 'sv-SE',
    merchant_urls: {
      success: successUrl,
      cancel: cancelUrl,
      failure: cancelUrl,
      status: cancelUrl,
    },
  };

  // Call Klarna API to create session
  const response = await fetch(`${KLARNA_API_BASE}/sessions`, {
    method: 'POST',
    headers: {
      'Authorization': createAuthHeader(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(orderData),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(
      `Klarna API error: ${response.status} ${response.statusText} - ${JSON.stringify(errorData)}`
    );
  }

  const session = await response.json();

  res.json({
    redirectUrl: session.redirect_uri,
  });
});

// Retrieve Klarna Session details
router.get('/session/:sessionId', async (req, res) => {
  const { sessionId } = req.params;

  if (!sessionId) {
    return res.status(400).json({ error: 'sessionId is required' });
  }

  // Call Klarna API to retrieve session
  const response = await fetch(`${KLARNA_API_BASE}/sessions/${sessionId}`, {
    method: 'GET',
    headers: {
      'Authorization': createAuthHeader(),
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(
      `Klarna API error: ${response.status} ${response.statusText} - ${JSON.stringify(errorData)}`
    );
  }

  const session = await response.json();

  res.json({
    id: session.session_id,
    status: session.status,
    order_amount: session.order_amount,
    customer_email: session.billing_address?.email || null,
  });
});

export default router;