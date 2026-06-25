import React from 'react';
import { ArrowLeft, AlertTriangle } from 'lucide-react';
import { MobileHeader } from './MobileHeader';
import { MobileNavigation } from './MobileNavigation';
import { MobileHome } from './MobileHome';
import { MobileHistory } from './MobileHistory';
import { MobileAnalytics } from './MobileAnalytics';
import { MobileProfile } from './MobileProfile';
import { MobileAddExpense } from './MobileAddExpense';
import { CATEGORIES, getGreeting, getCategoryIcon } from './useDashboardState.jsx';
import './MobileLayout.css';

export const MobileLayout = ({ state }) => {
  const {
    activeMobileView,
    setActiveMobileView,
    remainingBudget,
    totalSpending,
    spendPercent,
    totalBudget,
    radius,
    circumference,
    strokeDashoffset,
    savingsPercent,
    spentLast7Days,
    topCategory7d,
    topCategory7dAmount,
    currentFilteredExpenses,
    filteredTotalSpending,
    handleDeleteExpense,
    selectedMonth,
    setSelectedMonth,
    historySearch,
    setHistorySearch,
    historyCategory,
    setHistoryCategory,
    expenses,
    donutData,
    chartColors,
    categorySpending,
    budgets,
    user,
    logout,
    editingBudget,
    setEditingBudget,
    handleUpdateBudget,
    overallBudgetMatch,
    manualForm,
    setManualForm,
    handleManualSubmit,
    theme,
    toggleTheme,
    handleQuickLog,
    quickLogText,
    setQuickLogText,
    quickLogLoading,
    error,
    setIsChatOpen,
  } = state;

  return (
    <div className="mobile-layout">
      {/* Top Header Background & Gradient Area */}
      <MobileHeader
        activeMobileView={activeMobileView}
        setActiveMobileView={setActiveMobileView}
        getGreeting={getGreeting}
        remainingBudget={remainingBudget}
        totalSpending={totalSpending}
        spendPercent={spendPercent}
        totalBudget={totalBudget}
        ArrowLeft={ArrowLeft}
        setIsChatOpen={setIsChatOpen}
      />

      {/* Bottom Curved Body Area */}
      <div className="mobile-curved-container">
        {error && (
          <div className="error-banner" style={{ marginBottom: '1.25rem' }}>
            <AlertTriangle size={18} className="error-banner-icon" />
            <span>{error}</span>
          </div>
        )}

        {activeMobileView === 'home' && (
          <MobileHome
            radius={radius}
            circumference={circumference}
            strokeDashoffset={strokeDashoffset}
            savingsPercent={savingsPercent}
            spentLast7Days={spentLast7Days}
            topCategory7d={topCategory7d}
            topCategory7dAmount={topCategory7dAmount}
            getCategoryIcon={getCategoryIcon}
            filteredTotalSpending={filteredTotalSpending}
            currentFilteredExpenses={currentFilteredExpenses}
            handleDeleteExpense={handleDeleteExpense}
            handleQuickLog={handleQuickLog}
            quickLogText={quickLogText}
            setQuickLogText={setQuickLogText}
            quickLogLoading={quickLogLoading}
          />
        )}

        {activeMobileView === 'history' && (
          <MobileHistory
            selectedMonth={selectedMonth}
            setSelectedMonth={setSelectedMonth}
            historySearch={historySearch}
            setHistorySearch={setHistorySearch}
            historyCategory={historyCategory}
            setHistoryCategory={setHistoryCategory}
            CATEGORIES={CATEGORIES}
            expenses={expenses}
            getCategoryIcon={getCategoryIcon}
            handleDeleteExpense={handleDeleteExpense}
          />
        )}

        {activeMobileView === 'analytics' && (
          <MobileAnalytics
            selectedMonth={selectedMonth}
            setSelectedMonth={setSelectedMonth}
            currentMonthExpenses={expenses.filter((e) => e.date.startsWith(selectedMonth))}
            donutData={donutData}
            totalSpending={totalSpending}
            chartColors={chartColors}
            CATEGORIES={CATEGORIES}
            categorySpending={categorySpending}
            budgets={budgets}
          />
        )}

        {activeMobileView === 'add-expense' && (
          <MobileAddExpense
            manualForm={manualForm}
            setManualForm={setManualForm}
            CATEGORIES={CATEGORIES}
            handleManualSubmit={handleManualSubmit}
            handleQuickLog={handleQuickLog}
            quickLogText={quickLogText}
            setQuickLogText={setQuickLogText}
            quickLogLoading={quickLogLoading}
          />
        )}

        {activeMobileView === 'profile' && (
          <MobileProfile
            user={user}
            logout={logout}
            selectedMonth={selectedMonth}
            setSelectedMonth={setSelectedMonth}
            CATEGORIES={CATEGORIES}
            editingBudget={editingBudget}
            setEditingBudget={setEditingBudget}
            handleUpdateBudget={handleUpdateBudget}
            totalSpending={totalSpending}
            overallBudgetMatch={overallBudgetMatch}
            theme={theme}
            toggleTheme={toggleTheme}
          />
        )}
      </div>

      {/* Floating Bottom Nav Dock */}
      <MobileNavigation
        activeMobileView={activeMobileView}
        setActiveMobileView={setActiveMobileView}
      />
    </div>
  );
};
