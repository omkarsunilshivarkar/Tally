import React, { useState } from 'react';
import { Target, Plus, Trash2, Coins, Calendar, ChevronDown, ChevronUp } from 'lucide-react';
import './SavingsVault.css';

export const SavingsVault = ({
  savingsGoals = [],
  totalVaultBalance = 0,
  handleCreateGoal,
  handleUpdateGoalFunding,
  handleDeleteGoal
}) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [newGoal, setNewGoal] = useState({
    name: '',
    targetAmount: '',
    currentAmount: '0',
    targetDate: new Date().toISOString().split('T')[0]
  });

  const [fundInputs, setFundInputs] = useState({});

  const onSubmit = (e) => {
    e.preventDefault();
    if (!newGoal.name || !newGoal.targetAmount || !newGoal.targetDate) return;

    handleCreateGoal({
      name: newGoal.name,
      targetAmount: parseFloat(newGoal.targetAmount),
      currentAmount: parseFloat(newGoal.currentAmount || 0),
      targetDate: newGoal.targetDate
    });

    setNewGoal({
      name: '',
      targetAmount: '',
      currentAmount: '0',
      targetDate: new Date().toISOString().split('T')[0]
    });
    setIsFormOpen(false);
  };

  const handleFundChange = (goalId, value) => {
    setFundInputs({
      ...fundInputs,
      [goalId]: value
    });
  };

  const adjustFunding = (goal, isAdd) => {
    const inputVal = parseFloat(fundInputs[goal.id] || 0);
    if (isNaN(inputVal) || inputVal <= 0) return;

    const adjustment = isAdd ? inputVal : -inputVal;
    const finalAmount = Math.max(0, goal.currentAmount + adjustment);

    handleUpdateGoalFunding(goal.id, finalAmount);
    setFundInputs({
      ...fundInputs,
      [goal.id]: ''
    });
  };

  return (
    <div className="glass-card savings-vault-card">
      <div className="vault-header">
        <div>
          <h4 className="vault-title">Savings Vault</h4>
          <p className="vault-subtitle">Set targets and allocate funds manually</p>
        </div>
        <div className="vault-balance-badge">
          <Coins size={16} className="vault-balance-icon" />
          <span>Total Saved: <strong>₹{totalVaultBalance.toFixed(2)}</strong></span>
        </div>
      </div>

      {/* Accordion-style inline creation form */}
      <div className="vault-creation-section">
        <button
          type="button"
          className="btn btn-secondary btn-new-goal-toggle"
          onClick={() => setIsFormOpen(!isFormOpen)}
        >
          {isFormOpen ? <ChevronUp size={16} /> : <Plus size={16} />}
          <span>{isFormOpen ? 'Cancel' : 'Create New Goal'}</span>
        </button>

        {isFormOpen && (
          <form onSubmit={onSubmit} className="new-goal-form-inline">
            <div className="form-grid-3">
              <div className="form-group">
                <input
                  type="text"
                  placeholder="Goal Name (e.g. Macbook)"
                  className="form-input"
                  value={newGoal.name}
                  onChange={(e) => setNewGoal({ ...newGoal, name: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <input
                  type="number"
                  step="0.01"
                  placeholder="Target Amount (₹)"
                  className="form-input"
                  value={newGoal.targetAmount}
                  onChange={(e) => setNewGoal({ ...newGoal, targetAmount: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <input
                  type="date"
                  className="form-input"
                  value={newGoal.targetDate}
                  onChange={(e) => setNewGoal({ ...newGoal, targetDate: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="form-grid-2">
              <div className="form-group">
                <input
                  type="number"
                  step="0.01"
                  placeholder="Initial Deposit (₹) (Optional)"
                  className="form-input"
                  value={newGoal.currentAmount}
                  onChange={(e) => setNewGoal({ ...newGoal, currentAmount: e.target.value })}
                />
              </div>
              <button type="submit" className="btn btn-primary btn-submit-goal">
                <Target size={16} /> Set Goal
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Goals Grid list */}
      {savingsGoals.length === 0 ? (
        <div className="vault-empty-state">
          No savings goals set. Click "Create New Goal" above to get started!
        </div>
      ) : (
        <div className="goals-grid">
          {savingsGoals.map((goal) => {
            const progress = goal.targetAmount > 0
              ? Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100))
              : 0;

            const remainingDays = Math.max(
              0,
              Math.ceil((new Date(goal.targetDate) - new Date()) / (1000 * 60 * 60 * 24))
            );

            return (
              <div key={goal.id} className="goal-progress-card">
                <div className="goal-card-header">
                  <div>
                    <h5 className="goal-card-name">{goal.name}</h5>
                    <p className="goal-card-deadline">
                      <Calendar size={12} className="card-deadline-icon" />
                      <span>{remainingDays} days left</span>
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDeleteGoal(goal.id)}
                    className="goal-card-delete-btn"
                    title="Delete goal"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>

                {/* Progress Indicators */}
                <div className="goal-progress-bar-wrapper">
                  <div className="goal-progress-bar-container">
                    <div
                      className={`goal-progress-bar-fill ${progress === 100 ? 'completed' : ''}`}
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <div className="goal-progress-bar-labels">
                    <span className="goal-progress-amounts">
                      ₹{goal.currentAmount.toFixed(0)} <span className="goal-progress-slash">/</span> ₹{goal.targetAmount.toFixed(0)}
                    </span>
                    <span className="goal-progress-percentage">{progress}%</span>
                  </div>
                </div>

                {/* Direct Funding Form */}
                <div className="goal-funding-controls">
                  <input
                    type="number"
                    step="0.01"
                    placeholder="Amount (₹)"
                    className="form-input goal-funding-input"
                    value={fundInputs[goal.id] || ''}
                    onChange={(e) => handleFundChange(goal.id, e.target.value)}
                  />
                  <div className="goal-funding-btn-group">
                    <button
                      type="button"
                      onClick={() => adjustFunding(goal, true)}
                      className="btn-funding-action btn-fund-add"
                    >
                      Fund
                    </button>
                    <button
                      type="button"
                      onClick={() => adjustFunding(goal, false)}
                      className="btn-funding-action btn-fund-withdraw"
                      disabled={goal.currentAmount <= 0}
                    >
                      Withdraw
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
