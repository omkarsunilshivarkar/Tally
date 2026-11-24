import express from 'express';
import dotenv from 'dotenv';
import webhookRouter from './whatsapp/webhook.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());

// WhatsApp webhook
app.use('/webhook', webhookRouter);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date() });
});

app.listen(PORT, () => {
  console.log(`🚀 Tally WhatsApp Bot running on port ${PORT}`);
});
