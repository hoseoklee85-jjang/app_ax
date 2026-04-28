import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

interface OrderItem {
  id: number;
  productName: string;
  price: number;
  quantity: number;
  status: string;
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
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [dateFilterStr, setDateFilterStr] = useState({ start: '', end: '' });

  const fetchOrders = async (status: string, searchStr: string = searchQuery, p: number = page, dates = dateFilterStr) => {
    try {
      setLoading(true);
      const storeId = localStorage.getItem('storeId') || 'ALL';
      let url = `/api/orders?page=${p}&limit=10&storeId=${storeId}`;
      if (status !== 'ALL') url += `&status=${status}`;
      if (searchStr) url += `&search=${encodeURIComponent(searchStr)}`;
      if (dates.start) url += `&startDate=${dates.start}`;
      if (dates.end) url += `&endDate=${dates.end}`;
      
      const res = await fetch(url);
      const result = await res.json();
      if (result.pagination) {
        setOrders(result.data);
        setTotalPages(result.pagination.totalPages);
      } else {
        setOrders(result);
      }
    } catch (err) {
      console.error('Failed to fetch orders', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders('ALL', searchQuery, page, dateFilterStr);
  }, [searchQuery, page, dateFilterStr]);

  const handleSeedDummy = async () => {
    try {
      const res = await fetch('/api/orders/seed', { method: 'POST' });
      if (res.ok) {
        alert('Created 5 fake detailed orders successfully!');
        fetchOrders('ALL', searchQuery, page, dateFilterStr);
      }
    } catch (err) {
      console.error('Failed to seed orders', err);
    }
  };

  const exportToCSV = () => {
    if (orders.length === 0) return alert('No data to export');
    const headers = ['Order Number', 'Date', 'Customer', 'Email', 'Phone', 'Total', 'Payment', 'Status'];
    const rows = orders.map(o => [
      o.orderNumber,
      new Date(o.createdAt).toLocaleString(),
      o.customer,
      o.customerEmail || '',
      o.customerPhone || '',
      o.total,
      o.paymentMethod,
      o.status
    ]);
    
    const csvContent = [
      headers.join(','),
      ...rows.map(r => r.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    ].join('\n');
    
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `orders_export_${new Date().getTime()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <>
      <section className="admin-panel" style={{ gridColumn: '1 / -1', paddingBottom: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ margin: 0 }}>Order Management</h2>
          <div>
            <button onClick={handleSeedDummy} className="btn-primary" style={{ width: 'auto', background: 'var(--success)' }}>
              + Create Fake Orders
            </button>
            <button onClick={exportToCSV} className="btn-primary" style={{ width: 'auto', background: 'var(--accent)', marginLeft: '1rem' }}>
              Export CSV
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
          <DatePicker
            selected={startDate}
            onChange={(date: Date | null) => setStartDate(date)}
            selectsStart
            startDate={startDate || undefined}
            endDate={endDate || undefined}
            placeholderText="시작일"
            dateFormat="yyyy-MM-dd"
            customInput={<input style={{ padding: '0.6rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-main)', color: 'var(--text-main)', width: '110px', textAlign: 'center' }} />}
          />
          <span style={{ padding: '0.6rem 0' }}>~</span>
          <DatePicker
            selected={endDate}
            onChange={(date: Date | null) => setEndDate(date)}
            selectsEnd
            startDate={startDate || undefined}
            endDate={endDate || undefined}
            minDate={startDate || undefined}
            placeholderText="종료일"
            dateFormat="yyyy-MM-dd"
            customInput={<input style={{ padding: '0.6rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-main)', color: 'var(--text-main)', width: '110px', textAlign: 'center' }} />}
          />
          <input 
            type="text" 
            placeholder="고객명 또는 주문번호 검색..." 
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => { 
              if (e.key === 'Enter') { 
                setSearchQuery(searchInput); 
                setDateFilterStr({ 
                  start: startDate ? startDate.toISOString().split('T')[0] : '', 
                  end: endDate ? endDate.toISOString().split('T')[0] : '' 
                }); 
                setPage(1); 
              } 
            }}
            style={{ flex: 1, padding: '0.6rem 1rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-main)', color: 'var(--text-main)', fontSize: '0.95rem', minWidth: '200px' }}
          />
          <button 
            onClick={() => { 
              setSearchQuery(searchInput); 
              setDateFilterStr({ 
                start: startDate ? startDate.toISOString().split('T')[0] : '', 
                end: endDate ? endDate.toISOString().split('T')[0] : '' 
              }); 
              setPage(1); 
            }}
            style={{ background: 'var(--accent)', color: 'white', border: 'none', padding: '0 1.5rem', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
          >
            검색
          </button>
          {(searchQuery || dateFilterStr.start || dateFilterStr.end) && (
            <button 
              onClick={() => { setSearchInput(''); setSearchQuery(''); setStartDate(null); setEndDate(null); setDateFilterStr({ start: '', end: '' }); setPage(1); }}
              style={{ background: 'var(--bg-main)', color: 'var(--text-main)', border: '1px solid var(--border)', padding: '0 1rem', borderRadius: '8px', cursor: 'pointer' }}
            >
              초기화
            </button>
          )}
        </div>


      </section>

      <section className="admin-panel product-list-panel" style={{ gridColumn: '1 / -1', marginTop: '-1rem' }}>
        {loading ? (
          <p>Loading orders...</p>
        ) : (
          <>
            <div className="table-wrapper" style={{ overflowX: 'auto' }}>
            <table className="product-table" style={{ minWidth: '1000px' }}>
              <thead>
                <tr>
                  <th style={{ width: '40px', textAlign: 'center' }}><input type="checkbox" /></th>
                  <th>Order #</th>
                  <th>Products (Items)</th>
                  <th>Purchase Date</th>
                  <th>Customer Name</th>
                  <th>Grand Total</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'center' }}>Action</th>
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
                    <tr key={o.id} onClick={() => navigate(`/orders/${o.id}`)} style={{ cursor: 'pointer', borderBottom: '1px solid var(--border)' }}>
                      <td style={{ textAlign: 'center' }} onClick={(e) => e.stopPropagation()}><input type="checkbox" /></td>
                      <td style={{ fontSize: '0.9rem', color: 'var(--accent)', fontWeight: 'bold' }}>{o.orderNumber}</td>
                      <td>
                        <div style={{ fontSize: '0.75rem', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          {!o.items || o.items.length === 0 ? (
                            <div style={{ color: 'var(--text-muted)' }}>No items</div>
                          ) : null}
                          {o.items?.map((item: any) => (
                            <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <span style={{ color: 'var(--text-muted)', maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>- {item.productName}</span>
                              <span style={{ fontSize: '0.7rem', padding: '1px 4px', borderRadius: '4px', background: 'var(--bg-main)', border: '1px solid var(--border)', fontWeight: 'bold', color: 'var(--accent)' }}>
                                {item.status === 'PREP_SHIPPING' ? '배송준비' : 
                                 item.status === 'PICKING' ? '피킹중' : 
                                 item.status === 'SHIPPING' ? '배송중' : 
                                 item.status === 'DELIVERED' ? '배송완료' :
                                 item.status === 'CANCELLED' ? '취소' :
                                 item.status === 'RETURNED' ? '반품' : '결제완료'}
                              </span>
                            </div>
                          ))}
                        </div>
                      </td>
                      <td style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{new Date(o.createdAt).toLocaleString()}</td>
                      <td>
                        <div style={{ fontWeight: 'bold', fontSize: '0.95rem' }}>{o.customer}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{o.customerEmail || o.customerPhone}</div>
                      </td>
                      <td>
                        <div style={{ fontWeight: 'bold', fontSize: '1rem', color: 'var(--text-main)' }}>₩{o.total.toLocaleString()}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{o.paymentMethod}</div>
                      </td>
                      <td>
                        <span 
                          className={
                            o.status === 'PAID' ? 'badge-primary' : 
                            o.status === 'PREP_SHIPPING' ? 'badge-primary' : 
                            o.status === 'PICKING' ? 'badge-primary' : 
                            o.status === 'SHIPPING' ? 'badge-primary' : 
                            o.status === 'DELIVERED' ? 'badge-success' : 
                            'badge-warning'
                          }
                          style={{
                            background: o.status === 'CANCELLED' || o.status === 'RETURNED' ? 'rgba(239, 68, 68, 0.1)' : undefined,
                            color: o.status === 'CANCELLED' || o.status === 'RETURNED' ? '#ef4444' : undefined,
                            borderRadius: '4px',
                            padding: '0.3rem 0.6rem',
                            fontSize: '0.8rem',
                            fontWeight: 'bold'
                          }}
                        >
                          {o.status}
                        </span>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <button 
                          onClick={(e) => { e.stopPropagation(); navigate(`/orders/${o.id}`); }}
                          style={{ background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer', fontWeight: 'bold', textDecoration: 'none', fontSize: '0.9rem' }}
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem', marginTop: '1.5rem' }}>
            <button 
              disabled={page === 1} 
              onClick={() => setPage(p => p - 1)} 
              style={{ padding: '0.4rem 1rem', borderRadius: '4px', border: '1px solid var(--border)', background: 'var(--bg-main)', color: 'var(--text-main)', cursor: page === 1 ? 'not-allowed' : 'pointer', fontWeight: 'bold' }}
            >Prev</button>
            <span style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>Page {page} of {totalPages || 1}</span>
            <button 
              disabled={page >= totalPages} 
              onClick={() => setPage(p => p + 1)} 
              style={{ padding: '0.4rem 1rem', borderRadius: '4px', border: '1px solid var(--border)', background: 'var(--bg-main)', color: 'var(--text-main)', cursor: page >= totalPages ? 'not-allowed' : 'pointer', fontWeight: 'bold' }}
            >Next</button>
          </div>
          </>
        )}
      </section>
    </>
  );
}
