import React, { useState } from 'react';
import { TrendingUp } from 'lucide-react';
import './SpendingTrendChart.css';

export const SpendingTrendChart = ({
  currentMonthExpenses = [],
  timeframe = 'Monthly',
  selectedMonth,
  isMobile = false,
}) => {
  const [activeIdx, setActiveIdx] = useState(null);

  if (!currentMonthExpenses || currentMonthExpenses.length === 0) {
    return (
      <div className="glass-card trend-chart-card">
        <h4 className="trend-chart-title">Daily Spending Trend</h4>
        <div className="chart-trend-container empty-state">
          <div className="empty-state-content">
            <TrendingUp size={32} className="trend-empty-icon" />
            <p className="trend-chart-empty">No transaction history in this period</p>
          </div>
        </div>
      </div>
    );
  }

  // Parse Year and Month for Calendar calculations
  const monthStr = selectedMonth || new Date().toISOString().slice(0, 7);
  const [year, month] = monthStr.split('-').map(Number);

  let chartData = [];

  if (timeframe === 'Daily') {
    // Sort today's expenses chronologically (by id)
    const todayExpenses = [...currentMonthExpenses].sort((a, b) => a.id - b.id);
    
    // Progressive cumulative spending throughout the day
    chartData.push({
      label: 'Start',
      fullLabel: 'Start of Day',
      amount: 0,
      expenses: [],
    });

    let runningTotal = 0;
    todayExpenses.forEach((exp) => {
      runningTotal += exp.amount;
      chartData.push({
        label: exp.description ? (exp.description.length > 8 ? exp.description.slice(0, 8) + '...' : exp.description) : exp.category.split(' ')[0],
        fullLabel: exp.description || exp.category,
        amount: runningTotal,
        expenses: [exp],
      });
    });
  } else if (timeframe === 'Weekly') {
    // Last 7 days ending today
    const dateSums = {};
    const dateExpenses = {};
    currentMonthExpenses.forEach((exp) => {
      dateSums[exp.date] = (dateSums[exp.date] || 0) + exp.amount;
      if (!dateExpenses[exp.date]) dateExpenses[exp.date] = [];
      dateExpenses[exp.date].push(exp);
    });

    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const dayName = d.toLocaleDateString('default', { weekday: 'short' });
      const dayNum = d.getDate();
      chartData.push({
        label: `${dayName} ${dayNum}`,
        fullLabel: d.toLocaleDateString('default', { weekday: 'long', month: 'short', day: 'numeric' }),
        amount: dateSums[dateStr] || 0,
        expenses: dateExpenses[dateStr] || [],
      });
    }
  } else {
    // Monthly timeframe
    const numDays = new Date(year, month, 0).getDate();
    const daySums = {};
    const dayExpenses = {};
    currentMonthExpenses.forEach((exp) => {
      const dNum = new Date(exp.date).getDate();
      daySums[dNum] = (daySums[dNum] || 0) + exp.amount;
      if (!dayExpenses[dNum]) dayExpenses[dNum] = [];
      dayExpenses[dNum].push(exp);
    });

    for (let d = 1; d <= numDays; d++) {
      const dateObj = new Date(year, month - 1, d);
      chartData.push({
        label: `${d}`,
        fullLabel: dateObj.toLocaleDateString('default', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' }),
        amount: daySums[d] || 0,
        expenses: dayExpenses[d] || [],
      });
    }
  }

  // Calculate coordinates mapping to SVG viewBox="0 0 500 200"
  const maxAmt = Math.max(...chartData.map((d) => d.amount), 20); // Scale ceiling (minimum scale ₹20)

  const getCoords = (idx) => {
    const totalPoints = chartData.length;
    const x = totalPoints > 1 ? 45 + (idx / (totalPoints - 1)) * 435 : 260;
    const y = 170 - (chartData[idx].amount / maxAmt) * 140; // baseline y=170, max height 140px (y=30)
    return { x, y };
  };

  const points = chartData.map((_, idx) => getCoords(idx));

  // Compute SVG Paths
  let dPath = '';
  let dGradPath = '';
  if (points.length > 0) {
    dPath = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      dPath += ` L ${points[i].x} ${points[i].y}`;
    }
    dGradPath = `${dPath} L ${points[points.length - 1].x} 170 L ${points[0].x} 170 Z`;
  }

  // Mouse Move snaper logic
  const handleMouseMove = (e) => {
    if (points.length === 0) return;
    const svg = e.currentTarget;
    const rect = svg.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const mouseX = clientX - rect.left;
    const mouseXInSvg = (mouseX / rect.width) * 500;

    let closestIdx = 0;
    let minDiff = Infinity;
    points.forEach((p, idx) => {
      const diff = Math.abs(p.x - mouseXInSvg);
      if (diff < minDiff) {
        minDiff = diff;
        closestIdx = idx;
      }
    });
    setActiveIdx(closestIdx);
  };

  const handleMouseLeave = () => {
    setActiveIdx(null);
  };

  // Determine active index to display details for
  // If not hovered, display the latest logged point details by default
  const activePointIdx = activeIdx !== null ? activeIdx : (chartData.length > 0 ? chartData.length - 1 : null);
  const activePoint = activePointIdx !== null ? points[activePointIdx] : null;
  const activeData = activePointIdx !== null ? chartData[activePointIdx] : null;

  // Stats Computations
  const totalSpent = currentMonthExpenses.reduce((sum, exp) => sum + exp.amount, 0);
  const dailyAvg = timeframe === 'Weekly' ? totalSpent / 7 : timeframe === 'Daily' ? totalSpent : totalSpent / chartData.length;

  let peakDay = null;
  let peakAmt = 0;
  chartData.forEach((d) => {
    if (d.amount > peakAmt) {
      peakAmt = d.amount;
      peakDay = d;
    }
  });

  const shouldShowXLabel = (idx, total) => {
    if (timeframe === 'Daily') {
      if (total <= 5) return true;
      return idx === 0 || idx === total - 1 || idx === Math.floor(total / 2);
    }
    if (total <= 7) return true;
    if (total <= 15) return idx % 2 === 0;
    // Monthly (28-31 days): show clean intervals
    const day = idx + 1;
    return day === 1 || day === 5 || day === 10 || day === 15 || day === 20 || day === 25 || day === total;
  };

  return (
    <div className={`glass-card trend-chart-card ${isMobile ? 'mobile-card-override' : ''}`}>
      {/* Stats Summary Header */}
      <div className="trend-chart-header">
        <div className="trend-chart-header-info">
          <h4 className="trend-chart-title">Daily Spending Trend</h4>
          <p className="trend-chart-subtitle">
            {timeframe === 'Daily' ? 'Today' : timeframe === 'Weekly' ? 'Weekly progression' : `Monthly - ${new Date(year, month - 1).toLocaleString('default', { month: 'long', year: 'numeric' })}`}
          </p>
        </div>
        <div className="trend-stats-summary">
          <div className="trend-stat-card">
            <span className="trend-stat-label">Total Spent</span>
            <span className="trend-stat-value">₹{totalSpent.toFixed(0)}</span>
          </div>
          {timeframe !== 'Daily' && (
            <div className="trend-stat-card">
              <span className="trend-stat-label">Daily Avg</span>
              <span className="trend-stat-value">₹{dailyAvg.toFixed(0)}</span>
            </div>
          )}
          {peakDay && peakAmt > 0 && (
            <div className="trend-stat-card">
              <span className="trend-stat-label">Peak Spending</span>
              <span className="trend-stat-value">
                ₹{peakAmt.toFixed(0)}{' '}
                <span className="trend-stat-sub">({timeframe === 'Daily' ? 'Logged' : `Day ${peakDay.label}`})</span>
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="chart-trend-container">
        {/* Absolute Tooltip Overlay */}
        {activeData && activePoint && (
          <div
            className="trend-chart-tooltip"
            style={{
              left: `${(activePoint.x / 500) * 100}%`,
              top: `${(activePoint.y / 200) * 100}%`,
              transform: 'translate(-50%, -125%)',
            }}
          >
            <div className="tooltip-date">{activeData.fullLabel}</div>
            <div className="tooltip-amount">
              ₹{activeData.amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            {activeData.expenses && activeData.expenses.length > 0 && (
              <div className="tooltip-expenses-list">
                {activeData.expenses.slice(0, 3).map((exp, i) => (
                  <div key={i} className="tooltip-expense-item">
                    <span className="tooltip-expense-desc">{exp.description || exp.category}</span>
                    <span className="tooltip-expense-val">₹{exp.amount.toFixed(0)}</span>
                  </div>
                ))}
                {activeData.expenses.length > 3 && (
                  <div className="tooltip-expense-more">
                    + {activeData.expenses.length - 3} more items
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* SVG Drawing Area */}
        <svg
          width="100%"
          height="100%"
          viewBox="0 0 500 200"
          className="trend-chart-svg"
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          onTouchMove={handleMouseMove}
          onTouchStart={handleMouseMove}
          onTouchEnd={handleMouseLeave}
        >
          <defs>
            <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--text-primary)" stopOpacity="0.18" />
              <stop offset="100%" stopColor="var(--text-primary)" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Y-Axis Labels & Grid Lines */}
          <g className="grid-lines">
            <text x="35" y="33" textAnchor="end" fill="var(--text-muted)" fontSize="8" fontWeight="500">
              ₹{maxAmt.toFixed(0)}
            </text>
            <line x1="42" y1="30" x2="480" y2="30" stroke="var(--border-color)" strokeDasharray="3" />

            <text x="35" y="103" textAnchor="end" fill="var(--text-muted)" fontSize="8" fontWeight="500">
              ₹{(maxAmt / 2).toFixed(0)}
            </text>
            <line x1="42" y1="100" x2="480" y2="100" stroke="var(--border-color)" strokeDasharray="3" />

            <text x="35" y="173" textAnchor="end" fill="var(--text-muted)" fontSize="8" fontWeight="500">
              ₹0
            </text>
            <line x1="42" y1="170" x2="480" y2="170" stroke="var(--border-color)" />
          </g>

          {/* Area Fill Gradient */}
          {dGradPath && <path d={dGradPath} fill="url(#chartGradient)" />}

          {/* Glow Line behind (Double stroke technique) */}
          {dPath && (
            <path
              d={dPath}
              fill="none"
              stroke="var(--text-primary)"
              strokeWidth="6"
              opacity="0.15"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* Main Trend Line */}
          {dPath && (
            <path
              d={dPath}
              fill="none"
              stroke="var(--text-primary)"
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* Snapping Interactive vertical guide line & point */}
          {activePoint && (
            <g className="snapping-guide">
              <line
                x1={activePoint.x}
                y1="30"
                x2={activePoint.x}
                y2="170"
                stroke="var(--text-primary)"
                strokeDasharray="4 4"
                opacity="0.35"
                strokeWidth="1.5"
              />
              <circle cx={activePoint.x} cy={activePoint.y} r="8" fill="var(--text-primary)" opacity="0.15" />
              <circle cx={activePoint.x} cy={activePoint.y} r="4.5" fill="var(--text-primary)" stroke="var(--bg-color)" strokeWidth="1.5" />
            </g>
          )}

          {/* X-Axis labels at clean spacing */}
          <g className="x-axis-labels">
            {chartData.map((d, idx) => {
              if (!shouldShowXLabel(idx, chartData.length)) return null;
              const p = points[idx];
              return (
                <text
                  key={idx}
                  x={p.x}
                  y="186"
                  textAnchor="middle"
                  fill="var(--text-muted)"
                  fontSize="8"
                  fontWeight="500"
                >
                  {d.label}
                </text>
              );
            })}
          </g>
        </svg>
      </div>
    </div>
  );
};

export default SpendingTrendChart;
