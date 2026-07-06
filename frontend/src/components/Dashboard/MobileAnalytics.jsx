import React from 'react';
import { SpendingTrendChart } from './SpendingTrendChart';
import './MobileAnalytics.css';

export const MobileAnalytics = ({
  selectedMonth,
  setSelectedMonth,
  currentMonthExpenses,
  donutData,
  totalSpending,
  chartColors,
  CATEGORIES,
  categorySpending,
  budgets,
}) => {
  return (
    <div className="mobile-view-fade">
      {/* Filter controls inside a glass card */}
      <div className="glass-card glass-card-padded">
        <div className="form-group form-group-no-margin">
          <label className="form-label mobile-input-label">Analysis Month</label>
          <input
            type="month"
            className="form-input mobile-input-compact w-100"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
          />
        </div>
      </div>

      {/* Daily Trend line Chart */}
      <SpendingTrendChart
        currentMonthExpenses={currentMonthExpenses}
        timeframe="Monthly"
        selectedMonth={selectedMonth}
        isMobile={true}
      />

      {/* Spending by Category Donut */}
      <div className="glass-card glass-card-padded-compact">
        <h4 className="mobile-section-title">Category Distribution</h4>
        <div className="mobile-flex-center-row">
          {donutData.length === 0 ? (
            <p className="mobile-chart-empty-text">No spending details</p>
          ) : (
            <>
              <svg width="120" height="120" viewBox="0 0 100 100">
                {(() => {
                  const totalVal = donutData.reduce((s, d) => s + d.value, 0);
                  let cumulativePercent = 0;

                  return donutData.map((slice, index) => {
                    const percent = slice.value / totalVal;
                    const startX = Math.cos(2 * Math.PI * cumulativePercent);
                    const startY = Math.sin(2 * Math.PI * cumulativePercent);
                    cumulativePercent += percent;
                    const endX = Math.cos(2 * Math.PI * cumulativePercent);
                    const endY = Math.sin(2 * Math.PI * cumulativePercent);
                    const largeArcFlag = percent > 0.5 ? 1 : 0;

                    const r = 35;
                    const cx = 50;
                    const cy = 50;

                    const x1 = cx + r * startX;
                    const y1 = cy + r * startY;
                    const x2 = cx + r * endX;
                    const y2 = cy + r * endY;

                    return (
                      <path
                        key={index}
                        d={`M ${x1} ${y1} A ${r} ${r} 0 ${largeArcFlag} 1 ${x2} ${y2}`}
                        fill="none"
                        stroke={chartColors[index % chartColors.length]}
                        strokeWidth="10"
                      />
                    );
                  });
                })()}
                <circle cx="50" cy="50" r="28" fill="none" />
                <text x="50" y="53" textAnchor="middle" fill="var(--text-primary)" fontSize="9" fontWeight="bold">₹{totalSpending.toFixed(0)}</text>
              </svg>
              <div className="mobile-legend-container">
                {donutData.map((slice, index) => (
                  <div key={index} className="mobile-legend-item">
                    <div className="mobile-legend-dot" style={{ background: chartColors[index % chartColors.length] }} />
                    <span className="mobile-legend-label">{slice.name.split(' ')[0]}:</span>
                    <strong>₹{slice.value.toFixed(0)}</strong>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Budgets Limit Tracker */}
      <div className="glass-card glass-card-padded-compact">
        <h4 className="mobile-section-title">Monthly Limits</h4>
        <div className="mobile-list-container">
          {CATEGORIES.map((cat) => {
            const spent = categorySpending[cat] || 0;
            const budgetMatch = budgets.find((b) => b.category === cat);
            const limit = budgetMatch ? budgetMatch.limitAmount : 0;
            const progressPercent = limit > 0 ? Math.min((spent / limit) * 100, 100) : 0;
            const isOver = limit > 0 && spent > limit;

            return (
              <div key={cat} className="mobile-budget-item-card">
                <div className="mobile-budget-item-header">
                  <span>{cat}</span>
                  <span className={`mobile-budget-item-amount ${isOver ? 'text-danger' : ''}`}>
                    ₹{spent.toFixed(0)} / ₹{limit > 0 ? limit.toFixed(0) : '—'}
                  </span>
                </div>
                {limit > 0 && (
                  <div className="progress-bar-container mobile-progress-bar-container-compact">
                    <div
                      className="progress-bar-fill"
                      style={{
                        width: `${progressPercent}%`,
                        background: isOver ? '#ff4d4d' : progressPercent > 80 ? 'var(--warning-color)' : 'var(--text-primary)',
                      }}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
