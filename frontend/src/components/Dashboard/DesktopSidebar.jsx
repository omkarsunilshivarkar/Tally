import React from 'react';
import { Sparkles, IndianRupee, FileText, Brain, User, LogOut } from 'lucide-react';
import './DesktopSidebar.css';

export const DesktopSidebar = ({ user, logout, setIsScannerOpen, setIsChatOpen }) => {
  return (
    <aside className="sidebar">
      <div className="sidebar-logo-container">
        <div className="sidebar-logo-box">
          <Sparkles size={22} color="white" />
        </div>
        <div>
          <h1 className="sidebar-logo-text">Tally</h1>
          <span className="sidebar-logo-subtext">AI Financial Hub</span>
        </div>
      </div>

      <div className="sidebar-nav">
        <button className="btn btn-secondary sidebar-nav-btn-active">
          <IndianRupee size={18} color="white" /> Dashboard
        </button>
        <button className="btn btn-secondary sidebar-nav-btn" onClick={() => setIsScannerOpen(true)}>
          <FileText size={18} /> OCR Scanner
        </button>
        <button className="btn btn-secondary sidebar-nav-btn" onClick={() => setIsChatOpen(true)}>
          <Brain size={18} /> AI Advisor
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
        <button onClick={logout} className="btn btn-secondary sidebar-logout-btn">
          <LogOut size={14} /> Logout
        </button>
      </div>
    </aside>
  );
};
