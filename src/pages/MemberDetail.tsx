import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';

interface MemberAddress {
  id: string;
  addressType: string;
  recipientName?: string;
  street: string;
  addressLine1?: string;
  addressLine2?: string;
  addressLine3?: string;
  phoneNumber?: string;
  email?: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  countryCode?: string;
  isDefault: boolean;
}

interface Member {
  id: string;
  websiteId: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  customerGroup: string;
  status: string;
  dateOfBirth: string;
  createdAt: string;
  updatedAt: string;
  storeCountry: string | null;
  addresses: MemberAddress[];
  orders?: any[];
}

export default function MemberDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [member, setMember] = useState<Member | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editStatus, setEditStatus] = useState('ACTIVE');
  const [editGroup, setEditGroup] = useState('General');
  const [editAddresses, setEditAddresses] = useState<MemberAddress[]>([]);

  useEffect(() => {
    const fetchMember = async () => {
      try {
        const res = await fetch(`/api/members/${id}`);
        if (!res.ok) throw new Error('Failed to fetch member details');
        const data = await res.json();
        setMember(data);
        setEditStatus(data.status || 'ACTIVE');
        setEditGroup(data.customerGroup || 'GENERAL');
        setEditAddresses(JSON.parse(JSON.stringify(data.addresses || [])));
      } catch (err) {
        console.error(err);
        alert('고객 정보를 불러올 수 없습니다.');
        navigate('/members');
      } finally {
        setLoading(false);
      }
    };
    fetchMember();
  }, [id, navigate]);

  if (loading) return <p>Loading customer details...</p>;
  if (!member) return <p>Customer not found.</p>;

  const handleAddressChange = (addrId: string, field: string, value: string) => {
    setEditAddresses(prev => prev.map(a => a.id === addrId ? { ...a, [field]: value } : a));
  };

  const currentAddresses = isEditing ? editAddresses : (member.addresses || []);
  const shippingAddresses = currentAddresses.filter(a => a.addressType === 'SHIPPING');
  const billingAddresses = currentAddresses.filter(a => a.addressType === 'BILLING');

  const handleSave = async () => {
    try {
      const res = await fetch(`/api/members/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: editStatus, customerGroup: editGroup, addresses: editAddresses })
      });
      if (!res.ok) throw new Error('Failed to update member');
      const updatedMember = await res.json();
      setMember(updatedMember);
      setIsEditing(false);
    } catch (err) {
      console.error(err);
      alert('Failed to update customer.');
    }
  };

  return (
    <div style={{ width: '100%', paddingBottom: '3rem' }}>
      {/* Header Banner */}
      <div style={{ 
        background: 'linear-gradient(135deg, var(--bg-panel) 0%, #f8fafc 100%)', 
        borderRadius: '16px', 
        padding: '2rem', 
        marginBottom: '2rem',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
        border: '1px solid var(--border)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start'
      }}>
        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
          {/* Avatar */}
          <div style={{
            width: '80px', height: '80px', borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--accent) 0%, #475569 100%)',
            display: 'flex', justifyContent: 'center', alignItems: 'center',
            color: 'white', fontSize: '2rem', fontWeight: 'bold',
            boxShadow: '0 10px 15px -3px rgba(59, 130, 246, 0.3)'
          }}>
            {member.firstName ? member.firstName.charAt(0).toUpperCase() : member.email.charAt(0).toUpperCase()}
          </div>
          <div>
            <Link to="/members" style={{ color: '#64748b', textDecoration: 'none', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.25rem', marginBottom: '0.5rem', transition: 'color 0.2s' }}>
              ← Back to Customers
            </Link>
            <h2 style={{ margin: 0, fontSize: '1.8rem', color: '#0f172a', fontWeight: '800', letterSpacing: '-0.02em' }}>
              {member.firstName || member.lastName ? `${member.firstName || ''} ${member.lastName || ''}` : 'No Name Provided'}
            </h2>
            <p style={{ margin: '0.25rem 0 0 0', color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              #{member.id} • {member.email}
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'flex-end' }}>
          {isEditing ? (
            <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
              <select value={editStatus} onChange={e => setEditStatus(e.target.value)} style={{ padding: '0.4rem', borderRadius: '8px', border: '1px solid var(--border)', fontWeight: 'bold' }}>
                <option value="ACTIVE">ACTIVE</option>
                <option value="INACTIVE">INACTIVE</option>
                <option value="SUSPENDED">SUSPENDED</option>
              </select>
              <button onClick={handleSave} className="btn-primary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.9rem' }}>Save</button>
              <button onClick={() => { setIsEditing(false); setEditStatus(member.status); setEditGroup(member.customerGroup || 'GENERAL'); setEditAddresses(JSON.parse(JSON.stringify(member.addresses || []))); }} className="btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.9rem' }}>Cancel</button>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <span style={{ 
                padding: '0.5rem 1.25rem', 
                borderRadius: '999px', 
                fontSize: '0.875rem', 
                fontWeight: '700',
                background: member.status === 'ACTIVE' ? '#dcfce7' : '#fef08a',
                color: member.status === 'ACTIVE' ? '#166534' : '#854d0e',
                border: `1px solid ${member.status === 'ACTIVE' ? '#bbf7d0' : '#fde047'}`,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: member.status === 'ACTIVE' ? '#22c55e' : '#eab308' }}></span>
                {member.status}
              </span>
              <button onClick={() => setIsEditing(true)} className="btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.9rem' }}>Edit Account</button>
            </div>
          )}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        
        {/* Left Side: Info */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          {/* Personal Info */}
          <section style={{ background: 'var(--bg-panel)', borderRadius: '16px', padding: '2rem', border: '1px solid var(--border)', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <h3 style={{ marginTop: 0, marginBottom: '1.5rem', color: '#0f172a', fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              👤 Personal Information
            </h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '0.25rem', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: '600' }}>Phone</div>
                <div style={{ color: '#0f172a', fontWeight: '500', fontSize: '1.05rem' }}>{member.phoneNumber || 'Not provided'}</div>
              </div>
              <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '0.25rem', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: '600' }}>Date of Birth</div>
                <div style={{ color: '#0f172a', fontWeight: '500', fontSize: '1.05rem' }}>{member.dateOfBirth || 'Not provided'}</div>
              </div>
              <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '12px', border: '1px solid #e2e8f0', gridColumn: '1 / -1' }}>
                <div style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '0.25rem', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: '600' }}>Email Address</div>
                <div style={{ color: '#0f172a', fontWeight: '500', fontSize: '1.05rem' }}>{member.email}</div>
              </div>
            </div>
          </section>

          {/* Account Details */}
          <section style={{ background: 'var(--bg-panel)', borderRadius: '16px', padding: '2rem', border: '1px solid var(--border)', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ margin: 0, color: '#0f172a', fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                🛡️ Account Details
              </h3>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              <div style={{ padding: '0.5rem 0', borderBottom: '1px solid #f1f5f9' }}>
                <div style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '0.25rem' }}>Store (Country)</div>
                <div style={{ color: 'var(--accent)', fontWeight: '700', fontSize: '1.1rem' }}>{member.storeCountry || member.websiteId || 'Unknown'}</div>
              </div>
              <div style={{ padding: '0.5rem 0', borderBottom: '1px solid #f1f5f9' }}>
                <div style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '0.25rem' }}>Customer Group</div>
                <div style={{ color: '#0f172a', fontWeight: '600', fontSize: '1rem' }}>
                  {isEditing ? (
                    <select value={editGroup} onChange={e => setEditGroup(e.target.value)} style={{ padding: '0.3rem', borderRadius: '6px', border: '1px solid var(--border)', width: '100%' }}>
                      <option value="GENERAL">GENERAL</option>
                      <option value="VIP">VIP</option>
                      <option value="B2B">B2B</option>
                      <option value="WHOLESALE">WHOLESALE</option>
                    </select>
                  ) : (
                    <span style={{ background: '#e2e8f0', padding: '0.2rem 0.6rem', borderRadius: '6px' }}>{member.customerGroup || 'GENERAL'}</span>
                  )}
                </div>
              </div>
              <div style={{ padding: '0.5rem 0' }}>
                <div style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '0.25rem' }}>Join Date</div>
                <div style={{ color: '#0f172a', fontWeight: '500' }}>{new Date(member.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
              </div>
              <div style={{ padding: '0.5rem 0' }}>
                <div style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '0.25rem' }}>Last Updated</div>
                <div style={{ color: '#0f172a', fontWeight: '500' }}>{new Date(member.updatedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
              </div>
            </div>
          </section>
        </div>

        {/* Right Side: Addresses */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          {/* Shipping Address Book */}
          <section style={{ background: 'var(--bg-panel)', borderRadius: '16px', padding: '2rem', border: '1px solid var(--border)', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ margin: 0, color: '#0f172a', fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                📦 Shipping Addresses
                <span style={{ background: '#f1f5f9', color: '#64748b', padding: '0.1rem 0.6rem', borderRadius: '999px', fontSize: '0.85rem' }}>{shippingAddresses.length}</span>
              </h3>
            </div>
            
            {shippingAddresses.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {shippingAddresses.map(addr => (
                  <div key={addr.id} style={{ 
                    padding: '1.5rem', 
                    border: addr.isDefault ? '2px solid var(--accent)' : '1px solid #e2e8f0', 
                    borderRadius: '12px', 
                    background: addr.isDefault ? '#eff6ff' : '#ffffff',
                    position: 'relative',
                    transition: 'all 0.2s',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
                  }}>
                    {addr.isDefault && (
                      <span style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'var(--accent)', color: 'white', fontSize: '0.7rem', fontWeight: 'bold', padding: '0.2rem 0.6rem', borderRadius: '999px', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                        Default
                      </span>
                    )}
                    {isEditing ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '1rem' }}>
                        <input value={addr.recipientName || ''} onChange={e => handleAddressChange(addr.id, 'recipientName', e.target.value)} placeholder="Recipient Name" style={{ padding: '0.4rem', borderRadius: '6px', border: '1px solid var(--border)', fontWeight: 'bold' }} />
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <input value={addr.state || ''} onChange={e => handleAddressChange(addr.id, 'state', e.target.value)} placeholder="State" style={{ flex: 1, padding: '0.4rem', borderRadius: '6px', border: '1px solid var(--border)' }} />
                          <input value={addr.city || ''} onChange={e => handleAddressChange(addr.id, 'city', e.target.value)} placeholder="City" style={{ flex: 1, padding: '0.4rem', borderRadius: '6px', border: '1px solid var(--border)' }} />
                          <input value={addr.zipCode || ''} onChange={e => handleAddressChange(addr.id, 'zipCode', e.target.value)} placeholder="Zip Code" style={{ flex: 1, padding: '0.4rem', borderRadius: '6px', border: '1px solid var(--border)' }} />
                        </div>
                        <input value={addr.addressLine1 || addr.street || ''} onChange={e => handleAddressChange(addr.id, 'addressLine1', e.target.value)} placeholder="Address Line 1" style={{ padding: '0.4rem', borderRadius: '6px', border: '1px solid var(--border)' }} />
                        <input value={addr.addressLine2 || ''} onChange={e => handleAddressChange(addr.id, 'addressLine2', e.target.value)} placeholder="Address Line 2" style={{ padding: '0.4rem', borderRadius: '6px', border: '1px solid var(--border)' }} />
                        <input value={addr.addressLine3 || ''} onChange={e => handleAddressChange(addr.id, 'addressLine3', e.target.value)} placeholder="Address Line 3" style={{ padding: '0.4rem', borderRadius: '6px', border: '1px solid var(--border)' }} />
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <input value={addr.phoneNumber || ''} onChange={e => handleAddressChange(addr.id, 'phoneNumber', e.target.value)} placeholder="Phone Number" style={{ flex: 1, padding: '0.4rem', borderRadius: '6px', border: '1px solid var(--border)' }} />
                          <input value={addr.email || ''} onChange={e => handleAddressChange(addr.id, 'email', e.target.value)} placeholder="Email" style={{ flex: 1, padding: '0.4rem', borderRadius: '6px', border: '1px solid var(--border)' }} />
                        </div>
                      </div>
                    ) : (
                      <>
                        <h4 style={{ margin: '0 0 0.5rem 0', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          📍 {addr.state}, {addr.city}, {addr.zipCode}
                        </h4>
                        {addr.recipientName && <p style={{ margin: '0 0 0.25rem 0', color: '#0f172a', fontSize: '0.95rem', paddingLeft: '1.75rem', fontWeight: 'bold' }}>👤 {addr.recipientName}</p>}
                        <p style={{ margin: '0 0 0.25rem 0', color: '#475569', fontSize: '0.95rem', paddingLeft: '1.75rem' }}>
                          {addr.addressLine1 || addr.street}
                        </p>
                        {addr.addressLine2 && <p style={{ margin: '0 0 0.25rem 0', color: '#475569', fontSize: '0.95rem', paddingLeft: '1.75rem' }}>{addr.addressLine2}</p>}
                        {addr.addressLine3 && <p style={{ margin: '0 0 0.25rem 0', color: '#475569', fontSize: '0.95rem', paddingLeft: '1.75rem' }}>{addr.addressLine3}</p>}
                        {(addr.phoneNumber || addr.email) && (
                          <div style={{ paddingLeft: '1.75rem', marginTop: '0.5rem', fontSize: '0.85rem', color: '#64748b' }}>
                            {addr.phoneNumber && <div>📞 {addr.phoneNumber}</div>}
                            {addr.email && <div>✉️ {addr.email}</div>}
                          </div>
                        )}
                        <p style={{ margin: '0.5rem 0 0 0', color: '#94a3b8', fontSize: '0.9rem', paddingLeft: '1.75rem', fontWeight: '500' }}>{addr.country || addr.countryCode}</p>
                      </>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ padding: '3rem', border: '2px dashed #e2e8f0', borderRadius: '12px', textAlign: 'center', color: '#94a3b8' }}>
                <p style={{ margin: 0, fontSize: '1.1rem' }}>No shipping addresses found.</p>
              </div>
            )}
          </section>

          {/* Billing Address Book */}
          <section style={{ background: 'var(--bg-panel)', borderRadius: '16px', padding: '2rem', border: '1px solid var(--border)', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ margin: 0, color: '#0f172a', fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                💳 Billing Addresses
                <span style={{ background: '#f1f5f9', color: '#64748b', padding: '0.1rem 0.6rem', borderRadius: '999px', fontSize: '0.85rem' }}>{billingAddresses.length}</span>
              </h3>
            </div>
            
            {billingAddresses.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {billingAddresses.map(addr => (
                  <div key={addr.id} style={{ 
                    padding: '1.5rem', 
                    border: addr.isDefault ? '2px solid #475569' : '1px solid #e2e8f0', 
                    borderRadius: '12px', 
                    background: addr.isDefault ? '#f5f3ff' : '#ffffff',
                    position: 'relative',
                    transition: 'all 0.2s',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
                  }}>
                    {addr.isDefault && (
                      <span style={{ position: 'absolute', top: '1rem', right: '1rem', background: '#475569', color: 'white', fontSize: '0.7rem', fontWeight: 'bold', padding: '0.2rem 0.6rem', borderRadius: '999px', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                        Default
                      </span>
                    )}
                    {isEditing ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '1rem' }}>
                        <input value={addr.recipientName || ''} onChange={e => handleAddressChange(addr.id, 'recipientName', e.target.value)} placeholder="Recipient Name" style={{ padding: '0.4rem', borderRadius: '6px', border: '1px solid var(--border)', fontWeight: 'bold' }} />
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <input value={addr.state || ''} onChange={e => handleAddressChange(addr.id, 'state', e.target.value)} placeholder="State" style={{ flex: 1, padding: '0.4rem', borderRadius: '6px', border: '1px solid var(--border)' }} />
                          <input value={addr.city || ''} onChange={e => handleAddressChange(addr.id, 'city', e.target.value)} placeholder="City" style={{ flex: 1, padding: '0.4rem', borderRadius: '6px', border: '1px solid var(--border)' }} />
                          <input value={addr.zipCode || ''} onChange={e => handleAddressChange(addr.id, 'zipCode', e.target.value)} placeholder="Zip Code" style={{ flex: 1, padding: '0.4rem', borderRadius: '6px', border: '1px solid var(--border)' }} />
                        </div>
                        <input value={addr.addressLine1 || addr.street || ''} onChange={e => handleAddressChange(addr.id, 'addressLine1', e.target.value)} placeholder="Address Line 1" style={{ padding: '0.4rem', borderRadius: '6px', border: '1px solid var(--border)' }} />
                        <input value={addr.addressLine2 || ''} onChange={e => handleAddressChange(addr.id, 'addressLine2', e.target.value)} placeholder="Address Line 2" style={{ padding: '0.4rem', borderRadius: '6px', border: '1px solid var(--border)' }} />
                        <input value={addr.addressLine3 || ''} onChange={e => handleAddressChange(addr.id, 'addressLine3', e.target.value)} placeholder="Address Line 3" style={{ padding: '0.4rem', borderRadius: '6px', border: '1px solid var(--border)' }} />
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <input value={addr.phoneNumber || ''} onChange={e => handleAddressChange(addr.id, 'phoneNumber', e.target.value)} placeholder="Phone Number" style={{ flex: 1, padding: '0.4rem', borderRadius: '6px', border: '1px solid var(--border)' }} />
                          <input value={addr.email || ''} onChange={e => handleAddressChange(addr.id, 'email', e.target.value)} placeholder="Email" style={{ flex: 1, padding: '0.4rem', borderRadius: '6px', border: '1px solid var(--border)' }} />
                        </div>
                      </div>
                    ) : (
                      <>
                        <h4 style={{ margin: '0 0 0.5rem 0', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          🏢 {addr.state}, {addr.city}, {addr.zipCode}
                        </h4>
                        {addr.recipientName && <p style={{ margin: '0 0 0.25rem 0', color: '#0f172a', fontSize: '0.95rem', paddingLeft: '1.75rem', fontWeight: 'bold' }}>👤 {addr.recipientName}</p>}
                        <p style={{ margin: '0 0 0.25rem 0', color: '#475569', fontSize: '0.95rem', paddingLeft: '1.75rem' }}>
                          {addr.addressLine1 || addr.street}
                        </p>
                        {addr.addressLine2 && <p style={{ margin: '0 0 0.25rem 0', color: '#475569', fontSize: '0.95rem', paddingLeft: '1.75rem' }}>{addr.addressLine2}</p>}
                        {addr.addressLine3 && <p style={{ margin: '0 0 0.25rem 0', color: '#475569', fontSize: '0.95rem', paddingLeft: '1.75rem' }}>{addr.addressLine3}</p>}
                        {(addr.phoneNumber || addr.email) && (
                          <div style={{ paddingLeft: '1.75rem', marginTop: '0.5rem', fontSize: '0.85rem', color: '#64748b' }}>
                            {addr.phoneNumber && <div>📞 {addr.phoneNumber}</div>}
                            {addr.email && <div>✉️ {addr.email}</div>}
                          </div>
                        )}
                        <p style={{ margin: '0.5rem 0 0 0', color: '#94a3b8', fontSize: '0.9rem', paddingLeft: '1.75rem', fontWeight: '500' }}>{addr.country || addr.countryCode}</p>
                      </>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ padding: '3rem', border: '2px dashed #e2e8f0', borderRadius: '12px', textAlign: 'center', color: '#94a3b8' }}>
                <p style={{ margin: 0, fontSize: '1.1rem' }}>No billing addresses found.</p>
              </div>
            )}
          </section>
        </div>

        {/* Bottom Section: Order History (Spans full width) */}
        <div style={{ gridColumn: '1 / -1', marginTop: '1rem' }}>
          <section style={{ background: 'var(--bg-panel)', borderRadius: '16px', padding: '2rem', border: '1px solid var(--border)', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ margin: 0, color: '#0f172a', fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                🛍️ Order History
                <span style={{ background: '#f1f5f9', color: '#64748b', padding: '0.1rem 0.6rem', borderRadius: '999px', fontSize: '0.85rem' }}>
                  {member.orders?.length || 0}
                </span>
              </h3>
            </div>
            
            {member.orders && member.orders.length > 0 ? (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.95rem' }}>
                  <thead>
                    <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0', color: '#64748b' }}>
                      <th style={{ padding: '1rem', fontWeight: '600' }}>Order #</th>
                      <th style={{ padding: '1rem', fontWeight: '600' }}>Date</th>
                      <th style={{ padding: '1rem', fontWeight: '600' }}>Status</th>
                      <th style={{ padding: '1rem', fontWeight: '600', textAlign: 'right' }}>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {member.orders.map((order: any) => (
                      <tr key={order.id} style={{ borderBottom: '1px solid #f1f5f9', transition: 'background 0.2s' }}>
                        <td style={{ padding: '1rem', fontWeight: '500', color: 'var(--accent)' }}>
                          <Link to={`/orders/${order.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                            {order.orderNumber}
                          </Link>
                        </td>
                        <td style={{ padding: '1rem', color: '#475569' }}>
                          {new Date(order.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                        </td>
                        <td style={{ padding: '1rem' }}>
                          <span style={{ 
                            padding: '0.2rem 0.6rem', 
                            borderRadius: '999px', 
                            fontSize: '0.8rem', 
                            fontWeight: '600',
                            background: order.status === 'DELIVERED' ? '#dcfce7' : (order.status === 'PAID' ? '#bfdbfe' : (order.status === 'PENDING' ? '#fef08a' : '#f1f5f9')),
                            color: order.status === 'DELIVERED' ? '#166534' : (order.status === 'PAID' ? '#1e3a8a' : (order.status === 'PENDING' ? '#854d0e' : '#475569'))
                          }}>
                            {order.status}
                          </span>
                        </td>
                        <td style={{ padding: '1rem', textAlign: 'right', fontWeight: '600', color: '#0f172a' }}>
                          {new Intl.NumberFormat('en-US', { style: 'currency', currency: order.currency || 'KRW' }).format(order.total)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div style={{ padding: '3rem', border: '2px dashed #e2e8f0', borderRadius: '12px', textAlign: 'center', color: '#94a3b8' }}>
                <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>🛒</div>
                <p style={{ margin: 0, fontSize: '1.1rem', fontWeight: '500' }}>No orders found for this customer.</p>
                <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.9rem' }}>When this customer makes a purchase, it will appear here.</p>
              </div>
            )}
          </section>
        </div>

      </div>
    </div>
  );
}
