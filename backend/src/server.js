import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRouter from './routes/auth.js';
import expensesRouter from './routes/expenses.js';
import budgetsRouter from './routes/budgets.js';
import chatbotRouter from './routes/chatbot.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS for frontend connection
app.use(
  cors({
    origin: '*', // In production, replace with specific frontend URL
    credentials: true,
  })
);

app.use(express.json());

// API Routes
app.use('/api/auth', authRouter);
app.use('/api/expenses', expensesRouter);
app.use('/api/budgets', budgetsRouter);
app.use('/api/chatbot', chatbotRouter);

// Basic status health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date() });
});

// Start listening
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
