import { useState, useEffect } from 'react'
// import './styles/variables.css' // Imported in index.css now
import Timer from './components/Timer'
import Dashboard from './components/Dashboard'
import Social from './components/Social'
import Auth from './components/Auth'
import { AuthProvider, useAuth } from './context/AuthContext'

function AppContent() {
  const [view, setView] = useState('timer'); // timer, dashboard, social
  const [theme, setTheme] = useState('dark');
  const { token, loading } = useAuth();

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  if (loading) return <div className="glass-panel" style={{ margin: '20%' }}>Loading...</div>;
  if (!token) return <Auth />;

  return (
    <div className="app-container">
      <header className="glass-panel" style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '16px 32px', marginBottom: '32px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '2rem' }}>🍅</span>
          <h2 style={{
            margin: 0,
            background: 'linear-gradient(to right, var(--primary), var(--secondary))',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontSize: '1.8rem'
          }}>
            PomodZone
          </h2>
        </div>

        <nav style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button className={`btn ${view === 'timer' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setView('timer')}>Timer</button>
          <button className={`btn ${view === 'dashboard' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setView('dashboard')}>Dashboard</button>
          <button className={`btn ${view === 'social' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setView('social')}>Social</button>

          <div style={{ width: '1px', height: '24px', background: 'var(--glass-border)', margin: '0 8px' }}></div>

          <button className="icon-btn" onClick={toggleTheme} title="Toggle Theme">
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
        </nav>
      </header>

      <main className="main-content">
        {view === 'timer' && <Timer />}
        {view === 'dashboard' && <Dashboard />}
        {view === 'social' && <Social />}
      </main>
    </div>
  )
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App
