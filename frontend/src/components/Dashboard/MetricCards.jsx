import React from 'react';
import { IndianRupee, TrendingUp, Percent, FolderMinus } from 'lucide-react';
import './MetricCards.css';

export const MetricCards = ({ totalSpending, totalBudget, remainingBudget, topCategory }) => {
  return (
    <section className="metrics-grid">
      <div className="glass-card metric-card">
        <div className="metric-icon-wrapper metric-card-icon">
          <IndianRupee size={24} />
        </div>
        <div>
          <p className="metric-card-label">Total Spending</p>
          <h3 className="metric-card-val">₹{totalSpending.toFixed(2)}</h3>
        </div>
      </div>

      <div className="glass-card metric-card">
        <div className="metric-icon-wrapper metric-card-icon">
          <TrendingUp size={24} />
        </div>
        <div>
          <p className="metric-card-label">Monthly Budget Limit</p>
          <h3 className="metric-card-val">₹{totalBudget.toFixed(2)}</h3>
        </div>
      </div>

      <div className="glass-card metric-card">
        <div className="metric-icon-wrapper metric-card-icon">
          <Percent size={24} />
        </div>
        <div>
          <p className="metric-card-label">Remaining Balance</p>
          <h3 className="metric-card-val">₹{remainingBudget.toFixed(2)}</h3>
        </div>
      </div>

      <div className="glass-card metric-card">
        <div className="metric-icon-wrapper metric-card-icon">
          <FolderMinus size={24} />
        </div>
        <div>
          <p className="metric-card-label">Top Category</p>
          <h3 className="metric-card-top-val">{topCategory}</h3>
        </div>
      </div>
    </section>
  );
};
