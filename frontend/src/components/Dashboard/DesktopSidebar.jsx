import React from 'react';
import { 
  Home, 
  History, 
  Wallet, 
  PiggyBank, 
  Brain, 
  HelpCircle,
  User, 
  LogOut, 
  Sun, 
  Moon 
} from 'lucide-react';
import './DesktopSidebar.css';

export const DesktopSidebar = ({ 
  user, 
  logout, 
  setIsChatOpen, 
  theme, 
  toggleTheme, 
  activeDesktopView, 
  setActiveDesktopView,
  setIsOnboardingOpen
}) => {
  return (
    <aside className="sidebar">
      <div className="sidebar-logo-container">
        <img
          src="/icon-512.png"
          alt="Tally Logo"
          width={36}
          height={36}
          style={{ borderRadius: '10px', objectFit: 'cover', border: '1px solid var(--border-color)' }}
        />
        <div>
          <h1 className="sidebar-logo-text">Tally</h1>
          <span className="sidebar-logo-subtext">AI Financial Hub</span>
        </div>
      </div>

      <div className="sidebar-nav">
        <button 
          className={`btn btn-secondary sidebar-nav-btn ${activeDesktopView === 'home' ? 'sidebar-nav-btn-active' : ''}`}
          onClick={() => setActiveDesktopView('home')}
        >
          <Home size={18} /> Home
        </button>

        <button 
          className={`btn btn-secondary sidebar-nav-btn ${activeDesktopView === 'history' ? 'sidebar-nav-btn-active' : ''}`}
          onClick={() => setActiveDesktopView('history')}
        >
          <History size={18} /> Transaction History
        </button>

        <button 
          className={`btn btn-secondary sidebar-nav-btn ${activeDesktopView === 'budgets' ? 'sidebar-nav-btn-active' : ''}`}
          onClick={() => setActiveDesktopView('budgets')}
        >
          <Wallet size={18} /> Budgets
        </button>

        <button 
          className={`btn btn-secondary sidebar-nav-btn ${activeDesktopView === 'savings' ? 'sidebar-nav-btn-active' : ''}`}
          onClick={() => setActiveDesktopView('savings')}
        >
          <PiggyBank size={18} /> Savings Vault
        </button>

        <div className="sidebar-nav-divider" />

        <button 
          className="btn btn-secondary sidebar-nav-btn sidebar-chat-trigger" 
          onClick={() => setIsChatOpen(true)}
        >
          <Brain size={18} /> AI Advisor
        </button>

        <button 
          className="btn btn-secondary sidebar-nav-btn" 
          onClick={() => setIsOnboardingOpen(true)}
        >
          <HelpCircle size={18} /> Restart Tour
        </button>
      </div>

      <div className="sidebar-footer">
        <div className="sidebar-profile">
          <div className="sidebar-avatar">
            <User size={16} color="var(--text-secondary)" />
          </div>
          <div className="sidebar-user-details">
            <p className="sidebar-user-name">{user?.name}</p>
            <p className="sidebar-user-email">{user?.email}</p>
          </div>
        </div>

        <div className="sidebar-footer-actions">
          <button onClick={toggleTheme} className="btn btn-secondary sidebar-theme-btn">
            {theme === 'dark' ? <Moon size={14} /> : <Sun size={14} />}
            <span>Theme</span>
          </button>
          <button onClick={logout} className="btn btn-secondary sidebar-logout-btn">
            <LogOut size={14} /> Logout
          </button>
        </div>
      </div>
    </aside>
  );
};
