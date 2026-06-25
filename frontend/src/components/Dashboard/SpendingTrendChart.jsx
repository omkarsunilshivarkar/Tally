import React from 'react';
import './SpendingTrendChart.css';

export const SpendingTrendChart = ({ currentMonthExpenses }) => {
  return (
    <div className="glass-card">
      <h4 className="trend-chart-title">Spending Trend Line (Day-by-Day)</h4>
      <div className="chart-trend-container">
        {currentMonthExpenses.length === 0 ? (
          <p className="trend-chart-empty">No transaction history to chart</p>
        ) : (
          <svg width="100%" height="220" viewBox="0 0 500 200" className="trend-chart-svg">
            <defs>
              <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="white" stopOpacity="0.15" />
                <stop offset="100%" stopColor="white" stopOpacity="0" />
              </linearGradient>
            </defs>
            {/* Grid Lines */}
            <line x1="40" y1="20" x2="480" y2="20" stroke="rgba(255,255,255,0.05)" strokeDasharray="3" />
            <line x1="40" y1="75" x2="480" y2="75" stroke="rgba(255,255,255,0.05)" strokeDasharray="3" />
            <line x1="40" y1="130" x2="480" y2="130" stroke="rgba(255,255,255,0.05)" strokeDasharray="3" />
            <line x1="40" y1="170" x2="480" y2="170" stroke="rgba(255,255,255,0.1)" />

            {/* Draw points & connecting line */}
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

              const dGrad = `${d} L ${points[points.length - 1].x} 170 L ${points[0].x} 170 Z`;

              return (
                <>
                  <path d={dGrad} fill="url(#chartGradient)" />
                  <path d={d} fill="none" stroke="white" strokeWidth="2.5" />
                  {points.map((p, idx) => (
                    <g key={idx}>
                      <circle cx={p.x} cy={p.y} r="5" fill="white" stroke="var(--bg-color)" strokeWidth="1.5" />
                      <text x={p.x} y={p.y - 10} textAnchor="middle" fill="white" fontSize="9" fontWeight="bold">
                        ₹{daySums[sortedDays[idx]].toFixed(0)}
                      </text>
                      <text x={p.x} y="188" textAnchor="middle" fill="var(--text-muted)" fontSize="8">
                        d{sortedDays[idx]}
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
  );
};
