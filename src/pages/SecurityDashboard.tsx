import { useState, useEffect, useCallback } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface SecurityLog {
  id: string; timestamp: string; type: string; severity: string;
  status: string; sourceIp: string; targetEndpoint: string;
  description: string; action: string; details: Record<string, any>;
}
interface SecurityState {
  level: string; activeThreats: number; blockedToday: number;
  totalScanned: number; logs: SecurityLog[]; lastUpdated: string;
}

const COMMERCE_API = 'http://localhost:4321';

const SEVERITY_COLORS: Record<string, string> = { LOW: '#22c55e', MEDIUM: '#f59e0b', HIGH: '#f97316', CRITICAL: '#ef4444' };
const THREAT_ICONS: Record<string, string> = { DDOS: '🌊', SQL_INJECTION: '💉', PRICE_MANIPULATION: '💰', BRUTE_FORCE: '🔓' };
const THREAT_LABELS: Record<string, string> = { DDOS: 'DDoS Attack', SQL_INJECTION: 'SQL Injection', PRICE_MANIPULATION: 'Price Manipulation', BRUTE_FORCE: 'Brute Force' };

export default function SecurityDashboard() {
  const [data, setData] = useState<SecurityState | null>(null);
  const [report, setReport] = useState('');
  const [loading, setLoading] = useState(false);
  const [reportLoading, setReportLoading] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [chartHistory, setChartHistory] = useState<{time: string; traffic: number}[]>([]);

  const fetchState = useCallback(async () => {
    try {
      const res = await fetch(`${COMMERCE_API}/api/security?action=status`);
      if (res.ok) {
        const json = await res.json();
        setData(json);
        // 차트 데이터 업데이트
        setChartHistory(prev => {
          const now = new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
          const traffic = json.activeThreats > 0 ? 3000 + Math.random() * 5000 : 100 + Math.random() * 80;
          const next = [...prev, { time: now, traffic: Math.floor(traffic) }];
          return next.slice(-12);
        });
      }
    } catch (err) {
      console.error('Failed to fetch security data', err);
    }
  }, []);

  useEffect(() => { fetchState(); const t = setInterval(fetchState, 2000); return () => clearInterval(t); }, [fetchState]);

  const simulate = async (type: string) => {
    setLoading(true);
    await fetch(`${COMMERCE_API}/api/security`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'simulate', type }) });
    await fetchState(); setLoading(false);
  };
  const simulateAll = async () => {
    setLoading(true);
    await fetch(`${COMMERCE_API}/api/security`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'simulate_all' }) });
    setTimeout(fetchState, 1000); setTimeout(fetchState, 3000); setTimeout(fetchState, 5000); setTimeout(fetchState, 7000);
    setTimeout(() => setLoading(false), 2000);
  };
  const clearLogs = async () => {
    await fetch(`${COMMERCE_API}/api/security`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'clear' }) });
    fetchState(); setReport(''); setChartHistory([]);
  };
  const genReport = async () => {
    setReportLoading(true);
    setShowReportModal(true);
    const res = await fetch(`${COMMERCE_API}/api/security`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'report' }) });
    const d = await res.json(); setReport(d.report || ''); setReportLoading(false);
  };

  if (!data) {
    return <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>🛡️ Security Dashboard 연결 중... (Commerce 서버 확인 필요)</div>;
  }

  const levelColor = data.level === 'CRITICAL' ? '#ef4444' : data.level === 'WARNING' ? '#f59e0b' : '#10b981';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', minHeight: '600px' }}>
      {/* 1. Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
        <div className="admin-panel stat-card" style={{ padding: '1.2rem', borderLeft: `4px solid ${levelColor}` }}>
          <h3 style={{ color: 'var(--text-muted)', margin: '0 0 0.3rem 0', fontSize: '0.9rem' }}>🛡️ Threat Level</h3>
          <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: levelColor }}>
            {data.level}
          </div>
        </div>
        <div className="admin-panel stat-card" style={{ padding: '1.2rem', borderLeft: `4px solid ${data.activeThreats > 0 ? '#ef4444' : '#10b981'}` }}>
          <h3 style={{ color: 'var(--text-muted)', margin: '0 0 0.3rem 0', fontSize: '0.9rem' }}>🔴 Active Threats</h3>
          <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: data.activeThreats > 0 ? '#ef4444' : 'var(--text-main)' }}>
            {data.activeThreats}
          </div>
        </div>
        <div className="admin-panel stat-card" style={{ padding: '1.2rem', borderLeft: '4px solid #3b82f6' }}>
          <h3 style={{ color: 'var(--text-muted)', margin: '0 0 0.3rem 0', fontSize: '0.9rem' }}>🟡 Blocked Today</h3>
          <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#3b82f6' }}>
            {data.blockedToday.toLocaleString()}
          </div>
        </div>
        <div className="admin-panel stat-card" style={{ padding: '1.2rem', borderLeft: '4px solid #c084fc' }}>
          <h3 style={{ color: 'var(--text-muted)', margin: '0 0 0.3rem 0', fontSize: '0.9rem' }}>📊 Total Scanned</h3>
          <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#c084fc' }}>
            {data.totalScanned.toLocaleString()}
          </div>
        </div>
      </div>

      {/* 2. 공격 시뮬레이션 + 차트 */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '1rem' }}>
        {/* 시뮬레이션 버튼 */}
        <div className="admin-panel" style={{ padding: '1.5rem' }}>
          <h2 style={{ marginBottom: '1rem', fontSize: '1.1rem' }}>⚡ Attack Simulation</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <button className="btn-primary" style={{ background: 'linear-gradient(135deg, #ef4444, #dc2626)', border: 'none', color: '#fff', padding: '10px 16px', borderRadius: 8, cursor: 'pointer', fontWeight: 700, fontSize: '0.85rem' }} onClick={() => simulate('DDOS')} disabled={loading}>🌊 DDoS Attack</button>
            <button className="btn-primary" style={{ background: 'linear-gradient(135deg, #f97316, #ea580c)', border: 'none', color: '#fff', padding: '10px 16px', borderRadius: 8, cursor: 'pointer', fontWeight: 700, fontSize: '0.85rem' }} onClick={() => simulate('SQL_INJECTION')} disabled={loading}>💉 SQL Injection</button>
            <button className="btn-primary" style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)', border: 'none', color: '#fff', padding: '10px 16px', borderRadius: 8, cursor: 'pointer', fontWeight: 700, fontSize: '0.85rem' }} onClick={() => simulate('PRICE_MANIPULATION')} disabled={loading}>💰 Price Manipulation</button>
            <button className="btn-primary" style={{ background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)', border: 'none', color: '#fff', padding: '10px 16px', borderRadius: 8, cursor: 'pointer', fontWeight: 700, fontSize: '0.85rem' }} onClick={() => simulate('BRUTE_FORCE')} disabled={loading}>🔓 Brute Force</button>
            <hr style={{ border: 'none', borderTop: '1px solid var(--border-color)', margin: '4px 0' }} />
            <button className="btn-primary" style={{ background: 'linear-gradient(135deg, #dc2626, #991b1b)', border: 'none', color: '#fff', padding: '10px 16px', borderRadius: 8, cursor: 'pointer', fontWeight: 800, fontSize: '0.9rem' }} onClick={simulateAll} disabled={loading}>🚨 Full Attack Scenario</button>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button style={{ flex: 1, background: '#374151', border: 'none', color: '#fff', padding: '8px', borderRadius: 8, cursor: 'pointer', fontSize: '0.8rem' }} onClick={clearLogs}>🗑️ Clear</button>
              <button style={{ flex: 1, background: 'linear-gradient(135deg, #3b82f6, #2563eb)', border: 'none', color: '#fff', padding: '8px', borderRadius: 8, cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600 }} onClick={genReport} disabled={reportLoading}>{reportLoading ? '⏳...' : '📊 AI Report'}</button>
            </div>
          </div>
        </div>

        {/* 실시간 차트 */}
        <div className="admin-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
          <h2 style={{ marginBottom: '1rem', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ color: data.activeThreats > 0 ? '#ef4444' : '#10b981', animation: data.activeThreats > 0 ? 'pulse 1s infinite' : 'none' }}>●</span>
            Live Traffic Monitoring
          </h2>
          <div style={{ flex: 1, minHeight: 250 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartHistory}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                <XAxis dataKey="time" stroke="var(--text-muted)" fontSize={11} />
                <YAxis stroke="var(--text-muted)" fontSize={11} />
                <Tooltip contentStyle={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)', borderRadius: 8 }} />
                <Line type="monotone" dataKey="traffic" stroke={data.activeThreats > 0 ? '#ef4444' : '#10b981'} strokeWidth={3} dot={{ r: 3, fill: '#fff', strokeWidth: 2 }} animationDuration={300} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* 3. Event Logs */}
      <div className="admin-panel" style={{ padding: '1.5rem' }}>
        <h2 style={{ marginBottom: '1rem', fontSize: '1.1rem' }}>📋 Security Event Logs ({data.logs.length})</h2>
        <div className="table-wrapper" style={{ maxHeight: 350, overflowY: 'auto' }}>
          <table className="product-table" style={{ width: '100%', margin: 0 }}>
            <thead>
              <tr>
                <th style={{ padding: '0.75rem 0.5rem' }}>Time</th>
                <th style={{ padding: '0.75rem 0.5rem' }}>Severity</th>
                <th style={{ padding: '0.75rem 0.5rem' }}>Event Type</th>
                <th style={{ padding: '0.75rem 0.5rem' }}>Source</th>
                <th style={{ padding: '0.75rem 0.5rem' }}>Status</th>
                <th style={{ padding: '0.75rem 0.5rem' }}>Action Taken</th>
              </tr>
            </thead>
            <tbody>
              {(!data.logs || data.logs.length === 0) ? (
                <tr>
                  <td colSpan={6} style={{ padding: '2rem', color: 'var(--text-muted)', textAlign: 'center' }}>No security events detected. Run a simulation to test.</td>
                </tr>
              ) : (
                data.logs.map((log, idx) => (
                  <tr key={idx} style={{ backgroundColor: log.severity === 'CRITICAL' ? 'rgba(239, 68, 68, 0.05)' : 'transparent' }}>
                    <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)', padding: '0.75rem 0.5rem', whiteSpace: 'nowrap' }}>{new Date(log.timestamp).toLocaleTimeString()}</td>
                    <td style={{ padding: '0.75rem 0.5rem' }}>
                      <span style={{ background: SEVERITY_COLORS[log.severity] || '#666', color: '#fff', padding: '2px 10px', borderRadius: 12, fontSize: '0.7rem', fontWeight: 'bold' }}>
                        {log.severity}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.85rem', padding: '0.75rem 0.5rem', fontWeight: 600 }}>
                      {THREAT_ICONS[log.type] || '⚠️'} {THREAT_LABELS[log.type] || log.type}
                    </td>
                    <td style={{ fontSize: '0.8rem', padding: '0.75rem 0.5rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>{log.sourceIp}</td>
                    <td style={{ fontSize: '0.8rem', padding: '0.75rem 0.5rem' }}>
                      <span style={{ color: log.status === 'RESOLVED' ? '#10b981' : log.status === 'BLOCKED' ? '#f59e0b' : '#ef4444', fontWeight: 600 }}>
                        {log.status}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.8rem', padding: '0.75rem 0.5rem', color: 'var(--text-muted)', maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{log.action}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. AI Report Modal */}
      {showReportModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setShowReportModal(false)}>
          <div onClick={e => e.stopPropagation()} style={{ width: 720, maxWidth: '92vw', maxHeight: '88vh', background: '#fff', borderRadius: 16, boxShadow: '0 24px 80px rgba(0,0,0,0.25)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            {/* Header */}
            <div style={{ padding: '24px 28px 20px', borderBottom: '1px solid #e5e7eb', background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', color: '#fff' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                    <span style={{ fontSize: 22 }}>🛡️</span>
                    <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800 }}>AI Security Analysis Report</h2>
                  </div>
                  <div style={{ fontSize: 12, color: '#94a3b8' }}>Generated: {new Date().toLocaleString('ko-KR')} · LG AI Commerce Platform</div>
                </div>
                <button onClick={() => setShowReportModal(false)} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', width: 32, height: 32, borderRadius: 8, cursor: 'pointer', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
              </div>
              {data && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginTop: 16 }}>
                  {[
                    { label: 'Threat Level', value: data.level, color: data.level === 'CRITICAL' ? '#ef4444' : data.level === 'WARNING' ? '#f59e0b' : '#22c55e' },
                    { label: 'Active Threats', value: data.activeThreats, color: data.activeThreats > 0 ? '#ef4444' : '#22c55e' },
                    { label: 'Blocked Today', value: data.blockedToday, color: '#3b82f6' },
                    { label: 'Total Scanned', value: data.totalScanned?.toLocaleString(), color: '#a78bfa' },
                  ].map((s, i) => (
                    <div key={i} style={{ background: 'rgba(255,255,255,0.07)', borderRadius: 8, padding: '10px 12px', textAlign: 'center', border: '1px solid rgba(255,255,255,0.1)' }}>
                      <div style={{ fontSize: 18, fontWeight: 800, color: s.color }}>{s.value}</div>
                      <div style={{ fontSize: 10, color: '#94a3b8', marginTop: 2, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{s.label}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            {/* Body */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '24px 28px' }}>
              {reportLoading ? (
                <div style={{ textAlign: 'center', padding: 60, color: '#64748b' }}>
                  <div style={{ fontSize: 28, marginBottom: 12 }}>🤖</div>
                  <div style={{ fontSize: 15, fontWeight: 600 }}>AI가 보안 로그를 분석하고 있습니다...</div>
                  <div style={{ fontSize: 12, marginTop: 6, color: '#94a3b8' }}>Gemini Security Analyzer</div>
                </div>
              ) : (
                <div style={{ fontSize: 14, lineHeight: 1.8, color: '#1e293b', whiteSpace: 'pre-wrap' }}>
                  {report.split('\n').map((line, idx) => {
                    const t = line.trim();
                    if (t.startsWith('# ')) return <h2 key={idx} style={{ fontSize: 18, fontWeight: 800, color: '#0f172a', margin: '20px 0 8px', borderBottom: '2px solid #e2e8f0', paddingBottom: 6 }}>{t.slice(2)}</h2>;
                    if (t.startsWith('## ')) return <h3 key={idx} style={{ fontSize: 16, fontWeight: 700, color: '#1e40af', margin: '16px 0 6px' }}>{t.slice(3)}</h3>;
                    if (t.startsWith('### ')) return <h4 key={idx} style={{ fontSize: 14, fontWeight: 700, color: '#334155', margin: '12px 0 4px' }}>{t.slice(4)}</h4>;
                    if (t.startsWith('- ') || t.startsWith('* ')) return <div key={idx} style={{ paddingLeft: 16, position: 'relative', marginBottom: 4 }}><span style={{ position: 'absolute', left: 4, color: '#3b82f6', fontWeight: 700 }}>•</span>{t.slice(2)}</div>;
                    if (t.startsWith('> ')) return <div key={idx} style={{ borderLeft: '3px solid #3b82f6', paddingLeft: 12, color: '#475569', fontStyle: 'italic', margin: '8px 0', background: '#f8fafc', padding: '8px 12px', borderRadius: '0 6px 6px 0' }}>{t.slice(2)}</div>;
                    if (t.startsWith('---')) return <hr key={idx} style={{ border: 'none', borderTop: '1px solid #e2e8f0', margin: '16px 0' }} />;
                    if (t === '') return <div key={idx} style={{ height: 8 }} />;
                    const boldParsed = t.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>');
                    return <div key={idx} dangerouslySetInnerHTML={{ __html: boldParsed }} style={{ marginBottom: 2 }} />;
                  })}
                </div>
              )}
            </div>
            {/* Footer */}
            <div style={{ padding: '14px 28px', borderTop: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc' }}>
              <div style={{ fontSize: 11, color: '#94a3b8' }}>🔒 Confidential · LG AI Commerce Security Team</div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => { const w = window.open('', '_blank'); if (w) { w.document.write(`<html><head><title>Security Report</title><style>body{font-family:'Segoe UI',sans-serif;padding:40px;color:#1e293b;line-height:1.8}h1{color:#0f172a;border-bottom:2px solid #e2e8f0;padding-bottom:8px}h2{color:#1e40af}</style></head><body><h1>🛡️ AI Security Analysis Report</h1><p style="color:#94a3b8;font-size:12px">Generated: ${new Date().toLocaleString('ko-KR')}</p><pre style="white-space:pre-wrap;font-family:inherit">${report}</pre></body></html>`); w.document.close(); w.print(); }}} style={{ padding: '8px 16px', borderRadius: 8, border: '1px solid #d1d5db', background: '#fff', color: '#374151', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>🖨️ Print</button>
                <button onClick={() => setShowReportModal(false)} style={{ padding: '8px 20px', borderRadius: 8, border: 'none', background: '#0f172a', color: '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>Close</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
