import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function Dashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await fetch('/api/dashboard');
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* 1. Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
        <div className="admin-panel stat-card" style={{ padding: '2rem' }}>
          <h3 style={{ color: 'var(--text-muted)', margin: '0 0 0.5rem 0', fontSize: '1rem' }}>Total Revenue</h3>
          <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--accent)' }}>
            ${data.summary.totalRevenue.toLocaleString()}
          </div>
        </div>
        <div className="admin-panel stat-card" style={{ padding: '2rem' }}>
          <h3 style={{ color: 'var(--text-muted)', margin: '0 0 0.5rem 0', fontSize: '1rem' }}>Total Orders</h3>
          <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--success)' }}>
            {data.summary.totalOrders}
          </div>
        </div>
        <div className="admin-panel stat-card" style={{ padding: '2rem' }}>
          <h3 style={{ color: 'var(--text-muted)', margin: '0 0 0.5rem 0', fontSize: '1rem' }}>Total Products</h3>
          <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--warning)' }}>
            {data.summary.totalProducts}
          </div>
        </div>
        <div className="admin-panel stat-card" style={{ padding: '2rem' }}>
          <h3 style={{ color: 'var(--text-muted)', margin: '0 0 0.5rem 0', fontSize: '1rem' }}>Active Admins</h3>
          <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#c084fc' }}>
            {data.summary.totalAdmins}
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem' }}>
        {/* 2. Chart */}
        <div className="admin-panel" style={{ height: '400px', display: 'flex', flexDirection: 'column' }}>
          <h2 style={{ marginBottom: '1.5rem' }}>Sales Overview (Last 6 Months)</h2>
          <div style={{ flex: 1, minHeight: 0 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="name" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f8fafc', borderRadius: '8px' }}
                  itemStyle={{ color: '#60a5fa' }}
                />
                <Line type="monotone" dataKey="sales" stroke="#3b82f6" strokeWidth={4} dot={{ r: 6, fill: '#1e293b', strokeWidth: 3 }} activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 3. Recent Orders */}
        <div className="admin-panel" style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <h2 style={{ marginBottom: '1.5rem' }}>Recent Orders</h2>
          <div className="table-wrapper" style={{ flex: 1 }}>
            <table className="product-table" style={{ width: '100%' }}>
              <thead>
                <tr>
                  <th>Order No.</th>
                  <th>Customer</th>
                  <th>Status</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {data.recentOrders.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="text-center">No recent orders.</td>
                  </tr>
                ) : (
                  data.recentOrders.map((o: any) => (
                    <tr key={o.id}>
                      <td style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{o.orderNumber}</td>
                      <td className="fw-bold">{o.customer}</td>
                      <td>
                        <span 
                          className={
                            o.status === 'COMPLETED' ? 'badge-success' : 
                            o.status === 'CANCELLED' ? 'badge-warning' : 'badge-warning'
                          }
                          style={{
                            background: o.status === 'CANCELLED' ? 'rgba(239, 68, 68, 0.1)' : undefined,
                            color: o.status === 'CANCELLED' ? '#ef4444' : undefined,
                            borderRadius: '4px'
                          }}
                        >
                          {o.status}
                        </span>
                      </td>
                      <td className="fw-bold text-accent">${o.total.toLocaleString()}</td>
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
