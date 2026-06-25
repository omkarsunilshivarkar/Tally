import { useState, useRef } from 'react';
import { Upload, X, Check, RefreshCw, AlertCircle } from 'lucide-react';
import { API_URL } from '../context/AuthContext';
import './ReceiptScanner.css';

export const ReceiptScanner = ({
  token,
  onClose,
  onExpenseAdded,
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState(null);
  
  // Scanned results confirmation state
  const [scannedData, setScannedData] = useState(null);
  
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.type.startsWith('image/')) {
        triggerScan(droppedFile);
      } else {
        setError('Only receipt image files (PNG, JPG, WEBP) are supported.');
      }
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      triggerScan(selectedFile);
    }
  };

  const triggerScan = async (selectedFile) => {
    setScanning(true);
    setError(null);
    setScannedData(null);

    const formData = new FormData();
    formData.append('receipt', selectedFile);

    try {
      const res = await fetch(`${API_URL}/expenses/scan`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to scan receipt image');
      }

      const result = await res.json();
      setScannedData(result);
    } catch (err) {
      console.error(err);
      setError(err.message || 'AI scanner failed. Please check backend logs or try again.');
    } finally {
      setScanning(false);
    }
  };

  const handleSaveExpense = async (e) => {
    e.preventDefault();
    if (!scannedData) return;

    setSaving(true);
    try {
      const res = await fetch(`${API_URL}/expenses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(scannedData),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to save expense');
      }

      onExpenseAdded();
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to save transaction');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(8px)',
        zIndex: 500,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
      }}
    >
      <div
        className="glass-card"
        style={{
          width: '100%',
          maxWidth: '560px',
          padding: '2rem',
          maxHeight: '90vh',
          overflowY: 'auto',
          position: 'relative',
        }}
      >
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            right: '1rem',
            top: '1rem',
            background: 'none',
            border: 'none',
            color: 'var(--text-secondary)',
            cursor: 'pointer',
          }}
        >
          <X size={20} />
        </button>

        <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>
          <span className="gradient-text">AI Receipt Scanner</span>
        </h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
          Upload or drag a receipt image. Gemini AI will automatically extract merchant, category, amount, items, and date details.
        </p>

        {error && (
          <div
            style={{
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid var(--danger-color)',
              borderRadius: 'var(--radius-sm)',
              padding: '0.75rem',
              color: 'var(--text-primary)',
              fontSize: '0.875rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              marginBottom: '1rem',
            }}
          >
            <AlertCircle size={16} style={{ color: 'var(--danger-color)', flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        {/* Scan Input View */}
        {!scannedData && !scanning && (
          <div
            className={`scanner-dropzone ${dragActive ? 'active' : ''}`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              style={{ display: 'none' }}
            />
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: 'rgba(139, 92, 246, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--primary-color)',
              }}
            >
              <Upload size={28} />
            </div>
            <div>
              <p style={{ fontWeight: '600', marginBottom: '0.25rem' }}>
                Drag and drop receipt image here
              </p>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                or click to browse local files
              </p>
            </div>
          </div>
        )}

        {/* Scanning Animation Screen */}
        {scanning && (
          <div
            style={{
              padding: '3rem 2rem',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '1.5rem',
              position: 'relative',
              borderRadius: 'var(--radius-lg)',
              background: 'rgba(0,0,0,0.2)',
              border: '1px solid var(--border-color)',
            }}
          >
            {/* Holographic glowing scan box */}
            <div
              style={{
                width: '120px',
                height: '140px',
                border: '2px solid var(--secondary-color)',
                borderRadius: '8px',
                position: 'relative',
                overflow: 'hidden',
                boxShadow: '0 0 15px rgba(6, 182, 212, 0.2)',
              }}
            >
              {/* Animated laser line */}
              <div
                style={{
                  position: 'absolute',
                  left: 0,
                  width: '100%',
                  height: '4px',
                  background: 'linear-gradient(to bottom, transparent, var(--secondary-color), transparent)',
                  boxShadow: '0 0 10px var(--secondary-color)',
                  animation: 'laser-scan 2s ease-in-out infinite',
                }}
              />
            </div>
            <style>
              {`
                @keyframes laser-scan {
                  0% { top: 0%; }
                  50% { top: 100%; }
                  100% { top: 0%; }
                }
              `}
            </style>
            <div>
              <p style={{ fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center' }}>
                <RefreshCw size={18} className="ai-log-sparkle" style={{ animation: 'spin 2s linear infinite' }} />
                Gemini AI scanning...
              </p>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.5rem' }}>
                Extracting items, amount, date, and merchants
              </p>
            </div>
            <style>
              {`
                @keyframes spin {
                  from { transform: rotate(0deg); }
                  to { transform: rotate(360deg); }
                }
              `}
            </style>
          </div>
        )}

        {/* Confirmation Form */}
        {scannedData && !scanning && (
          <form onSubmit={handleSaveExpense} style={{ marginTop: '0.5rem' }}>
            <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', marginBottom: '1.5rem', textAlign: 'center' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--success-color)', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                <Check size={16} /> AI parsing completed successfully!
              </span>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '1rem',
              }}
            >
              <div className="form-group">
                <label className="form-label" htmlFor="scan-amount">Amount</label>
                <input
                  id="scan-amount"
                  type="number"
                  step="0.01"
                  className="form-input"
                  value={scannedData.amount}
                  onChange={(e) => setScannedData({ ...scannedData, amount: parseFloat(e.target.value) || 0 })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="scan-date">Date</label>
                <input
                  id="scan-date"
                  type="date"
                  className="form-input"
                  value={scannedData.date}
                  onChange={(e) => setScannedData({ ...scannedData, date: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="scan-category">Category</label>
              <select
                id="scan-category"
                className="form-select"
                value={scannedData.category}
                onChange={(e) => setScannedData({ ...scannedData, category: e.target.value })}
              >
                <option value="Food & Dining">Food & Dining</option>
                <option value="Shopping & Clothing">Shopping & Clothing</option>
                <option value="Utilities & Bills">Utilities & Bills</option>
                <option value="Transportation & Travel">Transportation & Travel</option>
                <option value="Entertainment & Leisure">Entertainment & Leisure</option>
                <option value="Healthcare & Fitness">Healthcare & Fitness</option>
                <option value="Education">Education</option>
                <option value="Others">Others</option>
              </select>
            </div>

            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
              <label className="form-label" htmlFor="scan-description">Description</label>
              <textarea
                id="scan-description"
                className="form-input"
                style={{ resize: 'vertical', minHeight: '80px' }}
                value={scannedData.description}
                onChange={(e) => setScannedData({ ...scannedData, description: e.target.value })}
                required
              />
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
              <button
                type="button"
                className="btn btn-secondary"
                style={{ flex: 1 }}
                onClick={() => {
                  setScannedData(null);
                }}
              >
                Rescan Receipt
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                style={{ flex: 1 }}
                disabled={saving}
              >
                {saving ? 'Saving...' : 'Confirm & Save'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
