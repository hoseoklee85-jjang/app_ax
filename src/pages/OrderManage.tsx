import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface OrderItem {
  id: number;
  productName: string;
  price: number;
  quantity: number;
}

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
  items?: OrderItem[];
}

export default function OrderManage() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'PAID' | 'SHIPPING' | 'DELIVERED' | 'CANCELLED' | 'RETURNED'>('PAID');

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
      } else {
        const data = await res.json();
        alert(data.error || '상태 변경 실패');
      }
    } catch (err) {
      console.error('Failed to update status', err);
      alert('서버 오류가 발생했습니다.');
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
            { label: '💰 PAID (결제완료)', value: 'PAID' },
            { label: '🚚 SHIPPING (배송중)', value: 'SHIPPING' },
            { label: '📦 DELIVERED (배송완료)', value: 'DELIVERED' },
            { label: '🚫 CANCELLED (취소)', value: 'CANCELLED' },
            { label: '↩️ RETURNED (반품)', value: 'RETURNED' }
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
                    <tr key={o.id} onClick={() => navigate(`/orders/${o.id}`)} style={{ cursor: 'pointer' }}>
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
                            o.status === 'PAID' ? 'badge-primary' : 
                            o.status === 'SHIPPING' ? 'badge-primary' : 
                            o.status === 'DELIVERED' ? 'badge-success' : 
                            'badge-warning'
                          }
                          style={{
                            background: o.status === 'CANCELLED' || o.status === 'RETURNED' ? 'rgba(239, 68, 68, 0.1)' : undefined,
                            color: o.status === 'CANCELLED' || o.status === 'RETURNED' ? '#ef4444' : undefined,
                            borderRadius: '4px'
                          }}
                        >
                          {o.status}
                        </span>
                      </td>
                      <td>
                        {o.status === 'PAID' && (
                          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                            <button 
                              onClick={(e) => { e.stopPropagation(); handleStatusChange(o.id, 'SHIPPING'); }}
                              style={{ background: 'var(--accent)', color: 'white', border: 'none', padding: '0.4rem 0.6rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem' }}
                            >Ship (배송)</button>
                            <button 
                              onClick={(e) => { e.stopPropagation(); handleStatusChange(o.id, 'CANCELLED'); }}
                              style={{ background: '#ef4444', color: 'white', border: 'none', padding: '0.4rem 0.6rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem' }}
                            >Cancel</button>
                          </div>
                        )}
                        {o.status === 'SHIPPING' && (
                          <button 
                            onClick={(e) => { e.stopPropagation(); handleStatusChange(o.id, 'DELIVERED'); }}
                            style={{ background: 'var(--success)', color: 'white', border: 'none', padding: '0.4rem 0.6rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem' }}
                          >Deliver (완료)</button>
                        )}
                        {o.status === 'DELIVERED' && (
                          <button 
                            onClick={(e) => { e.stopPropagation(); handleStatusChange(o.id, 'RETURNED'); }}
                            style={{ background: 'var(--warning)', color: 'white', border: 'none', padding: '0.4rem 0.6rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem' }}
                          >Return (반품)</button>
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
