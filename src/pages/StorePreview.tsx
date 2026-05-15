export default function StorePreview() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 80px)', width: '100%', padding: '1rem', boxSizing: 'border-box', background: '#f1f5f9' }}>
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        height: '100%', 
        width: '100%', 
        borderRadius: '12px', 
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 15px rgba(0,0,0,0.05)',
        border: '1px solid #cbd5e1',
        overflow: 'hidden',
        background: '#fff'
      }}>
        <div style={{ 
          background: '#e2e8f0', 
          padding: '12px 16px', 
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          borderBottom: '1px solid #cbd5e1'
        }}>
          {/* Fake window buttons */}
          <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#ff5f56' }} />
          <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#ffbd2e' }} />
          <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#27c93f' }} />
          <div style={{ flex: 1, textAlign: 'center', color: '#1e293b', fontSize: '0.95rem', fontWeight: 800, letterSpacing: '1px' }}>
            LIVE STORE PREVIEW
          </div>
          <div style={{ width: '52px' }}></div> {/* Spacer to center the text */}
        </div>
        <iframe 
          id="store-preview-iframe"
          src="http://localhost:4321/products" 
          title="Store Preview"
          style={{ width: '100%', flex: 1, border: 'none', background: '#fff' }}
        />
      </div>
    </div>
  );
}
