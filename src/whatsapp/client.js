/**
 * WhatsApp Cloud API Client
 *
 * Wraps Meta's Graph API for sending messages.
 * Uses Node's built-in fetch() — no external dependencies.
 */

const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;
const ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;
const API_VERSION = 'v21.0';
const BASE_URL = `https://graph.facebook.com/${API_VERSION}/${PHONE_NUMBER_ID}/messages`;

/**
 * Internal helper — sends a request to the WhatsApp Messages API.
 */
async function sendRequest(body) {
  const res = await fetch(BASE_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${ACCESS_TOKEN}`,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.text();
    console.error('WhatsApp API error:', res.status, err);
    throw new Error(`WhatsApp API ${res.status}: ${err}`);
  }

  return res.json();
}

/**
 * Send a plain text message.
 */
export async function sendTextMessage(to, text) {
  return sendRequest({
    messaging_product: 'whatsapp',
    to,
    type: 'text',
    text: { body: text },
  });
}

/**
 * Send an interactive list message (menu with sections and rows).
 *
 * @param {string} to - Recipient phone number
 * @param {object} options
 * @param {string} [options.header] - Header text (optional)
 * @param {string} options.body - Body text (required)
 * @param {string} [options.footer] - Footer text (optional)
 * @param {string} options.buttonText - Text shown on the list-open button
 * @param {Array} options.sections - Array of { title, rows: [{ id, title, description }] }
 */
export async function sendInteractiveList(to, { header, body, footer, buttonText, sections }) {
  const interactive = {
    type: 'list',
    body: { text: body },
    action: {
      button: buttonText,
      sections,
    },
  };

  if (header) interactive.header = { type: 'text', text: header };
  if (footer) interactive.footer = { text: footer };

  return sendRequest({
    messaging_product: 'whatsapp',
    to,
    type: 'interactive',
    interactive,
  });
}

/**
 * Send interactive reply buttons (max 3 buttons).
 *
 * @param {string} to - Recipient phone number
 * @param {object} options
 * @param {string} options.body - Body text
 * @param {Array} options.buttons - Array of { id, title } (max 3)
 */
export async function sendReplyButtons(to, { body, buttons }) {
  return sendRequest({
    messaging_product: 'whatsapp',
    to,
    type: 'interactive',
    interactive: {
      type: 'button',
      body: { text: body },
      action: {
        buttons: buttons.map((btn) => ({
          type: 'reply',
          reply: { id: btn.id, title: btn.title },
        })),
      },
    },
  });
}

/**
 * Mark a received message as read (blue ticks).
 */
export async function markAsRead(messageId) {
  return sendRequest({
    messaging_product: 'whatsapp',
    status: 'read',
    message_id: messageId,
  });
}
