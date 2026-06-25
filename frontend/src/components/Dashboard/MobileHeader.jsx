import React from 'react';
import { Coins, IndianRupee, ArrowLeft, Bot } from 'lucide-react';
import './MobileHeader.css';

export const MobileHeader = ({
  activeMobileView,
  setActiveMobileView,
  getGreeting,
  remainingBudget,
  totalSpending,
  spendPercent,
  totalBudget,
  setIsChatOpen,
}) => {
  if (activeMobileView === 'home') {
    return (
      <div className="mobile-top-bar">
        <header className="mobile-header-nav">
          <div>
            <p className="mobile-greeting-subtitle">{getGreeting()}</p>
            <h2 className="mobile-greeting-title">Hi, Welcome Back</h2>
          </div>
          
          <button className="mobile-chat-btn" onClick={() => setIsChatOpen(true)} title="AI Advisor">
            <Bot size={20} />
          </button>
        </header>

        <section className="mobile-metrics-row">
          <div className="mobile-metric-col">
            <span className="mobile-metric-label">
              <Coins size={12} className="mobile-header-icon" /> Total Balance
            </span>
            <h3 className="mobile-metric-val">₹{remainingBudget.toFixed(2)}</h3>
          </div>
          <div className="mobile-metric-divider"></div>
          <div className="mobile-metric-col">
            <span className="mobile-metric-label">
              <IndianRupee size={12} className="mobile-header-icon-small" /> Total Expense
            </span>
            <h3 className="mobile-metric-val">-₹{totalSpending.toFixed(2)}</h3>
          </div>
        </section>

        <section className="mobile-progress-wrapper">
          <div className="mobile-progress-info">
            <span className="mobile-progress-label">Monthly Limit</span>
            <span className="mobile-progress-values">
              ₹{totalSpending.toFixed(2)} <span className="mobile-progress-slash">/</span> ₹{totalBudget.toFixed(2)}
            </span>
          </div>
          <div className="mobile-progress-bar">
            <div
              className="mobile-progress-filled"
              style={{
                width: `${spendPercent}%`,
                background: spendPercent > 90
                  ? 'linear-gradient(90deg, #ff4d4d, #ff6b6b)'
                  : 'linear-gradient(90deg, var(--text-secondary), var(--text-primary))'
              }}
            />
          </div>
          <p className="mobile-progress-status-msg">
            {spendPercent}% Of Your Expenses, {spendPercent > 90 ? 'Needs Attention!' : 'Looks Good.'}
          </p>
        </section>
      </div>
    );
  }

  return (
    <div className="mobile-view-header">
      <button
        onClick={() => setActiveMobileView('home')}
        className="mobile-page-back-btn"
        title="Back"
      >
        <ArrowLeft size={20} />
      </button>
      <h2 className="mobile-page-title">
        {activeMobileView === 'add-expense' && 'Log Expense'}
        {activeMobileView === 'history' && 'Transaction History'}
        {activeMobileView === 'analytics' && 'Spending Analysis'}
        {activeMobileView === 'profile' && 'Profile & Settings'}
      </h2>
    </div>
  );
};
