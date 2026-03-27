import React, { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  // e.g. toast("Message", "green")
  const toast = useCallback((message, type = 'blue') => {
    const id = Date.now() + Math.random().toString(36).substr(2, 9);
    setToasts(prev => [...prev, { id, message, type }]);

    // Auto dismiss at 3.8s
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3800);
  }, []);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div 
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          zIndex: 9999,
          pointerEvents: 'none'
        }}
      >
        {toasts.map(t => (
          <div 
            key={t.id}
            style={{
              backgroundColor: '#fff',
              color: '#000',
              padding: '12px 16px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              fontWeight: 500,
              fontSize: '14px',
              animation: 'slideIn 0.3s ease-out forwards',
              fontFamily: '"DM Sans", sans-serif'
            }}
          >
            {/* Color Map: green → --green, blue → --accent, amber → --amber, red → --red */}
            <div style={{
              width: '8px', height: '8px', borderRadius: '50%',
              backgroundColor: 
                t.type === 'green' ? 'var(--green)' :
                t.type === 'amber' ? 'var(--amber)' :
                t.type === 'red' ? 'var(--red)' :
                'var(--accent)'
            }}></div>
            {t.message}
          </div>
        ))}
      </div>
      <style>{`
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `}</style>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
