import React from 'react';
import { TrendingUp, Trash2 } from 'lucide-react';
import './MobileHome.css';

export const MobileHome = ({
  radius,
  circumference,
  strokeDashoffset,
  savingsPercent,
  spentLast7Days,
  topCategory7d,
  topCategory7dAmount,
  getCategoryIcon,
  filteredTotalSpending,
  currentFilteredExpenses,
  handleDeleteExpense,
}) => {
  return (
    <div className="mobile-view-fade">
      {/* Featured Goal & Activity Split Card */}
      <div className="mobile-featured-card">
        <div className="mobile-card-left">
          <div className="mobile-goals-ring-wrapper">
            <svg width="64" height="64" viewBox="0 0 50 50">
              <circle cx="25" cy="25" r={radius} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="4" />
              <circle
                cx="25"
                cy="25"
                r={radius}
                fill="none"
                stroke="white"
                strokeWidth="4"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                transform="rotate(-90 25 25)"
              />
            </svg>
            <div className="mobile-goals-ring-center mobile-goals-ring-text">
              {savingsPercent}%
            </div>
          </div>
          <span className="mobile-card-tag">Budget<br />Left</span>
        </div>

        <div className="mobile-card-divider"></div>

        <div className="mobile-card-right">
          <div className="mobile-subcard-item mobile-flex-gap-0-5">
            <TrendingUp size={16} className="mobile-subcard-icon" />
            <div>
              <p className="mobile-subcard-label">Spent (Last 7 Days)</p>
              <h4 className="mobile-subcard-val">₹{spentLast7Days.toFixed(2)}</h4>
            </div>
          </div>
          <div className="mobile-subcard-hr"></div>
          <div className="mobile-subcard-item mobile-flex-gap-0-5">
            {getCategoryIcon(topCategory7d)}
            <div>
              <p className="mobile-subcard-label">Top Category (7d)</p>
              <h4 className="mobile-subcard-val">
                {topCategory7d !== 'None' ? `${topCategory7d.split(' ')[0]} (₹${topCategory7dAmount.toFixed(0)})` : 'None'}
              </h4>
            </div>
          </div>
        </div>
      </div>

      <div className="mobile-timeframe-summary">
        Total spent this week: <strong className="mobile-bold-text-white">₹{filteredTotalSpending.toFixed(2)}</strong>
      </div>

      {/* Transaction List cards */}
      <div className="mobile-transactions-section">
        <div className="mobile-flex-space-between">
          <h4 className="mobile-recent-tx-title">Recent Transactions</h4>
          <span className="mobile-recent-tx-count">{currentFilteredExpenses.length} found</span>
        </div>

        {currentFilteredExpenses.length === 0 ? (
          <div className="mobile-empty-state">
            No transactions for this view.
          </div>
        ) : (
          <div className="mobile-tx-list">
            {currentFilteredExpenses.map((exp) => (
              <div className="mobile-tx-card" key={exp.id}>
                <div className="mobile-tx-icon">
                  {getCategoryIcon(exp.category)}
                </div>
                <div className="mobile-tx-info">
                  <h4 className="mobile-tx-merchant">{exp.description}</h4>
                  <p className="mobile-tx-date">{exp.date} • {exp.category.split(' ')[0]}</p>
                </div>
                <div className="mobile-tx-right">
                  <span className="mobile-tx-amt">-₹{exp.amount.toFixed(2)}</span>
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
    </div>
  );
};
