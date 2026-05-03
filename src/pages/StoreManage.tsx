import { useState, useEffect } from 'react';

interface Store {
  id: string; // e.g. KR_SITE
  name: string; // e.g. South Korea
  currency: string;
  timezone: string;
  createdAt: string;
}

export default function StoreManage() {
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ id: '', name: '', currency: '', timezone: '' });
  
  // Pagination states
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const fetchStores = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/stores?page=${page}&limit=10`);
      const json = await res.json();
      setStores(json.data || []);
      if (json.pagination) {
        setTotalPages(json.pagination.totalPages);
        setTotalCount(json.pagination.total);
      }
    } catch (err) {
      console.error('Failed to fetch stores', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStores();
  }, [page]); // re-fetch on page change

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.id || !form.name) return alert('Store ID and Name are required.');

    try {
      const res = await fetch('/api/stores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      if (res.ok) {
        setForm({ id: '', name: '', currency: '', timezone: '' });
        setPage(1); // Reset to first page to see new store
        fetchStores();
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to create store');
      }
    } catch (err) {
      console.error('Failed to create store', err);
    }
  };

  return (
    <>
      <section className="admin-panel add-product-panel" style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ marginBottom: '1rem' }}>Register New Store (Website)</h2>
        <form onSubmit={handleSubmit} className="product-form">
          <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label>Store/Website ID</label>
              <input 
                type="text" 
                value={form.id} 
                onChange={e => setForm({...form, id: e.target.value})} 
                placeholder="e.g. JP_SITE" 
                required 
              />
            </div>
            <div className="form-group">
              <label>Store Name</label>
              <input 
                type="text" 
                value={form.name} 
                onChange={e => setForm({...form, name: e.target.value})} 
                placeholder="e.g. Japan" 
                required 
              />
            </div>
          </div>
          <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
            <div className="form-group">
              <label>Currency / Subsidiary Code</label>
              <input 
                type="text" 
                value={form.currency} 
                onChange={e => setForm({...form, currency: e.target.value})} 
                placeholder="e.g. LGEJP" 
              />
            </div>
            <div className="form-group">
              <label>Timezone / Locale</label>
              <input 
                type="text" 
                value={form.timezone} 
                onChange={e => setForm({...form, timezone: e.target.value})} 
                placeholder="e.g. ja-JP" 
              />
            </div>
          </div>
          <button type="submit" className="btn-primary" style={{ marginTop: '1.5rem' }}>Add Store</button>
        </form>
      </section>

      <section className="admin-panel product-list-panel">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2 style={{ margin: 0 }}>Active Stores (Websites)</h2>
          <span style={{ color: 'var(--text-muted)' }}>Total: {totalCount} stores</span>
        </div>
        {loading ? (
          <p>Loading stores from database...</p>
        ) : (
          <div className="table-wrapper">
            <table className="product-table">
              <thead>
                <tr>
                  <th>Store ID</th>
                  <th>Name</th>
                  <th>Subsidiary (Currency)</th>
                  <th>Locale (Timezone)</th>
                  <th>Date Created</th>
                </tr>
              </thead>
              <tbody>
                {stores.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center" style={{ padding: '2rem' }}>
                      No stores found.
                    </td>
                  </tr>
                ) : (
                  stores.map(s => (
                    <tr key={s.id}>
                      <td className="fw-bold">{s.id}</td>
                      <td>{s.name}</td>
                      <td>
                        <span style={{ 
                          padding: '0.2rem 0.5rem', 
                          background: 'var(--bg-main)', 
                          borderRadius: '4px',
                          fontSize: '0.85rem'
                        }}>
                          {s.currency}
                        </span>
                      </td>
                      <td>{s.timezone}</td>
                      <td>{new Date(s.createdAt).toLocaleDateString()}</td>
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
