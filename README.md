# Tally — WhatsApp Expense Tracker

A WhatsApp-powered personal finance service that lets you track spending, manage budgets, and set savings goals — all through chat. No app to download, no website to visit. Just message your bot on WhatsApp.

> Think of it like how banks let you check your balance on WhatsApp — but for expense tracking.

---

## ✨ Features

- **💬 Conversational Interface** — Interact entirely through WhatsApp text messages, interactive menus, and buttons
- **➕ Log Expenses** — Step-by-step guided flow: amount → category → description → date → done
- **📊 Spending Summaries** — Monthly breakdowns by category with percentages
- **💳 Budget Management** — Set per-category monthly limits and track spending against them with progress bars
- **🎯 Savings Goals** — Create targets, fund them incrementally, and watch your progress
- **📋 Quick Commands** — Type `summary`, `recent`, `budget`, or `goals` for instant info
- **🗑️ Delete Expenses** — Remove mistakes with a guided selection flow
- **👤 Auto-Registration** — No sign-up needed. First message creates your account using your phone number

---

## 🛠️ Tech Stack

- **Runtime:** Node.js (ES Modules)
- **Framework:** Express
- **Database:** SQLite via Drizzle ORM + libsql (Turso-ready for cloud deployment)
- **Messaging:** WhatsApp Cloud API (Meta Graph API)
- **Dependencies:** Just 4 production packages — zero bloat

---

## 📂 Project Structure

```
Tally/
├── src/
│   ├── whatsapp/
│   │   ├── client.js       # WhatsApp Cloud API wrapper (send messages)
│   │   ├── webhook.js      # Webhook routes (GET verify + POST receive)
│   │   ├── handler.js      # Message router & intent parser
│   │   ├── flows.js        # Multi-step conversation state machine
│   │   └── formatters.js   # Rich message builders (summaries, menus)
│   ├── db/
│   │   ├── index.js        # Database connection (Drizzle + libsql)
│   │   └── schema.js       # Table definitions (users, expenses, budgets, goals)
│   └── server.js           # Express app entry point
├── drizzle/                 # Generated SQL migration files
├── docs/
│   └── WHATSAPP_SETUP.md   # Meta Business Account setup guide
├── .env.example             # Environment variable template
├── drizzle.config.js        # Drizzle Kit configuration
├── package.json
└── README.md
```

---

## ⚙️ Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env
```

Edit `.env` with your WhatsApp API credentials:

```env
PORT=5000
WHATSAPP_ACCESS_TOKEN=your_access_token
WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id
WHATSAPP_BUSINESS_ACCOUNT_ID=your_business_account_id
WEBHOOK_VERIFY_TOKEN=any_random_secret
```

> Don't have WhatsApp API credentials yet? Follow the [WhatsApp Setup Guide](docs/WHATSAPP_SETUP.md).

### 3. Initialize Database

```bash
npm run db:push
```

### 4. Start the Server

```bash
npm run dev
```

### 5. Expose with ngrok (for local development)

```bash
ngrok http 5000
```

Then configure the webhook URL in [Meta's dashboard](https://developers.facebook.com/) → WhatsApp → Configuration.

---

## 💬 How It Works

### Main Menu
Send **"hi"** to get the interactive menu:

```
📊 Tally
Welcome back, Omkar! 👋

[📋 Open Menu]
  ━━━ 💰 Expenses ━━━
    ➕ Log Expense
    📋 Recent Expenses
    🗑️ Delete Expense
  ━━━ 📊 Reports ━━━
    📈 Monthly Summary
  ━━━ 💳 Budgets ━━━
    👀 View Budgets
    ✏️ Set Budget
  ━━━ 🎯 Savings Goals ━━━
    🎯 View Goals
    ➕ Create Goal
    💰 Fund Goal
```

### Quick Commands

| Command | What it does |
|---------|-------------|
| `hi` / `menu` / `help` | Show the interactive menu |
| `log` / `add` | Start logging an expense |
| `summary` / `bal` | This month's spending breakdown |
| `recent` / `history` | Last 10 expenses |
| `budget` | Budget overview with progress bars |
| `goals` / `savings` | Savings goals with progress |
| `cancel` | Cancel any in-progress action |

### Sample Conversation

```
You:  hi
Bot:  📊 Tally — [📋 Open Menu]

You:  [tap: ➕ Log Expense]
Bot:  How much did you spend?

You:  450
Bot:  [📂 Pick Category — 8 options]

You:  [tap: 🍔 Food & Dining]
Bot:  What was this expense for?

You:  Dinner at restaurant
Bot:  [📅 Today] [📅 Yesterday] [📅 Other Date]

You:  [tap: 📅 Today]
Bot:  📋 Confirm: 🍔 ₹450.00 — Dinner at restaurant — 2026-11-24
      [✅ Save] [❌ Cancel]

You:  [tap: ✅ Save]
Bot:  ✅ Expense Logged! 🍔 Food & Dining ₹450.00
```

---

## 📡 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/webhook` | Meta webhook verification handshake |
| `POST` | `/webhook` | Receive incoming WhatsApp messages |
| `GET` | `/health` | Server health check |

---

## 🗄️ Database Management

```bash
# Push schema changes to database
npm run db:push

# Generate SQL migration files
npm run db:generate

# Open visual database explorer
npm run db:studio
```

---

## 🚀 Deployment

See the [WhatsApp Setup Guide](docs/WHATSAPP_SETUP.md) for detailed deployment instructions covering:

- **Railway** — recommended for production
- **Render** — free tier available
- **ngrok** — for local development

---

## 💡 Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `PORT` | No | Server port (default: 5000) |
| `WHATSAPP_ACCESS_TOKEN` | Yes | Meta API access token |
| `WHATSAPP_PHONE_NUMBER_ID` | Yes | Your WhatsApp phone number ID |
| `WHATSAPP_BUSINESS_ACCOUNT_ID` | Yes | Your business account ID |
| `WEBHOOK_VERIFY_TOKEN` | Yes | Webhook verification secret |
| `DATABASE_URL` | No | Turso DB URL (default: local SQLite) |
| `DATABASE_AUTH_TOKEN` | No | Turso auth token |

---

## 📄 License

ISC
