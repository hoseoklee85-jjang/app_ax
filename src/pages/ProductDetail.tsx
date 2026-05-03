import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

interface Product {
  id: string;
  productCode?: string;
  name: string;
  price: number;
  originalPrice?: number;
  description: string;
  stock: number;
  isDiscounted: boolean;
  status: string;
  createdAt: string;
  imageUrl?: string;
}

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editStock, setEditStock] = useState(0);
  const [editStatus, setEditStatus] = useState('ACTIVE');

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await fetch(`/api/products/${id}`);
        if (!res.ok) throw new Error('Failed to fetch');
        const data = await res.json();
        setProduct(data);
        setEditStock(data.stock);
        setEditStatus(data.status);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  if (loading) return <div className="admin-panel"><p>Loading product details...</p></div>;
  if (!product) return <div className="admin-panel"><p>Product not found.</p><button onClick={() => navigate('/products')} className="btn-secondary">Back to Products</button></div>;

  const handleSave = async () => {
    try {
      const res = await fetch(`/api/products/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stock: editStock, status: editStatus })
      });
      if (!res.ok) throw new Error('Failed to update product');
      const updatedProduct = await res.json();
      setProduct(updatedProduct);
      setIsEditing(false);
    } catch (err) {
      console.error(err);
      alert('Failed to update product.');
    }
  };

  return (
    <div className="product-detail-page">
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1.5rem', gap: '1rem' }}>
        <button onClick={() => navigate('/products')} className="btn-secondary" style={{ padding: '0.4rem 0.8rem' }}>&larr; Back</button>
        <h2 style={{ margin: 0 }}>Product Details</h2>
      </div>

      <section className="admin-panel" style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
        <div style={{ flex: '1 1 300px', display: 'flex', justifyContent: 'center', alignItems: 'center', background: 'var(--bg-main)', borderRadius: '8px', padding: '2rem', border: '1px solid var(--border)' }}>
          {product.imageUrl ? (
            <img src={product.imageUrl} alt={product.name} style={{ maxWidth: '100%', maxHeight: '400px', objectFit: 'contain' }} />
          ) : (
            <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
              <span style={{ fontSize: '4rem', display: 'block', marginBottom: '1rem' }}>📦</span>
              <p>No Image Available</p>
            </div>
          )}
        </div>
        
        <div style={{ flex: '2 1 400px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
            <div>
              <h1 style={{ fontSize: '2rem', margin: '0 0 0.5rem 0', color: 'var(--text-main)' }}>{product.name}</h1>
              <p style={{ color: 'var(--text-muted)', margin: 0 }}>SKU: {product.productCode || 'N/A'}</p>
            </div>
            <div>
              {isEditing ? (
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button onClick={handleSave} className="btn-primary" style={{ padding: '0.5rem 1rem' }}>Save</button>
                  <button onClick={() => { setIsEditing(false); setEditStock(product.stock); setEditStatus(product.status); }} className="btn-secondary" style={{ padding: '0.5rem 1rem' }}>Cancel</button>
                </div>
              ) : (
                <button onClick={() => setIsEditing(true)} className="btn-secondary" style={{ padding: '0.5rem 1rem' }}>Edit Product</button>
              )}
            </div>
          </div>

          <div style={{ padding: '1.5rem', background: 'var(--bg-main)', borderRadius: '8px', border: '1px solid var(--border)', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border)' }}>
              <span style={{ color: 'var(--text-muted)' }}>Price</span>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--accent)' }}>${product.price.toLocaleString()}</span>
                {product.isDiscounted && product.originalPrice && (
                  <span style={{ display: 'block', textDecoration: 'line-through', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                    ${product.originalPrice.toLocaleString()}
                  </span>
                )}
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Status</span>
              {isEditing ? (
                <select value={editStatus} onChange={e => setEditStatus(e.target.value)} style={{ padding: '0.3rem', borderRadius: '4px', border: '1px solid var(--border)', background: 'var(--bg-main)', color: 'var(--text-main)' }}>
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="INACTIVE">INACTIVE</option>
                  <option value="DISCONTINUED">DISCONTINUED</option>
                </select>
              ) : (
                <span className={product.status === 'ACTIVE' ? 'badge-success' : 'badge-warning'}>{product.status}</span>
              )}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Stock</span>
              {isEditing ? (
                <input type="number" value={editStock} onChange={e => setEditStock(parseInt(e.target.value) || 0)} style={{ width: '80px', padding: '0.3rem', borderRadius: '4px', border: '1px solid var(--border)', background: 'var(--bg-main)', color: 'var(--text-main)' }} />
              ) : (
                <span style={{ fontWeight: 'bold', color: product.stock > 10 ? 'var(--success)' : 'var(--danger)' }}>
                  {product.stock} units
                </span>
              )}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>Created At</span>
              <span>{new Date(product.createdAt).toLocaleString()}</span>
            </div>
          </div>

          <div>
            <h3 style={{ marginBottom: '0.5rem' }}>Description</h3>
            <div style={{ padding: '1rem', background: 'var(--bg-main)', borderRadius: '8px', border: '1px solid var(--border)', minHeight: '100px', whiteSpace: 'pre-wrap' }}>
              {product.description || 'No description provided.'}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
