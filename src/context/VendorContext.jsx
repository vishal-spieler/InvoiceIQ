import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../utils/supabaseClient';
import { useAuth } from './AuthContext';

const VendorContext = createContext();

export function useVendors() {
  return useContext(VendorContext);
}

export function VendorProvider({ children }) {
  const { currentUser } = useAuth();
  const [vendors, setVendors] = useState([]);

  const fetchVendors = async () => {
    if (!currentUser || !currentUser.orgId) {
      setVendors([]);
      return;
    }
    const { data } = await supabase.from('vendors').select('*').eq('org_id', currentUser.orgId);
    if (data) {
      setVendors(data.map(v => ({
        id: v.id,
        name: v.name,
        gstin: v.gstin,
        layout: v.category || 'Structured table',
        source: 'Upload',
        invoices: 0,
        accuracy: null,
        status: v.status
      })));
    }
  };

  useEffect(() => {
    fetchVendors();
  }, [currentUser?.orgId]);

  const addVendor = async (vendor) => {
    if (!currentUser || !currentUser.orgId) return;
    const { data, error } = await supabase.from('vendors').insert([{
      org_id: currentUser.orgId,
      name: vendor.name,
      gstin: vendor.gstin,
      category: vendor.layout,
      status: 'Active',
      emails: [],
      rules: { keyword: vendor.keyword, totalKeyword: vendor.totalKeyword }
    }]).select().single();

    if (data) {
      await fetchVendors();
    }
  };

  return (
    <VendorContext.Provider value={{ vendors, addVendor, fetchVendors }}>
      {children}
    </VendorContext.Provider>
  );
}
