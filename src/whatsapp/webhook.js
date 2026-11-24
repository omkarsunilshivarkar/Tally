/**
 * WhatsApp Webhook Routes
 *
 * GET  /webhook — Meta verification handshake
 * POST /webhook — Receive incoming messages and status updates
 */

import { Router } from 'express';
import { handleIncomingMessage } from './handler.js';

const router = Router();

const VERIFY_TOKEN = process.env.WEBHOOK_VERIFY_TOKEN;

/**
 * GET /webhook — Meta sends this to verify your endpoint.
 * Must respond with the challenge token if the verify_token matches.
 */
router.get('/', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    console.log('✅ Webhook verified successfully');
    return res.status(200).send(challenge);
  }

  console.warn('❌ Webhook verification failed — token mismatch');
  return res.sendStatus(403);
});

/**
 * POST /webhook — Receives incoming messages from WhatsApp.
 * Always responds 200 immediately (Meta retries on failure).
 * Processes messages asynchronously.
 */
router.post('/', async (req, res) => {
  // Acknowledge receipt immediately — Meta expects 200 within 5 seconds
  res.status(200).send('EVENT_RECEIVED');

  try {
    const { object, entry } = req.body;

    if (object !== 'whatsapp_business_account') return;

    for (const e of entry || []) {
      for (const change of e.changes || []) {
        if (change.field !== 'messages') continue;

        const { messages = [], contacts = [] } = change.value;

        for (const message of messages) {
          const contact = contacts.find((c) => c.wa_id === message.from) || {};

          // Process each message (errors caught inside handler)
          await handleIncomingMessage(message, contact);
        }
      }
    }
  } catch (error) {
    console.error('Webhook processing error:', error);
  }
});

export default router;
