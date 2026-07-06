import React from 'react';
import { TrendingUp } from 'lucide-react';
import './SpendingTrendChart.css';

export const SpendingTrendChart = ({
  currentMonthExpenses = [],
  timeframe = 'Monthly',
  selectedMonth,
  isMobile = false,
}) => {
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
    const x = totalPoints > 1 ? 55 + (idx / (totalPoints - 1)) * 420 : 260;
    const y = 170 - (chartData[idx].amount / maxAmt) * 115; // baseline y=170, max height 115px (y=55) to leave room for big text at top
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
        {/* SVG Drawing Area */}
        <svg
          width="100%"
          height="100%"
          viewBox="0 0 500 200"
          className="trend-chart-svg"
        >
          <defs>
            <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--text-primary)" stopOpacity="0.18" />
              <stop offset="100%" stopColor="var(--text-primary)" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Y-Axis Labels & Grid Lines */}
          <g className="grid-lines">
            <text x="48" y="60" textAnchor="end" fill="var(--text-muted)" fontSize="16" fontWeight="700">
              ₹{maxAmt.toFixed(0)}
            </text>
            <line x1="55" y1="55" x2="480" y2="55" stroke="var(--border-color)" strokeDasharray="3" />

            <text x="48" y="117.5" textAnchor="end" fill="var(--text-muted)" fontSize="16" fontWeight="700">
              ₹{(maxAmt / 2).toFixed(0)}
            </text>
            <line x1="55" y1="112.5" x2="480" y2="112.5" stroke="var(--border-color)" strokeDasharray="3" />

            <text x="48" y="175" textAnchor="end" fill="var(--text-muted)" fontSize="16" fontWeight="700">
              ₹0
            </text>
            <line x1="55" y1="170" x2="480" y2="170" stroke="var(--border-color)" />
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

          {/* Render circular dots & amount values above peaks/spending days */}
          {points.map((p, idx) => {
            const d = chartData[idx];
            if (d.amount === 0) return null;

            // Spacing check: render text label if sparse or significant
            const showValueText = chartData.length <= 8 || idx % 2 === 0 || d.amount > (maxAmt * 0.2);

            return (
              <g key={idx}>
                <circle
                  cx={p.x}
                  cy={p.y}
                  r="4"
                  fill="var(--text-primary)"
                  stroke="var(--bg-color)"
                  strokeWidth="1.5"
                />
                {showValueText && (
                  <text
                    x={p.x}
                    y={p.y - 18}
                    textAnchor="middle"
                    fill="var(--text-primary)"
                    fontSize="20"
                    fontWeight="800"
                  >
                    ₹{d.amount.toFixed(0)}
                  </text>
                )}
              </g>
            );
          })}

          {/* X-Axis labels at clean spacing */}
          <g className="x-axis-labels">
            {chartData.map((d, idx) => {
              if (!shouldShowXLabel(idx, chartData.length)) return null;
              const p = points[idx];
              return (
                <text
                  key={idx}
                  x={p.x}
                  y="194"
                  textAnchor="middle"
                  fill="var(--text-muted)"
                  fontSize="16"
                  fontWeight="700"
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
