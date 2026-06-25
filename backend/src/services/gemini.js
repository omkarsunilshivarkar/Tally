import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;

// Initialize GoogleGenAI client if API key is provided
let ai = null;
if (apiKey) {
  ai = new GoogleGenAI({ apiKey });
} else {
  console.warn(
    'âš ï¸ GEMINI_API_KEY is not defined in the environment variables. The backend will use mock data for AI features.'
  );
}

const CATEGORIES = [
  'Food & Dining',
  'Shopping & Clothing',
  'Utilities & Bills',
  'Transportation & Travel',
  'Entertainment & Leisure',
  'Healthcare & Fitness',
  'Education',
  'Others',
];

/**
 * Scan a receipt image using Gemini API
 */
export async function scanReceipt(fileBuffer, mimeType) {
  const currentDate = new Date().toISOString().split('T')[0];

  if (!ai) {
    // Return mock data if Gemini API is not configured
    return {
      merchant: 'Starbucks (Mock)',
      amount: 14.50,
      category: 'Food & Dining',
      date: currentDate,
      description: 'Coffee & Blueberry Muffin (Mock - Set GEMINI_API_KEY for real scanning)',
    };
  }

  try {
    const prompt = `You are an expert expense parser. Analyze the uploaded receipt image and extract the transaction details.
Return a JSON object conforming exactly to this schema:
{
  "merchant": "string (name of the merchant/store, default to 'Unknown')",
  "amount": "number (total amount spent)",
  "category": "string (MUST be exactly one of: ${CATEGORIES.join(', ')})",
  "date": "string (transaction date in YYYY-MM-DD format. If not visible, use current date: ${currentDate})",
  "description": "string (brief summary of items purchased)"
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        {
          inlineData: {
            data: fileBuffer.toString('base64'),
            mimeType,
          },
        },
        prompt,
      ],
      config: {
        responseMimeType: 'application/json',
      },
    });

    const text = response.text;
    if (!text) throw new Error('Empty response from Gemini API');

    const parsed = JSON.parse(text);
    
    // Ensure amount is a number and category is standard
    parsed.amount = Number(parsed.amount) || 0;
    if (!CATEGORIES.includes(parsed.category)) {
      parsed.category = 'Others';
    }

    return parsed;
  } catch (error) {
    console.error('Error scanning receipt with Gemini:', error);
    // Fallback in case of parsing/network errors
    return {
      merchant: 'Receipt Scan Error',
      amount: 0.00,
      category: 'Others',
      date: currentDate,
      description: 'Failed to scan receipt. Please enter details manually.',
    };
  }
}

/**
 * Parse quick text command using Gemini API
 */
export async function parseQuickLog(textCommand) {
  const currentDate = new Date().toISOString().split('T')[0];

  if (!ai) {
    // Simple regex fallback for local test
    const amountMatch = textCommand.match(/\$?(\d+(\.\d{2})?)/);
    const amount = amountMatch ? parseFloat(amountMatch[1]) : 10.00;
    
    let merchant = 'Unknown';
    if (textCommand.toLowerCase().includes('at ')) {
      const parts = textCommand.toLowerCase().split('at ');
      if (parts[1]) {
        merchant = parts[1].split(' ')[0];
        merchant = merchant.charAt(0).toUpperCase() + merchant.slice(1);
      }
    }

    return {
      merchant: merchant + ' (Mock)',
      amount,
      category: 'Others',
      date: currentDate,
      description: textCommand + ' (Mock - Set GEMINI_API_KEY for real AI parsing)',
    };
  }

  try {
    const prompt = `Analyze this expense note: "${textCommand}". Extract transaction details.
Today is ${currentDate}.
Return a JSON object conforming exactly to this schema:
{
  "merchant": "string (name of the store or service, default to 'Unknown')",
  "amount": "number (amount spent)",
  "category": "string (MUST be exactly one of: ${CATEGORIES.join(', ')})",
  "date": "string (transaction date in YYYY-MM-DD format. Infer from relative text if any, e.g. 'yesterday')",
  "description": "string (clean explanation of what was bought)"
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const text = response.text;
    if (!text) throw new Error('Empty response from Gemini API');

    const parsed = JSON.parse(text);
    parsed.amount = Number(parsed.amount) || 0;
    if (!CATEGORIES.includes(parsed.category)) {
      parsed.category = 'Others';
    }

    return parsed;
  } catch (error) {
    console.error('Error parsing quick-log with Gemini:', error);
    return {
      merchant: 'Quick Log',
      amount: 0.00,
      category: 'Others',
      date: currentDate,
      description: textCommand,
    };
  }
}

/**
 * AI Financial Chatbot advisor
 */
export async function getFinancialAdvice(chatHistory, expensesContext, budgetsContext) {
  if (!ai) {
    return `### Smart Financial Advisor (Mock Mode)
It looks like **GEMINI_API_KEY** is not configured. Here is some general financial advice:

*   **Create a Budget:** Always plan your categories. Try to keep your "Others" category under 10% of total spending.
*   **Track Patterns:** Looking at your mock data, make sure your income exceeds expenses.
*   **AI Tip:** Configure your Gemini API key in the environment to get customized analytics of your real transactions!`;
  }

  try {
    const systemPrompt = `You are Tally, a premium, intelligent AI financial advisor.
You are helping a user manage their money, track categories, stay within budgets, and optimize savings.

Below is the user's transaction data and budgets for reference.
---
USER EXPENSES:
${expensesContext}

USER BUDGET LIMITS:
${budgetsContext}
---

Rules:
1. Refer to actual expenses or budgets in the context if the user asks about them (e.g. "how much did I spend", "am I on budget").
2. Keep replies concise, conversational, and encouraging.
3. Format output beautifully in Markdown (use bullet points, bold text, etc.).
4. Do not make up transactions outside of the context provided above.
5. If there is no data, explain that they can start by adding expenses or scanning receipts.`;

    const chat = ai.chats.create({
      model: 'gemini-2.5-flash',
      history: chatHistory.slice(0, -1), // Everything except the latest message
    });

    const latestMessage = chatHistory[chatHistory.length - 1].parts[0].text;
    const response = await chat.sendMessage({
      message: `${systemPrompt}\n\nUser Question: ${latestMessage}`,
    });

    return response.text || 'I analyzed your query, but could not formulate a response. Please try again.';
  } catch (error) {
    console.error('Error getting financial advice from Gemini:', error);
    return 'Apologies, I encountered an issue analyzing your data. Please check back shortly.';
  }
}
