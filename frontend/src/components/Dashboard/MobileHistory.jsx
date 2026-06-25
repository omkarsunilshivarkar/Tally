import React from 'react';
import { Search, X, Trash2 } from 'lucide-react';
import './MobileHistory.css';

export const MobileHistory = ({
  selectedMonth,
  setSelectedMonth,
  historySearch,
  setHistorySearch,
  historyCategory,
  setHistoryCategory,
  CATEGORIES,
  expenses,
  getCategoryIcon,
  handleDeleteExpense,
}) => {
  const filteredHistoryExpenses = expenses.filter((exp) => {
    const matchesMonth = exp.date.startsWith(selectedMonth);
    const matchesSearch = exp.description.toLowerCase().includes(historySearch.toLowerCase()) ||
                          exp.category.toLowerCase().includes(historySearch.toLowerCase());
    const matchesCategory = historyCategory === 'All' || exp.category === historyCategory;
    return matchesMonth && matchesSearch && matchesCategory;
  });
  const totalFilteredHistorySpending = filteredHistoryExpenses.reduce((sum, e) => sum + e.amount, 0);

  return (
    <div className="mobile-view-fade">
      {/* Filter controls inside a glass card */}
      <div className="glass-card glass-card-padded">
        <div className="mobile-grid-2col">
          <div className="form-group form-group-no-margin">
            <label className="form-label mobile-input-label">Budget Month</label>
            <input
              type="month"
              className="form-input mobile-input-compact"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
            />
          </div>
          <div className="form-group form-group-no-margin">
            <label className="form-label mobile-input-label">Search Transactions</label>
            <div className="pos-relative">
              <input
                type="text"
                placeholder="Search..."
                className="form-input mobile-input-compact w-100"
                value={historySearch}
                onChange={(e) => setHistorySearch(e.target.value)}
              />
              {historySearch && (
                <button
                  onClick={() => setHistorySearch('')}
                  className="mobile-input-clear-btn"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="form-group form-group-no-margin">
          <label className="form-label mobile-input-label">Filter by Category</label>
          <div className="mobile-category-chips-scroll">
            {['All', ...CATEGORIES].map((cat) => {
              const isSelected = historyCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setHistoryCategory(cat)}
                  className={`mobile-chip ${isSelected ? 'active' : ''}`}
                >
                  {cat.split(' ')[0]}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Summary stats */}
      <div className="mobile-summary-banner-row">
        <span className="mobile-summary-banner-count">
          Showing {filteredHistoryExpenses.length} transactions
        </span>
        <span className="mobile-summary-banner-total">
          Total: ₹{totalFilteredHistorySpending.toFixed(2)}
        </span>
      </div>

      {/* Scrollable list */}
      {filteredHistoryExpenses.length === 0 ? (
        <div className="mobile-empty-state">
          No matching transactions found for this month.
        </div>
      ) : (
        <div className="mobile-tx-list mobile-tx-list-scrollable">
          {filteredHistoryExpenses.map((exp) => (
            <div className="mobile-tx-card" key={exp.id}>
              <div className="mobile-tx-icon">
                {getCategoryIcon(exp.category)}
              </div>
              <div className="mobile-tx-info">
                <h4 className="mobile-tx-merchant">{exp.description}</h4>
                <p className="mobile-tx-date">{exp.date} • {exp.category.split(' ')[0]}</p>
              </div>
              <div className="mobile-tx-right">
                <span className="mobile-tx-amt mobile-bold-text-white">-₹{exp.amount.toFixed(2)}</span>
                <button
                  className="mobile-tx-del-btn"
                  onClick={() => handleDeleteExpense(exp.id)}
                  title="Delete"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
