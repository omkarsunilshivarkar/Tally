# WhatsApp Business API — Setup Guide

This guide walks you through setting up the Meta Business Account and WhatsApp Cloud API so your Tally bot can send and receive messages.

---

## Prerequisites

- A **Facebook account** (personal — used to create the business account)
- A **phone number** for your WhatsApp Business bot (can be a new number; cannot be one already registered on WhatsApp/WhatsApp Business app)
- Your Tally server deployed to a **public HTTPS URL** (or ngrok for local testing)

---

## Step 1: Create a Meta Business Account

1. Go to [Meta Business Suite](https://business.facebook.com/)
2. Click **Create Account** (or use an existing business account)
3. Fill in your business name, your name, and business email
4. Complete the setup wizard

> **Note:** You don't need a Facebook Page for this. The business account is sufficient.

---

## Step 2: Create a Meta App

1. Go to [Meta for Developers](https://developers.facebook.com/)
2. Click **My Apps** → **Create App**
3. Select **Other** as the use case → click **Next**
4. Select **Business** as the app type → click **Next**
5. Fill in:
   - **App Name:** `Tally WhatsApp Bot` (or any name)
   - **Contact Email:** Your email
   - **Business Account:** Select the one you created in Step 1
6. Click **Create App**

---

## Step 3: Add WhatsApp to Your App

1. On the app dashboard, find **WhatsApp** in the product list and click **Set Up**
2. You'll be taken to the WhatsApp **Getting Started** page
3. Meta provides a **test phone number** you can use for development
4. Note down these values (you'll need them for your `.env` file):
   - **Phone Number ID** — found under *API Setup > Phone number ID*
   - **WhatsApp Business Account ID** — found under *API Setup*

---

## Step 4: Generate a Permanent Access Token

The temporary token from the dashboard expires in 24 hours. For production, create a **System User token**:

1. Go to [Meta Business Settings](https://business.facebook.com/settings/)
2. Navigate to **Users** → **System Users**
3. Click **Add** → give it a name (e.g., `tally-bot`) → set role to **Admin**
4. Click **Add Assets** → select your app → grant **Full Control**
5. Click **Generate New Token** → select your app
6. Enable these permissions:
   - `whatsapp_business_messaging`
   - `whatsapp_business_management`
7. Click **Generate Token** → **copy and save it securely**

> **⚠️ Important:** This token won't be shown again. Store it safely.

---

## Step 5: Configure Your `.env` File

Open your `.env` file and fill in the values:

```env
PORT=5000

# From Step 3-4
WHATSAPP_ACCESS_TOKEN=EAAxxxxxxxxxxxxxxxx
WHATSAPP_PHONE_NUMBER_ID=123456789012345
WHATSAPP_BUSINESS_ACCOUNT_ID=123456789012345

# Any random string — must match what you enter in Meta's dashboard
WEBHOOK_VERIFY_TOKEN=my_tally_secret_token_2026

# Leave blank for local SQLite
DATABASE_URL=
DATABASE_AUTH_TOKEN=
```

---

## Step 6: Deploy Your Server (or Use ngrok)

WhatsApp requires a **publicly accessible HTTPS URL** for the webhook.

### Option A: Local Development with ngrok

1. Install ngrok: https://ngrok.com/download
2. Start your Tally server:
   ```bash
   npm run dev
   ```
3. In a separate terminal, expose port 5000:
   ```bash
   ngrok http 5000
   ```
4. Copy the HTTPS URL (e.g., `https://abc123.ngrok-free.app`)

### Option B: Deploy to Railway (Recommended for Production)

1. Push your code to GitHub
2. Go to [Railway](https://railway.app/) → **New Project** → **Deploy from GitHub**
3. Select your repo → Railway auto-detects Node.js
4. Add environment variables (from your `.env` file) in the Railway dashboard
5. Railway gives you a public URL (e.g., `https://tally-bot.up.railway.app`)

### Option C: Deploy to Render

1. Go to [Render](https://render.com/) → **New Web Service**
2. Connect your GitHub repo
3. Set:
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
4. Add environment variables in the Render dashboard
5. Render gives you a public URL

---

## Step 7: Configure the Webhook in Meta Dashboard

1. Go to your Meta app → **WhatsApp** → **Configuration**
2. Under **Webhook**, click **Edit**
3. Fill in:
   - **Callback URL:** `https://your-server.com/webhook`
   - **Verify Token:** Same value as `WEBHOOK_VERIFY_TOKEN` in your `.env`
4. Click **Verify and Save**
   - Meta sends a GET request to your server — if the token matches, it succeeds ✅
5. Under **Webhook fields**, click **Manage**
6. **Subscribe** to the `messages` field (toggle it on)

---

## Step 8: Test Your Bot

1. Open WhatsApp on your phone
2. Send **"hi"** to your bot's phone number (the test number from Step 3)
3. You should receive the interactive menu! 🎉

> **Note:** With the test number, you can only message numbers that are registered as test recipients in the Meta dashboard. Go to **API Setup** → **To** field → add your personal number.

---

## Going to Production

To use a **real phone number** (not the test number) and message anyone:

### 1. Add a Phone Number
1. Go to **WhatsApp** → **Phone Numbers** → **Add Phone Number**
2. Enter your business phone number
3. Verify it via SMS or voice call

### 2. Business Verification
1. Go to [Meta Business Settings](https://business.facebook.com/settings/) → **Security Center**
2. Click **Start Verification**
3. Submit your business documents (business registration, utility bill, etc.)
4. Verification typically takes 2-7 business days

### 3. Display Name Approval
1. After business verification, set a **Display Name** for your WhatsApp Business profile
2. This is what users see when they message your bot

---

## Pricing

- **First 1,000 service conversations per month:** Free
- **Service conversations** (user-initiated): The user messages you first
- **Marketing/utility conversations** (business-initiated via templates): Paid
- See [Meta's pricing page](https://developers.facebook.com/docs/whatsapp/pricing/) for rates per country

For an expense tracker bot where users message you first, you'll stay within the free tier for a long time.

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Webhook verification fails | Check that `WEBHOOK_VERIFY_TOKEN` in `.env` matches what you entered in Meta's dashboard |
| Bot doesn't respond | Check server logs for errors. Ensure you subscribed to the `messages` webhook field |
| "Unsupported post request" error | Your `WHATSAPP_PHONE_NUMBER_ID` is incorrect or the access token doesn't have permissions |
| Messages not delivered | With the test number, you can only send to registered test recipients |
| Token expired | Your temporary token expired. Create a System User token (Step 4) for a permanent one |

---

## Useful Links

- [WhatsApp Cloud API Docs](https://developers.facebook.com/docs/whatsapp/cloud-api)
- [Message Types Reference](https://developers.facebook.com/docs/whatsapp/cloud-api/messages)
- [Interactive Messages Guide](https://developers.facebook.com/docs/whatsapp/guides/interactive-messages)
- [Webhook Reference](https://developers.facebook.com/docs/whatsapp/cloud-api/webhooks)
- [Meta Business Help Center](https://www.facebook.com/business/help)
