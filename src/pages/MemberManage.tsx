import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

interface Member {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  dateOfBirth?: string;
  customerGroup?: string;
  status: string;
  createdAt: string;
  websiteId?: string;
}

export default function MemberManage() {
  const navigate = useNavigate();
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [phone, setPhone] = useState('');
  const [status, setStatus] = useState('ALL');
  const [group, setGroup] = useState('ALL');
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [dateFilterStr, setDateFilterStr] = useState({ start: '', end: '' });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const fetchMembers = async () => {
    try {
      setLoading(true);
      const storeId = localStorage.getItem('storeId') || 'ALL';
      let url = `/api/members?page=${page}&limit=10&storeId=${storeId}`;
      if (searchQuery) url += `&search=${encodeURIComponent(searchQuery)}`;
      if (phone) url += `&phone=${encodeURIComponent(phone)}`;
      if (status !== 'ALL') url += `&status=${status}`;
      if (group !== 'ALL') url += `&group=${group}`;
      if (dateFilterStr.start) url += `&startDate=${dateFilterStr.start}`;
      if (dateFilterStr.end) url += `&endDate=${dateFilterStr.end}`;
      
      const res = await fetch(url);
      const json = await res.json();
      setMembers(json.data || []);
      if (json.pagination) {
        setTotalPages(json.pagination.totalPages);
        setTotalCount(json.pagination.total);
      }
    } catch (err) {
      console.error('Failed to fetch members', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, [searchQuery, phone, status, group, dateFilterStr, page]);

  return (
    <>
      <section className="admin-panel" style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ margin: 0, marginBottom: '1rem' }}>Customer Management</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%' }}>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <input 
              type="text" 
              placeholder="Search email or name..." 
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
              style={{ flex: 2, padding: '0.8rem 1.2rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-main)', color: 'var(--text-main)', fontSize: '0.95rem', minWidth: '200px' }}
            />
            <input 
              type="text" 
              placeholder="Phone number..." 
              value={phone}
              onChange={(e) => { setPhone(e.target.value); setPage(1); }}
              style={{ flex: 1, padding: '0.8rem 1.2rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-main)', color: 'var(--text-main)', fontSize: '0.95rem', minWidth: '150px' }}
            />
            <select
              value={group}
              onChange={(e) => { setGroup(e.target.value); setPage(1); }}
              style={{ flex: 1, padding: '0.8rem 1.2rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-main)', color: 'var(--text-main)', fontSize: '0.95rem', minWidth: '150px' }}
            >
              <option value="ALL">All Groups</option>
              <option value="General">General</option>
              <option value="VIP">VIP</option>
              <option value="VVIP">VVIP</option>
            </select>
            <select
              value={status}
              onChange={(e) => { setStatus(e.target.value); setPage(1); }}
              style={{ flex: 1, padding: '0.8rem 1.2rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-main)', color: 'var(--text-main)', fontSize: '0.95rem', minWidth: '150px' }}
            >
              <option value="ALL">All Status</option>
              <option value="ACTIVE">ACTIVE</option>
              <option value="INACTIVE">INACTIVE</option>
              <option value="SUSPENDED">SUSPENDED</option>
            </select>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <DatePicker
              selected={startDate}
              onChange={(date: Date | null) => setStartDate(date)}
              selectsStart
              startDate={startDate || undefined}
              endDate={endDate || undefined}
              placeholderText="시작일 (Join Date)"
              dateFormat="yyyy-MM-dd"
              customInput={<input style={{ padding: '0.6rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-main)', color: 'var(--text-main)', width: '130px', textAlign: 'center' }} />}
            />
            <span>~</span>
            <DatePicker
              selected={endDate}
              onChange={(date: Date | null) => setEndDate(date)}
              selectsEnd
              startDate={startDate || undefined}
              endDate={endDate || undefined}
              minDate={startDate || undefined}
              placeholderText="종료일 (Join Date)"
              dateFormat="yyyy-MM-dd"
              customInput={<input style={{ padding: '0.6rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-main)', color: 'var(--text-main)', width: '130px', textAlign: 'center' }} />}
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
              style={{ background: 'var(--accent)', color: 'white', border: 'none', padding: '0.6rem 1.5rem', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', marginLeft: '0.5rem' }}
            >
              검색 (Search)
            </button>
            {(searchQuery || phone || status !== 'ALL' || group !== 'ALL' || startDate || endDate) && (
              <button 
                onClick={() => { 
                  setSearchInput(''); setSearchQuery(''); setPhone(''); setStatus('ALL'); setGroup('ALL');
                  setStartDate(null); setEndDate(null); setDateFilterStr({ start: '', end: '' }); setPage(1); 
                }}
                style={{ background: 'var(--bg-main)', color: 'var(--text-main)', border: '1px solid var(--border)', padding: '0.6rem 1.5rem', borderRadius: '8px', cursor: 'pointer', marginLeft: '0.5rem' }}
              >
                초기화 (Reset)
              </button>
            )}
          </div>
        </div>
      </section>

      <section className="admin-panel product-list-panel">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2 style={{ margin: 0 }}>Customer List</h2>
          <span style={{ color: 'var(--text-muted)' }}>Total: {totalCount} members</span>
        </div>
        {loading ? (
          <p>Loading customers from database...</p>
        ) : (
          <div className="table-wrapper">
            <table className="product-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Email</th>
                  <th>Name</th>
                  <th>Phone</th>
                  <th>Group</th>
                  <th>Status</th>
                  <th>Join Date</th>
                </tr>
              </thead>
              <tbody>
                {members.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center" style={{ padding: '2rem' }}>
                      No customers found.
                    </td>
                  </tr>
                ) : (
                  members.map(m => (
                    <tr 
                      key={m.id} 
                      onClick={() => navigate(`/members/${m.id}`)}
                      style={{ cursor: 'pointer' }}
                    >
                      <td>#{m.id}</td>
                      <td className="fw-bold">{m.email}</td>
                      <td>{m.firstName || m.lastName ? `${m.firstName || ''} ${m.lastName || ''}` : '-'}</td>
                      <td>{m.phoneNumber || '-'}</td>
                      <td>
                        <span style={{ 
                          padding: '0.2rem 0.5rem', 
                          background: 'var(--bg-main)', 
                          borderRadius: '4px',
                          fontSize: '0.85rem'
                        }}>
                          {m.customerGroup || 'General'}
                        </span>
                      </td>
                      <td>
                        <span className={m.status === 'ACTIVE' ? 'badge-success' : 'badge-warning'}>
                          {m.status}
                        </span>
                      </td>
                      <td>{new Date(m.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
            
            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '1.5rem' }}>
                <button 
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  style={{
                    padding: '0.4rem 0.8rem',
                    borderRadius: '4px',
                    border: '1px solid var(--border)',
                    background: page === 1 ? 'var(--bg-card)' : 'var(--bg-panel)',
                    color: page === 1 ? 'var(--text-muted)' : 'var(--text-main)',
                    cursor: page === 1 ? 'not-allowed' : 'pointer'
                  }}
                >
                  Previous
                </button>
                <span style={{ display: 'flex', alignItems: 'center', padding: '0 0.5rem' }}>
                  Page {page} of {totalPages}
                </span>
                <button 
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  style={{
                    padding: '0.4rem 0.8rem',
                    borderRadius: '4px',
                    border: '1px solid var(--border)',
                    background: page === totalPages ? 'var(--bg-card)' : 'var(--bg-panel)',
                    color: page === totalPages ? 'var(--text-muted)' : 'var(--text-main)',
                    cursor: page === totalPages ? 'not-allowed' : 'pointer'
                  }}
                >
                  Next
                </button>
              </div>
            )}
          </div>
        )}
      </section>
    </>
  );
}
