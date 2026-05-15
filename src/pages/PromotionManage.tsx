import { useState, useEffect } from 'react';

// Common Types
interface Product {
  id: number;
  name: string;
  price: number;
}

export default function PromotionManage() {
  const [activeTab, setActiveTab] = useState<'coupon' | 'timesale' | 'preorder' | 'pto' | 'addon'>('coupon');
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoadingProducts(true);
      try {
        const storeId = localStorage.getItem('storeId') || 'ALL';
        const res = await fetch(`/api/products?storeId=${storeId}`);
        if (res.ok) {
          const data = await res.json();
          setProducts(data);
        }
      } catch (err) {
        console.error('Failed to fetch products', err);
      } finally {
        setLoadingProducts(false);
      }
    };
    fetchProducts();
  }, []);

  // --- 1. Coupon Management ---
  const [coupons, setCoupons] = useState([
    { id: 1, code: 'WELCOME10', type: 'percentage', value: 10, expiry: '2026-12-31' },
    { id: 2, code: 'MINUS50', type: 'fixed', value: 50, expiry: '2026-06-30' }
  ]);
  const [couponForm, setCouponForm] = useState({ code: '', type: 'percentage', value: '', expiry: '' });

  const handleCreateCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponForm.code || !couponForm.value) return;
    setCoupons([...coupons, { id: Date.now(), code: couponForm.code, type: couponForm.type, value: Number(couponForm.value), expiry: couponForm.expiry }]);
    setCouponForm({ code: '', type: 'percentage', value: '', expiry: '' });
  };

  const handleDownloadCouponProducts = (code: string) => {
    let csvContent = "data:text/csv;charset=utf-8,SKU,Coupon_Code,Name\n";
    const target = code;
    for (let i = 1; i <= 35; i++) {
      csvContent += `PRD-${target}-${i},${target},Eligible Product ${i}\n`;
    }
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `eligible_products_${target}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // --- 2. Timesale Management ---
  const [timesales, setTimesales] = useState([
    { id: 1, productId: 1, discountPrice: 99, start: '2026-05-01T00:00', end: '2026-05-03T23:59' }
  ]);
  const [timesaleForm, setTimesaleForm] = useState({ productId: '', discountPrice: '', start: '', end: '' });

  const handleCreateTimesale = (e: React.FormEvent) => {
    e.preventDefault();
    if (!timesaleForm.productId || !timesaleForm.discountPrice) return;
    setTimesales([...timesales, { id: Date.now(), productId: Number(timesaleForm.productId), discountPrice: Number(timesaleForm.discountPrice), start: timesaleForm.start, end: timesaleForm.end }]);
    setTimesaleForm({ productId: '', discountPrice: '', start: '', end: '' });
  };

  // --- 3. Pre-order Management ---
  const [preorders, setPreorders] = useState([
    { id: 1, productId: 2, shippingDate: '2026-07-01' }
  ]);
  const [preorderForm, setPreorderForm] = useState({ productId: '', shippingDate: '' });

  const handleCreatePreorder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!preorderForm.productId || !preorderForm.shippingDate) return;
    setPreorders([...preorders, { id: Date.now(), productId: Number(preorderForm.productId), shippingDate: preorderForm.shippingDate }]);
    setPreorderForm({ productId: '', shippingDate: '' });
  };

  // --- 4. PTO Bundle Management ---
  const [ptoBundles, setPtoBundles] = useState([
    { id: 1, name: 'Home Office Set', productId1: 3, productId2: 4, bundlePrice: 150 }
  ]);
  const [ptoForm, setPtoForm] = useState({ name: '', productId1: '', productId2: '', bundlePrice: '' });

  const handleCreatePtoBundle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ptoForm.productId1 || !ptoForm.productId2 || !ptoForm.bundlePrice) return;
    setPtoBundles([...ptoBundles, { id: Date.now(), name: ptoForm.name, productId1: Number(ptoForm.productId1), productId2: Number(ptoForm.productId2), bundlePrice: Number(ptoForm.bundlePrice) }]);
    setPtoForm({ name: '', productId1: '', productId2: '', bundlePrice: '' });
  };

  // --- 5. Add-on Bundle Management ---
  const [addonBundles, setAddonBundles] = useState([
    { id: 1, mainProductId: 1, addonProductId: 5, addonPrice: 19 }
  ]);
  const [addonForm, setAddonForm] = useState({ mainProductId: '', addonProductId: '', addonPrice: '' });

  const handleCreateAddonBundle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!addonForm.mainProductId || !addonForm.addonProductId || !addonForm.addonPrice) return;
    setAddonBundles([...addonBundles, { id: Date.now(), mainProductId: Number(addonForm.mainProductId), addonProductId: Number(addonForm.addonProductId), addonPrice: Number(addonForm.addonPrice) }]);
    setAddonForm({ mainProductId: '', addonProductId: '', addonPrice: '' });
  };

  const getProductName = (id: number) => {
    const product = products.find(p => p.id === id);
    return product ? product.name : `Product #${id}`;
  };

  const menuItems = [
    { id: 'coupon', label: '🎟️ Coupon Management' },
    { id: 'timesale', label: '⏱️ Timesale Management' },
    { id: 'preorder', label: '📦 Pre-order Management' },
    { id: 'pto', label: '🎁 PTO Bundle Management' },
    { id: 'addon', label: '➕ Add-on Bundle Management' },
  ];

  return (
    <>
      {/* LEFT COLUMN: Vertical Navigation */}
      <section className="admin-panel" style={{ padding: '1rem' }}>
        <h2 style={{ paddingLeft: '0.5rem', marginBottom: '1rem' }}>Promotions</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {menuItems.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as any)}
              style={{
                textAlign: 'left',
                padding: '1rem',
                border: 'none',
                borderRadius: '8px',
                background: activeTab === item.id ? 'var(--accent-bg, rgba(165, 0, 52, 0.1))' : 'transparent',
                color: activeTab === item.id ? 'var(--accent)' : 'var(--text-main)',
                fontWeight: activeTab === item.id ? 'bold' : 'normal',
                cursor: 'pointer',
                transition: 'all 0.2s',
                fontSize: '1rem'
              }}
              onMouseOver={(e) => {
                if (activeTab !== item.id) {
                  e.currentTarget.style.background = 'var(--bg-main)';
                }
              }}
              onMouseOut={(e) => {
                if (activeTab !== item.id) {
                  e.currentTarget.style.background = 'transparent';
                }
              }}
            >
              {item.label}
            </button>
          ))}
        </div>
      </section>

      {/* RIGHT COLUMN: Content Panel */}
      <section className="admin-panel">
        {/* 1. Coupon Management */}
        {activeTab === 'coupon' && (
          <>
            <h2>Coupon Management</h2>
            <form onSubmit={handleCreateCoupon} className="product-form" style={{ marginBottom: '2rem' }}>
              <div className="form-row">
                <div className="form-group">
                  <label>Coupon Code</label>
                  <input type="text" value={couponForm.code} onChange={e => setCouponForm({...couponForm, code: e.target.value})} placeholder="e.g. SUMMER24" required />
                </div>
                <div className="form-group">
                  <label>Discount Type</label>
                  <select value={couponForm.type} onChange={e => setCouponForm({...couponForm, type: e.target.value})}>
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Amount ($)</option>
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Discount Value</label>
                  <input type="number" value={couponForm.value} onChange={e => setCouponForm({...couponForm, value: e.target.value})} placeholder="10" required />
                </div>
                <div className="form-group">
                  <label>Expiry Date</label>
                  <input type="date" value={couponForm.expiry} onChange={e => setCouponForm({...couponForm, expiry: e.target.value})} required />
                </div>
              </div>
              <button type="submit" className="btn-primary">Create Coupon</button>
            </form>

            <div className="table-wrapper">
              <table className="product-table">
                <thead><tr><th>Code</th><th>Type</th><th>Value</th><th>Expiry</th><th>Action</th></tr></thead>
                <tbody>
                  {coupons.map(c => (
                    <tr key={c.id}>
                      <td className="fw-bold">{c.code}</td>
                      <td style={{ textTransform: 'capitalize' }}>{c.type}</td>
                      <td>{c.type === 'percentage' ? `${c.value}%` : `$${c.value}`}</td>
                      <td>{c.expiry}</td>
                      <td>
                        <button 
                          onClick={() => handleDownloadCouponProducts(c.code)}
                          style={{
                            background: '#f1f5f9',
                            border: '1px solid #cbd5e1',
                            color: '#334155',
                            padding: '4px 10px',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '0.8rem',
                            fontWeight: 'bold',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                        >
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                          Download Applied Products
                        </button>
                      </td>
                    </tr>
                  ))}
                  {coupons.length === 0 && <tr><td colSpan={5} className="text-center">No coupons found.</td></tr>}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* 2. Timesale Management */}
        {activeTab === 'timesale' && (
          <>
            <h2>Timesale Management</h2>
            <form onSubmit={handleCreateTimesale} className="product-form" style={{ marginBottom: '2rem' }}>
              <div className="form-row">
                <div className="form-group" style={{ flex: 2 }}>
                  <label>Select Product</label>
                  <select value={timesaleForm.productId} onChange={e => setTimesaleForm({...timesaleForm, productId: e.target.value})} required>
                    <option value="">-- Select Product --</option>
                    {products.map(p => <option key={p.id} value={p.id}>{p.name} (Retail: ${p.price})</option>)}
                  </select>
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Discount Price ($)</label>
                  <input type="number" value={timesaleForm.discountPrice} onChange={e => setTimesaleForm({...timesaleForm, discountPrice: e.target.value})} placeholder="e.g. 99" required />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Start Time</label>
                  <input type="datetime-local" value={timesaleForm.start} onChange={e => setTimesaleForm({...timesaleForm, start: e.target.value})} required />
                </div>
                <div className="form-group">
                  <label>End Time</label>
                  <input type="datetime-local" value={timesaleForm.end} onChange={e => setTimesaleForm({...timesaleForm, end: e.target.value})} required />
                </div>
              </div>
              <button type="submit" className="btn-primary">Create Timesale</button>
            </form>

            <div className="table-wrapper">
              <table className="product-table">
                <thead><tr><th>Product</th><th>Discount Price</th><th>Start Time</th><th>End Time</th></tr></thead>
                <tbody>
                  {timesales.map(t => (
                    <tr key={t.id}>
                      <td className="fw-bold">{getProductName(t.productId)}</td>
                      <td style={{ color: 'var(--warning)', fontWeight: 'bold' }}>${t.discountPrice}</td>
                      <td>{t.start.replace('T', ' ')}</td>
                      <td>{t.end.replace('T', ' ')}</td>
                    </tr>
                  ))}
                  {timesales.length === 0 && <tr><td colSpan={4} className="text-center">No active timesales.</td></tr>}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* 3. Pre-order Management */}
        {activeTab === 'preorder' && (
          <>
            <h2>Pre-order Management</h2>
            <form onSubmit={handleCreatePreorder} className="product-form" style={{ marginBottom: '2rem' }}>
              <div className="form-row">
                <div className="form-group">
                  <label>Select Product</label>
                  <select value={preorderForm.productId} onChange={e => setPreorderForm({...preorderForm, productId: e.target.value})} required>
                    <option value="">-- Select Product --</option>
                    {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Expected Shipping Date</label>
                  <input type="date" value={preorderForm.shippingDate} onChange={e => setPreorderForm({...preorderForm, shippingDate: e.target.value})} required />
                </div>
              </div>
              <button type="submit" className="btn-primary">Enable Pre-order</button>
            </form>

            <div className="table-wrapper">
              <table className="product-table">
                <thead><tr><th>Product</th><th>Shipping Date</th><th>Status</th></tr></thead>
                <tbody>
                  {preorders.map(p => (
                    <tr key={p.id}>
                      <td className="fw-bold">{getProductName(p.productId)}</td>
                      <td>{p.shippingDate}</td>
                      <td><span className="badge-warning">Pre-order Active</span></td>
                    </tr>
                  ))}
                  {preorders.length === 0 && <tr><td colSpan={3} className="text-center">No pre-order configurations.</td></tr>}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* 4. PTO Bundle Management */}
        {activeTab === 'pto' && (
          <>
            <h2>PTO Bundle (Pick Two Options)</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>Group two distinct items to offer a special bundle price.</p>
            <form onSubmit={handleCreatePtoBundle} className="product-form" style={{ marginBottom: '2rem' }}>
              <div className="form-group">
                <label>Bundle Name</label>
                <input type="text" value={ptoForm.name} onChange={e => setPtoForm({...ptoForm, name: e.target.value})} placeholder="e.g. Essential Work Set" required />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Product 1</label>
                  <select value={ptoForm.productId1} onChange={e => setPtoForm({...ptoForm, productId1: e.target.value})} required>
                    <option value="">-- Select Product 1 --</option>
                    {products.map(p => <option key={p.id} value={p.id}>{p.name} (${p.price})</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Product 2</label>
                  <select value={ptoForm.productId2} onChange={e => setPtoForm({...ptoForm, productId2: e.target.value})} required>
                    <option value="">-- Select Product 2 --</option>
                    {products.map(p => <option key={p.id} value={p.id}>{p.name} (${p.price})</option>)}
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label>Special Bundle Price ($)</label>
                <input type="number" value={ptoForm.bundlePrice} onChange={e => setPtoForm({...ptoForm, bundlePrice: e.target.value})} placeholder="e.g. 150" required />
              </div>
              <button type="submit" className="btn-primary">Create PTO Bundle</button>
            </form>

            <div className="table-wrapper">
              <table className="product-table">
                <thead><tr><th>Bundle Name</th><th>Product 1</th><th>Product 2</th><th>Bundle Price</th></tr></thead>
                <tbody>
                  {ptoBundles.map(b => (
                    <tr key={b.id}>
                      <td className="fw-bold">{b.name}</td>
                      <td>{getProductName(b.productId1)}</td>
                      <td>{getProductName(b.productId2)}</td>
                      <td style={{ color: 'var(--warning)', fontWeight: 'bold' }}>${b.bundlePrice}</td>
                    </tr>
                  ))}
                  {ptoBundles.length === 0 && <tr><td colSpan={4} className="text-center">No bundles found.</td></tr>}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* 5. Add-on Bundle Management */}
        {activeTab === 'addon' && (
          <>
            <h2>Add-on Bundle Management</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>Offer a discount on an Add-on item when bought together with the Main Product.</p>
            <form onSubmit={handleCreateAddonBundle} className="product-form" style={{ marginBottom: '2rem' }}>
              <div className="form-row">
                <div className="form-group">
                  <label>Main Product</label>
                  <select value={addonForm.mainProductId} onChange={e => setAddonForm({...addonForm, mainProductId: e.target.value})} required>
                    <option value="">-- Select Main Product --</option>
                    {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Add-on Product</label>
                  <select value={addonForm.addonProductId} onChange={e => setAddonForm({...addonForm, addonProductId: e.target.value})} required>
                    <option value="">-- Select Add-on Product --</option>
                    {products.map(p => <option key={p.id} value={p.id}>{p.name} (Retail: ${p.price})</option>)}
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label>Add-on Special Price ($)</label>
                <input type="number" value={addonForm.addonPrice} onChange={e => setAddonForm({...addonForm, addonPrice: e.target.value})} placeholder="e.g. 19" required />
              </div>
              <button type="submit" className="btn-primary">Create Add-on Bundle</button>
            </form>

            <div className="table-wrapper">
              <table className="product-table">
                <thead><tr><th>Main Product</th><th>Add-on Product</th><th>Add-on Price</th></tr></thead>
                <tbody>
                  {addonBundles.map(b => (
                    <tr key={b.id}>
                      <td className="fw-bold">{getProductName(b.mainProductId)}</td>
                      <td><span className="badge-success">Add-on:</span> {getProductName(b.addonProductId)}</td>
                      <td style={{ color: 'var(--warning)', fontWeight: 'bold' }}>${b.addonPrice}</td>
                    </tr>
                  ))}
                  {addonBundles.length === 0 && <tr><td colSpan={3} className="text-center">No add-ons found.</td></tr>}
                </tbody>
              </table>
            </div>
          </>
        )}
      </section>
    </>
  );
}
