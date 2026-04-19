import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

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

export default function OrderDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/orders/${id}`);
        if (!res.ok) throw new Error('Order not found');
        const data = await res.json();
        setOrder(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id]);

  if (loading) {
    return (
      <section className="admin-panel" style={{ gridColumn: '1 / -1' }}>
        <p>Loading order details...</p>
      </section>
    );
  }

  if (!order) {
    return (
      <section className="admin-panel" style={{ gridColumn: '1 / -1' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '3rem' }}>
          <h2>Order Not Found</h2>
          <button onClick={() => navigate('/orders')} className="btn-primary" style={{ marginTop: '1rem' }}>
            Back to Orders
          </button>
        </div>
      </section>
    );
  }

  return (
    <>
      <section className="admin-panel" style={{ gridColumn: '1 / -1', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <button 
            onClick={() => navigate('/orders')} 
            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', padding: 0, marginBottom: '0.5rem', fontSize: '0.9rem' }}
          >
            ← Back to Orders
          </button>
          <h2 style={{ margin: 0 }}>Order Details: {order.orderNumber}</h2>
        </div>
      </section>

      <section className="admin-panel" style={{ gridColumn: '1 / -1' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
          <div>
            <p style={{ margin: '0 0 0.5rem 0', color: 'var(--text-muted)', fontSize: '0.9rem' }}>Customer Name</p>
            <p style={{ margin: 0, fontWeight: 'bold' }}>{order.customer}</p>
          </div>
          <div>
            <p style={{ margin: '0 0 0.5rem 0', color: 'var(--text-muted)', fontSize: '0.9rem' }}>Phone / Email</p>
            <p style={{ margin: 0 }}>{order.customerPhone || '-'}</p>
            <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-muted)' }}>{order.customerEmail || '-'}</p>
          </div>
          <div style={{ gridColumn: '1 / -1' }}>
            <p style={{ margin: '0 0 0.5rem 0', color: 'var(--text-muted)', fontSize: '0.9rem' }}>Shipping Address</p>
            <p style={{ margin: 0 }}>{order.shippingAddress || '-'}</p>
          </div>
          <div>
            <p style={{ margin: '0 0 0.5rem 0', color: 'var(--text-muted)', fontSize: '0.9rem' }}>Payment Method</p>
            <p style={{ margin: 0 }}>{order.paymentMethod}</p>
          </div>
          <div>
            <p style={{ margin: '0 0 0.5rem 0', color: 'var(--text-muted)', fontSize: '0.9rem' }}>Total Amount</p>
            <p style={{ margin: 0, fontWeight: 'bold', color: 'var(--accent)', fontSize: '1.2rem' }}>₩{order.total.toLocaleString()}</p>
          </div>
          <div>
            <p style={{ margin: '0 0 0.5rem 0', color: 'var(--text-muted)', fontSize: '0.9rem' }}>Status</p>
            <p style={{ margin: 0 }}>
              <span className={
                order.status === 'PAID' || order.status === 'SHIPPING' ? 'badge-primary' : 
                order.status === 'DELIVERED' ? 'badge-success' : 'badge-warning'
              } style={{ 
                borderRadius: '4px', padding: '0.2rem 0.5rem',
                background: order.status === 'CANCELLED' || order.status === 'RETURNED' ? 'rgba(239, 68, 68, 0.1)' : undefined,
                color: order.status === 'CANCELLED' || order.status === 'RETURNED' ? '#ef4444' : undefined
              }}>
                {order.status}
              </span>
            </p>
          </div>
          <div>
            <p style={{ margin: '0 0 0.5rem 0', color: 'var(--text-muted)', fontSize: '0.9rem' }}>Order Date</p>
            <p style={{ margin: 0 }}>{new Date(order.createdAt).toLocaleString()}</p>
          </div>
        </div>

        {/* Order Items Section */}
        <div style={{ marginBottom: '2rem' }}>
          <p style={{ margin: '0 0 0.5rem 0', color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 'bold' }}>Ordered Items</p>
          {order.items && order.items.length > 0 ? (
            <div style={{ border: '1px solid var(--border)', borderRadius: '8px', overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                <thead style={{ background: 'var(--bg-main)', borderBottom: '1px solid var(--border)' }}>
                  <tr>
                    <th style={{ padding: '0.8rem 1rem', textAlign: 'left', fontWeight: 'normal', color: 'var(--text-muted)' }}>Product</th>
                    <th style={{ padding: '0.8rem 1rem', textAlign: 'center', fontWeight: 'normal', color: 'var(--text-muted)' }}>Qty</th>
                    <th style={{ padding: '0.8rem 1rem', textAlign: 'right', fontWeight: 'normal', color: 'var(--text-muted)' }}>Price</th>
                  </tr>
                </thead>
                <tbody>
                  {order.items.map((item, idx) => (
                    <tr key={item.id || idx} style={{ borderBottom: idx === (order.items?.length || 0) - 1 ? 'none' : '1px solid var(--border)' }}>
                      <td style={{ padding: '0.8rem 1rem' }}>{item.productName}</td>
                      <td style={{ padding: '0.8rem 1rem', textAlign: 'center' }}>{item.quantity}</td>
                      <td style={{ padding: '0.8rem 1rem', textAlign: 'right', fontWeight: 'bold' }}>₩{(item.price * item.quantity).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-muted)' }}>No item details available.</p>
          )}
        </div>
        
        <div style={{ background: 'var(--bg-main)', padding: '1.5rem', borderRadius: '8px' }}>
          <p style={{ margin: '0 0 0.5rem 0', color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 'bold' }}>Customer Notes</p>
          <p style={{ margin: 0, whiteSpace: 'pre-wrap', lineHeight: 1.5 }}>{order.notes || 'No notes provided.'}</p>
        </div>
      </section>
    </>
  );
}
