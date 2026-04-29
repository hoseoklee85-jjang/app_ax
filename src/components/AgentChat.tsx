import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function AgentChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{role: 'user'|'agent', text: string}[]>([
    {role: 'agent', text: '안녕하세요! 똑똑한 AI 비서입니다. ✨\n화면 이동이 필요하거나 가짜 주문 데이터 생성이 필요하면 언제든 말씀해 주세요! (예: "주문 관리로 가줘", "대시보드로 갈래", "가짜 주문 데이터 만들어줘")'}
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;
    
    const userMsg = input.trim();
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setInput('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/agent/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg })
      });
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || '서버 오류가 발생했습니다.');
      }
      
      setMessages(prev => [...prev, { role: 'agent', text: data.text }]);

      if (data.type === 'action' && data.action) {
        if (data.action.type === 'NAVIGATE') {
          setTimeout(() => navigate(data.action.payload), 1000);
        } else if (data.action.type === 'REFRESH_DATA') {
          setTimeout(() => window.location.reload(), 1500);
        }
      }
    } catch (err: any) {
      setMessages(prev => [...prev, { role: 'agent', text: `오류가 발생했습니다: ${err.message}` }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: 'fixed',
          bottom: '2rem',
          right: '2rem',
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          backgroundColor: 'var(--accent)',
          color: 'white',
          border: 'none',
          boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
          cursor: 'pointer',
          fontSize: '1.5rem',
          zIndex: 1000,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          transition: 'transform 0.2s, background-color 0.2s'
        }}
        onMouseOver={e => { e.currentTarget.style.transform = 'scale(1.1)'; e.currentTarget.style.backgroundColor = '#2563eb'; }}
        onMouseOut={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.backgroundColor = 'var(--accent)'; }}
      >
        {isOpen ? '✕' : '✨'}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div style={{
          position: 'fixed',
          bottom: '6.5rem',
          right: '2rem',
          width: '380px',
          height: '550px',
          backgroundColor: 'var(--bg-panel)',
          borderRadius: '16px',
          boxShadow: '0 12px 28px rgba(0,0,0,0.5)',
          border: '1px solid var(--border)',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 1000,
          overflow: 'hidden',
          animation: 'fadeIn 0.2s ease-out'
        }}>
          {/* Header */}
          <div style={{ padding: '1rem', backgroundColor: 'rgba(59, 130, 246, 0.1)', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '1.2rem' }}>✨</span>
            <div>
              <h3 style={{ margin: 0, fontSize: '1rem', color: 'var(--text-main)' }}>AI Admin Agent</h3>
              <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>Powered by Gemini</p>
            </div>
          </div>
          
          {/* Messages Area */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {messages.map((m, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
                <div style={{
                  maxWidth: '85%',
                  padding: '0.8rem 1rem',
                  borderRadius: '12px',
                  backgroundColor: m.role === 'user' ? 'var(--accent)' : 'rgba(255,255,255,0.05)',
                  color: m.role === 'user' ? '#fff' : 'var(--text-main)',
                  border: m.role === 'user' ? 'none' : '1px solid var(--border)',
                  fontSize: '0.9rem',
                  lineHeight: '1.5',
                  whiteSpace: 'pre-wrap'
                }}>
                  {m.text}
                </div>
              </div>
            ))}
            {isLoading && (
              <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                <div style={{ padding: '0.8rem 1rem', borderRadius: '12px', backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                  타이핑 중...
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div style={{ padding: '1rem', borderTop: '1px solid var(--border)', display: 'flex', gap: '0.5rem', backgroundColor: 'var(--bg-main)' }}>
            <input 
              type="text" 
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSend()}
              placeholder="명령어를 입력하세요..."
              style={{
                flex: 1,
                padding: '0.8rem',
                borderRadius: '8px',
                border: '1px solid var(--border)',
                backgroundColor: 'rgba(0,0,0,0.2)',
                color: 'var(--text-main)',
                outline: 'none',
                transition: 'border-color 0.2s'
              }}
              onFocus={e => e.target.style.borderColor = 'var(--accent)'}
              onBlur={e => e.target.style.borderColor = 'var(--border)'}
            />
            <button 
              onClick={handleSend}
              disabled={isLoading || !input.trim()}
              style={{
                padding: '0 1.2rem',
                borderRadius: '8px',
                backgroundColor: 'var(--accent)',
                color: 'white',
                border: 'none',
                cursor: isLoading || !input.trim() ? 'not-allowed' : 'pointer',
                opacity: isLoading || !input.trim() ? 0.5 : 1,
                fontWeight: 'bold',
                transition: 'transform 0.1s'
              }}
              onMouseDown={e => e.currentTarget.style.transform = 'scale(0.95)'}
              onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
            >
              전송
            </button>
          </div>
        </div>
      )}
    </>
  );
}
