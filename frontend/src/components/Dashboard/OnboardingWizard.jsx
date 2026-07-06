import React, { useState, useEffect } from 'react';
import {
  Brain,
  Bot,
  FileText,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Check,
  X,
  Wallet,
  Smartphone,
  Info
} from 'lucide-react';
import './OnboardingWizard.css';

export const OnboardingWizard = ({ state }) => {
  const { user, handleUpdateBudget, setIsOnboardingOpen, showToast } = state;
  const [currentSlide, setCurrentSlide] = useState(0);
  const [simulatorText, setSimulatorText] = useState('');
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationResult, setSimulationResult] = useState(null);
  const [budgetVal, setBudgetVal] = useState('15000');

  const totalSlides = 4;

  const handleNext = () => {
    if (currentSlide < totalSlides - 1) {
      setCurrentSlide(currentSlide + 1);
    }
  };

  const handleBack = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  const handleSkipOrFinish = () => {
    // Save onboarding completed in localStorage
    localStorage.setItem(`tally_onboarded_mobile_v1_${user?.id}`, 'true');
    setIsOnboardingOpen(false);
    showToast('Welcome to Tally! Your workspace is ready.');
  };

  // Mock parser for the simulation slide
  const runSimulator = () => {
    if (!simulatorText.trim()) return;
    setIsSimulating(true);
    setSimulationResult(null);

    setTimeout(() => {
      const text = simulatorText.toLowerCase();
      // Extract number
      const matchAmount = text.match(/\d+(\.\d+)?/);
      const parsedAmount = matchAmount ? parseFloat(matchAmount[0]) : 450;

      // Classify category based on keywords
      let category = 'Others';
      if (text.includes('food') || text.includes('dining') || text.includes('dinner') || text.includes('lunch') || text.includes('mcdonald') || text.includes('pizza') || text.includes('coffee') || text.includes('cafe')) {
        category = 'Food & Dining';
      } else if (text.includes('shop') || text.includes('clothe') || text.includes('shoe') || text.includes('shirt') || text.includes('dress') || text.includes('amazon') || text.includes('myntra')) {
        category = 'Shopping & Clothing';
      } else if (text.includes('uber') || text.includes('cab') || text.includes('auto') || text.includes('travel') || text.includes('ride') || text.includes('train') || text.includes('flight') || text.includes('petrol') || text.includes('fuel')) {
        category = 'Transportation & Travel';
      } else if (text.includes('bill') || text.includes('electricity') || text.includes('wifi') || text.includes('rent') || text.includes('water') || text.includes('recharge')) {
        category = 'Utilities & Bills';
      } else if (text.includes('movie') || text.includes('game') || text.includes('netflix') || text.includes('show') || text.includes('play') || text.includes('beer') || text.includes('party')) {
        category = 'Entertainment & Leisure';
      } else if (text.includes('gym') || text.includes('fit') || text.includes('medicine') || text.includes('doctor') || text.includes('health')) {
        category = 'Healthcare & Fitness';
      } else if (text.includes('course') || text.includes('book') || text.includes('class') || text.includes('college') || text.includes('fee')) {
        category = 'Education';
      }

      // Generate clean description
      let description = simulatorText;
      // Strip out the amount if possible for cleaner description
      if (matchAmount) {
        description = description.replace(matchAmount[0], '').replace(/(?:rs|inr|₹|bucks)\.?/g, '').trim();
      }
      description = description
        .replace(/\b(spent|logged|added|bought|for|at|on)\b/g, '')
        .trim();
      // Capitalize first letter
      description = description ? description.charAt(0).toUpperCase() + description.slice(1) : 'Logged Expense';

      setSimulationResult({
        amount: parsedAmount,
        category,
        description
      });
      setIsSimulating(false);
    }, 1200);
  };

  const useTemplate = (template) => {
    setSimulatorText(template);
    setSimulationResult(null);
  };

  return (
    <div className="onboarding-backdrop">
      <div className="onboarding-modal-card">
        {/* Header bar */}
        <div className="onboarding-header">
          <div className="onboarding-logo-area">
            <img
              src="/icon-512.png"
              alt="Tally Logo"
              width={24}
              height={24}
              style={{ borderRadius: '6px', objectFit: 'cover', border: '1px solid var(--border-color)' }}
            />
            <span className="onboarding-logo-text">Tally</span>
          </div>
          <button className="onboarding-skip-btn" onClick={handleSkipOrFinish}>
            {currentSlide === totalSlides - 1 ? 'Skip Setup' : 'Skip'}
          </button>
        </div>

        {/* Content Slides */}
        <div className="onboarding-slide-container">
          {/* SLIDE 1: Welcome */}
          {currentSlide === 0 && (
            <div className="onboarding-slide fade-in">
              <div className="onboarding-slide-header-horizontal">
                <div className="onboarding-icon-wrapper-small welcome-icon">
                  <Smartphone size={24} />
                </div>
                <div className="onboarding-slide-title-group">
                  <h2 className="onboarding-slide-title-compact">
                    Welcome to <span className="gradient-text">Tally</span>
                  </h2>
                  <p className="onboarding-slide-desc-compact">
                    Your AI-Powered Personal Financial Assistant. Keep track of budgets, goals, and logs automatically.
                  </p>
                </div>
              </div>
              
              <div className="onboarding-features-list">
                <div className="onboarding-feature-item">
                  <div className="feature-bullet"><Brain size={16} /></div>
                  <div className="feature-text">
                    <strong>Natural AI Commands</strong>
                    <span>Log expenses instantly by typing simple sentences.</span>
                  </div>
                </div>
                <div className="onboarding-feature-item">
                  <div className="feature-bullet"><Wallet size={16} /></div>
                  <div className="feature-text">
                    <strong>Budgets & Savings Vaults</strong>
                    <span>Set spending limits and allocate funds to achieve savings goals.</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SLIDE 2: AI Input Simulator */}
          {currentSlide === 1 && (
            <div className="onboarding-slide fade-in">
              <div className="onboarding-slide-header-horizontal">
                <div className="onboarding-icon-wrapper-small info-icon">
                  <Brain size={24} />
                </div>
                <div className="onboarding-slide-title-group">
                  <h2 className="onboarding-slide-title-compact">AI Command Bar</h2>
                  <p className="onboarding-slide-desc-compact">
                    No complex forms needed. Just type how you spent your money. Try the simulator below:
                  </p>
                </div>
              </div>

              {/* Interactive Simulator UI */}
              <div className="onboarding-simulator">
                <div className="simulator-input-row">
                  <input
                    type="text"
                    className="form-input simulator-input"
                    placeholder="e.g., spent 450 rs for dinner at pizza hut"
                    value={simulatorText}
                    readOnly
                    style={{ opacity: 0.85, cursor: 'default' }}
                  />
                  <button
                    className="btn btn-primary simulator-btn"
                    onClick={runSimulator}
                    disabled={isSimulating || !simulatorText.trim()}
                  >
                    {isSimulating ? 'Parsing...' : 'Parse'}
                  </button>
                </div>

                <div className="simulator-templates">
                  <span className="templates-label">Or tap template:</span>
                  <div className="template-pills">
                    <button onClick={() => useTemplate('spent 250 rs on cab travel')}>₹250 Cab</button>
                    <button onClick={() => useTemplate('bought shoes from Nike for 3200')}>₹3200 Shoes</button>
                    <button onClick={() => useTemplate('wifi monthly bill 999')}>₹999 Wifi Bill</button>
                  </div>
                </div>

                {isSimulating && (
                  <div className="simulator-loading-indicator">
                    <div className="spinner-dots">
                      <span></span><span></span><span></span>
                    </div>
                    <span className="loading-text">AI engine extracting categories & amounts...</span>
                  </div>
                )}

                {simulationResult && !isSimulating && (
                  <div className="simulator-result-card fade-in">
                    <div className="result-header">
                      <Check size={16} className="result-check" />
                      <span>AI Parsed Successfully!</span>
                    </div>
                    <div className="result-grid">
                      <div className="result-item">
                        <span className="result-label">Amount</span>
                        <span className="result-value">₹{simulationResult.amount}</span>
                      </div>
                      <div className="result-item">
                        <span className="result-label">Category</span>
                        <span className="result-value-badge">{simulationResult.category}</span>
                      </div>
                      <div className="result-item full-width">
                        <span className="result-label">Description</span>
                        <span className="result-value">{simulationResult.description}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* SLIDE 3: Advisor and Savings Goals Info */}
          {currentSlide === 2 && (
            <div className="onboarding-slide fade-in">
              <div className="onboarding-slide-header-horizontal">
                <div className="onboarding-icon-wrapper-small advisor-icon">
                  <Bot size={24} />
                </div>
                <div className="onboarding-slide-title-group">
                  <h2 className="onboarding-slide-title-compact">Advisor & Savings Vaults</h2>
                  <p className="onboarding-slide-desc-compact">
                    Tally helps you optimize your spending and track long-term goals.
                  </p>
                </div>
              </div>

              <div className="dashboard-help-cards">
                <div className="help-sub-card">
                  <Wallet className="sub-icon" size={20} />
                  <div>
                    <h4>Savings Vaults</h4>
                    <p>Create visual financial targets (like buying a car or gadget) and fund your vaults as you save money.</p>
                  </div>
                </div>
                <div className="help-sub-card">
                  <Bot className="sub-icon" size={20} />
                  <div>
                    <h4>Chat Financial Advisor</h4>
                    <p>Have questions like "Where did I spend most?" or "Give me budgeting tips"? Tap "Chat Advisor" and talk with AI.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SLIDE 4: Monthly Budget limits Mock Preview */}
          {currentSlide === 3 && (
            <div className="onboarding-slide fade-in">
              <div className="onboarding-slide-header-horizontal">
                <div className="onboarding-icon-wrapper-small budget-icon">
                  <Wallet size={24} />
                </div>
                <div className="onboarding-slide-title-group">
                  <h2 className="onboarding-slide-title-compact">Monthly Limits & Budgets</h2>
                  <p className="onboarding-slide-desc-compact">
                    Set custom spending limits per category to manage your money. Here is a preview:
                  </p>
                </div>
              </div>

              {/* Mock Budget Tracker Card preview */}
              <div className="onboarding-budget-preview-card" style={{ width: '100%', background: 'rgba(255,255,255,0.03)', padding: '1rem 1.25rem', borderRadius: '12px', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '0.75rem', textAlign: 'left' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: '500' }}>
                  <span>Overall Monthly Limit</span>
                  <span style={{ color: 'var(--text-primary)' }}>₹6,000 / ₹15,000</span>
                </div>
                <div style={{ height: '8px', background: 'rgba(255,255,255,0.08)', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ width: '40%', height: '100%', background: 'var(--text-primary)' }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: 'var(--text-muted)' }}>
                  <span>40% spent (Looks good)</span>
                  <span>₹9,000 remaining</span>
                </div>
              </div>
              
              <p className="budget-setup-tip" style={{ marginTop: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: 'var(--text-muted)' }}>
                <Info size={14} style={{ color: 'var(--text-secondary)' }} />
                Set and adjust your own budgets anytime from the Profile section.
              </p>
            </div>
          )}

        </div>

        {/* Footer controls */}
        <div className="onboarding-footer">
          <div className="onboarding-navigation-buttons">
            {currentSlide > 0 ? (
              <button className="btn btn-secondary nav-btn-back" onClick={handleBack}>
                <ArrowLeft size={16} /> Back
              </button>
            ) : (
              <div className="nav-btn-placeholder" />
            )}

            <div className="onboarding-dots">
              {Array.from({ length: totalSlides }).map((_, i) => (
                <div
                  key={i}
                  className={`onboarding-dot ${currentSlide === i ? 'active' : ''}`}
                  onClick={() => setCurrentSlide(i)}
                />
              ))}
            </div>

            {currentSlide < totalSlides - 1 ? (
              <button className="btn btn-primary nav-btn-next" onClick={handleNext}>
                Next <ArrowRight size={16} />
              </button>
            ) : (
              <button className="btn btn-primary nav-btn-finish" onClick={handleSkipOrFinish}>
                Finish & Explore <Check size={16} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnboardingWizard;
