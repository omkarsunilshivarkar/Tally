import React from 'react';
import { X, Check, Info, AlertTriangle } from 'lucide-react';
import './ToastAndModal.css';

export const ToastContainer = ({ toasts, removeToast }) => {
  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="toast-container">
      {toasts.map((toast) => {
        let Icon = Info;
        if (toast.type === 'success') Icon = Check;
        if (toast.type === 'error') Icon = AlertTriangle;

        return (
          <div key={toast.id} className={`toast-item ${toast.exit ? 'exit' : ''}`}>
            <div className={`toast-icon ${toast.type}`}>
              <Icon size={16} />
            </div>
            <span className="toast-message">{toast.message}</span>
            <button
              className="toast-close"
              onClick={() => removeToast(toast.id)}
              aria-label="Close notification"
            >
              <X size={14} />
            </button>
          </div>
        );
      })}
    </div>
  );
};

export const ConfirmModal = ({ confirmState, setConfirmState }) => {
  if (!confirmState || !confirmState.isOpen) return null;

  const handleCancel = () => {
    setConfirmState({ isOpen: false, title: '', message: '', onConfirm: null });
  };

  const handleConfirm = () => {
    if (confirmState.onConfirm) {
      confirmState.onConfirm();
    }
    setConfirmState({ isOpen: false, title: '', message: '', onConfirm: null });
  };

  return (
    <div className="confirm-backdrop" onClick={handleCancel}>
      <div className="confirm-modal" onClick={(e) => e.stopPropagation()}>
        <div className="confirm-header">
          <div className="confirm-icon">
            <AlertTriangle size={20} />
          </div>
          <h4 className="confirm-title">{confirmState.title || 'Confirm Action'}</h4>
        </div>
        <div className="confirm-body">
          {confirmState.message}
        </div>
        <div className="confirm-actions">
          <button className="btn btn-secondary" onClick={handleCancel}>
            Cancel
          </button>
          <button className="btn btn-danger" onClick={handleConfirm}>
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};
