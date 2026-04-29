import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

interface OrderItem {
  id: number;
  productId?: number;
  productName: string;
  price: number;
  quantity: number;
  status: string;
}

interface OrderStatusHistory {
  id: number;
  oldStatus?: string;
  newStatus: string;
  changedBy: string;
  createdAt: string;
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
  statusHistory?: OrderStatusHistory[];
}

export default function OrderDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const handleStatusChange = async (newStatus: string) => {
    if (!confirm(`Are you sure you want to change this order's status to ${newStatus}?`)) return;
    
    try {
      const res = await fetch(`/api/orders/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        fetchOrder();
      } else {
        const data = await res.json();
        alert(data.error || '상태 변경 실패');
      }
    } catch (err) {
      console.error('Failed to update status', err);
      alert('서버 오류가 발생했습니다.');
    }
  };

  const handleItemStatusChange = async (itemId: number, newStatus: string) => {
    try {
      const res = await fetch(`/api/orders/${id}/items/${itemId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        fetchOrder();
      } else {
        const data = await res.json();
        alert(data.error || '아이템 상태 변경 실패');
      }
    } catch (err) {
      console.error('Failed to update item status', err);
      alert('서버 오류가 발생했습니다.');
    }
  };

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
      {/* Action Bar (Top) */}
      <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '1rem' }}>
          Order &nbsp; {order.orderNumber}
          <span className={
            ['PAID', 'PREP_SHIPPING', 'PICKING', 'SHIPPING'].includes(order.status) ? 'badge-primary' : 
            order.status === 'DELIVERED' ? 'badge-success' : 'badge-warning'
          } style={{ 
            borderRadius: '4px', padding: '0.2rem 0.5rem', fontSize: '0.8rem',
            background: order.status === 'CANCELLED' || order.status === 'RETURNED' ? 'rgba(239, 68, 68, 0.1)' : undefined,
            color: order.status === 'CANCELLED' || order.status === 'RETURNED' ? '#ef4444' : undefined
          }}>
            {order.status}
          </span>
        </h2>
        
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button 
            onClick={() => navigate('/orders')}
            style={{ background: 'var(--bg-main)', color: 'var(--text-main)', border: '1px solid var(--border)', padding: '0.4rem 1rem', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
          >Back</button>
          
          {order.status === 'PAID' && (
            <>
              <button 
                onClick={() => handleStatusChange('CANCELLED')}
                style={{ background: '#ef4444', color: 'white', border: 'none', padding: '0.4rem 1rem', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
              >Cancel</button>
              <button 
                onClick={() => handleStatusChange('PREP_SHIPPING')}
                style={{ background: 'var(--accent)', color: 'white', border: 'none', padding: '0.4rem 1rem', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
              >Prep Shipping</button>
            </>
          )}
          {order.status === 'PREP_SHIPPING' && (
            <>
              <button onClick={() => handleStatusChange('CANCELLED')} style={{ background: '#ef4444', color: 'white', border: 'none', padding: '0.4rem 1rem', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>Cancel</button>
              <button onClick={() => handleStatusChange('PICKING')} style={{ background: 'var(--accent)', color: 'white', border: 'none', padding: '0.4rem 1rem', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>Start Picking</button>
            </>
          )}
          {order.status === 'PICKING' && (
            <>
              <button onClick={() => handleStatusChange('SHIPPING')} style={{ background: 'var(--accent)', color: 'white', border: 'none', padding: '0.4rem 1rem', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>Ship</button>
            </>
          )}
          {order.status === 'SHIPPING' && (
            <button 
              onClick={() => handleStatusChange('DELIVERED')}
              style={{ background: 'var(--success)', color: 'white', border: 'none', padding: '0.4rem 1rem', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
            >Deliver</button>
          )}
          {order.status === 'DELIVERED' && (
            <button 
              onClick={() => handleStatusChange('RETURNED')}
              style={{ background: 'var(--warning)', color: 'white', border: 'none', padding: '0.4rem 1rem', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
            >Refund</button>
          )}
        </div>
      </div>

      {/* Information Blocks */}
      <div style={{ gridColumn: '1 / -1', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
        
        {/* Order & Account Information */}
        <section className="admin-panel" style={{ padding: '1.5rem' }}>
          <h3 style={{ borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem', marginTop: 0, marginBottom: '1rem', fontSize: '1.1rem' }}>Order & Account Information</h3>
          <div style={{ marginBottom: '1rem' }}>
            <p style={{ margin: '0 0 0.2rem 0', color: 'var(--text-muted)', fontSize: '0.85rem' }}>Order Date</p>
            <p style={{ margin: 0, fontWeight: 'bold' }}>{new Date(order.createdAt).toLocaleString()}</p>
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <p style={{ margin: '0 0 0.2rem 0', color: 'var(--text-muted)', fontSize: '0.85rem' }}>Order Status</p>
            <p style={{ margin: 0, fontWeight: 'bold' }}>{order.status}</p>
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <p style={{ margin: '0 0 0.2rem 0', color: 'var(--text-muted)', fontSize: '0.85rem' }}>Customer Name</p>
            <p style={{ margin: 0, fontWeight: 'bold', color: 'var(--accent)' }}>{order.customer}</p>
          </div>
          <div>
            <p style={{ margin: '0 0 0.2rem 0', color: 'var(--text-muted)', fontSize: '0.85rem' }}>Email / Phone</p>
            <p style={{ margin: 0 }}>{order.customerEmail || '-'}</p>
            <p style={{ margin: 0 }}>{order.customerPhone || '-'}</p>
          </div>
        </section>

        {/* Address Information */}
        <section className="admin-panel" style={{ padding: '1.5rem' }}>
          <h3 style={{ borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem', marginTop: 0, marginBottom: '1rem', fontSize: '1.1rem' }}>Address Information</h3>
          <div style={{ marginBottom: '1rem' }}>
            <p style={{ margin: '0 0 0.2rem 0', color: 'var(--text-muted)', fontSize: '0.85rem' }}>Shipping Address</p>
            <p style={{ margin: 0, lineHeight: 1.5 }}>
              {order.customer}<br />
              {order.shippingAddress || 'No Address Provided'}<br />
              {order.customerPhone}
            </p>
          </div>
        </section>

        {/* Payment & Shipping Method */}
        <section className="admin-panel" style={{ padding: '1.5rem' }}>
          <h3 style={{ borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem', marginTop: 0, marginBottom: '1rem', fontSize: '1.1rem' }}>Payment & Shipping Method</h3>
          <div style={{ marginBottom: '1rem' }}>
            <p style={{ margin: '0 0 0.2rem 0', color: 'var(--text-muted)', fontSize: '0.85rem' }}>Payment Information</p>
            <p style={{ margin: 0, fontWeight: 'bold' }}>{order.paymentMethod}</p>
          </div>
          <div>
            <p style={{ margin: '0 0 0.2rem 0', color: 'var(--text-muted)', fontSize: '0.85rem' }}>Customer Notes</p>
            <p style={{ margin: 0, whiteSpace: 'pre-wrap', lineHeight: 1.5, background: 'var(--bg-main)', padding: '0.5rem', borderRadius: '4px' }}>
              {order.notes || 'No notes provided.'}
            </p>
          </div>
        </section>
      </div>

      {/* Items Ordered */}
      <section className="admin-panel" style={{ gridColumn: '1 / -1', padding: '1.5rem', marginBottom: '1.5rem' }}>
        <h3 style={{ borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem', marginTop: 0, marginBottom: '1rem', fontSize: '1.1rem' }}>Items Ordered</h3>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem', minWidth: '600px' }}>
            <thead style={{ background: 'var(--bg-main)', borderBottom: '1px solid var(--border)', borderTop: '1px solid var(--border)' }}>
              <tr>
                <th style={{ padding: '0.8rem 1rem', textAlign: 'left', color: 'var(--text-muted)' }}>Product</th>
                <th style={{ padding: '0.8rem 1rem', textAlign: 'center', color: 'var(--text-muted)' }}>Item Status</th>
                <th style={{ padding: '0.8rem 1rem', textAlign: 'right', color: 'var(--text-muted)' }}>Price</th>
                <th style={{ padding: '0.8rem 1rem', textAlign: 'center', color: 'var(--text-muted)' }}>Qty</th>
                <th style={{ padding: '0.8rem 1rem', textAlign: 'right', color: 'var(--text-muted)' }}>Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {order.items && order.items.length > 0 ? (
                order.items.map((item, idx) => (
                  <tr key={item.id || idx} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '1rem' }}>
                      <div style={{ fontWeight: 'bold' }}>{item.productName}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                        코드: {item.productId ? `PRD-${item.productId.toString().padStart(4, '0')}` : 'N/A'}
                      </div>
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'center' }}>
                      <select 
                        value={item.status || 'PAID'}
                        onChange={(e) => handleItemStatusChange(item.id, e.target.value)}
                        style={{ padding: '0.3rem', borderRadius: '4px', border: '1px solid var(--border)', background: 'var(--bg-main)', color: 'var(--text-main)', fontSize: '0.85rem' }}
                      >
                        <option value="PAID">결제완료</option>
                        <option value="PREP_SHIPPING">배송준비중</option>
                        <option value="PICKING">피킹중</option>
                        <option value="SHIPPING">배송중</option>
                        <option value="DELIVERED">배송완료</option>
                        <option value="CANCELLED">취소</option>
                        <option value="RETURNED">반품</option>
                      </select>
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'right' }}>₩{item.price.toLocaleString()}</td>
                    <td style={{ padding: '1rem', textAlign: 'center' }}>
                      <div style={{ display: 'inline-block', textAlign: 'left' }}>
                        Ordered: <strong>{item.quantity}</strong><br/>
                        Invoiced: <strong>{item.quantity}</strong>
                      </div>
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'right', fontWeight: 'bold' }}>
                      ₩{(item.price * item.quantity).toLocaleString()}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} style={{ padding: '1rem', textAlign: 'center' }}>No items found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Bottom Section: History & Totals */}
      <section style={{ gridColumn: '1 / -1', display: 'flex', gap: '1.5rem', marginBottom: '3rem', alignItems: 'flex-start', flexWrap: 'wrap' }}>
        
        {/* Status History */}
        <div style={{ flex: 1, minWidth: '300px' }}>
          {order.statusHistory && order.statusHistory.length > 0 && (
            <div className="admin-panel" style={{ padding: '1.5rem', height: '100%', boxSizing: 'border-box' }}>
              <h3 style={{ borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem', marginTop: 0, marginBottom: '1rem', fontSize: '1.1rem' }}>Order Status History</h3>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {order.statusHistory.map((history, idx) => (
                  <li key={history.id} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', paddingBottom: idx !== order.statusHistory!.length - 1 ? '1rem' : '0', borderBottom: idx !== order.statusHistory!.length - 1 ? '1px dashed var(--border)' : 'none', marginBottom: idx !== order.statusHistory!.length - 1 ? '1rem' : '0' }}>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', width: '130px', flexShrink: 0 }}>
                      {new Date(history.createdAt).toLocaleString()}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                      {history.oldStatus && (
                        <>
                          <span className="badge-warning" style={{ background: 'var(--bg-main)', color: 'var(--text-main)', border: '1px solid var(--border)' }}>{history.oldStatus}</span>
                          <span style={{ color: 'var(--text-muted)' }}>→</span>
                        </>
                      )}
                      <span className={
                        history.newStatus === 'PAID' ? 'badge-primary' : 
                        history.newStatus === 'DELIVERED' ? 'badge-success' : 
                        history.newStatus === 'CANCELLED' || history.newStatus === 'RETURNED' ? 'badge-warning' : 'badge-primary'
                      } style={{ 
                        background: history.newStatus === 'CANCELLED' || history.newStatus === 'RETURNED' ? 'rgba(239, 68, 68, 0.1)' : undefined,
                        color: history.newStatus === 'CANCELLED' || history.newStatus === 'RETURNED' ? '#ef4444' : undefined,
                        fontWeight: 'bold', borderRadius: '4px', padding: '0.2rem 0.5rem', fontSize: '0.8rem'
                      }}>{history.newStatus}</span>
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginLeft: '0.5rem' }}>by {history.changedBy}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Order Totals */}
        <div className="admin-panel" style={{ width: '350px', padding: '1.5rem', flexShrink: 0 }}>
          <h3 style={{ borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem', marginTop: 0, marginBottom: '1rem', fontSize: '1.1rem' }}>Order Totals</h3>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.8rem', fontSize: '0.9rem' }}>
            <span style={{ color: 'var(--text-muted)' }}>Subtotal</span>
            <span>₩{order.total.toLocaleString()}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', fontSize: '0.9rem' }}>
            <span style={{ color: 'var(--text-muted)' }}>Shipping & Handling</span>
            <span>₩0</span>
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '2px solid var(--border)', paddingTop: '1rem', marginTop: '0.5rem' }}>
            <span style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>Grand Total</span>
            <span style={{ fontWeight: 'bold', fontSize: '1.2rem', color: 'var(--accent)' }}>₩{order.total.toLocaleString()}</span>
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem', fontSize: '0.9rem' }}>
            <span style={{ color: 'var(--text-muted)' }}>Total Paid</span>
            <span style={{ fontWeight: 'bold' }}>₩{order.status === 'CANCELLED' ? 0 : order.total.toLocaleString()}</span>
          </div>
        </div>
      </section>
    </>
  );
}
