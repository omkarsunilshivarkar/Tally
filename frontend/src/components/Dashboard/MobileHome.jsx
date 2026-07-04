import React, { useState } from 'react';
import { TrendingUp, Trash2, Brain, Loader2, Send, Plus, Calendar, ChevronUp, ChevronDown, Target, X } from 'lucide-react';
import './MobileHome.css';
import './MobileQuickLog.css';

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
  handleQuickLog,
  quickLogText,
  setQuickLogText,
  quickLogLoading,
  savingsGoals = [],
  totalVaultBalance = 0,
  handleUpdateGoalFunding,
  handleCreateGoal,
  handleDeleteGoal,
}) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [activeFundingGoal, setActiveFundingGoal] = useState(null);
  const [newGoal, setNewGoal] = useState({
    name: '',
    targetAmount: '',
    currentAmount: '0',
    targetDate: new Date().toISOString().split('T')[0]
  });

  const onSubmit = (e) => {
    e.preventDefault();
    if (!newGoal.name || !newGoal.targetAmount || !newGoal.targetDate) return;

    handleCreateGoal({
      name: newGoal.name,
      targetAmount: parseFloat(newGoal.targetAmount),
      currentAmount: parseFloat(newGoal.currentAmount || 0),
      targetDate: newGoal.targetDate
    });

    setNewGoal({
      name: '',
      targetAmount: '',
      currentAmount: '0',
      targetDate: new Date().toISOString().split('T')[0]
    });
    setIsFormOpen(false);
  };
  return (
    <div className="mobile-view-fade">
      {/* Quick Log Sparkle Bar */}
      <section className="mobile-quick-log-section">
        <form onSubmit={handleQuickLog} className="ai-log-container">
          <Brain className="ai-log-sparkle" size={18} />
          <input
            type="text"
            className="ai-log-input"
            placeholder="AI Command: 'spent ₹250 at KFC today'..."
            value={quickLogText}
            onChange={(e) => setQuickLogText(e.target.value)}
            disabled={quickLogLoading}
          />
          {quickLogLoading ? (
            <div className="ai-log-loading-wrapper">
              <Loader2 size={16} className="ai-log-sparkle spin-loader" />
            </div>
          ) : (
            quickLogText.trim() && (
              <button type="submit" className="ai-log-submit-btn" title="Submit command">
                <Send size={14} />
              </button>
            )
          )}
        </form>
      </section>

      {/* Featured Goal & Activity Split Card */}
      <div className="mobile-featured-card">
        <div className="mobile-card-left">
          <div className="mobile-goals-ring-wrapper">
            <svg width="64" height="64" viewBox="0 0 50 50">
              <circle
                cx="25"
                cy="25"
                r={radius}
                fill="none"
                stroke="var(--border-color)"
                strokeWidth="4"
              />
              <circle
                cx="25"
                cy="25"
                r={radius}
                fill="none"
                stroke="var(--text-primary)"
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

      {/* Mobile Savings Goals Vault */}
      <div className="glass-card glass-card-padded-compact mobile-vault-container">
        <div className="mobile-flex-space-between mobile-vault-header">
          <h4 className="mobile-recent-tx-title mobile-vault-title">Savings Vault</h4>
          <span className="mobile-vault-balance-badge">
            Saved: ₹{totalVaultBalance.toFixed(0)}
          </span>
        </div>

        {/* Collapsible Mobile Goal Creator */}
        <div className="mobile-vault-creation-toggle-wrapper">
          <button
            type="button"
            className="btn btn-secondary mobile-btn-new-goal-toggle"
            onClick={() => setIsFormOpen(!isFormOpen)}
          >
            {isFormOpen ? <ChevronUp size={14} /> : <Plus size={14} />}
            <span>{isFormOpen ? 'Cancel New Goal' : 'Create New Goal'}</span>
          </button>

          {isFormOpen && (
            <form onSubmit={onSubmit} className="mobile-new-goal-form-inline">
              <div className="form-group mobile-form-group-compact">
                <input
                  type="text"
                  placeholder="Goal Name"
                  className="form-input mobile-input-compact"
                  value={newGoal.name}
                  onChange={(e) => setNewGoal({ ...newGoal, name: e.target.value })}
                  required
                />
              </div>
              <div className="form-group mobile-form-group-compact">
                <input
                  type="number"
                  placeholder="Target Amount (₹)"
                  className="form-input mobile-input-compact"
                  value={newGoal.targetAmount}
                  onChange={(e) => setNewGoal({ ...newGoal, targetAmount: e.target.value })}
                  required
                />
              </div>
              <div className="form-group mobile-form-group-compact">
                <input
                  type="date"
                  className="form-input mobile-input-compact"
                  value={newGoal.targetDate}
                  onChange={(e) => setNewGoal({ ...newGoal, targetDate: e.target.value })}
                  required
                />
              </div>
              <div className="form-group mobile-form-group-compact">
                <input
                  type="number"
                  placeholder="Initial Deposit (Optional)"
                  className="form-input mobile-input-compact"
                  value={newGoal.currentAmount}
                  onChange={(e) => setNewGoal({ ...newGoal, currentAmount: e.target.value })}
                />
              </div>
              <button type="submit" className="btn btn-primary mobile-btn-submit-goal">
                <Target size={14} /> Add Goal
              </button>
            </form>
          )}
        </div>

        {savingsGoals.length === 0 ? (
          <div className="mobile-empty-state mobile-empty-state-compact">
            No savings goals set yet.
          </div>
        ) : (
          <div className="mobile-goals-carousel">
            {savingsGoals.map((goal) => {
              const progress = goal.targetAmount > 0
                ? Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100))
                : 0;

              const remainingDays = Math.max(
                0,
                Math.ceil((new Date(goal.targetDate) - new Date()) / (1000 * 60 * 60 * 24))
              );

              const radius = 22;
              const circumference = 2 * Math.PI * radius;
              const strokeDashoffset = circumference - (progress / 100) * circumference;

              return (
                <div key={goal.id} className="mobile-goal-card">
                  <div className="mobile-goal-card-content">
                    <div className="mobile-goal-card-header">
                      <div className="mobile-goal-card-title-group">
                        <span className="mobile-goal-card-title">{goal.name}</span>
                        <div className="mobile-goal-card-meta">
                          <Calendar size={11} /> {remainingDays} days left
                        </div>
                      </div>
                      
                      <button
                        type="button"
                        className="mobile-tx-del-btn"
                        onClick={() => handleDeleteGoal(goal.id)}
                        title="Delete goal"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>

                    <div className="mobile-goal-card-body">
                      {/* Left side info */}
                      <div className="mobile-goal-card-stats">
                        <span className="mobile-goal-card-stats-label">
                          Saved Balance
                        </span>
                        <span className="mobile-goal-card-stats-value">
                          ₹{goal.currentAmount.toLocaleString()} <span className="mobile-goal-card-stats-target">/ ₹{goal.targetAmount.toLocaleString()}</span>
                        </span>
                      </div>

                      {/* Right side circular SVG progress (matching Featured Card ring style) */}
                      <div className="mobile-goal-circle-wrapper">
                        <svg className="mobile-goal-circle-svg" width="64" height="64" viewBox="0 0 50 50">
                          <circle
                            cx="25"
                            cy="25"
                            r={radius}
                            fill="none"
                            stroke="var(--border-color)"
                            strokeWidth="4"
                          />
                          <circle
                            cx="25"
                            cy="25"
                            r={radius}
                            fill="none"
                            stroke={progress === 100 ? '#10b981' : 'var(--text-primary)'}
                            strokeWidth="4"
                            strokeDasharray={circumference}
                            strokeDashoffset={strokeDashoffset}
                            strokeLinecap="round"
                            transform="rotate(-90 25 25)"
                          />
                        </svg>
                        <span className={`mobile-goal-circle-percentage ${progress === 100 ? 'completed' : ''}`}>
                          {progress}%
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      className="mobile-fund-manage-btn"
                      onClick={() => setActiveFundingGoal(goal)}
                    >
                      Manage Funds
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Transaction List cards */}
      <div className="mobile-transactions-section">
        <div className="mobile-flex-space-between">
          <h4 className="mobile-recent-tx-title">Recent Transactions</h4>
          <span className="mobile-recent-tx-count">
            {currentFilteredExpenses.length > 5 ? 'Latest 5' : `${currentFilteredExpenses.length} found`}
          </span>
        </div>

        {currentFilteredExpenses.length === 0 ? (
          <div className="mobile-empty-state">
            No transactions for this view.
          </div>
        ) : (
          <div className="mobile-tx-list">
            {currentFilteredExpenses.slice(0, 5).map((exp) => (
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
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bottom Sheet Drawer for mobile funding actions */}
      {activeFundingGoal && (
        <div className="mobile-bottom-sheet-overlay" onClick={() => setActiveFundingGoal(null)}>
          <div className="mobile-bottom-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="mobile-bottom-sheet-handle" />
            
            <div className="mobile-sheet-header">
              <div className="mobile-sheet-header-title-group">
                <h3 className="mobile-sheet-title">Manage: {activeFundingGoal.name}</h3>
                <p className="mobile-sheet-subtitle">
                  Current Saved: <strong>₹{activeFundingGoal.currentAmount.toLocaleString()}</strong> / target ₹{activeFundingGoal.targetAmount.toLocaleString()}
                </p>
              </div>
              <button
                type="button"
                className="mobile-sheet-close-btn"
                onClick={() => setActiveFundingGoal(null)}
                title="Close"
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="mobile-sheet-input-row">
              <input
                type="number"
                placeholder="Amount (₹)"
                id="mobile-fund-input-sheet"
                className="form-input"
                autoFocus
              />
              <div className="mobile-sheet-buttons">
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => {
                    const el = document.getElementById('mobile-fund-input-sheet');
                    const val = parseFloat(el?.value || 0);
                    if (!isNaN(val) && val > 0) {
                      handleUpdateGoalFunding(activeFundingGoal.id, activeFundingGoal.currentAmount + val);
                      setActiveFundingGoal(null);
                    }
                  }}
                >
                  Fund
                </button>
                <button
                  type="button"
                  className="btn mobile-btn-withdraw"
                  disabled={activeFundingGoal.currentAmount <= 0}
                  onClick={() => {
                    const el = document.getElementById('mobile-fund-input-sheet');
                    const val = parseFloat(el?.value || 0);
                    if (!isNaN(val) && val > 0) {
                      handleUpdateGoalFunding(
                        activeFundingGoal.id,
                        Math.max(0, activeFundingGoal.currentAmount - val)
                      );
                      setActiveFundingGoal(null);
                    }
                  }}
                >
                  Withdraw
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
