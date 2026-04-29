export default function StorePreview() {
  return (
    <div style={{ height: 'calc(100vh - 80px)', width: '100%', margin: '-2rem' }}>
      <iframe 
        id="store-preview-iframe"
        src="http://localhost:4321/products" 
        title="Store Preview"
        style={{ width: '100%', height: '100%', border: 'none', background: '#fff' }}
      />
    </div>
  );
}
