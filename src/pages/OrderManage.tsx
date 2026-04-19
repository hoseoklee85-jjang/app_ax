import { useState, useEffect } from 'react';

interface Order {
  id: number;
  orderNumber: string;
  customer: string;
  customerEmail: string | null;
  customerPhone: string | null;
  shippingAddress: string | null;
  paymentMethod: string;
  total: number;
  status: string;
  notes: string | null;
  createdAt: string;
}

export default function OrderManage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'COMPLETED' | 'CANCELLED' | 'RETURNED'>('COMPLETED');

  const fetchOrders = async (status: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/orders?status=${status}`);
      const data = await res.json();
      setOrders(data);
    } catch (err) {
      console.error('Failed to fetch orders', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders(activeTab);
  }, [activeTab]);

  const handleStatusChange = async (id: number, newStatus: string) => {
    if (!confirm(`Are you sure you want to change this order's status to ${newStatus}?`)) return;
    
    try {
      const res = await fetch(`/api/orders/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        fetchOrders(activeTab);
      }
    } catch (err) {
      console.error('Failed to update status', err);
    }
  };

  const handleSeedDummy = async () => {
    try {
      const res = await fetch('/api/orders/seed', { method: 'POST' });
      if (res.ok) {
        alert('Created 5 fake detailed orders successfully!');
        fetchOrders(activeTab);
      }
    } catch (err) {
      console.error('Failed to seed orders', err);
    }
  };

  return (
    <>
      <section className="admin-panel" style={{ gridColumn: '1 / -1', paddingBottom: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ margin: 0 }}>Order Management</h2>
          <button onClick={handleSeedDummy} className="btn-primary" style={{ width: 'auto', background: 'var(--success)' }}>
            + Create Fake Orders
          </button>
        </div>

        <div style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid var(--border)' }}>
          {[
            { label: '📦 Normal (Completed)', value: 'COMPLETED' },
            { label: '🚫 Cancelled', value: 'CANCELLED' },
            { label: '↩️ Returned', value: 'RETURNED' }
          ].map(tab => (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value as any)}
              style={{
                background: 'transparent', border: 'none', padding: '1rem 1.5rem',
                color: activeTab === tab.value ? 'var(--accent)' : 'var(--text-muted)',
                borderBottom: activeTab === tab.value ? '3px solid var(--accent)' : '3px solid transparent',
                cursor: 'pointer', fontWeight: activeTab === tab.value ? 'bold' : 'normal',
                fontSize: '1rem', transition: 'all 0.2s'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </section>

      <section className="admin-panel product-list-panel" style={{ gridColumn: '1 / -1', marginTop: '-1rem' }}>
        {loading ? (
          <p>Loading orders...</p>
        ) : (
          <div className="table-wrapper" style={{ overflowX: 'auto' }}>
            <table className="product-table" style={{ minWidth: '1000px' }}>
              <thead>
                <tr>
                  <th>Order No.</th>
                  <th>Customer Info</th>
                  <th>Shipping Address</th>
                  <th>Payment / Total</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center" style={{ padding: '3rem' }}>
                      No orders found in this category.
                    </td>
                  </tr>
                ) : (
                  orders.map(o => (
                    <tr key={o.id}>
                      <td style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{o.orderNumber}</td>
                      <td>
                        <div className="fw-bold">{o.customer}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{o.customerPhone}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{o.customerEmail}</div>
                      </td>
                      <td>
                        <div style={{ 
                          maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', 
                          textOverflow: 'ellipsis', fontSize: '0.9rem' 
                        }} title={o.shippingAddress || ''}>
                          {o.shippingAddress}
                        </div>
                      </td>
                      <td>
                        <div className="fw-bold text-accent">${o.total.toLocaleString()}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{o.paymentMethod}</div>
                      </td>
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
                      <td>
                        {o.status === 'COMPLETED' && (
                          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                            <button 
                              onClick={() => handleStatusChange(o.id, 'CANCELLED')}
                              style={{ background: '#ef4444', color: 'white', border: 'none', padding: '0.4rem 0.6rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem' }}
                            >Cancel</button>
                            <button 
                              onClick={() => handleStatusChange(o.id, 'RETURNED')}
                              style={{ background: 'var(--warning)', color: 'white', border: 'none', padding: '0.4rem 0.6rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem' }}
                            >Return</button>
                          </div>
                        )}
                        {o.status !== 'COMPLETED' && (
                          <button 
                            onClick={() => handleStatusChange(o.id, 'COMPLETED')}
                            style={{ background: 'var(--success)', color: 'white', border: 'none', padding: '0.4rem 0.6rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem' }}
                          >Restore</button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </>
  );
}
