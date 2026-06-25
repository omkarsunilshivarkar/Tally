import React from 'react';
import { User, LogOut } from 'lucide-react';
import './MobileProfile.css';

export const MobileProfile = ({
  user,
  logout,
  selectedMonth,
  setSelectedMonth,
  CATEGORIES,
  editingBudget,
  setEditingBudget,
  handleUpdateBudget,
  totalSpending,
  overallBudgetMatch,
}) => {
  return (
    <div className="mobile-view-fade mobile-profile-section">
      <div className="mobile-profile-card mobile-profile-card-row">
        <div className="mobile-avatar mobile-avatar-compact">
          <User size={20} color="white" />
        </div>
        <div>
          <h3 className="mobile-profile-name">{user?.name}</h3>
          <p className="mobile-profile-email">{user?.email}</p>
        </div>
      </div>

      {/* Set budget limits inline for mobile */}
      <div className="glass-card glass-card-padded-compact">
        <h4 className="mobile-section-title">Set Budget Month</h4>
        <div className="mobile-flex-row-gap-1">
          <input
            type="month"
            className="form-input mobile-input-compact w-100"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
          />
        </div>

        {/* Overall Budget Row for Mobile */}
        <div className="mobile-overall-budget-card">
          <div className="mobile-overall-budget-header">
            <span>Overall Budget</span>
            <span>
              ₹{totalSpending.toFixed(0)} / ₹{overallBudgetMatch ? overallBudgetMatch.limitAmount.toFixed(0) : '—'}
            </span>
          </div>
          <div className="mobile-overall-budget-inputs">
            <input
              type="number"
              placeholder="Overall Limit (₹)"
              className="form-input mobile-input-micro"
              value={editingBudget['Overall'] || ''}
              onChange={(e) => setEditingBudget({ ...editingBudget, Overall: e.target.value })}
            />
            <button
              onClick={() => handleUpdateBudget('Overall')}
              className="btn btn-primary mobile-btn-micro"
            >
              Set
            </button>
          </div>
        </div>

        <p className="mobile-text-micro-muted">Or select category to set limit:</p>
        <div className="mobile-scroll-list-compact">
          {CATEGORIES.map((cat) => (
            <div key={cat} className="mobile-flex-align-center">
              <span className="mobile-flex-span">{cat.split(' ')[0]}</span>
              <input
                type="number"
                placeholder="Limit (₹)"
                className="form-input mobile-input-micro-width"
                value={editingBudget[cat] || ''}
                onChange={(e) => setEditingBudget({ ...editingBudget, [cat]: e.target.value })}
              />
              <button
                onClick={() => handleUpdateBudget(cat)}
                className="btn btn-secondary mobile-btn-micro"
              >
                Set
              </button>
            </div>
          ))}
        </div>
      </div>

      <button onClick={logout} className="btn btn-primary mobile-logout-btn">
        <LogOut size={16} /> Log Out
      </button>
    </div>
  );
};
