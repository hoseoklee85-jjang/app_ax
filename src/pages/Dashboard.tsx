import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function Dashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const storeId = localStorage.getItem('storeId') || 'ALL';
        const res = await fetch(`/api/dashboard?storeId=${storeId}`);
        const json = await res.json();
        setData(json);
      } catch (err) {
        console.error('Failed to fetch dashboard data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) {
    return <div style={{ padding: '3rem', textAlign: 'center' }}>Loading Dashboard...</div>;
  }

  if (!data) return null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', height: 'calc(100vh - 120px)', minHeight: '600px', gridColumn: '1 / -1' }}>
      {/* 1. Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
        <div className="admin-panel stat-card" style={{ padding: '1.2rem' }}>
          <h3 style={{ color: 'var(--text-muted)', margin: '0 0 0.3rem 0', fontSize: '0.9rem' }}>Total Revenue</h3>
          <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: 'var(--accent)' }}>
            ${data.summary.totalRevenue.toLocaleString()}
          </div>
        </div>
        <div className="admin-panel stat-card" style={{ padding: '1.2rem' }}>
          <h3 style={{ color: 'var(--text-muted)', margin: '0 0 0.3rem 0', fontSize: '0.9rem' }}>Total Orders</h3>
          <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: 'var(--success)' }}>
            {data.summary.totalOrders}
          </div>
        </div>
        <div className="admin-panel stat-card" style={{ padding: '1.2rem' }}>
          <h3 style={{ color: 'var(--text-muted)', margin: '0 0 0.3rem 0', fontSize: '0.9rem' }}>Total Products</h3>
          <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: 'var(--warning)' }}>
            {data.summary.totalProducts}
          </div>
        </div>
        <div className="admin-panel stat-card" style={{ padding: '1.2rem' }}>
          <h3 style={{ color: 'var(--text-muted)', margin: '0 0 0.3rem 0', fontSize: '0.9rem' }}>Active Admins</h3>
          <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#c084fc' }}>
            {data.summary.totalAdmins}
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr', gap: '1rem', flex: 1, minHeight: 0 }}>
        {/* 2. Chart */}
        <div className="admin-panel" style={{ display: 'flex', flexDirection: 'column', padding: '1.5rem', marginBottom: 0 }}>
          <h2 style={{ marginBottom: '1rem', fontSize: '1.1rem' }}>Sales Overview (Last 6 Months)</h2>
          <div style={{ flex: 1, minHeight: 0 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
                <YAxis stroke="#94a3b8" fontSize={12} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f8fafc', borderRadius: '8px' }}
                  itemStyle={{ color: '#60a5fa' }}
                />
                <Line type="monotone" dataKey="sales" stroke="#3b82f6" strokeWidth={4} dot={{ r: 5, fill: '#1e293b', strokeWidth: 2 }} activeDot={{ r: 7 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 3. Recent Orders */}
        <div className="admin-panel" style={{ display: 'flex', flexDirection: 'column', padding: '1.5rem', marginBottom: 0, overflow: 'hidden' }}>
          <h2 style={{ marginBottom: '1rem', fontSize: '1.1rem' }}>Recent Orders</h2>
          <div className="table-wrapper" style={{ flex: 1, overflowY: 'auto' }}>
            <table className="product-table" style={{ width: '100%', margin: 0 }}>
              <thead>
                <tr>
                  <th style={{ padding: '0.75rem 0.5rem' }}>Order No.</th>
                  <th style={{ padding: '0.75rem 0.5rem' }}>Region</th>
                  <th style={{ padding: '0.75rem 0.5rem' }}>Customer</th>
                  <th style={{ padding: '0.75rem 0.5rem' }}>Status</th>
                  <th style={{ padding: '0.75rem 0.5rem' }}>Total</th>
                </tr>
              </thead>
              <tbody>
                {data.recentOrders.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="text-center" style={{ padding: '2rem' }}>No recent orders.</td>
                  </tr>
                ) : (
                  data.recentOrders.map((o: any) => (
                    <tr key={o.id}>
                      <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)', padding: '0.75rem 0.5rem' }}>{o.orderNumber.slice(-8)}</td>
                      <td style={{ fontWeight: 'bold', fontSize: '0.85rem', color: o.storeId === 'US' ? '#3b82f6' : '#10b981', padding: '0.75rem 0.5rem' }}>
                        {o.storeId === 'US' ? '🇺🇸 US' : '🇰🇷 KR'}
                      </td>
                      <td className="fw-bold" style={{ fontSize: '0.9rem', padding: '0.75rem 0.5rem' }}>{o.customer}</td>
                      <td style={{ padding: '0.75rem 0.5rem' }}>
                        <span 
                          className={
                            o.status === 'COMPLETED' ? 'badge-success' : 
                            'badge-warning'
                          }
                          style={{
                            background: o.status === 'CANCELLED' ? 'rgba(239, 68, 68, 0.1)' : undefined,
                            color: o.status === 'CANCELLED' ? '#ef4444' : undefined,
                            borderRadius: '4px',
                            fontSize: '0.75rem',
                            padding: '0.2rem 0.5rem'
                          }}
                        >
                          {o.status.substring(0, 4)}
                        </span>
                      </td>
                      <td className="fw-bold text-accent" style={{ fontSize: '0.9rem', padding: '0.75rem 0.5rem' }}>${o.total.toLocaleString()}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* 4. Product Status (Low Stock) */}
        <div className="admin-panel" style={{ display: 'flex', flexDirection: 'column', padding: '1.5rem', marginBottom: 0, overflow: 'hidden' }}>
          <h2 style={{ marginBottom: '1rem', fontSize: '1.1rem', display: 'flex', justifyContent: 'space-between' }}>
            <span>Product Inventory</span>
            <span style={{ fontSize: '0.8rem', color: 'var(--warning)', fontWeight: 'normal' }}>Low Stock Alert</span>
          </h2>
          <div className="table-wrapper" style={{ flex: 1, overflowY: 'auto' }}>
            <table className="product-table" style={{ width: '100%', margin: 0 }}>
              <thead>
                <tr>
                  <th style={{ padding: '0.75rem 0.5rem' }}>Product Name</th>
                  <th style={{ padding: '0.75rem 0.5rem' }}>Price</th>
                  <th style={{ padding: '0.75rem 0.5rem' }}>Stock Status</th>
                </tr>
              </thead>
              <tbody>
                {(!data.lowStockProducts || data.lowStockProducts.length === 0) ? (
                  <tr>
                    <td colSpan={3} className="text-center" style={{ padding: '2rem' }}>No products found.</td>
                  </tr>
                ) : (
                  data.lowStockProducts.map((p: any) => (
                    <tr key={p.id}>
                      <td className="fw-bold" style={{ fontSize: '0.9rem', padding: '0.75rem 0.5rem' }}>{p.name}</td>
                      <td style={{ fontSize: '0.9rem', padding: '0.75rem 0.5rem', color: 'var(--text-muted)' }}>${p.price.toLocaleString()}</td>
                      <td style={{ padding: '0.75rem 0.5rem' }}>
                        {p.stock === 0 ? (
                          <span style={{ color: '#ef4444', fontWeight: 'bold', fontSize: '0.85rem' }}>Out of Stock</span>
                        ) : p.stock <= 10 ? (
                          <span style={{ color: 'var(--warning)', fontWeight: 'bold', fontSize: '0.85rem' }}>Only {p.stock} left</span>
                        ) : (
                          <span style={{ color: 'var(--success)', fontSize: '0.85rem' }}>{p.stock} in stock</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
