import React from 'react';
import { Home, TrendingUp, Plus, History, User } from 'lucide-react';
import './MobileNavigation.css';

export const MobileNavigation = ({ activeMobileView, setActiveMobileView }) => {
  return (
    <nav className="mobile-bottom-nav">
      <button
        onClick={() => setActiveMobileView('home')}
        className={`mobile-nav-item ${activeMobileView === 'home' ? 'active' : ''}`}
        title="Home"
      >
        <Home size={20} />
      </button>

      <button
        onClick={() => setActiveMobileView('analytics')}
        className={`mobile-nav-item ${activeMobileView === 'analytics' ? 'active' : ''}`}
        title="Analytics"
      >
        <TrendingUp size={20} />
      </button>

      <button
        onClick={() => setActiveMobileView('add-expense')}
        className={`mobile-nav-item mobile-nav-scan ${activeMobileView === 'add-expense' ? 'active' : ''}`}
        title="Add Expense"
      >
        <Plus size={22} color="currentColor" />
      </button>

      <button
        onClick={() => setActiveMobileView('history')}
        className={`mobile-nav-item ${activeMobileView === 'history' ? 'active' : ''}`}
        title="History"
      >
        <History size={20} />
      </button>

      <button
        onClick={() => setActiveMobileView('profile')}
        className={`mobile-nav-item ${activeMobileView === 'profile' ? 'active' : ''}`}
        title="Profile"
      >
        <User size={20} />
      </button>
    </nav>
  );
};
