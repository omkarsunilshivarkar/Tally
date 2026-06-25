import React from 'react';
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
      <div className="glass-card glass-card-padded-compact">
        <h4 className="mobile-section-title">Daily Spending Trend</h4>
        <div className="mobile-chart-container">
          {currentMonthExpenses.length === 0 ? (
            <p className="mobile-chart-empty-text">No transactions to plot</p>
          ) : (
            <svg width="100%" height="160" viewBox="0 0 500 200" className="trend-chart-svg">
              <line x1="40" y1="20" x2="480" y2="20" stroke="rgba(255,255,255,0.05)" strokeDasharray="3" />
              <line x1="40" y1="130" x2="480" y2="130" stroke="rgba(255,255,255,0.05)" strokeDasharray="3" />
              <line x1="40" y1="170" x2="480" y2="170" stroke="rgba(255,255,255,0.1)" />
              {(() => {
                const daySums = {};
                currentMonthExpenses.forEach((exp) => {
                  const day = new Date(exp.date).getDate();
                  daySums[day] = (daySums[day] || 0) + exp.amount;
                });
                const sortedDays = Object.keys(daySums).map(Number).sort((a, b) => a - b);
                if (sortedDays.length === 0) return null;

                const maxAmt = Math.max(...Object.values(daySums), 20);
                const getCoords = (day, amt) => {
                  const x = 40 + (day / 31) * 440;
                  const y = 170 - (amt / maxAmt) * 150;
                  return { x, y };
                };

                const points = sortedDays.map((day) => getCoords(day, daySums[day]));
                let d = `M ${points[0].x} ${points[0].y}`;
                for (let i = 1; i < points.length; i++) {
                  d += ` L ${points[i].x} ${points[i].y}`;
                }
                return (
                  <>
                    <path d={d} fill="none" stroke="white" strokeWidth="2" />
                    {points.map((p, idx) => (
                      <g key={idx}>
                        <circle cx={p.x} cy={p.y} r="4" fill="white" />
                        <text x={p.x} y={p.y - 8} textAnchor="middle" fill="white" fontSize="9">
                          ₹{daySums[sortedDays[idx]].toFixed(0)}
                        </text>
                      </g>
                    ))}
                  </>
                );
              })()}
            </svg>
          )}
        </div>
      </div>

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
                <circle cx="50" cy="50" r="28" fill="var(--bg-color)" />
                <text x="50" y="53" textAnchor="middle" fill="white" fontSize="9" fontWeight="bold">₹{totalSpending.toFixed(0)}</text>
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
                  <span className={isOver ? 'text-danger' : ''}>
                    ₹{spent.toFixed(0)} / ₹{limit > 0 ? limit.toFixed(0) : '—'}
                  </span>
                </div>
                {limit > 0 && (
                  <div className="progress-bar-container mobile-progress-bar-container-compact">
                    <div
                      className="progress-bar-fill"
                      style={{
                        width: `${progressPercent}%`,
                        background: isOver ? '#ff4d4d' : progressPercent > 80 ? 'var(--warning-color)' : 'white',
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
