import { useState, useEffect } from 'react';

interface Product {
  id: number;
  productCode?: string;
  name: string;
  price: number;
  description: string;
  stock: number;
  createdAt: string;
}

export default function ProductManage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [langTab, setLangTab] = useState('en');
  const [form, setForm] = useState({ 
    productCode: '',
    price: '', 
    stock: '',
    translations: {
      en: { name: '', description: '' },
      ko: { name: '', description: '' }
    }
  });

  const fetchProducts = async () => {
    try {
      const storeId = localStorage.getItem('storeId') || 'ALL';
      const res = await fetch(`/api/products?storeId=${storeId}`);
      const data = await res.json();
      setProducts(data);
    } catch (err) {
      console.error('Failed to fetch products', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.translations.en.name || !form.price) return alert('English name and price are required.');
    
    try {
      const storeId = localStorage.getItem('storeId') || 'US';
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productCode: form.productCode ? form.productCode : undefined,
          name: form.translations.en.name,
          price: parseInt(form.price),
          description: form.translations.en.description,
          stock: parseInt(form.stock) || 0,
          storeId: storeId === 'ALL' ? 'US' : storeId,
          translations: [
            { language: 'en', name: form.translations.en.name, description: form.translations.en.description },
            { language: 'ko', name: form.translations.ko.name, description: form.translations.ko.description }
          ]
        })
      });
      if (res.ok) {
        setForm({ 
          productCode: '', price: '', stock: '', 
          translations: { en: { name: '', description: '' }, ko: { name: '', description: '' } } 
        });
        fetchProducts(); // Refresh list
      }
    } catch (err) {
      console.error('Failed to create product', err);
    }
  };

  return (
    <>
      <section className="admin-panel add-product-panel">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ margin: 0 }}>Add New Product</h2>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button type="button" onClick={() => setLangTab('en')} style={{ padding: '0.4rem 1rem', borderRadius: '4px', border: '1px solid var(--border)', background: langTab === 'en' ? 'var(--accent)' : 'var(--bg-panel)', color: langTab === 'en' ? 'white' : 'var(--text-main)', cursor: 'pointer', fontWeight: 'bold' }}>English</button>
            <button type="button" onClick={() => setLangTab('ko')} style={{ padding: '0.4rem 1rem', borderRadius: '4px', border: '1px solid var(--border)', background: langTab === 'ko' ? 'var(--accent)' : 'var(--bg-panel)', color: langTab === 'ko' ? 'white' : 'var(--text-main)', cursor: 'pointer', fontWeight: 'bold' }}>Korean</button>
          </div>
        </div>
        <form onSubmit={handleSubmit} className="product-form">
          <div className="form-group">
            <label>Product Code (Optional)</label>
            <input type="text" value={form.productCode} onChange={e => setForm({...form, productCode: e.target.value})} placeholder="e.g. PRD-A001" />
          </div>
          <div className="form-group">
            <label>Product Name ({langTab.toUpperCase()})</label>
            <input type="text" value={form.translations[langTab as 'en'|'ko'].name} onChange={e => setForm({...form, translations: {...form.translations, [langTab]: {...form.translations[langTab as 'en'|'ko'], name: e.target.value}}})} placeholder="e.g. Wireless Mouse" />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Price ($)</label>
              <input type="number" value={form.price} onChange={e => setForm({...form, price: e.target.value})} placeholder="29" />
            </div>
            <div className="form-group">
              <label>Stock</label>
              <input type="number" value={form.stock} onChange={e => setForm({...form, stock: e.target.value})} placeholder="100" />
            </div>
          </div>
          <div className="form-group">
            <label>Description ({langTab.toUpperCase()})</label>
            <textarea value={form.translations[langTab as 'en'|'ko'].description} onChange={e => setForm({...form, translations: {...form.translations, [langTab]: {...form.translations[langTab as 'en'|'ko'], description: e.target.value}}})} placeholder="Product description..."></textarea>
          </div>
          <button type="submit" className="btn-primary">Save Product</button>
        </form>
      </section>

      <section className="admin-panel product-list-panel">
        <h2>Product Inventory</h2>
        {loading ? (
          <p>Loading products from database...</p>
        ) : (
          <div className="table-wrapper">
            <table className="product-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Product Code</th>
                  <th>Name</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Date Added</th>
                </tr>
              </thead>
              <tbody>
                {products.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center">No products found. Add one!</td>
                  </tr>
                ) : (
                  products.map(p => (
                    <tr key={p.id}>
                      <td>#{p.id}</td>
                      <td style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{p.productCode || '-'}</td>
                      <td className="fw-bold">{p.name}</td>
                      <td>${p.price.toLocaleString()}</td>
                      <td>
                        <span className={p.stock > 10 ? 'badge-success' : 'badge-warning'}>
                          {p.stock}
                        </span>
                      </td>
                      <td>{new Date(p.createdAt).toLocaleDateString()}</td>
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
