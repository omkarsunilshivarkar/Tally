import { useState, useRef, useEffect } from 'react';
import { Send, X, Bot, Sparkles, Loader2 } from 'lucide-react';
import { API_URL } from '../context/AuthContext';
import './AIChatbot.css';

const TallyLogo = ({ size = 20, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 100 100"
    fill="none"
    stroke="currentColor"
    strokeWidth="6"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={`${className} tally-logo-svg`}
    style={{ transform: 'none' }}
  >
    {/* Trend Line */}
    <path d="M22 55 L42 35 L58 45 L78 20" />
    {/* Arrow Head */}
    <path d="M66 20 H78 V32" />
    {/* Bar 1 */}
    <rect x="26" y="64" width="10" height="16" rx="2" fill="none" />
    {/* Bar 2 */}
    <rect x="44" y="52" width="10" height="28" rx="2" fill="none" />
    {/* Bar 3 */}
    <rect x="62" y="38" width="10" height="42" rx="2" fill="none" />
  </svg>
);

// Quick-start suggestion chips
const SUGGESTION_CHIPS = [
  'How much have I spent this month?',
  'Am I staying within my budget?',
  'Where can I optimize my savings?',
  'Give me a summary of my categories',
];

export const AIChatbot = ({ token, isOpen, onClose }) => {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: `Hello! I am your **Tally Advisor**. 

I have full access to your transactions and budget limits. Ask me anything, for example:
*   *"Am I overspending on Dining?"*
*   *\"Summarize my expenses for me\"*
*   *\"Tips to save money\"*`,
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Auto-scroll chat to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      setTimeout(scrollToBottom, 100);
    }
  }, [messages, isOpen]);

  const handleSendMessage = async (textToSend) => {
    if (!textToSend.trim()) return;

    const userMessage = textToSend.trim();
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/chatbot`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          message: userMessage,
          history: messages,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to reach advisor');
      }

      const data = await response.json();
      setMessages((prev) => [...prev, { role: 'assistant', content: data.response }]);
    } catch (error) {
      console.error('Advisor error:', error);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: '⚠️  Apologies, I could not retrieve advice. Please check that the backend server is running.',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Safe renderer for basic Markdown returned by Gemini
  const renderMarkdown = (text) => {
    return text.split('\n').map((line, idx) => {
      let content = line;

      // Handle bullet list item
      const isBullet = content.startsWith('* ') || content.startsWith('- ');
      if (isBullet) {
        content = content.slice(2);
      }

      // Parse bold **text**
      const boldRegex = /\*\*(.*?)\*\*/g;
      const parts = [];
      let lastIndex = 0;
      let match;

      while ((match = boldRegex.exec(content)) !== null) {
        if (match.index > lastIndex) {
          parts.push(content.substring(lastIndex, match.index));
        }
        parts.push(<strong key={match.index}>{match[1]}</strong>);
        lastIndex = boldRegex.lastIndex;
      }
      if (lastIndex < content.length) {
        parts.push(content.substring(lastIndex));
      }

      const finalLine = parts.length > 0 ? parts : content;

      if (isBullet) {
        return (
          <li key={idx} style={{ marginLeft: '1rem', marginBottom: '0.25rem' }}>
            {finalLine}
          </li>
        );
      }

      return (
        <p key={idx} style={{ marginBottom: line.trim() === '' ? '0.75rem' : '0.25rem', minHeight: '1px' }}>
          {finalLine}
        </p>
      );
    });
  };

  return (
    <div
      className={`chat-drawer ${isOpen ? 'open' : ''}`}
      style={{
        display: 'flex',
      }}
    >
      {/* Mobile Drag Handle */}
      <div className="mobile-drag-handle" />

      {/* Header */}
      <div className="chat-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div className="chat-header-logo-box">
            <TallyLogo size={20} />
          </div>
          <div>
            <h4 style={{ fontSize: '1.05rem', fontWeight: 600 }}>Tally Advisor</h4>
            <span style={{ fontSize: '0.75rem', color: 'var(--secondary-color)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <span style={{ 
                display: 'inline-block', 
                width: '6px', 
                height: '6px', 
                borderRadius: '50%', 
                backgroundColor: '#10b981', 
                boxShadow: '0 0 6px #10b981' 
              }} /> Online and ready to help
            </span>
          </div>
        </div>
        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--text-secondary)',
            cursor: 'pointer',
            padding: '0.25rem',
          }}
        >
          <X size={20} />
        </button>
      </div>

      {/* Messages area */}
      <div className="chat-messages">
        {messages.map((msg, index) => (
          <div key={index} className={`chat-bubble ${msg.role}`}>
            {msg.role === 'assistant' ? renderMarkdown(msg.content) : msg.content}
          </div>
        ))}
        {loading && (
          <div className="chat-bubble assistant" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Loader2 size={16} className="ai-log-sparkle" style={{ animation: 'spin 1.5s linear infinite' }} />
            <span>Analyzing your transactions...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggestion Chips */}
      {messages.length === 1 && !loading && (
        <div style={{ padding: '0.75rem 1.25rem', display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
          {SUGGESTION_CHIPS.map((chip, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(chip)}
              style={{
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid var(--border-color)',
                borderRadius: '9999px',
                padding: '0.4rem 0.8rem',
                fontSize: '0.8rem',
                cursor: 'pointer',
                color: 'var(--text-secondary)',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--primary-color)';
                e.currentTarget.style.color = 'white';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--border-color)';
                e.currentTarget.style.color = 'var(--text-secondary)';
              }}
            >
              {chip}
            </button>
          ))}
        </div>
      )}

      {/* Input area */}
      <div className="chat-input-area">
        <input
          type="text"
          className="form-input"
          placeholder="Ask about your budget or habits..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSendMessage(input)}
          disabled={loading}
          style={{ flex: 1, borderRadius: 'var(--radius-md)' }}
        />
        <button
          onClick={() => handleSendMessage(input)}
          className="btn btn-primary"
          disabled={loading || !input.trim()}
          style={{ padding: '0.75rem', borderRadius: 'var(--radius-md)', minWidth: '46px' }}
        >
          <Send size={16} />
        </button>
      </div>
    </div>
  );
};
