import dotenv from 'dotenv';

dotenv.config();

const apiKey = process.env.GROQ_API_KEY;

if (!apiKey) {
  console.warn(
    '⚠️  GROQ_API_KEY is not defined in the environment variables. The backend will use mock data for AI features.'
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
 * Scan a receipt image using Groq API
 */
export async function scanReceipt(fileBuffer, mimeType) {
  const currentDate = new Date().toISOString().split('T')[0];

  if (!apiKey) {
    // Return mock data if Groq API is not configured
    return {
      merchant: 'Starbucks (Mock)',
      amount: 14.50,
      category: 'Food & Dining',
      date: currentDate,
      description: 'Coffee & Blueberry Muffin (Mock - Set GROQ_API_KEY for real scanning)',
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

    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'llama-3.2-11b-vision-preview',
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: prompt },
              {
                type: 'image_url',
                image_url: {
                  url: `data:${mimeType};base64,${fileBuffer.toString('base64')}`,
                },
              },
            ],
          },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.1,
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Groq API returned status ${res.status}: ${errText}`);
    }

    const resData = await res.json();
    const text = resData.choices?.[0]?.message?.content;
    if (!text) throw new Error('Empty response from Groq API');

    const parsed = JSON.parse(text);
    
    // Ensure amount is a number and category is standard
    parsed.amount = Number(parsed.amount) || 0;
    if (!CATEGORIES.includes(parsed.category)) {
      parsed.category = 'Others';
    }

    return parsed;
  } catch (error) {
    console.error('Error scanning receipt with Groq:', error);
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
 * Parse quick text command using Groq API
 */
export async function parseQuickLog(textCommand) {
  const currentDate = new Date().toISOString().split('T')[0];

  if (!apiKey) {
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
      description: textCommand + ' (Mock - Set GROQ_API_KEY for real AI parsing)',
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

    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.1,
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Groq API returned status ${res.status}: ${errText}`);
    }

    const resData = await res.json();
    const text = resData.choices?.[0]?.message?.content;
    if (!text) throw new Error('Empty response from Groq API');

    const parsed = JSON.parse(text);
    parsed.amount = Number(parsed.amount) || 0;
    if (!CATEGORIES.includes(parsed.category)) {
      parsed.category = 'Others';
    }

    return parsed;
  } catch (error) {
    console.error('Error parsing quick-log with Groq:', error);
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
  if (!apiKey) {
    return `### Smart Financial Advisor (Mock Mode)
It looks like **GROQ_API_KEY** is not configured. Here is some general financial advice:

*   **Create a Budget:** Always plan your categories. Try to keep your "Others" category under 10% of total spending.
*   **Track Patterns:** Looking at your mock data, make sure your income exceeds expenses.
*   **AI Tip:** Configure your Groq API key in the environment to get customized analytics of your real transactions!`;
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

    // Map history to OpenAI/Groq compatible structure
    const mappedMessages = chatHistory.map((msg) => ({
      role: msg.role === 'model' ? 'assistant' : 'user',
      content: msg.parts[0].text,
    }));

    const messages = [
      { role: 'system', content: systemPrompt },
      ...mappedMessages,
    ];

    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages,
        temperature: 0.7,
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Groq API returned status ${res.status}: ${errText}`);
    }

    const resData = await res.json();
    const text = resData.choices?.[0]?.message?.content;
    
    return text || 'I analyzed your query, but could not formulate a response. Please try again.';
  } catch (error) {
    console.error('Error getting financial advice from Groq:', error);
    return 'Apologies, I encountered an issue analyzing your data. Please check back shortly.';
  }
}
