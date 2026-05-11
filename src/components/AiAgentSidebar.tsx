import React, { useState, useEffect, useRef } from 'react';

// Agent Data
const agents = [
  {
    id: 'promotion',
    name: 'Promotion Agent',
    desc: 'Handles campaigns, coupons, and discounts.',
    avatar: '/agents/promo_animal.png',
    suggestions: ['Create coupon', 'Create PTO model', 'Start pre-order']
  },
  {
    id: 'product',
    name: 'Product Agent',
    desc: 'Manages catalog, inventory, and listings.',
    avatar: '/agents/product_animal.png',
  },
  {
    id: 'order',
    name: 'Order Agent',
    desc: 'Tracks fulfillment and delivery workflows.',
    avatar: '/agents/order_agent_latest.png',
  },
  {
    id: 'rollout',
    name: 'Rollout Agent',
    desc: 'Instantly spins up new global storefronts.',
    avatar: '/agents/rollout_animal.png',
    suggestions: ['스페인 사이트 열어줘', 'Deploy UK Store']
  },
  {
    id: 'support',
    name: 'General Support Agent',
    desc: 'Not sure what to click? Ask me anything here!',
    avatar: '/agents/support_agent_new.png',
  }
];

function OrderIssuesForm({ onResolveErrors, onNotifyScm }: { onResolveErrors: (ids: string[]) => void, onNotifyScm: (ids: string[]) => void }) {
  const [checkedErrors, setCheckedErrors] = useState<string[]>([]);
  const [checkedDelays, setCheckedDelays] = useState<string[]>([]);
  const [showDetails, setShowDetails] = useState(false);
  
  // AI Flow States
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showAiProposal, setShowAiProposal] = useState(false);
  const [isCarrierFixed, setIsCarrierFixed] = useState(false);

  const mockCreationErrors = [
    { type: 'ship method code error', ids: ['ORDER_81001821483', 'ORDER_81003920194'], msgTemplate: "ECSS message: [Seq. {id}][GERP] @ Shipping method is not Found. ( Carrier: , Warehouse: E0M, Delivery_type_Code: S)" },
    { type: 'price expired', ids: ['ORDER_81000938472'], msgTemplate: "ECSS message: [Seq. {id}][GERP] @ Price list is not set up. Contact to Sales Admin and ask to register a price." }
  ];

  const mockDelayedPicking = ['ORDER_81007891345', 'ORDER_81006672391'];

  const toggleCheck = (id: string, list: string[], setter: React.Dispatch<React.SetStateAction<string[]>>) => {
    setter(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  return (
    <div className="chat-form" style={{ background: '#fafafa', border: '1px solid #ced4da', animation: 'fadeIn 0.4s ease' }}>
      <p style={{ margin: '0 0 16px 0', fontSize: '0.85rem', fontWeight: 'bold' }}>⚠️ Pending Order Flow Actions</p>
      
      {/* 1. Creation Errors */}
      <div style={{ marginBottom: '16px', background: '#fff', border: '1px solid #e9ecef', borderRadius: '4px', padding: '12px' }}>
        <h4 style={{ margin: '0 0 12px 0', fontSize: '0.8rem', color: '#dc3545', display: 'flex', alignItems: 'center', gap: '6px' }}>🔴 Order Creation Error</h4>
        
        {mockCreationErrors.map(group => (
          <div key={group.type} style={{ marginBottom: '12px', paddingLeft: '8px', borderLeft: '2px solid #e9ecef' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#6c757d', marginBottom: '6px' }}>Reason: {group.type}</div>
            {group.ids.map(id => (
              <label key={id} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', marginBottom: '4px', cursor: 'pointer' }}>
                <input type="checkbox" checked={checkedErrors.includes(id)} onChange={() => toggleCheck(id, checkedErrors, setCheckedErrors)} />
                <span style={{ fontWeight: 700, letterSpacing: '0.05em' }}>{id}</span>
              </label>
            ))}
          </div>
        ))}

        {showDetails && checkedErrors.length > 0 && (
          <div style={{ background: '#212529', color: '#f8f9fa', padding: '10px', borderRadius: '4px', fontSize: '0.7rem', fontFamily: 'monospace', marginBottom: '12px', whiteSpace: 'pre-wrap', maxHeight: '120px', overflowY: 'auto', position: 'relative' }}>
            {checkedErrors.map(id => {
              const group = mockCreationErrors.find(g => g.ids.includes(id));
              return group ? <div key={id} style={{marginBottom: '4px'}}>{group.msgTemplate.replace('{id}', id)}</div> : null;
            })}
            
            {/* Loading Analysis Overlay */}
            {isAnalyzing && (
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(33,37,41,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#adb5bd', fontSize: '0.75rem', fontWeight: 'bold' }}>
                <span className="heartbeat-animation" style={{ marginRight: '8px' }}>🤖</span> AI Analysis in progress...
              </div>
            )}
          </div>
        )}

        {/* AI Proposal Card */}
        {showAiProposal && !isAnalyzing && checkedErrors.length > 0 && (
          <div style={{ background: '#f8f9fa', border: '1px solid #ced4da', borderLeft: '4px solid #0d6efd', padding: '12px', borderRadius: '4px', marginBottom: '12px', animation: 'fadeIn 0.5s ease' }}>
            <h5 style={{ margin: '0 0 8px 0', fontSize: '0.8rem', color: '#0d6efd', display: 'flex', alignItems: 'center', gap: '6px' }}>💡 Agent Analysis</h5>
            {!isCarrierFixed ? (
              <>
                <p style={{ margin: '0 0 10px 0', fontSize: '0.75rem', color: '#495057', lineHeight: '1.4' }}>
                  다른 제품들과 비교했을 때, 캐리어 값이 누락되어 있습니다.<br/>
                  동일 제품군의 Carrier 명인 <strong>Pantos</strong>로 세팅할까요?
                </p>
                <button 
                  className="btn" 
                  style={{ background: '#0d6efd', color: '#fff', fontSize: '0.7rem', padding: '6px 12px', fontWeight: 'bold', border: 'none', borderRadius: '4px' }}
                  onClick={(e) => { e.preventDefault(); setIsCarrierFixed(true); }}
                >
                  승인 (Approve & Update)
                </button>
              </>
            ) : (
              <p style={{ margin: '0', fontSize: '0.75rem', color: '#198754', fontWeight: 'bold' }}>
                ✅ Carrier explicitly mapped to <strong style={{ color: '#0d6efd' }}>Pantos</strong>.<br/>
                <span style={{ fontWeight: 'normal', color: '#6c757d', display: 'block', marginTop: '4px' }}>Ready to resend to ECS/ERP.</span>
              </p>
            )}
          </div>
        )}

        <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
          {!showDetails && (
            <button 
              className="btn" 
              style={{ width: '100%', background: '#f8f9fa', border: '1px solid #ced4da', color: '#495057', fontSize: '0.75rem', padding: '8px', fontWeight: 'bold' }}
              onClick={(e) => { 
                e.preventDefault(); 
                setShowDetails(true); 
                setIsAnalyzing(true);
                setTimeout(() => {
                  setIsAnalyzing(false);
                  setShowAiProposal(true);
                }, 1800);
              }}
              disabled={checkedErrors.length === 0}
            >
              Check Details
            </button>
          )}

          {isCarrierFixed && (
            <button 
              className="btn btn-primary" 
              style={{ width: '100%', background: 'var(--lg-red)', fontSize: '0.75rem', padding: '8px', animation: 'fadeIn 0.3s ease' }}
              onClick={(e) => { e.preventDefault(); if(checkedErrors.length > 0) onResolveErrors(checkedErrors); }}
            >
              Resend to ECS/ERP ({checkedErrors.length})
            </button>
          )}
        </div>
      </div>

      {/* 2. Delayed Picking */}
      <div style={{ background: '#fff', border: '1px solid #e9ecef', borderRadius: '4px', padding: '12px' }}>
        <h4 style={{ margin: '0 0 12px 0', fontSize: '0.8rem', color: '#ffc107', display: 'flex', alignItems: 'center', gap: '6px' }}>🟡 Order Picking Delayed</h4>
        
        <div style={{ marginBottom: '12px', paddingLeft: '8px', borderLeft: '2px solid #e9ecef' }}>
          {mockDelayedPicking.map(id => (
            <label key={id} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', marginBottom: '4px', cursor: 'pointer' }}>
               <input type="checkbox" checked={checkedDelays.includes(id)} onChange={() => toggleCheck(id, checkedDelays, setCheckedDelays)} />
               <span style={{ fontWeight: 700, letterSpacing: '0.05em' }}>{id}</span>
            </label>
          ))}
        </div>

        <button 
          className="btn btn-primary" 
          style={{ width: '100%', marginTop: '8px', background: 'var(--lg-black)', fontSize: '0.75rem', padding: '8px' }}
          onClick={(e) => { e.preventDefault(); if(checkedDelays.length > 0) onNotifyScm(checkedDelays); }}
          disabled={checkedDelays.length === 0}
        >
          Notify SCM Manager Again ({checkedDelays.length})
        </button>
      </div>
    </div>
  );
}

export default function AiAgentSidebar() {
  const [isOpen, setIsOpen] = useState(true);
  const [view, setView] = useState<'dashboard' | 'chat'>('dashboard');
  const [activeAgent, setActiveAgent] = useState<any>(null);
  const [activePromotions, setActivePromotions] = useState<any[]>([]);
  
  // Drag State for Floating Button
  const [btnPos, setBtnPos] = useState({ x: 16, y: 16 });
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef({ startX: 0, startY: 0, btnX: 0, btnY: 0, moved: false });
  
  // Chat States
  const [messages, setMessages] = useState<any[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const dispatchAiAction = (detail: any) => {
    window.dispatchEvent(new CustomEvent('ai-action-apply', { detail }));
    const iframe = document.getElementById('store-preview-iframe') as HTMLIFrameElement;
    if (iframe && iframe.contentWindow) {
      iframe.contentWindow.postMessage({ type: 'ai-action-apply', detail }, '*');
    }
  };

  // Auto-push body padding when Sidebar is open, persisting through Astro ViewTransitions
  useEffect(() => {
    const syncBodyClass = () => {
      if (isOpen) {
        document.body.classList.add('ai-sidebar-open');
      } else {
        document.body.classList.remove('ai-sidebar-open');
      }
    };
    
    syncBodyClass();
    document.addEventListener('astro:page-load', syncBodyClass);
    return () => document.removeEventListener('astro:page-load', syncBodyClass);
  }, [isOpen]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSelectAgent = (agent: any) => {
    setActiveAgent(agent);
    setView('chat');
    setMessages([
      { role: 'agent', type: 'text', content: `Welcome! I am your ${agent.name}. How can I help you manage the store today?` }
    ]);
  };

  // Drag Event Handlers
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const dx = e.clientX - dragRef.current.startX;
      const dy = e.clientY - dragRef.current.startY;
      if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
        dragRef.current.moved = true;
      }
      setBtnPos({
        x: dragRef.current.btnX + dx,
        y: dragRef.current.btnY + dy
      });
    };

    const handleMouseUp = () => {
      if (isDragging) setIsDragging(false);
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  const submitMessage = async (text: string) => {
    if (!text.trim()) return;

    setMessages(prev => [...prev, { role: 'user', type: 'text', content: text }]);
    setInputText('');
    setIsTyping(true);

    if (activeAgent?.id === 'rollout' && (text.includes('스페인') || text.includes('Spain'))) {
      setTimeout(() => {
        setIsTyping(false);
        setMessages(prev => [...prev, {
          role: 'agent',
          type: 'text',
          content: 'Sure, I can help you roll out a new storefront for Spain (ES). I have pre-filled the initial configuration schema based on regional defaults.'
        }, {
          role: 'agent',
          type: 'form',
          formType: 'rollout_setup'
        }]);
      }, 1500);
      return;
    }

    try {
      const response = await fetch('/api/agent/chat', { 
         method: 'POST', 
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({ message: text, agent: activeAgent.id, activePromotions }) 
      });
      const data = await response.json();
      setIsTyping(false);
      
      if (!response.ok) {
        setMessages(prev => [...prev, { role: 'agent', type: 'text', content: `⚠️ ${data.error || '알 수 없는 서버 오류'}` }]);
        return;
      }
      
      // Auto-handler for STOP promotion action coming from AI
      if (data && data.type === 'action' && data.actionDetails?.type === 'STOP_PROMOTION') {
        const rawPromoId = data.actionDetails.promotionId || '';
        const promoId = rawPromoId.replace(/\[|\]/g, ''); // Strip bracket hallucinations
        const schedule = (data.actionDetails.schedule || 'Immediate').toLowerCase();

        if (schedule.includes('immediate')) {
          setActivePromotions(prev => {
            const nextList = prev.filter(p => p.id !== promoId);
            dispatchAiAction({ type: 'STOP', remaining: nextList, promotionId: promoId });
            return nextList;
          });
        }
      }

      if (data) {
        setMessages(prev => [...prev, {
          role: 'agent',
          type: data.type || 'text',
          formType: data.formType,
          content: data.text,
          actionDetails: data.action
        }]);
      }
    } catch (err) {
      console.error("AI Fetch Error:", err);
      setIsTyping(false);
      setMessages(prev => [...prev, { role: 'agent', type: 'text', content: 'Connection to AI brain failed. Please check the network or API Key.' }]);
    }
  };

  const handleSendMessage = (e?: React.FormEvent) => {
    e?.preventDefault();
    submitMessage(inputText);
  };

  const handleFormSubmit = (promoDetails: any) => {
    const isPct = promoDetails.discountType === 'PERCENT';
    const valObj = isPct ? `${promoDetails.rate}%` : `$${promoDetails.rate}`;
    const targetObj = promoDetails.target === 'Specific SKU' ? `SKU ${promoDetails.sku}` : promoDetails.target;
    const textMsg = `Draft a promotion applying a ${valObj} discount on ${targetObj} for audience [${promoDetails.audience}] valid from ${promoDetails.startDate || 'today'} until ${promoDetails.endDate || 'forever'}.`;
    
    setMessages(prev => [...prev, { 
      role: 'user', 
      type: 'text', 
      content: textMsg
    }]);

    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      setMessages(prev => [...prev, {
        role: 'agent',
        type: 'action',
        content: "I've drafted the promotion settings based on the form. Please review and approve.",
        actionDetails: { type: 'PROMOTION', ...promoDetails }
      }]);
    }, 1500);
  };

  const handleApproveAction = (details: any) => {
    const newPromo = { id: Math.random().toString(36).substring(2, 9).toUpperCase(), ...details };
    setActivePromotions(prev => [...prev, newPromo]);

    // Calculate simulated affected count based on target scope
    let affectedCount = 1;
    if (details.target === 'All Products') affectedCount = 1450;
    else if (details.target === 'All TV') affectedCount = 38;
    else if (details.target === 'All Soundbar') affectedCount = 12;
    else if (details.target === 'All Refrigerator') affectedCount = 45;
    else if (details.target === 'Specific SKU') affectedCount = 1;

    setMessages(prev => [...prev, {
      role: 'agent',
      type: 'action',
      actionDetails: { type: 'PROMOTION_SUCCESS', promotionId: newPromo.id, affectedCount, target: details.target, sku: details.sku }
    }, {
      role: 'agent',
      type: 'action',
      actionDetails: { type: 'ASK_PREVIEW' }
    }]);

    // ✨ GLOBAL EVENT DISPATCH ✨
    dispatchAiAction({ type: 'PROMOTION', promotion: newPromo });
  };

  return (
    <>
      <div className={`ai-sidebar-container ${isOpen ? 'open' : ''}`}>
        <div className="ai-header">
        <div>
          <h2>LG.com AI Agent</h2>
          <p>Zero-Click Architecture</p>
        </div>
        <button onClick={() => setIsOpen(!isOpen)} style={{ border:'none', background:'transparent', fontSize:'1.2rem', cursor:'pointer' }}>
          ✕
        </button>
      </div>

      {view === 'dashboard' ? (
        <div className="ai-view-content">
          <p style={{marginBottom:'24px', fontWeight:700}}>Select your specialized agent:</p>
          {agents.map(agent => (
            <div key={agent.id} className="ai-agent-item" style={{ display: 'flex', alignItems: 'center' }} onClick={() => handleSelectAgent(agent)}>
              <img src={agent.avatar} alt={agent.name} className="ai-agent-avatar" />
              <div className="ai-agent-info" style={{ flexGrow: 1 }}>
                <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {agent.name}
                </h3>
                <p>{agent.desc}</p>
              </div>
              {agent.id === 'promotion' && (
                <div 
                  className="promotion-bell heartbeat-animation" 
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveAgent(agent);
                    setView('chat');
                    setMessages([
                      { 
                        role: 'agent', 
                        type: 'text', 
                        content: `🚀 **Sales Opportunity Detected:**\nAdministrator, I've observed an incredible traffic surge for the **OLED65G4** TV line over the past week. Let's capture this immense interest and maximize our conversions!` 
                      },
                      {
                        role: 'agent',
                        type: 'action',
                        actionDetails: { type: 'DATA_VISUALIZATION_OLED' }
                      },
                      {
                        role: 'agent',
                        type: 'text',
                        content: `Should we issue a proactive targeted discount coupon to turn these hesitant visitors into buyers?`
                      },
                      {
                        role: 'agent',
                        type: 'action',
                        actionDetails: { type: 'PROACTIVE_TV_COUPON' }
                      }
                    ]);
                  }}
                  style={{ position: 'relative', cursor: 'pointer', padding: '12px', background: '#ffebeb', borderRadius: '50%', color: 'var(--lg-red)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  title="New Insight Available"
                >
                  <span style={{ fontSize: '1.2rem' }}>🔔</span>
                  <span style={{ position: 'absolute', top: '6px', right: '8px', width: '10px', height: '10px', background: 'var(--lg-red)', borderRadius: '50%', border: '2px solid white' }}></span>
                </div>
              )}
              {agent.id === 'order' && (
                <div 
                  className="promotion-bell heartbeat-animation" 
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveAgent(agent);
                    setView('chat');
                    setMessages([
                      { 
                        role: 'agent', 
                        type: 'text', 
                        content: `🔔 **System Alert:**\nWarning, I've detected some unprocessed orders and delayed pickings in the supply chain pipeline. Please select appropriate actions to resolve them.` 
                      },
                      {
                        role: 'agent',
                        type: 'form',
                        formType: 'order_issues_flow'
                      }
                    ]);
                  }}
                  style={{ position: 'relative', cursor: 'pointer', padding: '12px', background: '#e9ecef', borderRadius: '50%', color: '#495057', display: 'flex', alignItems: 'center', justifyContent: 'center', marginLeft: '8px' }}
                  title="Order Issues Available"
                >
                  <span style={{ fontSize: '1.2rem' }}>🔔</span>
                  <span style={{ position: 'absolute', top: '6px', right: '8px', width: '10px', height: '10px', background: 'var(--lg-red)', borderRadius: '50%', border: '2px solid white' }}></span>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <>
          <div className="ai-view-content" style={{ display:'flex', flexDirection:'column' }}>
            <div className="ai-chat-header">
              <button className="back-btn" onClick={() => setView('dashboard')}>←</button>
              <img src={activeAgent?.avatar} alt="Agent" style={{width:'48px', height:'48px', borderRadius:'50%'}} />
              <span style={{fontWeight:700, fontSize:'1.1rem'}}>{activeAgent?.name}</span>
            </div>

            <div className="chat-history">
              {messages.map((msg, idx) => (
                <div key={idx} className={`chat-bubble ${msg.role}`}>
                  <p>{msg.content}</p>
                  
                  {/* Interactive Dynamic Form */}
                  {msg.type === 'form' && msg.formType === 'promotion' && (
                    <PromotionForm onSubmit={handleFormSubmit} />
                  )}

                  {msg.type === 'form' && msg.formType === 'stop_promotion_flow' && (
                    <StopPromotionForm 
                      activePromotions={activePromotions} 
                      onSubmit={(promoId, scheduleType, date) => {
                        const textMsg = scheduleType === 'Immediate' 
                          ? `Stop coupon [${promoId}] immediately.` 
                          : `Schedule stop for coupon [${promoId}] on ${date}.`;
                        
                        setMessages(prev => [...prev, { role: 'user', type: 'text', content: textMsg }]);
                        setIsTyping(true);
                        setTimeout(() => {
                           setIsTyping(false);
                           setMessages(prev => [...prev, {
                             role: 'agent',
                             type: 'action',
                             content: "I have prepared the termination.",
                             actionDetails: { type: 'STOP_PROMOTION', promotionId: promoId, schedule: scheduleType === 'Immediate' ? 'Immediate' : date }
                           }]);
                           
                           if (scheduleType === 'Immediate') {
                              setActivePromotions(prev => {
                                const nextList = prev.filter(p => p.id !== promoId);
                                dispatchAiAction({ type: 'STOP', remaining: nextList, promotionId: promoId });
                                return nextList;
                              });
                           }
                        }, 1000);
                      }} 
                    />
                  )}

                  {msg.type === 'form' && msg.formType === 'pto_flow' && (
                    <PtoCreationForm onSubmit={(bundleName, price, skus, category, images) => {
                        setMessages(prev => [...prev, { role: 'user', type: 'text', content: `Create PTO Bundle: [${bundleName}] containing [${skus.join(', ')}] in category [${category}] for $${price}.` }]);
                        setIsTyping(true);
                        setTimeout(() => {
                           setIsTyping(false);
                           setMessages(prev => [...prev, {
                             role: 'agent',
                             type: 'action',
                             content: "The dynamic PTO bundle has been configured successfully. Please approve the deployment.",
                             actionDetails: { type: 'PTO_CREATE', bundleName, price, skus, category, images }
                           }]);
                        }, 1200);
                    }} />
                  )}

                  {msg.type === 'form' && msg.formType === 'order_issues_flow' && (
                    <OrderIssuesForm 
                      onResolveErrors={(ids) => {
                        setMessages(prev => [...prev, { role: 'user', type: 'text', content: `Run data cleansing and resend on: ${ids.join(', ')}` }]);
                        setIsTyping(true);
                        setTimeout(() => {
                          setIsTyping(false);
                          setMessages(prev => [...prev, { role: 'agent', type: 'text', content: `✅ Data cleansing completed. Successfully resent ${ids.length} orders to the processing queue.` }]);
                        }, 1500);
                      }}
                      onNotifyScm={(ids) => {
                        setMessages(prev => [...prev, { role: 'user', type: 'text', content: `Notify SCM Manager regarding delayed pickings: ${ids.join(', ')}` }]);
                        setIsTyping(true);
                        setTimeout(() => {
                          setIsTyping(false);
                          setMessages(prev => [...prev, { role: 'agent', type: 'text', content: `✅ SCM Manager has been notified with high priority regarding the ${ids.length} delayed shipments.` }]);
                        }, 1200);
                      }}
                    />
                  )}

                  {/* Rollout Setup Form */}
                  {msg.type === 'form' && msg.formType === 'rollout_setup' && (
                    <RolloutSetupForm 
                      onSubmit={(config) => {
                        setMessages(prev => [...prev, { role: 'user', type: 'text', content: `Deploy storefront for ${config.region} with currency ${config.currency} and language ${config.language}.` }]);
                        setIsTyping(true);
                        setTimeout(() => {
                          setIsTyping(false);
                          setMessages(prev => [...prev, {
                            role: 'agent',
                            type: 'action',
                            content: `I have compiled the build configurations and provisioned the database for the new region. Please approve to launch.`,
                            actionDetails: { type: 'ROLLOUT_SUCCESS', ...config }
                          }]);
                        }, 2000);
                      }}
                    />
                  )}

                  {/* Action Card Implementation */}
                  {msg.type === 'action' && msg.actionDetails?.type === 'DATA_VISUALIZATION_OLED' && (
                    <div className="action-card" style={{ background: '#f8f9fa', border: '1px solid #dee2e6' }}>
                      <div className="action-card-title" style={{ fontSize: '0.9rem', color: '#495057', display: 'flex', alignItems: 'center', gap: '8px' }}>
                         📊 <span>7-Day Funnel Analysis (OLED65G4)</span>
                      </div>
                      <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px', background: '#fff', borderRadius: '4px', borderLeft: '3px solid #ced4da' }}>
                          <span style={{color: '#6c757d', fontWeight: 600}}>Unique Views</span>
                          <span style={{fontWeight: 'bold', color: '#212529'}}>45,200</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px', background: '#fff', borderRadius: '4px', borderLeft: '3px solid var(--lg-red)' }}>
                          <span style={{color: '#6c757d', fontWeight: 600}}>Cart Additions</span>
                          <span style={{fontWeight: 'bold', color: '#212529'}}>3,100 <span style={{fontSize:'0.8rem', color:'var(--lg-red)'}}>(-12%)</span></span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px', background: '#fff', borderRadius: '4px', borderLeft: '3px solid #dc3545' }}>
                          <span style={{color: '#6c757d', fontWeight: 600}}>Completed Orders</span>
                          <span style={{fontWeight: 'bold', color: '#dc3545'}}>540 <span style={{fontSize:'0.8rem'}}> (1.19% CVR)</span></span>
                        </div>
                      </div>

                      {/* Hooking KPIs instead of Graph */}
                      <div style={{ marginTop: '16px', display: 'flex', gap: '8px' }}>
                        <div style={{ flex: 1, padding: '16px 12px', background: '#fff', border: '1px solid #ced4da', borderRadius: '8px', textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
                          <div style={{ color: '#6c757d', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Missed Revenue</div>
                          <div style={{ color: 'var(--lg-red)', fontSize: '1.3rem', fontWeight: 900, margin: '8px 0 4px', fontFamily: 'var(--font-headline)' }}>$1,240,000</div>
                          <div style={{ color: '#adb5bd', fontSize: '0.7rem' }}>Estimated from 45.2K views</div>
                        </div>
                        <div style={{ flex: 1, padding: '16px 12px', background: 'var(--lg-black)', border: '1px solid var(--lg-black)', borderRadius: '8px', textAlign: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                          <div style={{ color: '#adb5bd', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Expected Lift</div>
                          <div style={{ color: '#fff', fontSize: '1.3rem', fontWeight: 900, margin: '8px 0 4px', fontFamily: 'var(--font-headline)' }}>+ $850,000</div>
                          <div style={{ color: '#adb5bd', fontSize: '0.7rem' }}>with Targeted 15% Coupon</div>
                        </div>
                      </div>

                    </div>
                  )}

                  {/* Ask Preview Card */}
                  {msg.type === 'action' && msg.actionDetails?.type === 'ASK_PREVIEW' && (
                    <div className="action-card" style={{ background: '#e0f2fe', border: '1px solid #bae6fd', marginTop: '8px' }}>
                      <p style={{ fontSize: '0.85rem', color: '#0369a1', marginBottom: '12px', fontWeight: 600 }}>
                        Would you like to open the Store Preview to verify these changes live?
                      </p>
                      <button 
                        className="btn" 
                        style={{ width: '100%', background: '#0284c7', color: 'white', padding: '10px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                        onClick={() => { window.location.href = '/preview'; }}
                      >
                        <span style={{ fontSize: '1.2rem' }}>👀</span> Open Live Preview
                      </button>
                    </div>
                  )}

                  {msg.type === 'action' && msg.actionDetails?.type === 'PROACTIVE_TV_COUPON' && (
                    <div className="action-card">
                      <div className="action-row">
                        <button className="action-btn reject" onClick={() => {
                          setMessages(prev => prev.filter(m => m !== msg));
                          setMessages(prev => [...prev, { role: 'agent', type: 'text', content: 'Understood. I will continue monitoring.'}]);
                        }}>Dismiss</button>
                        <button className="action-btn approve" onClick={() => {
                          setMessages(prev => prev.filter(m => m !== msg));
                          setMessages(prev => [
                            ...prev, 
                            { role: 'user', type: 'text', content: 'Yes, draft a 15% off coupon for OLED TVs.' },
                            { role: 'agent', type: 'text', content: 'Certainly. I have pre-filled the promotion schema for you.' },
                            { role: 'agent', type: 'form', formType: 'promotion' }
                          ]);
                        }}>Yes, Create Coupon</button>
                      </div>
                    </div>
                  )}

                  {msg.type === 'action' && msg.actionDetails?.type === 'PROMOTION' && (
                    <div className="action-card">
                      <div className="action-card-title">✨ Promotion Draft</div>
                      <div className="action-card-details">
                        <p><strong>Discount:</strong> {msg.actionDetails.discountType === 'FIXED' ? '$' : ''}{msg.actionDetails.rate}{msg.actionDetails.discountType === 'PERCENT' ? '%' : ''} OFF</p>
                        <p><strong>Target:</strong> {msg.actionDetails.target} {msg.actionDetails.sku ? `(${msg.actionDetails.sku})` : ''}</p>
                        <p><strong>Audience:</strong> {msg.actionDetails.audience}</p>
                        <p><strong>Period:</strong> {msg.actionDetails.startDate || 'Now'} ~ {msg.actionDetails.endDate || 'No Expiry'}</p>
                      </div>
                      <div className="action-row">
                        <button className="action-btn reject" onClick={() => {
                          setMessages(prev => [...prev, { role: 'agent', type: 'text', content: 'Action cancelled. Let me know if you need anything else.'}]);
                        }}>Reject</button>
                        <button className="action-btn approve" onClick={() => handleApproveAction(msg.actionDetails)}>Approve & Deploy</button>
                      </div>
                    </div>
                  )}

                  {/* Promotion Success Card */}
                  {msg.type === 'action' && msg.actionDetails?.type === 'PROMOTION_SUCCESS' && (
                    <div className="action-card" style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', marginTop: '8px' }}>
                      <div className="action-card-title" style={{ color: '#166534', fontSize: '0.9rem' }}>✅ Deployment Successful</div>
                      <p style={{ fontSize: '0.85rem', marginBottom: '12px', color: '#14532d' }}>
                        Promotion <strong>[{msg.actionDetails.promotionId}]</strong> applied to {msg.actionDetails.affectedCount.toLocaleString()} item(s) in {msg.actionDetails.target}.
                      </p>
                      <PromotionDetailsButton target={msg.actionDetails.target} count={msg.actionDetails.affectedCount} sku={msg.actionDetails.sku} />
                    </div>
                  )}

                  {/* Rollout Success Card */}
                  {msg.type === 'action' && msg.actionDetails?.type === 'ROLLOUT_SUCCESS' && (
                    <div className="action-card" style={{ borderLeft: '4px solid var(--accent)' }}>
                      <div className="action-card-title">🌍 Site Launch Ready</div>
                      <div className="action-card-details">
                        <p><strong>Region:</strong> {msg.actionDetails.region}</p>
                        <p><strong>Currency:</strong> {msg.actionDetails.currency}</p>
                        <p><strong>Language:</strong> {msg.actionDetails.language}</p>
                        <p><strong>Catalog:</strong> {msg.actionDetails.catalog}</p>
                      </div>
                      <div className="action-row">
                        <button className="action-btn reject" onClick={() => {
                          setMessages(prev => [...prev, { role: 'agent', type: 'text', content: 'Rollout cancelled.' }]);
                        }}>Abort</button>
                        <button className="action-btn approve" style={{ background: 'var(--accent)' }} onClick={() => {
                          setMessages(prev => [...prev, 
                            { role: 'agent', type: 'text', content: `🚀 Deployment initiated! The **${msg.actionDetails.region}** storefront is now LIVE at lg.com/${msg.actionDetails.region.toLowerCase()}` },
                            { role: 'agent', type: 'action', actionDetails: { type: 'ASK_PREVIEW' } }
                          ]);
                        }}>Launch Site</button>
                      </div>
                    </div>
                  )}

                  {/* Stop Promotion Card */}
                  {msg.type === 'action' && msg.actionDetails?.type === 'STOP_PROMOTION' && (
                    <div className="action-card">
                       <span style={{color: 'var(--lg-red)', fontWeight: 'bold'}}>
                         🛑 {(msg.actionDetails.schedule || 'Immediate').toLowerCase().includes('immediate') ? `Stopped Promotion ID: ${msg.actionDetails.promotionId.replace(/\[|\]/g, '')}` : `Scheduled Stop: [${msg.actionDetails.promotionId.replace(/\[|\]/g, '')}] on ${msg.actionDetails.schedule}`}
                       </span>
                    </div>
                  )}

                  {/* PTO Bundle Action Card */}
                  {msg.type === 'action' && msg.actionDetails?.type === 'PTO_CREATE' && (
                    <div className="action-card" style={{ borderLeft: '4px solid var(--lg-red)', background: '#fff4f4' }}>
                      <div className="action-card-title">📦 PTO Bundle Draft</div>
                      <div className="action-card-details">
                        {msg.actionDetails.images && msg.actionDetails.images.length > 0 && (
                          <div style={{ position: 'relative', height: '140px', background: '#fff', borderRadius: '4px', border: '1px solid #ddd', marginBottom: '12px', overflow: 'hidden' }}>
                             {msg.actionDetails.images.map((img: string, idx: number) => (
                               <img 
                                 key={idx} 
                                 src={img} 
                                 alt="Bundle Preview" 
                                 style={{
                                    position: 'absolute',
                                    width: '55%',
                                    height: '100%',
                                    objectFit: 'contain',
                                    top: '0',
                                    left: idx === 0 ? '0%' : 'auto',
                                    right: idx === 1 ? '0%' : 'auto',
                                    zIndex: 10 - idx,
                                    mixBlendMode: 'multiply',
                                    WebkitMaskImage: idx === 0 
                                      ? 'linear-gradient(to right, rgba(0,0,0,1) 70%, rgba(0,0,0,0) 100%)'
                                      : (idx === 1 ? 'linear-gradient(to left, rgba(0,0,0,1) 70%, rgba(0,0,0,0) 100%)' : 'none'),
                                    maskImage: idx === 0 
                                      ? 'linear-gradient(to right, rgba(0,0,0,1) 70%, rgba(0,0,0,0) 100%)'
                                      : (idx === 1 ? 'linear-gradient(to left, rgba(0,0,0,1) 70%, rgba(0,0,0,0) 100%)' : 'none')
                                 }}
                               />
                             ))}
                             {msg.actionDetails.images.length > 1 && (
                               <div style={{ position:'absolute', top:'50%', left:'50%', transform:'translate(-50%, -50%)', zIndex: 12, background:'var(--lg-red)', color:'white', width:'24px', height:'24px', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:'bold', fontSize:'0.9rem', boxShadow:'0 1px 3px rgba(0,0,0,0.3)' }}>+</div>
                             )}
                             <span className="badge" style={{ position: 'absolute', top: '8px', left: '8px', background: 'var(--lg-red)', color:'white', fontSize: '0.65rem', padding: '2px 6px', transform: 'none', border:'1px solid white', zIndex: 20 }}>BUNDLE DEAL</span>
                          </div>
                        )}
                        <p><strong>Name:</strong> {msg.actionDetails.bundleName}</p>
                        <p><strong>Price:</strong> ${msg.actionDetails.price.toLocaleString()}</p>
                        <p><strong>Category:</strong> {msg.actionDetails.category}</p>
                        <p><strong>Includes:</strong> {msg.actionDetails.skus?.join(' + ')}</p>
                      </div>
                      <div className="action-row">
                        <button className="action-btn reject" onClick={() => {
                          setMessages(prev => [...prev, { role: 'agent', type: 'text', content: 'PTO Creation cancelled.'}]);
                        }}>Reject</button>
                        <button className="action-btn approve" style={{ background: 'var(--lg-red)' }} onClick={() => {
                          dispatchAiAction(msg.actionDetails);
                          setMessages(prev => [...prev, 
                            { role: 'agent', type: 'text', content: `Successfully deployed PTO Bundle: ${msg.actionDetails.bundleName} to the catalog.` },
                            { role: 'agent', type: 'action', actionDetails: { type: 'ASK_PREVIEW' } }
                          ]);
                        }}>Approve & Deploy</button>
                      </div>
                    </div>
                  )}

                  {/* List Promotions Card */}
                  {msg.type === 'list_promotions' && (
                    <div className="action-card" style={{ background: 'var(--lg-body-bg)' }}>
                      <div className="action-card-title">📝 Active Promotions ({activePromotions.length})</div>
                      {activePromotions.length === 0 ? <p style={{fontSize:'0.85rem'}}>No active promotions.</p> : (
                        <ul style={{fontSize:'0.85rem', paddingLeft:'20px'}}>
                          {activePromotions.map(p => (
                            <li key={p.id}>
                              <strong>[{p.id}]</strong> {p.discountType==='FIXED'?'$':''}{p.rate}{p.discountType==='PERCENT'?'%':''} off {p.target} {p.sku ? `(${p.sku})` : ''} - For: {p.audience} ({p.startDate} ~ {p.endDate})
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  )}
                </div>
              ))}
              {isTyping && (
                <div className="chat-bubble agent typing-indicator">
                  <div className="typing-dot"></div>
                  <div className="typing-dot"></div>
                  <div className="typing-dot"></div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>
          </div>

          <div className="ai-input-area">
            {activeAgent?.suggestions && (
              <div className="ai-suggestions-container">
                {activeAgent.suggestions.map((sug: string, idx: number) => (
                  <button 
                    key={idx} 
                    className="ai-suggestion-chip" 
                    onClick={() => submitMessage(sug)}
                  >
                    {sug}
                  </button>
                ))}
              </div>
            )}
            <form className="ai-input-wrap" onSubmit={handleSendMessage}>
              <input 
                type="text" 
                placeholder="Message your agent..." 
                value={inputText}
                onChange={e => setInputText(e.target.value)}
              />
              <button type="submit">↑</button>
            </form>
          </div>
        </>
      )}
    </div>
    {!isOpen && (
      <button 
        className="ai-toggle-btn"
        onMouseDown={(e) => {
          setIsDragging(true);
          dragRef.current = { startX: e.clientX, startY: e.clientY, btnX: btnPos.x, btnY: btnPos.y, moved: false };
        }}
        onClick={(e) => {
          if (dragRef.current.moved) return;
          setIsOpen(true);
        }}
        title="Expand Agent"
        style={{ left: `${btnPos.x}px`, top: `${btnPos.y}px`, cursor: isDragging ? 'grabbing' : 'grab' }}
      >
        <span style={{ fontSize: '1.4rem' }}>✨</span>
      </button>
    )}
    </>
  );
}

// Sub-component for the interactive form
function PromotionForm({ onSubmit }: { onSubmit: (data: any) => void }) {
  const [discountType, setDiscountType] = useState('PERCENT');
  const [rate, setRate] = useState(15);
  const [target, setTarget] = useState('All Products');
  const [sku, setSku] = useState('');
  const [audiences, setAudiences] = useState<string[]>(['All']);
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date(Date.now() + 86400000*30).toISOString().split('T')[0]);

  const handleAudienceChange = (aud: string) => {
    if (aud === 'All') {
      setAudiences(['All']);
    } else {
      setAudiences(prev => {
        const next = prev.filter(x => x !== 'All');
        if (next.includes(aud)) {
           const removed = next.filter(x => x !== aud);
           return removed.length === 0 ? ['All'] : removed;
        } else {
           return [...next, aud];
        }
      });
    }
  };

  return (
    <div className="chat-form">
      <div style={{ display: 'flex', gap: '8px' }}>
        <div style={{ flex: 1 }}>
          <label>Type</label>
          <select className="chat-input" value={discountType} onChange={e => setDiscountType(e.target.value)}>
            <option value="PERCENT">% Percent</option>
            <option value="FIXED">$ Amount</option>
          </select>
        </div>
        <div style={{ flex: 1 }}>
          <label>Value</label>
          <input type="number" className="chat-input" value={rate} onChange={e => setRate(Number(e.target.value))} />
        </div>
      </div>
      <div>
        <label>Target Scope</label>
        <select className="chat-input" value={target} onChange={e => setTarget(e.target.value)}>
          <option value="All Products">All Products</option>
          <option value="All TV">All TV</option>
          <option value="All Soundbar">All Soundbar</option>
          <option value="All Refrigerator">All Refrigerator</option>
          <option value="Specific SKU">Specific SKU</option>
        </select>
      </div>
      {target === 'Specific SKU' && (
        <div>
          <label>SKU Code</label>
          <input type="text" className="chat-input" placeholder="e.g. OLED65G4" value={sku} onChange={e => setSku(e.target.value)} />
        </div>
      )}
      <div>
        <label>Target Audience</label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '4px', marginBottom: '8px' }}>
          {['All', 'Guest', 'D2C', 'D2B2C', 'D2E'].map(aud => (
             <label key={aud} style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.85rem' }}>
                <input type="checkbox" checked={audiences.includes(aud)} onChange={() => handleAudienceChange(aud)} /> {aud}
             </label>
          ))}
        </div>
      </div>
      <div>
        <label>Start Date</label>
        <input type="date" className="chat-input" value={startDate} onChange={e => setStartDate(e.target.value)} />
      </div>
      <div style={{ marginTop: '8px' }}>
        <label>End Date</label>
        <input type="date" className="chat-input" value={endDate} onChange={e => setEndDate(e.target.value)} />
      </div>
      <button 
        className="btn btn-primary" 
        style={{ padding: '8px', fontSize: '0.85rem', width: '100%', marginTop: '12px' }}
        onClick={(e) => { e.preventDefault(); onSubmit({ discountType, rate, target, sku, audience: audiences.join(', '), startDate, endDate }); }}
      >
        Set Parameters
      </button>
    </div>
  );
}

// Stop Promotion Interactive Form
function StopPromotionForm({ activePromotions, onSubmit }: { activePromotions: any[], onSubmit: (id: string, schedule: string, date: string) => void }) {
  const [selectedId, setSelectedId] = useState('');
  const [scheduleType, setScheduleType] = useState('Immediate');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  if (activePromotions.length === 0) {
    return <div className="chat-form"><p style={{fontSize:'0.85rem'}}>No active promotions to stop.</p></div>;
  }

  return (
    <div className="chat-form">
       <label>Select Promotion to Terminate:</label>
       <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '12px', marginTop: '4px' }}>
         {activePromotions.map(p => (
            <label key={p.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', cursor: 'pointer' }}>
               <input type="radio" name="promo_stop" value={p.id} checked={selectedId === p.id} onChange={() => setSelectedId(p.id)} />
               <strong>[{p.id}]</strong> {p.target} ({p.discountType === 'PERCENT' ? p.rate+'%' : '$'+p.rate} OFF)
            </label>
         ))}
       </div>

       {selectedId && (
         <div style={{ animation: 'highlightFlash 0.5s ease-out' }}>
           <label>Termination Schedule:</label>
           <div style={{ display: 'flex', gap: '12px', marginTop: '4px', marginBottom: '8px' }}>
              <label style={{ fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                 <input type="radio" checked={scheduleType === 'Immediate'} onChange={() => setScheduleType('Immediate')} /> Immediate
              </label>
              <label style={{ fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                 <input type="radio" checked={scheduleType === 'Scheduled'} onChange={() => setScheduleType('Scheduled')} /> Future Date
              </label>
           </div>
           
           {scheduleType === 'Scheduled' && (
             <div style={{ marginBottom: '12px' }}>
               <label>Select Date:</label>
               <input type="date" className="chat-input" value={date} onChange={e => setDate(e.target.value)} />
             </div>
           )}

           <button 
              className="btn btn-primary" 
              style={{ background: 'var(--lg-red)', padding: '8px', fontSize: '0.85rem', width: '100%', marginTop: '4px', color:'white', border:'none', borderRadius:'4px', cursor:'pointer' }}
              onClick={(e) => { e.preventDefault(); onSubmit(selectedId, scheduleType, date); }}
            >
              Confirm Termination
           </button>
         </div>
       )}
    </div>
  );
}

// PTO Creation Interactive Form
function PtoCreationForm({ onSubmit }: { onSubmit: (name: string, price: number, skus: string[], category: string, images: string[]) => void }) {
  const [selectedSkus, setSelectedSkus] = useState<string[]>([]);
  const [individualPrices, setIndividualPrices] = useState<Record<string, number>>({});
  const [bundleName, setBundleName] = useState('');
  
  const FULL_CATALOG: Record<string, {sku: string, name: string, defaultPrice: number, imageUrl: string}[]> = {
    'TV / Audio': [
      { sku: 'OLED65G4', name: 'LG OLED evo G4 65" 4K Smart TV', defaultPrice: 2999, imageUrl: '/products/mock_oled.png' },
      { sku: 'OLED83C4', name: 'LG OLED evo C4 83" 4K Smart TV', defaultPrice: 5499, imageUrl: '/products/mock_oled.png' },
      { sku: 'S95TR', name: 'LG 9.1.5 ch High Res Audio Soundbar', defaultPrice: 1499, imageUrl: '/products/mock_oled.png' }
    ],
    'Kitchen Appliances': [
      { sku: 'LRYKC2606S', name: 'LG InstaView Refrigerator', defaultPrice: 3499, imageUrl: '/products/mock_fridge.png' },
      { sku: 'LSEL6337F', name: 'InstaView Electric Smart Range', defaultPrice: 2099, imageUrl: '/products/mock_fridge.png' }
    ],
    'Laundry': [
      { sku: 'WM4000HBA', name: 'LG Front Load Washer', defaultPrice: 1199, imageUrl: '/products/mock_washer.png' },
      { sku: 'WKE9900', name: 'LG WashTower Center', defaultPrice: 2299, imageUrl: '/products/mock_washer.png' }
    ],
    'IT / Computing': [
      { sku: '17Z90S-G.AA75K', name: 'LG gram 17" Laptop', defaultPrice: 1799, imageUrl: '/products/mock_laptop.png' }
    ]
  };

  const [currentPageProducts, setCurrentPageProducts] = useState<{sku: string, name: string, defaultPrice: number, imageUrl: string}[]>([]);

  useEffect(() => {
    const scrapeDOM = () => {
       const cards = document.querySelectorAll('.product-card');
       const scraped: {sku: string, name: string, defaultPrice: number, imageUrl: string}[] = [];
       cards.forEach((card) => {
          const skuNode = card.querySelector('.product-category');
          const nameNode = card.querySelector('.product-name');
          const priceNode = card.querySelector('.product-price');
          const imgNode = card.querySelector('.product-img');
          
          if (skuNode && nameNode && priceNode) {
             const sku = skuNode.textContent?.trim() || '';
             const name = nameNode.textContent?.trim() || '';
             const priceStr = priceNode.textContent?.replace(/[^\d.]/g, '') || '0';
             let price = parseFloat(priceStr);
             const imageUrl = imgNode?.getAttribute('src') || '/products/mock_laptop.png';
             if (sku && name) {
                 scraped.push({ sku, name, defaultPrice: price, imageUrl });
             }
          }
       });
       
       // dedupe by sku
       const unique: {sku: string, name: string, defaultPrice: number, imageUrl: string}[] = [];
       const seen = new Set();
       for (const p of scraped) {
          if (!seen.has(p.sku)) {
             unique.push(p);
             seen.add(p.sku);
          }
       }
       setCurrentPageProducts(unique);
    };

    scrapeDOM();
    document.addEventListener('astro:page-load', scrapeDOM);
    return () => document.removeEventListener('astro:page-load', scrapeDOM);
  }, []);

  const getFlatCatalog = () => {
     // merge FULL_CATALOG and currentPageProducts for pricing lookup
     return [...Object.values(FULL_CATALOG).flat(), ...currentPageProducts];
  };

  const [activeTab, setActiveTab] = useState<'current' | 'browse'>('current');
  const [browseCategory, setBrowseCategory] = useState<string>('TV / Audio');
  const [bundleCategory, setBundleCategory] = useState('TV / Audio');

  const handleToggle = (sku: string) => {
    setSelectedSkus(prev => {
      const isSelected = prev.includes(sku);
      if (isSelected) {
        const next = prev.filter(s => s !== sku);
        setIndividualPrices(p => {
           const copy = { ...p };
           delete copy[sku];
           return copy;
        });
        return next;
      } else {
        const defaultP = getFlatCatalog().find(c => c.sku === sku)?.defaultPrice || 0;
        setIndividualPrices(p => ({ ...p, [sku]: defaultP }));
        return [...prev, sku];
      }
    });
  };

  const handlePriceChange = (sku: string, price: number) => {
    setIndividualPrices(p => ({ ...p, [sku]: price }));
  };

  const calculateSuggestedBundleName = () => {
    setBundleName(`Premium Smart Set: ${selectedSkus.length} Items`);
  };

  const [discountType, setDiscountType] = useState('PERCENT');
  const [discountValue, setDiscountValue] = useState<number | ''>('');

  const bulkDiscountPrices = () => {
    if (!discountValue) return;
    const newPrices = { ...individualPrices };
    selectedSkus.forEach(sku => {
      const defaultP = getFlatCatalog().find(c => c.sku === sku)?.defaultPrice || 0;
      if (discountType === 'PERCENT') {
        newPrices[sku] = Math.max(0, Math.round(defaultP * (1 - Number(discountValue) / 100)));
      } else {
        newPrices[sku] = Math.max(0, defaultP - Number(discountValue));
      }
    });
    setIndividualPrices(newPrices);
    calculateSuggestedBundleName();
  };

  const currentTotal = selectedSkus.reduce((sum, sku) => sum + (individualPrices[sku] || 0), 0);
  const displayedCatalog = activeTab === 'current' ? currentPageProducts : FULL_CATALOG[browseCategory];

  return (
    <div className="chat-form" style={{ borderLeft: '3px solid var(--lg-red)', background: '#fff4f4' }}>
      <p style={{ margin: '0 0 10px 0', fontSize: '0.9rem', fontWeight: 'bold', color: 'var(--lg-red)' }}>Pick To Order Builder</p>
      
      <label>1. Select Base Products:</label>
      
      {/* Category Navigation Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '8px', marginTop: '4px' }}>
         <button 
           type="button" 
           onClick={() => setActiveTab('current')} 
           style={{ flex: 1, fontSize: '0.7rem', padding: '6px', borderRadius: '4px', border: '1px solid #ccc', background: activeTab === 'current' ? 'var(--lg-red)' : '#fff', color: activeTab === 'current' ? '#fff' : '#333' }}
         >
           Current Page ({currentPageProducts.length})
         </button>
         <button 
           type="button" 
           onClick={() => setActiveTab('browse')} 
           style={{ flex: 1, fontSize: '0.7rem', padding: '6px', borderRadius: '4px', border: '1px solid #ccc', background: activeTab === 'browse' ? 'var(--lg-red)' : '#fff', color: activeTab === 'browse' ? '#fff' : '#333' }}
         >
           Browse Full Catalog
         </button>
      </div>

      {activeTab === 'browse' && (
         <select 
            className="chat-input" 
            style={{ marginBottom: '8px', padding: '4px', fontSize: '0.8rem' }}
            value={browseCategory} 
            onChange={(e) => setBrowseCategory(e.target.value)}
         >
            {Object.keys(FULL_CATALOG).map(cat => (
               <option key={cat} value={cat}>{cat}</option>
            ))}
         </select>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '12px', background: '#fff', border: '1px solid #ddd', padding: '8px', borderRadius: '4px', maxHeight: '150px', overflowY: 'auto' }}>
        {displayedCatalog.length === 0 ? (
           <p style={{ fontSize: '0.8rem', color: '#888', margin: 0 }}>No products found.</p>
        ) : (
           displayedCatalog.map(c => (
             <label key={c.sku} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem' }}>
               <input type="checkbox" checked={selectedSkus.includes(c.sku)} onChange={() => handleToggle(c.sku)} />
               {c.name}
             </label>
           ))
        )}
      </div>

      {selectedSkus.length >= 2 && (
        <div style={{ animation: 'highlightFlash 0.5s ease-out' }}>
          <label>2. Assign Individual Bundle Pricing:</label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '12px', marginTop: '4px', background: '#fde8e8', padding: '10px', borderRadius: '4px' }}>
             {selectedSkus.map(sku => {
                const cat = getFlatCatalog().find(c => c.sku === sku);
                if (!cat) return null;
                return (
                  <div key={sku} style={{ display: 'flex', flexDirection: 'column' }}>
                     <span style={{ fontSize: '0.75rem', fontWeight: 'bold' }}>{cat.name}</span>
                     <span style={{ fontSize: '0.7rem', color: '#666', marginBottom: '4px' }}>Current D2C price: ${cat.defaultPrice.toLocaleString()}</span>
                     <input type="number" className="chat-input" value={individualPrices[sku]} onChange={(e) => handlePriceChange(sku, Number(e.target.value))} />
                  </div>
                )
             })}
             <div style={{ borderTop: '1px solid #fbcbc9', paddingTop: '8px', marginTop: '4px', fontSize: '0.9rem', fontWeight: 'bold', textAlign: 'right' }}>
                Total Target Bundle Price: ${currentTotal.toLocaleString()}
             </div>
          </div>

          <div style={{ display: 'flex', gap: '6px', alignItems: 'center', marginBottom: '12px', background: '#f5f5f5', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}>
             <select className="chat-input" style={{ minWidth: '75px', padding: '6px', fontSize: '0.8rem' }} value={discountType} onChange={e => setDiscountType(e.target.value)}>
               <option value="PERCENT">% Off</option>
               <option value="FIXED">$ Off</option>
             </select>
             <input type="number" className="chat-input" style={{ flex: 1, minWidth: '60px', padding: '6px' }} placeholder="Amount" value={discountValue} onChange={e => setDiscountValue(Number(e.target.value))} />
             <button 
                type="button" 
                style={{ fontSize: '0.75rem', padding: '6px 14px', whiteSpace: 'nowrap', background: 'var(--lg-black)', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }} 
                onClick={bulkDiscountPrices}
             >
               Apply
             </button>
          </div>

          <div style={{ marginBottom: '12px' }}>
             <label>3. Bundle Name</label>
             <input type="text" className="chat-input" value={bundleName} onChange={e => setBundleName(e.target.value)} placeholder="e.g. Dream Kitchen Combo" />
          </div>

          <div>
             <label>4. Destination Category</label>
             <select className="chat-input" style={{ width: '100%', padding: '6px', fontSize: '0.8rem' }} value={bundleCategory} onChange={e => setBundleCategory(e.target.value)}>
                {Object.keys(FULL_CATALOG).map(cat => <option key={cat} value={cat}>{cat}</option>)}
             </select>
          </div>

          <button 
            className="btn btn-primary" 
            style={{ width: '100%', marginTop: '12px', background: 'var(--lg-red)' }}
            onClick={(e) => { 
                e.preventDefault(); 
                if(bundleName && currentTotal > 0) {
                    const catalog = getFlatCatalog();
                    const imgs = selectedSkus.map(sku => catalog.find(c => c.sku === sku)?.imageUrl).filter((url): url is string => !!url);
                    onSubmit(bundleName, currentTotal, selectedSkus, bundleCategory, imgs); 
                }
            }}
            disabled={!bundleName || currentTotal <= 0}
          >
            Create PTO Combo (${currentTotal.toLocaleString()})
          </button>
        </div>
      )}
      {selectedSkus.length > 0 && selectedSkus.length < 2 && (
        <p style={{ fontSize: '0.8rem', color: '#888' }}>Select at least 2 items to form a bundle.</p>
      )}
    </div>
  );
}

// Promotion Details Toggle Component
function PromotionDetailsButton({ target, count, sku }: { target: string, count: number, sku?: string }) {
  const [show, setShow] = useState(false);
  
  // Mock some SKUs based on target to simulate DB query
  const mockSkus = target === 'All TV' ? ['OLED65G4', 'OLED77C3', '75UR8000', '86QNED80', `... and ${count - 4} more`] : 
                   target === 'Specific SKU' ? [sku || 'OLED65G4'] : 
                   target === 'All Soundbar' ? ['S95QR', 'SC9S', 'S75Q', `... and ${count - 3} more`] :
                   target === 'All Refrigerator' ? ['LFXS26596S', 'LRFVS3006S', 'LTCS24223S', `... and ${count - 3} more`] :
                   ['OLED65G4 (TV)', 'S95QR (Audio)', 'LFXS26596S (Home Appliance)', `... and ${count - 3} more products across catalog`];

  return (
    <div>
      <button 
        className="btn" 
        style={{ width: '100%', background: '#fff', border: '1px solid #bbf7d0', color: '#166534', padding: '8px', fontSize: '0.75rem', fontWeight: 'bold', borderRadius: '4px', cursor: 'pointer' }}
        onClick={() => setShow(!show)}
      >
        {show ? 'Hide Details' : 'Check Product Details'}
      </button>
      {show && (
        <div style={{ marginTop: '8px', background: '#fff', padding: '12px', borderRadius: '4px', border: '1px solid #e2e8f0', fontSize: '0.8rem', animation: 'fadeIn 0.3s ease' }}>
          <strong style={{ color: '#334155' }}>Affected Products:</strong>
          <ul style={{ paddingLeft: '20px', margin: '8px 0 0 0', color: '#475569', display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {mockSkus.map((s, i) => <li key={i}>{s}</li>)}
          </ul>
        </div>
      )}
    </div>
  );
}

// Rollout Setup Interactive Form
function RolloutSetupForm({ onSubmit }: { onSubmit: (data: any) => void }) {
  const [region, setRegion] = useState('ES');
  const [currency, setCurrency] = useState('EUR');
  const [language, setLanguage] = useState('es-ES');
  const [catalog, setCatalog] = useState('EU_Base_Catalog');
  const [complianceChecked, setComplianceChecked] = useState(false);

  return (
    <div className="chat-form">
      <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
        <div style={{ flex: 1 }}>
          <label>Region</label>
          <select className="chat-input" value={region} onChange={e => setRegion(e.target.value)}>
            <option value="ES">Spain (ES)</option>
            <option value="FR">France (FR)</option>
            <option value="IT">Italy (IT)</option>
            <option value="DE">Germany (DE)</option>
            <option value="BR">Brazil (BR)</option>
          </select>
        </div>
        <div style={{ flex: 1 }}>
          <label>Currency</label>
          <input type="text" className="chat-input" value={currency} onChange={e => setCurrency(e.target.value)} />
        </div>
      </div>
      <div style={{ marginBottom: '8px' }}>
        <label>Language Locale</label>
        <input type="text" className="chat-input" value={language} onChange={e => setLanguage(e.target.value)} />
      </div>
      <div style={{ marginBottom: '12px' }}>
        <label>Base Catalog Template</label>
        <select className="chat-input" value={catalog} onChange={e => setCatalog(e.target.value)}>
          <option value="EU_Base_Catalog">EU Standard Catalog</option>
          <option value="Global_Premium">Global Premium Tier</option>
          <option value="LATAM_Base">LATAM Standard</option>
        </select>
      </div>
      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: '#495057', cursor: 'pointer', marginBottom: '12px' }}>
        <input type="checkbox" checked={complianceChecked} onChange={e => setComplianceChecked(e.target.checked)} />
        Confirm regional tax & GDPR compliance checks
      </label>
      <button 
        className="btn btn-primary" 
        style={{ padding: '8px', fontSize: '0.85rem', width: '100%', background: 'var(--lg-red)', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        disabled={!complianceChecked}
        onClick={(e) => { e.preventDefault(); onSubmit({ region, currency, language, catalog }); }}
      >
        Prepare Launch
      </button>
    </div>
  );
}
