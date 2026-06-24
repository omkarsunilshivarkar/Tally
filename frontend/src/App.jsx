import { AuthProvider, useAuth } from './context/AuthContext';
import { AuthPages } from './components/AuthPages';
import { Dashboard } from './components/Dashboard';
import { Loader2 } from 'lucide-react';

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
          gap: '1rem',
          background: 'var(--bg-color)',
        }}
      >
        <Loader2
          size={36}
          className="ai-log-sparkle"
          style={{ animation: 'spin 1.5s linear infinite' }}
        />
        <p style={{ color: 'var(--text-secondary)', fontWeight: 500, letterSpacing: '0.05em' }}>
          SECURE CONNECTION ESTABLISHED...
        </p>
      </div>
    );
  }

  return user ? <Dashboard /> : <AuthPages />;
};

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
