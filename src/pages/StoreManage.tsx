import { useState, useEffect } from 'react';

interface Store {
  website_id: string;
  country: string;
  subsidiary_code: string;
  locale_code: string;
  created_at: string;
}

export default function StoreManage() {
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [form, setForm] = useState({ 
    website_id: '',
    country: '', 
    subsidiary_code: '',
    locale_code: ''
  });

  const [editId, setEditId] = useState<string | null>(null);

  const fetchStores = async () => {
    try {
      const res = await fetch('/api/stores');
      const data = await res.json();
      setStores(data);
    } catch (err) {
      console.error('Failed to fetch stores', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStores();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.website_id || !form.country || !form.locale_code) {
      return alert('Website ID, Country, and Locale Code are required.');
    }
    
    try {
      if (editId) {
        // Update
        const res = await fetch(`/api/stores/${editId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form)
        });
        if (res.ok) {
          setEditId(null);
          setForm({ website_id: '', country: '', subsidiary_code: '', locale_code: '' });
          fetchStores();
        }
      } else {
        // Create
        const res = await fetch('/api/stores', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form)
        });
        if (res.ok) {
          setForm({ website_id: '', country: '', subsidiary_code: '', locale_code: '' });
          fetchStores();
        } else {
          const data = await res.json();
          alert(data.error || 'Failed to create store');
        }
      }
    } catch (err) {
      console.error('Failed to save store', err);
    }
  };

  const handleEdit = (store: Store) => {
    setEditId(store.website_id);
    setForm({
      website_id: store.website_id,
      country: store.country,
      subsidiary_code: store.subsidiary_code,
      locale_code: store.locale_code
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this store?')) return;
    try {
      const res = await fetch(`/api/stores/${id}`, { method: 'DELETE' });
      if (res.ok) fetchStores();
    } catch (err) {
      console.error('Failed to delete store', err);
    }
  };

  const handleCancelEdit = () => {
    setEditId(null);
    setForm({ website_id: '', country: '', subsidiary_code: '', locale_code: '' });
  };

  return (
    <>
      <section className="admin-panel">
        <h2 style={{ marginBottom: '1.5rem', color: 'var(--accent)' }}>
          {editId ? 'Edit Store' : 'Add New Store'}
        </h2>
        <form onSubmit={handleSubmit} className="product-form">
          <div className="form-row">
            <div className="form-group">
              <label>Website ID</label>
              <input 
                type="text" 
                value={form.website_id} 
                onChange={e => setForm({...form, website_id: e.target.value})} 
                placeholder="e.g. 099" 
                disabled={!!editId} // Cannot change ID during edit
              />
            </div>
            <div className="form-group">
              <label>Country Name</label>
              <input 
                type="text" 
                value={form.country} 
                onChange={e => setForm({...form, country: e.target.value})} 
                placeholder="e.g. South Korea" 
              />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Subsidiary Code</label>
              <input 
                type="text" 
                value={form.subsidiary_code} 
                onChange={e => setForm({...form, subsidiary_code: e.target.value})} 
                placeholder="e.g. LGEKR" 
              />
            </div>
            <div className="form-group">
              <label>Locale Code</label>
              <input 
                type="text" 
                value={form.locale_code} 
                onChange={e => setForm({...form, locale_code: e.target.value})} 
                placeholder="e.g. KR" 
              />
            </div>
          </div>
          <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
            <button type="submit" className="btn-primary" style={{ flex: 1 }}>
              {editId ? 'Update Store' : 'Save Store'}
            </button>
            {editId && (
              <button 
                type="button" 
                onClick={handleCancelEdit} 
                style={{ 
                  flex: 1, 
                  background: 'transparent', 
                  border: '1px solid var(--border)', 
                  borderRadius: '8px',
                  fontWeight: 'bold',
                  cursor: 'pointer'
                }}
              >
                Cancel Edit
              </button>
            )}
          </div>
        </form>
      </section>

      <section className="admin-panel product-list-panel" style={{ marginTop: '2rem' }}>
        <h2>Global Stores list</h2>
        {loading ? (
          <p>Loading stores from database...</p>
        ) : (
          <div className="table-wrapper">
            <table className="product-table">
              <thead>
                <tr>
                  <th>Website ID</th>
                  <th>Country</th>
                  <th>Locale</th>
                  <th>Subsidiary</th>
                  <th>Date Added</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {stores.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center">No stores found.</td>
                  </tr>
                ) : (
                  stores.map(store => (
                    <tr key={store.website_id}>
                      <td style={{ color: 'var(--text-muted)', fontWeight: 'bold' }}>{store.website_id}</td>
                      <td className="fw-bold">{store.country}</td>
                      <td>
                        <span className="badge-success">{store.locale_code}</span>
                      </td>
                      <td style={{ color: 'var(--text-muted)' }}>{store.subsidiary_code}</td>
                      <td>{new Date(store.created_at).toLocaleDateString()}</td>
                      <td style={{ textAlign: 'right' }}>
                        <button 
                          onClick={() => handleEdit(store)} 
                          style={{
                            marginRight: '0.5rem',
                            padding: '0.4rem 0.8rem',
                            background: 'var(--accent)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer'
                          }}
                        >
                          Edit
                        </button>
                        <button 
                          onClick={() => handleDelete(store.website_id)} 
                          style={{
                            padding: '0.4rem 0.8rem',
                            background: '#ef4444',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer'
                          }}
                        >
                          Delete
                        </button>
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
