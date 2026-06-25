import { AuthProvider, useAuth } from './context/AuthContext';
import { AuthPages } from './components/AuthPages';
import { Dashboard } from './components/Dashboard';
import { Loader2 } from 'lucide-react';

const TallyLogo = ({ size = 64, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 100 100"
    fill="none"
    stroke="currentColor"
    strokeWidth="6"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={`${className} tally-logo-svg`}
  >
    {/* Trend Line */}
    <path d="M22 55 L42 35 L58 45 L78 20" />
    {/* Arrow Head */}
    <path d="M66 20 H78 V32" />
    {/* Bar 1 */}
    <rect x="26" y="64" width="10" height="16" rx="2" fill="none" />
    {/* Bar 2 */}
    <rect x="44" y="52" width="10" height="28" rx="2" fill="none" />
    {/* Bar 3 */}
    <rect x="62" y="38" width="10" height="42" rx="2" fill="none" />
  </svg>
);

const AppContent = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          width: '100vw',
          background: 'var(--bg-color)',
          padding: '2rem',
          boxSizing: 'border-box',
          position: 'relative',
        }}
      >
        {/* App Branding */}
        <div style={{ textAlign: 'center', marginBottom: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
          <div
            style={{
              padding: '0.5rem',
              borderRadius: 'var(--radius-lg)',
              background: 'var(--btn-secondary-bg)',
              border: '1px solid var(--border-color)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: 'var(--shadow-neon)',
              color: 'var(--text-primary)',
            }}
          >
            <TallyLogo size={60} />
          </div>
          <div>
            <h1
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '2.5rem',
                fontWeight: 800,
                letterSpacing: '-0.02em',
                color: 'var(--text-primary)',
                margin: 0,
                lineHeight: '1.1',
              }}
            >
              TALLY<span style={{ color: 'var(--text-muted)' }}>.</span>
            </h1>
            <p
              style={{
                fontFamily: 'var(--font-sans)',
                fontSize: '0.9rem',
                color: 'var(--text-secondary)',
                fontWeight: 500,
                marginTop: '0.4rem',
                letterSpacing: '0.05em',
              }}
            >
              AI-Powered Expense Tracker
            </p>
          </div>
        </div>

        {/* Loader and Status */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '0.75rem',
            position: 'absolute',
            bottom: '4rem',
          }}
        >
          <Loader2
            size={24}
            color="var(--text-primary)"
            style={{ animation: 'spin 1.5s linear infinite' }}
          />
          <p
            style={{
              color: 'var(--text-muted)',
              fontSize: '0.7rem',
              fontWeight: 600,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              textAlign: 'center',
              margin: 0,
            }}
          >
            Securing Connection
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthPages />;
  }

  return <Dashboard />;
};

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
