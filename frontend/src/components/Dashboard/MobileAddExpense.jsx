import React from 'react';
import { Plus } from 'lucide-react';
import './MobileAddExpense.css';

export const MobileAddExpense = ({ manualForm, setManualForm, CATEGORIES, handleManualSubmit }) => {
  return (
    <div className="mobile-view-fade">
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
