import React, { createContext, useContext, useState, useEffect } from 'react';

const InvoiceContext = createContext();

export function useInvoices() {
  return useContext(InvoiceContext);
}

export function InvoiceProvider({ children }) {
  const [invoices, setInvoices] = useState(() => {
    try {
      const stored = localStorage.getItem('invoiceiq_invoices');
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      console.error('Error reading localStorage:', e);
      return [];
    }
  });

  // Persist to localStorage whenever invoices array changes
  useEffect(() => {
    localStorage.setItem('invoiceiq_invoices', JSON.stringify(invoices));
  }, [invoices]);

  const addInvoice = (invoice) => {
    setInvoices(prev => {
      // Avoid duplicate by ID if possible
      const newInvoice = { ...invoice, id: invoice.id || Date.now(), createdAt: new Date().toISOString() };
      return [newInvoice, ...prev];
    });
  };

  const removeInvoice = (id) => {
    setInvoices(prev => prev.filter(inv => inv.id !== id));
  };

  const clearAllInvoices = () => {
    setInvoices([]);
    localStorage.removeItem('invoiceiq_invoices');
  };

  const value = {
    invoices,
    addInvoice,
    removeInvoice,
    clearAllInvoices
  };

  return (
    <InvoiceContext.Provider value={value}>
      {children}
    </InvoiceContext.Provider>
  );
}
