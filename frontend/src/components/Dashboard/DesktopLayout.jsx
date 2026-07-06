import React from 'react';
import { FileText, Bot, AlertTriangle, Brain, Loader2 } from 'lucide-react';
import { DesktopSidebar } from './DesktopSidebar';
import { MetricCards } from './MetricCards';
import { SpendingTrendChart } from './SpendingTrendChart';
import { CategoryDonutChart } from './CategoryDonutChart';
import { TransactionForm } from './TransactionForm';
import { TransactionTable } from './TransactionTable';
import { BudgetSettings } from './BudgetSettings';
import { SavingsVault } from './SavingsVault';
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
    savingsGoals,
    totalVaultBalance,
    handleCreateGoal,
    handleUpdateGoalFunding,
    handleDeleteGoal,
    timeframe,
    setTimeframe,
    currentFilteredExpenses,
    filteredTotalSpending,
    filteredTopCategory,
    filteredDonutData,
    activeDesktopView,
    setActiveDesktopView,
    setIsOnboardingOpen,
  } = state;

  return (
    <div className="desktop-layout app-container">
      {/* Sidebar Nav */}
      <DesktopSidebar
        user={user}
        logout={logout}
        setIsChatOpen={setIsChatOpen}
        theme={theme}
        toggleTheme={toggleTheme}
        activeDesktopView={activeDesktopView}
        setActiveDesktopView={setActiveDesktopView}
        setIsOnboardingOpen={setIsOnboardingOpen}
      />

      {/* Main Content Area */}
      <main className="main-content">
        {error && (
          <div className="error-banner">
            <AlertTriangle size={18} className="error-banner-icon" />
            <span>{error}</span>
          </div>
        )}

        {/* 1. Dashboard / Overview Page */}
        {activeDesktopView === 'home' && (
          <>
            <header className="desktop-header">
              <div>
                <h2 className="desktop-header-title">
                  Welcome back, <span className="gradient-text">{user?.name}</span>
                </h2>
                <p className="desktop-header-subtitle">Here is your financial workspace snapshot.</p>
              </div>

              <div className="desktop-header-actions">
                <button className="btn btn-secondary desktop-chat-advisor-btn" onClick={() => setIsChatOpen(true)}>
                  <Bot size={16} /> Chat Advisor
                </button>
              </div>
            </header>

            <MetricCards
              totalSpending={filteredTotalSpending}
              totalBudget={totalBudget}
              remainingBudget={totalBudget - filteredTotalSpending}
              topCategory={filteredTopCategory}
            />

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

            <section className="desktop-charts-grid">
              <SpendingTrendChart currentMonthExpenses={currentFilteredExpenses} timeframe={timeframe} selectedMonth={selectedMonth} />
              <CategoryDonutChart donutData={filteredDonutData} totalSpending={filteredTotalSpending} chartColors={chartColors} />
            </section>
          </>
        )}

        {/* 2. Transactions Log Page */}
        {activeDesktopView === 'history' && (
          <>
            <header className="desktop-header">
              <div>
                <h2 className="desktop-header-title">Transaction History</h2>
                <p className="desktop-header-subtitle">Log new expenses and review your past activity.</p>
              </div>
              <div className="desktop-header-actions">
                <input
                  type="month"
                  className="form-input desktop-month-picker"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                />
                <button className="btn btn-secondary desktop-chat-advisor-btn" onClick={() => setIsChatOpen(true)}>
                  <Bot size={16} /> Chat Advisor
                </button>
              </div>
            </header>

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

            <div className="glass-card">
              <div className="transaction-list-header">
                <h4 className="tx-list-title">Log Transactions</h4>
                <span className="tx-list-count">{currentFilteredExpenses.length} transactions this month</span>
              </div>

              <TransactionForm
                manualForm={manualForm}
                setManualForm={setManualForm}
                CATEGORIES={CATEGORIES}
                handleManualSubmit={handleManualSubmit}
              />

              <TransactionTable
                currentMonthExpenses={currentFilteredExpenses}
                getBadgeClass={getBadgeClass}
                handleDeleteExpense={handleDeleteExpense}
              />
            </div>
          </>
        )}

        {/* 3. Budgets Tracker Page */}
        {activeDesktopView === 'budgets' && (
          <>
            <header className="desktop-header">
              <div>
                <h2 className="desktop-header-title">Budgets Tracker</h2>
                <p className="desktop-header-subtitle">Set monthly budget limits for categories and track your adherence.</p>
              </div>
              <div className="desktop-header-actions">
                <input
                  type="month"
                  className="form-input desktop-month-picker"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                />
                <button className="btn btn-secondary desktop-chat-advisor-btn" onClick={() => setIsChatOpen(true)}>
                  <Bot size={16} /> Chat Advisor
                </button>
              </div>
            </header>

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
          </>
        )}

        {/* 4. Savings Vault Page */}
        {activeDesktopView === 'savings' && (
          <>
            <header className="desktop-header">
              <div>
                <h2 className="desktop-header-title">Savings Vault</h2>
                <p className="desktop-header-subtitle">Manage your long-term savings goals and fund vaults.</p>
              </div>
              <div className="desktop-header-actions">
                <button className="btn btn-secondary desktop-chat-advisor-btn" onClick={() => setIsChatOpen(true)}>
                  <Bot size={16} /> Chat Advisor
                </button>
              </div>
            </header>

            <SavingsVault
              savingsGoals={savingsGoals}
              totalVaultBalance={totalVaultBalance}
              handleCreateGoal={handleCreateGoal}
              handleUpdateGoalFunding={handleUpdateGoalFunding}
              handleDeleteGoal={handleDeleteGoal}
            />
          </>
        )}
      </main>
    </div>
  );
};
