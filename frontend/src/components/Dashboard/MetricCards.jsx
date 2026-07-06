import React from 'react';
import { IndianRupee, Coins, FolderMinus } from 'lucide-react';
import './MetricCards.css';

export const MetricCards = ({ totalSpending, totalBudget, remainingBudget, topCategory }) => {
  const spendPercent = totalBudget > 0 ? Math.min(100, Math.round((totalSpending / totalBudget) * 100)) : 0;
  const isOverBudget = totalBudget > 0 && totalSpending > totalBudget;

  return (
    <section className="glass-card desktop-metrics-card">
      {/* Top row of stats */}
      <div className="desktop-metrics-stats-row">
        <div className="desktop-metric-stat-item">
          <div className="desktop-metric-icon-box">
            <Coins size={20} />
          </div>
          <div>
            <p className="desktop-metric-label">Remaining Balance</p>
            <h3 className="desktop-metric-value">₹{remainingBudget.toFixed(2)}</h3>
          </div>
        </div>

        <div className="desktop-metric-divider" />

        <div className="desktop-metric-stat-item">
          <div className="desktop-metric-icon-box">
            <IndianRupee size={20} />
          </div>
          <div>
            <p className="desktop-metric-label">Total Spending</p>
            <h3 className="desktop-metric-value">₹{totalSpending.toFixed(2)}</h3>
          </div>
        </div>

        <div className="desktop-metric-divider" />

        <div className="desktop-metric-stat-item">
          <div className="desktop-metric-icon-box">
            <FolderMinus size={20} />
          </div>
          <div>
            <p className="desktop-metric-label">Top Category</p>
            <h3 className="desktop-metric-value desktop-metric-top-cat" title={topCategory}>
              {topCategory || 'None'}
            </h3>
          </div>
        </div>
      </div>

      {/* Bottom row budget progress */}
      <div className="desktop-metrics-progress-section">
        <div className="desktop-progress-header">
          <span className="desktop-progress-title">Monthly Budget Limit</span>
          <span className="desktop-progress-numbers">
            <strong>₹{totalSpending.toFixed(0)}</strong> <span className="desktop-progress-divider">/</span> ₹{totalBudget.toFixed(0)}
          </span>
        </div>
        
        <div className="desktop-progress-bar-track">
          <div 
            className="desktop-progress-bar-fill" 
            style={{ 
              width: `${spendPercent}%`,
              background: isOverBudget 
                ? 'linear-gradient(90deg, #ff4d4d, #ff6b6b)' 
                : spendPercent > 80
                  ? 'linear-gradient(90deg, var(--warning-color), var(--text-primary))'
                  : 'linear-gradient(90deg, var(--text-secondary), var(--text-primary))'
            }} 
          />
        </div>

        <div className="desktop-progress-footer">
          <span className="desktop-progress-percent">{spendPercent}% spent</span>
          <span className={`desktop-progress-status-text ${isOverBudget ? 'text-danger' : ''}`}>
            {isOverBudget 
              ? 'Over Budget limit! Consider freezing expenses.' 
              : spendPercent > 80 
                ? 'Approaching budget limit.' 
                : 'Overall expenses look good.'
            }
          </span>
        </div>
      </div>
    </section>
  );
};
