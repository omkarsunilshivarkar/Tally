import React from 'react';
import { useDashboardState } from './Dashboard/useDashboardState.jsx';
import { DesktopLayout } from './Dashboard/DesktopLayout';
import { MobileLayout } from './Dashboard/MobileLayout';
import { ReceiptScanner } from './ReceiptScanner';
import { AIChatbot } from './AIChatbot';
import './Dashboard.css';

export const Dashboard = () => {
  const state = useDashboardState();

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
    </div>
  );
};

export default Dashboard;
