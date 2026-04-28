import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

type Role = 'user' | 'agent';
interface Message {
  role: Role;
  text: string;
}

interface Agent {
  id: string;
  name: string;
  icon: string;
  color: string;
  description: string;
  systemGreeting: string;
}

const AGENTS: Agent[] = [
  { 
    id: 'general', name: 'General AI', icon: '🤖', color: '#60a5fa, #c084fc', 
    description: '대시보드 통합 관리',
    systemGreeting: '안녕하세요! 대시보드 관리를 돕는 General AI입니다. 무엇을 도와드릴까요?' 
  },
  { 
    id: 'order', name: 'Order AI', icon: '📦', color: '#c084fc, #f472b6', 
    description: '주문/배송 정보 운영',
    systemGreeting: '안녕하세요! 주문 처리와 배송 현황을 담당하는 Order AI입니다.' 
  },
  { 
    id: 'product', name: 'Product AI', icon: '🏷️', color: '#34d399, #10b981', 
    description: '상품 데이터 분석',
    systemGreeting: '안녕하세요! 재고 상태 및 상품 데이터를 관리하는 Product AI입니다.' 
  }
];

export default function AgentChat() {
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);
  
  // 각 에이전트별 대화 내역 독립 관리
  const [histories, setHistories] = useState<Record<string, Message[]>>({
    general: [{ role: 'agent', text: AGENTS[0].systemGreeting }],
    order: [{ role: 'agent', text: AGENTS[1].systemGreeting }],
    product: [{ role: 'agent', text: AGENTS[2].systemGreeting }]
  });

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeAgent = AGENTS.find(a => a.id === selectedAgentId);
  const currentMessages = selectedAgentId ? histories[selectedAgentId] : [];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentMessages, selectedAgentId]);

  const handleSend = async () => {
    if (!input.trim() || !selectedAgentId) return;
    
    const userMsg = input.trim();
    
    setHistories(prev => ({
      ...prev,
      [selectedAgentId]: [...prev[selectedAgentId], { role: 'user', text: userMsg }]
    }));
    
    setInput('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/agent/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg, agentId: selectedAgentId })
      });
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || '서버 오류가 발생했습니다.');
      }
      
      setHistories(prev => ({
        ...prev,
        [selectedAgentId]: [...prev[selectedAgentId], { role: 'agent', text: data.text }]
      }));

      // 핸들링 가능 액션
      if (data.type === 'action' && data.action) {
        if (data.action.type === 'NAVIGATE') {
          setTimeout(() => navigate(data.action.payload), 1000);
        } else if (data.action.type === 'REFRESH_DATA') {
          setTimeout(() => window.location.reload(), 1500);
        }
      }
    } catch (err: any) {
      setHistories(prev => ({
        ...prev,
        [selectedAgentId]: [...prev[selectedAgentId], { role: 'agent', text: `오류가 발생했습니다: ${err.message}` }]
      }));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      width: '100%',
      background: 'rgba(22, 24, 30, 0.98)',
    }}>
      <style>
        {`
          @keyframes slideUpFade {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
          }
          @keyframes typingDot {
            0%, 20% { transform: translateY(0); }
            50% { transform: translateY(-4px); }
            80%, 100% { transform: translateY(0); }
          }
          .typing-dot {
            display: inline-block;
            width: 6px;
            height: 6px;
            background-color: #94a3b8;
            border-radius: 50%;
            margin: 0 2px;
            animation: typingDot 1.4s infinite both;
          }
          .agent-scrollbar::-webkit-scrollbar { width: 5px; }
          .agent-scrollbar::-webkit-scrollbar-track { background: transparent; }
          .agent-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.15); border-radius: 10px; }
          .agent-card { transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1); cursor: pointer; }
          .agent-card:hover { transform: translateY(-2px); box-shadow: 0 8px 16px rgba(0,0,0,0.3); }
        `}
      </style>

      {/* 1. 상단: 에이전트 선택 영역 (고정 50%) */}
      <div style={{
        flex: 1, // 50:50 비율 할당
        display: 'flex',
        flexDirection: 'column',
        padding: '1.5rem',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        background: 'rgba(255,255,255,0.02)',
        overflow: 'hidden'
      }}>
        <h2 style={{ 
          margin: '0 0 1rem 0', 
          color: 'white', 
          fontSize: '1.1rem',
        }}>
          💡 AI 비서 목록
        </h2>
        
        <div style={{ 
          flex: 1,
          display: 'flex', 
          flexDirection: 'column', 
          gap: '1rem',
          overflowY: 'auto',
          paddingRight: '5px'
        }} className="agent-scrollbar">
          {AGENTS.map(agent => {
            const isSelected = selectedAgentId === agent.id;
            return (
              <div 
                key={agent.id}
                className="agent-card"
                onClick={() => setSelectedAgentId(agent.id)}
                style={{
                  background: isSelected ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.3)',
                  border: isSelected ? '1px solid rgba(255,255,255,0.3)' : '1px solid rgba(255,255,255,0.05)',
                  padding: '1rem',
                  borderRadius: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  transform: isSelected ? 'scale(1.02)' : 'scale(1)'
                }}
              >
                <div style={{ 
                  width: '42px', 
                  height: '42px', 
                  borderRadius: '12px', 
                  background: 'rgba(255,255,255,0.05)',
                  display: 'flex', justifyContent: 'center', alignItems: 'center',
                  fontSize: '1.3rem',
                  flexShrink: 0
                }}>
                  {agent.icon}
                </div>
                <div>
                  <div style={{
                    fontSize: '1rem',
                    fontWeight: 700,
                    background: `linear-gradient(to right, ${agent.color})`,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    marginBottom: '0.2rem'
                  }}>
                    {agent.name}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: isSelected ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.5)' }}>
                    {agent.description}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. 하단: 채팅 영역 (고정 50%) */}
      <div style={{
        flex: 1, // 50:50 비율 할당
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}>
        {selectedAgentId ? (
          <>
            <div className="agent-scrollbar" style={{ flex: 1, overflowY: 'auto', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {currentMessages.map((m, i) => (
                <div key={i} style={{ 
                  display: 'flex', 
                  justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start',
                  animation: 'slideUpFade 0.3s ease-out forwards'
                }}>
                  <div style={{
                    maxWidth: '90%',
                    padding: '0.8rem 1rem',
                    borderRadius: m.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                    background: m.role === 'user' 
                      ? `linear-gradient(135deg, ${activeAgent?.color})` 
                      : 'rgba(255, 255, 255, 0.05)',
                    color: '#f8fafc',
                    border: m.role === 'user' ? 'none' : '1px solid rgba(255,255,255,0.1)',
                    fontSize: '0.9rem',
                    lineHeight: '1.5',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word'
                  }}>
                    {m.text}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div style={{ display: 'flex', justifyContent: 'flex-start', animation: 'slideUpFade 0.2s ease-out' }}>
                  <div style={{ 
                    padding: '0.8rem 1rem', 
                    borderRadius: '16px 16px 16px 4px', 
                    backgroundColor: 'rgba(255,255,255,0.05)', 
                    border: '1px solid rgba(255,255,255,0.1)',
                    display: 'flex', alignItems: 'center', gap: '4px'
                  }}>
                    <span className="typing-dot" style={{ animationDelay: '0s' }}></span>
                    <span className="typing-dot" style={{ animationDelay: '0.2s' }}></span>
                    <span className="typing-dot" style={{ animationDelay: '0.4s' }}></span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <div style={{ padding: '1rem', background: 'rgba(0,0,0,0.2)', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                <textarea 
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  placeholder={`${activeAgent?.name}에게 질문...`}
                  style={{
                    width: '100%', minHeight: '60px', padding: '0.8rem',
                    background: 'rgba(255, 255, 255, 0.05)', color: '#f8fafc',
                    border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px',
                    outline: 'none', fontSize: '0.9rem', resize: 'none', boxSizing: 'border-box',
                    transition: 'border-color 0.2s'
                  }}
                  onFocus={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)'}
                  onBlur={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'}
                />
                <button 
                  onClick={handleSend}
                  disabled={isLoading || !input.trim()}
                  style={{
                    padding: '0.6rem', borderRadius: '8px',
                    background: isLoading || !input.trim() ? 'rgba(255,255,255,0.1)' : `linear-gradient(135deg, ${activeAgent?.color})`,
                    color: isLoading || !input.trim() ? 'rgba(255,255,255,0.4)' : 'white',
                    border: 'none', cursor: isLoading || !input.trim() ? 'not-allowed' : 'pointer',
                    fontWeight: 600, transition: 'all 0.2s', fontSize: '0.9rem'
                  }}
                >
                  전송
                </button>
              </div>
            </div>
          </>
        ) : (
          <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'rgba(255,255,255,0.3)', padding: '2rem', textAlign: 'center', lineHeight: '1.6' }}>
            위 목록에서 에이전트를 클릭하여<br/>대화를 시작하세요.
          </div>
        )}
      </div>
    </div>
  );
}
