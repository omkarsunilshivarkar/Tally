import React from 'react';
import './CategoryDonutChart.css';

export const CategoryDonutChart = ({ donutData, totalSpending, chartColors }) => {
  return (
    <div className="glass-card">
      <h4 className="donut-chart-title">Spending by Category</h4>
      <div className="chart-donut-container">
        {donutData.length === 0 ? (
          <p className="donut-chart-empty">No transactional category details</p>
        ) : (
          <>
            <svg width="180" height="180" viewBox="0 0 100 100">
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

                  const d = `M ${x1} ${y1} A ${r} ${r} 0 ${largeArcFlag} 1 ${x2} ${y2}`;

                  return (
                    <path
                      key={index}
                      d={d}
                      fill="none"
                      stroke={chartColors[index % chartColors.length]}
                      strokeWidth="12"
                    />
                  );
                });
              })()}
              <circle cx="50" cy="50" r="28" fill="none" />
              <text x="50" y="48" textAnchor="middle" fill="var(--text-muted)" fontSize="6" fontWeight="bold">TOTAL</text>
              <text x="50" y="58" textAnchor="middle" fill="var(--text-primary)" fontSize="9" fontWeight="bold">₹{totalSpending.toFixed(0)}</text>
            </svg>

            <div className="chart-donut-legend">
              {donutData.map((slice, index) => (
                <div key={index} className="chart-donut-legend-item">
                  <div className="chart-donut-legend-dot" style={{ background: chartColors[index % chartColors.length] }} />
                  <span className="donut-legend-label">{slice.name}:</span>
                  <strong className="donut-legend-value">₹{slice.value.toFixed(2)}</strong>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};
