import React from 'react';
import { useDashboardState } from './Dashboard/useDashboardState.jsx';
import { DesktopLayout } from './Dashboard/DesktopLayout';
import { MobileLayout } from './Dashboard/MobileLayout';
import { ReceiptScanner } from './ReceiptScanner';
import { AIChatbot } from './AIChatbot';
import { ToastContainer, ConfirmModal } from './Dashboard/ToastAndModal';
import { OnboardingWizard } from './Dashboard/OnboardingWizard';
import './Dashboard.css';

export const Dashboard = () => {
  const state = useDashboardState();

  if (state.loading) {
    return (
      <div className="dashboard-loading-screen">
        <div className="loading-content">
          <div className="loader-spinner"></div>
          <p className="loading-text">Tallying up your expenses...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-root">
      <DesktopLayout state={state} />
      <MobileLayout state={state} />

      {state.isScannerOpen && (
        <ReceiptScanner
          token={state.token}
          onClose={() => state.setIsScannerOpen(false)}
          onExpenseAdded={state.fetchDashboardData}
        />
      )}

      <AIChatbot
        token={state.token}
        isOpen={state.isChatOpen}
        onClose={() => state.setIsChatOpen(false)}
      />

      <ToastContainer toasts={state.toasts} removeToast={state.removeToast} />
      <ConfirmModal confirmState={state.confirmState} setConfirmState={state.setConfirmState} />
      
      {state.isOnboardingOpen && (
        <OnboardingWizard state={state} />
      )}
    </div>
  );
};

export default Dashboard;
