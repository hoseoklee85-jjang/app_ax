import React from 'react';

// Simple placeholder list of agents
const agents = ['AI Admin', 'Support Bot', 'Analytics Bot'];

export default function AgentList() {
  return (
    <div
      className="glass-panel"
      style={{
        position: 'fixed',
        top: '4rem', // below header
        left: '0',
        width: '200px',
        height: 'calc(100vh - 4rem)',
        borderRadius: '0 24px 24px 0',
        overflowY: 'auto',
        padding: '1rem',
        zIndex: 999,
        display: 'flex',
        flexDirection: 'column',
        gap: '0.8rem',
      }}
    >
      <h3 style={{ margin: 0, color: 'var(--text-h)', fontSize: '1.1rem' }}>Agents</h3>
      {agents.map((name, idx) => (
        <button
          key={idx}
          style={{
            background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            padding: '0.5rem 1rem',
            textAlign: 'left',
            cursor: 'pointer',
            fontWeight: 500,
            transition: 'transform 0.2s',
          }}
          onMouseOver={e => (e.currentTarget.style.transform = 'scale(1.02)')}
          onMouseOut={e => (e.currentTarget.style.transform = 'scale(1)')}
        >
          {name}
        </button>
      ))}
    </div>
  );
}
