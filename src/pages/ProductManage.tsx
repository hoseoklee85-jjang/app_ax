import { useState, useEffect } from 'react';

interface Product {
  id: number;
  name: string;
  price: number;
  description: string;
  stock: number;
  createdAt: string;
}

export default function ProductManage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: '', price: '', description: '', stock: '' });

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/products');
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
    if (!form.name || !form.price) return alert('Name and price are required.');
    
    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          price: parseInt(form.price),
          description: form.description,
          stock: parseInt(form.stock) || 0
        })
      });
      if (res.ok) {
        setForm({ name: '', price: '', description: '', stock: '' });
        fetchProducts(); // Refresh list
      }
    } catch (err) {
      console.error('Failed to create product', err);
    }
  };

  return (
    <>
      <section className="admin-panel add-product-panel">
        <h2>Add New Product</h2>
        <form onSubmit={handleSubmit} className="product-form">
          <div className="form-group">
            <label>Product Name</label>
            <input type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="e.g. Wireless Mouse" />
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
            <label>Description</label>
            <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} placeholder="Product description..."></textarea>
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
                  <th>Name</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Date Added</th>
                </tr>
              </thead>
              <tbody>
                {products.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center">No products found. Add one!</td>
                  </tr>
                ) : (
                  products.map(p => (
                    <tr key={p.id}>
                      <td>#{p.id}</td>
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
