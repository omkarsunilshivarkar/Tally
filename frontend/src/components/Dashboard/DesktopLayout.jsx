import React from 'react';
import { FileText, Bot, AlertTriangle, Brain, Loader2 } from 'lucide-react';
import { DesktopSidebar } from './DesktopSidebar';
import { MetricCards } from './MetricCards';
import { SpendingTrendChart } from './SpendingTrendChart';
import { CategoryDonutChart } from './CategoryDonutChart';
import { TransactionForm } from './TransactionForm';
import { TransactionTable } from './TransactionTable';
import { BudgetSettings } from './BudgetSettings';
import { CATEGORIES, getBadgeClass } from './useDashboardState.jsx';
import './DesktopLayout.css';

export const DesktopLayout = ({ state }) => {
  const {
    user,
    logout,
    setIsScannerOpen,
    setIsChatOpen,
    selectedMonth,
    setSelectedMonth,
    error,
    totalSpending,
    totalBudget,
    remainingBudget,
    topCategory,
    currentMonthExpenses,
    donutData,
    chartColors,
    manualForm,
    setManualForm,
    handleManualSubmit,
    handleDeleteExpense,
    handleQuickLog,
    quickLogText,
    setQuickLogText,
    quickLogLoading,
    budgets,
    categorySpending,
    editingBudget,
    setEditingBudget,
    handleUpdateBudget,
    overallBudgetMatch,
    theme,
    toggleTheme,
  } = state;

  return (
    <div className="desktop-layout app-container">
      {/* Sidebar Nav */}
      <DesktopSidebar
        user={user}
        logout={logout}
        setIsScannerOpen={setIsScannerOpen}
        setIsChatOpen={setIsChatOpen}
        theme={theme}
        toggleTheme={toggleTheme}
      />

      {/* Main Content Dashboard */}
      <main className="main-content">
        {/* Top Header */}
        <header className="desktop-header">
          <div>
            <h2 className="desktop-header-title">
              Welcome back, <span className="gradient-text">{user?.name}</span>
            </h2>
            <p className="desktop-header-subtitle">Here is your financial workspace snapshot.</p>
          </div>

          <div className="desktop-header-actions">
            <input
              type="month"
              className="form-input desktop-month-picker"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
            />
            <button className="btn btn-primary" onClick={() => setIsScannerOpen(true)}>
              <FileText size={16} /> Scan Receipt
            </button>
            <button className="btn btn-secondary desktop-chat-advisor-btn" onClick={() => setIsChatOpen(true)}>
              <Bot size={16} color="white" /> Chat Advisor
            </button>
          </div>
        </header>

        {error && (
          <div className="error-banner">
            <AlertTriangle size={18} className="error-banner-icon" />
            <span>{error}</span>
          </div>
        )}

        {/* Metrics Cards */}
        <MetricCards
          totalSpending={totalSpending}
          totalBudget={totalBudget}
          remainingBudget={remainingBudget}
          topCategory={topCategory}
        />

        {/* Quick Log Sparkle Bar */}
        <section className="desktop-quick-log-section">
          <form onSubmit={handleQuickLog} className="ai-log-container">
            <Brain className="ai-log-sparkle" size={20} />
            <input
              type="text"
              className="ai-log-input"
              placeholder="AI Command Bar: type 'spent ₹250 at McDonalds today' to log instantly..."
              value={quickLogText}
              onChange={(e) => setQuickLogText(e.target.value)}
              disabled={quickLogLoading}
            />
            {quickLogLoading && (
              <div className="ai-log-loading-wrapper">
                <Loader2 size={18} className="ai-log-sparkle spin-loader" />
              </div>
            )}
          </form>
        </section>

        {/* Charts & Analytics */}
        <section className="desktop-charts-grid">
          <SpendingTrendChart currentMonthExpenses={currentMonthExpenses} />
          <CategoryDonutChart donutData={donutData} totalSpending={totalSpending} chartColors={chartColors} />
        </section>

        {/* Lower Content: Expenses Log & Budgets Setup */}
        <section className="lower-content-grid">
          {/* Transaction Logging & List */}
          <div className="glass-card">
            <div className="transaction-list-header">
              <h4 className="tx-list-title">Transactions Log</h4>
              <span className="tx-list-count">{currentMonthExpenses.length} transactions</span>
            </div>

            <TransactionForm
              manualForm={manualForm}
              setManualForm={setManualForm}
              CATEGORIES={CATEGORIES}
              handleManualSubmit={handleManualSubmit}
            />

            <TransactionTable
              currentMonthExpenses={currentMonthExpenses}
              getBadgeClass={getBadgeClass}
              handleDeleteExpense={handleDeleteExpense}
            />
          </div>

          {/* Budgets Tracker panel */}
          <BudgetSettings
            CATEGORIES={CATEGORIES}
            budgets={budgets}
            categorySpending={categorySpending}
            editingBudget={editingBudget}
            setEditingBudget={setEditingBudget}
            handleUpdateBudget={handleUpdateBudget}
            totalSpending={totalSpending}
            overallBudgetMatch={overallBudgetMatch}
          />
        </section>
      </main>
    </div>
  );
};
