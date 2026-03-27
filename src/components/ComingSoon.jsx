import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function ComingSoon({ title }) {
  const navigate = useNavigate();
  
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100%',
      textAlign: 'center',
      padding: '40px'
    }}>
      <div style={{ fontSize: '40px', marginBottom: '16px' }}>🚧</div>
      <h2 style={{ fontSize: '20px', marginBottom: '8px' }}>{title}</h2>
      <p style={{ color: 'var(--t2)', marginBottom: '24px', maxWidth: '400px', lineHeight: 1.6 }}>
        This module is coming in Phase 2. Core upload and review features are live.
      </p>
      <button 
        className="btn bg" 
        onClick={() => navigate('/upload')}
      >
        Go to Upload →
      </button>
    </div>
  );
}
