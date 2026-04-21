import React, { createContext, useContext, useState } from 'react';

const FeatureFlagContext = createContext();

export function useFeatureFlags() {
  return useContext(FeatureFlagContext);
}

const DEFAULT_FLAGS = {
  inboxMonitor: true,
  processingQueue: true,
  emailReports: false,
  resendFailures: false,
  flowDiagram: false,
  emailConfig: true,
  replyTemplates: true,
};

export function FeatureFlagProvider({ children }) {
  const [flags, setFlags] = useState(() => {
    try {
      const stored = localStorage.getItem('invoiceiq_fflags');
      return stored ? JSON.parse(stored) : DEFAULT_FLAGS;
    } catch (e) {
      return DEFAULT_FLAGS;
    }
  });

  const toggleFlag = (key) => {
    setFlags(prev => {
      const updated = { ...prev, [key]: !prev[key] };
      localStorage.setItem('invoiceiq_fflags', JSON.stringify(updated));
      return updated;
    });
  };

  return (
    <FeatureFlagContext.Provider value={{ flags, toggleFlag }}>
      {children}
    </FeatureFlagContext.Provider>
  );
}