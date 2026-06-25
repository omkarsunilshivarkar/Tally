import React from 'react';
import { Plus, Brain, Loader2, Send } from 'lucide-react';
import './MobileAddExpense.css';
import './MobileQuickLog.css';

export const MobileAddExpense = ({
  manualForm,
  setManualForm,
  CATEGORIES,
  handleManualSubmit,
  handleQuickLog,
  quickLogText,
  setQuickLogText,
  quickLogLoading,
}) => {
  return (
    <div className="mobile-view-fade">
      {/* Quick Log Sparkle Bar */}
      <section className="mobile-quick-log-section" style={{ marginBottom: '1.25rem' }}>
        <form onSubmit={handleQuickLog} className="ai-log-container">
          <Brain className="ai-log-sparkle" size={18} />
          <input
            type="text"
            className="ai-log-input"
            placeholder="AI Command: 'spent ₹250 at KFC today'..."
            value={quickLogText}
            onChange={(e) => setQuickLogText(e.target.value)}
            disabled={quickLogLoading}
          />
          {quickLogLoading ? (
            <div className="ai-log-loading-wrapper">
              <Loader2 size={16} className="ai-log-sparkle spin-loader" />
            </div>
          ) : (
            quickLogText.trim() && (
              <button type="submit" className="ai-log-submit-btn" title="Submit command">
                <Send size={14} />
              </button>
            )
          )}
        </form>
      </section>

      {/* Or manually log section header */}
      <div className="mobile-or-separator" style={{ textAlign: 'center', marginBottom: '1.25rem', color: 'var(--text-muted)', fontSize: '11px', fontWeight: '600', letterSpacing: '1.5px', textTransform: 'uppercase', opacity: '0.8' }}>
        — Or Log Manually —
      </div>

      {/* Add Expense Form inline for mobile */}
      <div className="glass-card glass-card-padded">
        <form onSubmit={handleManualSubmit} className="mobile-form">
          <div className="form-group form-group-no-margin">
            <label className="form-label mobile-input-label">Description</label>
            <input
              type="text"
              placeholder="Description / items"
              className="form-input mobile-input-compact"
              value={manualForm.description}
              onChange={(e) => setManualForm({ ...manualForm, description: e.target.value })}
              required
            />
          </div>

          <div className="form-group form-group-no-margin">
            <label className="form-label mobile-input-label">Amount (₹)</label>
            <input
              type="number"
              step="0.01"
              placeholder="Amount"
              className="form-input mobile-input-compact"
              value={manualForm.amount}
              onChange={(e) => setManualForm({ ...manualForm, amount: e.target.value })}
              required
            />
          </div>

          <div className="form-group form-group-no-margin">
            <label className="form-label mobile-input-label">Category</label>
            <select
              className="form-select mobile-input-compact w-100"
              value={manualForm.category}
              onChange={(e) => setManualForm({ ...manualForm, category: e.target.value })}
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div className="form-group form-group-no-margin">
            <label className="form-label mobile-input-label">Date</label>
            <input
              type="date"
              className="form-input mobile-input-compact"
              value={manualForm.date}
              onChange={(e) => setManualForm({ ...manualForm, date: e.target.value })}
              required
            />
          </div>

          <button type="submit" className="btn btn-primary mobile-form-submit-btn">
            <Plus size={14} className="mobile-header-icon" /> Log Transaction
          </button>
        </form>
      </div>
    </div>
  );
};
