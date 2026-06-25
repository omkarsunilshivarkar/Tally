import React from 'react';
import { Plus } from 'lucide-react';
import './TransactionForm.css';

export const TransactionForm = ({ manualForm, setManualForm, CATEGORIES, handleManualSubmit }) => {
  return (
    <form onSubmit={handleManualSubmit} className="manual-transaction-form">
      <div className="form-group">
        <input
          type="number"
          step="0.01"
          placeholder="Amount"
          className="form-input"
          value={manualForm.amount}
          onChange={(e) => setManualForm({ ...manualForm, amount: e.target.value })}
          required
        />
      </div>
      <div className="form-group">
        <select
          className="form-select"
          value={manualForm.category}
          onChange={(e) => setManualForm({ ...manualForm, category: e.target.value })}
        >
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>
      <div className="form-group">
        <input
          type="date"
          className="form-input"
          value={manualForm.date}
          onChange={(e) => setManualForm({ ...manualForm, date: e.target.value })}
          required
        />
      </div>
      <div className="form-group form-group-span-2">
        <input
          type="text"
          placeholder="Description / items"
          className="form-input"
          value={manualForm.description}
          onChange={(e) => setManualForm({ ...manualForm, description: e.target.value })}
          required
        />
      </div>
      <button type="submit" className="btn btn-primary btn-submit">
        <Plus size={16} /> Log
      </button>
    </form>
  );
};
