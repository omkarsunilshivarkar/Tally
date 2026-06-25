import React from 'react';
import './BudgetSettings.css';

export const BudgetSettings = ({
  CATEGORIES,
  budgets,
  categorySpending,
  editingBudget,
  setEditingBudget,
  handleUpdateBudget,
  totalSpending,
  overallBudgetMatch,
}) => {
  return (
    <div className="glass-card">
      <h4 className="budget-settings-title">Monthly Category Budgets</h4>

      {(() => {
        const spent = totalSpending;
        const limit = overallBudgetMatch ? overallBudgetMatch.limitAmount : 0;
        const progressPercent = limit > 0 ? Math.min((spent / limit) * 100, 100) : 0;
        const isOver = limit > 0 && spent > limit;

        return (
          <div className="desktop-overall-budget-card">
            <div className="desktop-overall-budget-header">
              <span className="budget-overall-label">Overall Monthly Budget</span>
              <span className={`budget-overall-value ${isOver ? 'text-danger' : ''}`}>
                <strong>₹{spent.toFixed(0)}</strong> / ₹{limit > 0 ? limit.toFixed(0) : '—'}
              </span>
            </div>

            {limit > 0 && (
              <div className="progress-bar-container">
                <div
                  className="progress-bar-fill"
                  style={{
                    width: `${progressPercent}%`,
                    background: isOver ? '#ff4d4d' : progressPercent > 80 ? 'var(--warning-color)' : 'var(--text-primary)',
                  }}
                />
              </div>
            )}

            <div className="desktop-overall-budget-inputs">
              <input
                type="number"
                placeholder="Overall Limit (₹)"
                className="form-input budget-input"
                value={editingBudget['Overall'] || ''}
                onChange={(e) => setEditingBudget({ ...editingBudget, Overall: e.target.value })}
              />
              <button
                onClick={() => handleUpdateBudget('Overall')}
                className="btn btn-primary budget-btn"
              >
                Set Overall
              </button>
            </div>
          </div>
        );
      })()}

      <div className="budget-tracker-list">
        {CATEGORIES.map((cat) => {
          const spent = categorySpending[cat] || 0;
          const budgetMatch = budgets.find((b) => b.category === cat);
          const limit = budgetMatch ? budgetMatch.limitAmount : 0;
          const progressPercent = limit > 0 ? Math.min((spent / limit) * 100, 100) : 0;
          const isOver = limit > 0 && spent > limit;

          return (
            <div key={cat} className="budget-item-card">
              <div className="budget-item-header">
                <span className="budget-item-label">{cat}</span>
                <span className={`budget-item-value ${isOver ? 'text-danger' : ''}`}>
                  <strong>₹{spent.toFixed(0)}</strong> / ₹{limit > 0 ? limit.toFixed(0) : '—'}
                </span>
              </div>

              {limit > 0 && (
                <div className="progress-bar-container">
                  <div
                    className="progress-bar-fill"
                    style={{
                      width: `${progressPercent}%`,
                      background: isOver ? '#ff4d4d' : progressPercent > 80 ? 'var(--warning-color)' : 'var(--text-primary)',
                    }}
                  />
                </div>
              )}

              <div className="budget-item-inputs">
                <input
                  type="number"
                  placeholder="Limit (₹)"
                  className="form-input budget-input"
                  value={editingBudget[cat] || ''}
                  onChange={(e) => setEditingBudget({ ...editingBudget, [cat]: e.target.value })}
                />
                <button
                  onClick={() => handleUpdateBudget(cat)}
                  className="btn btn-secondary budget-btn"
                >
                  Set Limit
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
