import { Link, Outlet, useLocation, useNavigate, Navigate } from 'react-router-dom';
import '../App.css'; // Global styles

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
    <div className="admin-container">
      <header className="admin-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Link to="/" style={{ textDecoration: 'none' }}>
          <h1>🛍️ E-Commerce Admin</h1>
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
          <nav style={{ display: 'flex', gap: '1.5rem' }}>
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
      <main className="admin-main">
        <Outlet />
      </main>
    </div>
  );
}
