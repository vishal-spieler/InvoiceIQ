import React, { createContext, useContext, useState } from 'react';

const VendorContext = createContext();

export function useVendors() {
  return useContext(VendorContext);
}

const defaultVendors = [
  { id: 1, name: "Tata Consultancy Services", gstin: "27AAACT3518Q1ZZ", layout: "Semi-structured", source: "Email", invoices: 44, accuracy: 94.8, status: "Active" },
  { id: 2, name: "Infosys Limited",            gstin: "29AABCI1234A1Z1", layout: "Structured table", source: "Email", invoices: 38, accuracy: 97.2, status: "Active" },
  { id: 3, name: "Wipro Ltd",                  gstin: "29AABCW1234B1Z5", layout: "Free form",        source: "Upload", invoices: 28, accuracy: 88.1, status: "Draft"  },
  { id: 4, name: "Accenture Solutions",        gstin: "07AABCA1234C1ZZ", layout: "Scanned only",     source: "Email", invoices: 22, accuracy: 81.5, status: "Draft"  },
  { id: 5, name: "HCL Technologies",           gstin: "09AABCH1234D1Z2", layout: "Structured table", source: "Upload", invoices: 15, accuracy: 96.3, status: "Active" }
];

export function VendorProvider({ children }) {
  const [vendors, setVendors] = useState(() => {
    try {
      const stored = localStorage.getItem('invoiceiq_vendors');
      return stored ? JSON.parse(stored) : defaultVendors;
    } catch (e) {
      return defaultVendors;
    }
  });

  const addVendor = (vendor) => {
    const newVendor = {
      ...vendor,
      id: Date.now(),
      invoices: 0,
      accuracy: 0,
      source: "Upload",
      status: "Draft",
    };
    const newVendors = [...vendors, newVendor];
    setVendors(newVendors);
    localStorage.setItem('invoiceiq_vendors', JSON.stringify(newVendors));
  };

  return (
    <VendorContext.Provider value={{ vendors, addVendor }}>
      {children}
    </VendorContext.Provider>
  );
}
