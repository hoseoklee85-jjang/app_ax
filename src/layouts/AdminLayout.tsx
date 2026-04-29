import { Link, Outlet, useLocation, useNavigate, Navigate } from 'react-router-dom';
import AiAgentSidebar from '../components/AiAgentSidebar';
import '../App.css'; // Global styles
import '../ai-agent.css'; // AI Agent specific styles

export default function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();

  // 토큰이 없으면 로그인 페이지로 강제 이동 (보안 라우팅)
  const token = localStorage.getItem('adminToken');
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    navigate('/login');
  };

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', width: '100%' }}>
      {/* 🚀 AI Agent Sidebar on the left 🚀 */}
      <AiAgentSidebar />

      <div className="admin-container" style={{ flex: 1, overflowY: 'auto', padding: '2rem 3vw', boxSizing: 'border-box' }}>
        <header className="admin-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Link to="/" style={{ textDecoration: 'none' }}>
            <h1>🌐 LG Global Admin</h1>
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
            <select 
              style={{
                padding: '0.5rem 1rem',
                borderRadius: '8px',
                border: '1px solid var(--border)',
                background: 'var(--bg-panel)',
                color: 'var(--text-main)',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}
              defaultValue={localStorage.getItem('storeId') || 'ALL'}
              onChange={(e) => {
                localStorage.setItem('storeId', e.target.value);
                window.location.reload();
              }}
            >
              <option value="ALL">🌎 All Regions</option>
              <option value="KR">🇰🇷 South Korea (KRW)</option>
              <option value="US">🇺🇸 United States (USD)</option>
            </select>
            <nav style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
              <Link 
                to="/" 
                style={{ 
                  color: location.pathname === '/' ? 'var(--accent)' : 'var(--text-muted)',
                  textDecoration: 'none',
                  fontWeight: location.pathname === '/' ? 'bold' : 'normal',
                  transition: 'color 0.2s'
                }}
              >
                Dashboard
              </Link>
              <Link 
                to="/products" 
                style={{ 
                  color: location.pathname === '/products' ? 'var(--accent)' : 'var(--text-muted)',
                  textDecoration: 'none',
                  fontWeight: location.pathname === '/products' ? 'bold' : 'normal',
                  transition: 'color 0.2s'
                }}
              >
                Products
              </Link>
              <Link 
                to="/orders" 
                style={{ 
                  color: location.pathname === '/orders' ? 'var(--accent)' : 'var(--text-muted)',
                  textDecoration: 'none',
                  fontWeight: location.pathname === '/orders' ? 'bold' : 'normal',
                  transition: 'color 0.2s'
                }}
              >
                Orders
              </Link>
              <Link 
                to="/preview" 
                style={{ 
                  color: location.pathname === '/preview' ? 'var(--lg-red, #a50034)' : 'var(--text-muted)',
                  textDecoration: 'none',
                  fontWeight: location.pathname === '/preview' ? 'bold' : 'normal',
                  transition: 'color 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <span style={{ fontSize: '1.2rem' }}>✨</span> Live Store Preview
              </Link>
              <a 
                href="http://localhost:3000/api-docs" 
                target="_blank" 
                rel="noopener noreferrer"
                style={{ 
                  color: 'var(--text-muted)',
                  textDecoration: 'none',
                  transition: 'color 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
                onMouseOver={(e) => e.currentTarget.style.color = 'var(--accent)'}
                onMouseOut={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
              >
                API Docs ↗
              </a>
            </nav>
            <button 
              onClick={handleLogout}
              style={{
                background: 'transparent',
                border: '1px solid var(--border)',
                color: 'var(--text-muted)',
                padding: '0.4rem 0.8rem',
                borderRadius: '6px',
                cursor: 'pointer',
                transition: 'all 0.2s',
                fontWeight: 500
              }}
              onMouseOver={(e) => { e.currentTarget.style.color = '#ef4444'; e.currentTarget.style.borderColor = '#ef4444'; }}
              onMouseOut={(e) => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.borderColor = 'var(--border)'; }}
            >
              Logout
            </button>
          </div>
        </header>
        <main className="admin-main" style={{ display: location.pathname === '/preview' ? 'block' : 'grid' }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
