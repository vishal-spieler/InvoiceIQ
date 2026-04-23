import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../utils/supabaseClient';
import { useAuth } from './AuthContext';

const InvoiceContext = createContext();

export function useInvoices() {
  return useContext(InvoiceContext);
}

export function InvoiceProvider({ children }) {
  const { currentUser } = useAuth();
  const [invoices, setInvoices] = useState([]);
  const [batchJobs, setBatchJobs] = useState([]);

  useEffect(() => {
    if (currentUser?.orgId) {
      fetchInvoices();
      fetchBatchJobs();
    } else {
      setInvoices([]);
      setBatchJobs([]);
    }
  }, [currentUser]);

  const fetchInvoices = async () => {
    const { data, error } = await supabase
      .from('invoices')
      .select('*, vendors(name), invoice_line_items(*)')
      .eq('org_id', currentUser.orgId)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching invoices:', error);
    } else if (data) {
      // Map back to camelCase and filter out soft deletes via Javascript to avoid strict Postgres schema errors if migration is pending
      setInvoices(data.filter(inv => inv.is_deleted !== true).map(inv => ({
        id: inv.id,
        orgId: inv.org_id,
        vendorId: inv.vendor_id,
        vendor: inv.vendors?.name || 'Unknown Vendor',
        invoiceNo: inv.invoice_no,
        date: inv.date,
        subtotal: inv.subtotal,
        totalTax: inv.total_tax,
        total: inv.total,
        gst: inv.gst || {},
        confidence: inv.confidence,
        status: inv.status,
        source: inv.source,
        batchId: inv.batch_id,
        buyerGstin: inv.buyer_gstin,
        sellerGstin: inv.seller_gstin,
        packagingAmount: inv.packaging_amount,
        previewBase64: inv.preview_base64,
        createdAt: inv.created_at,
        lineItems: inv.invoice_line_items ? inv.invoice_line_items.map(li => ({
          id: li.id,
          description: li.description,
          qty: li.qty,
          rate: li.rate,
          hsn: li.hsn,
          discount: li.discount,
          total: li.total
        })) : [],
      })));
    }
  };

  const addInvoice = async (invoiceData) => {
    let resolvedVendorId = invoiceData.vendorId || null;

    // If we only have a vendor string, try to resolve it from the DB or create it
    if (!resolvedVendorId && invoiceData.vendor && currentUser?.orgId) {
       const vName = invoiceData.vendor.trim();
       const { data: vmatch } = await supabase
         .from('vendors')
         .select('id')
         .eq('org_id', currentUser.orgId)
         .ilike('name', vName)
         .limit(1)
         .maybeSingle();

       if (vmatch) {
         resolvedVendorId = vmatch.id;
       } else {
         // Auto-create missing vendor to prevent Unknown Vendor issues
         const { data: newV } = await supabase
           .from('vendors')
           .insert([{ org_id: currentUser.orgId, name: vName, status: 'Active' }])
           .select()
           .single();
         if (newV) resolvedVendorId = newV.id;
       }
    }

    // invoiceData needs to be mapped to snake_case for DB
    const sanitizeNum = (val) => val ? (parseFloat(String(val).replace(/,/g, '')) || null) : null;
    
    // Safely format dates to YYYY-MM-DD to avoid PostgreSQL out-of-range errors on DD-MM-YYYY
    const sanitizeDate = (val) => {
      if (!val) return null;
      const str = String(val).trim();
      const parts = str.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{2,4})$/);
      if (parts) {
        const day = parts[1].padStart(2, '0');
        const month = parts[2].padStart(2, '0');
        let year = parts[3];
        if (year.length === 2) year = '20' + year;
        return `${year}-${month}-${day}`;
      }
      return str; // let it pass-through for DB to attempt standard parse
    };

    const dbInvoice = {
      org_id: currentUser.orgId,
      vendor_id: resolvedVendorId,
      invoice_no: invoiceData.invoiceNo || null,
      date: sanitizeDate(invoiceData.date),
      subtotal: sanitizeNum(invoiceData.subtotal),
      total_tax: sanitizeNum(invoiceData.totalTax || invoiceData.gst?.total_gst),
      total: sanitizeNum(invoiceData.total),
      gst: invoiceData.gst || {},
      confidence: invoiceData.confidence !== undefined ? invoiceData.confidence : null,
      status: invoiceData.status || 'Pending',
      source: invoiceData.source || 'Upload',
      batch_id: invoiceData.batchId || null,
      buyer_gstin: invoiceData.buyerGstin || null,
      seller_gstin: invoiceData.sellerGstin || null,
      packaging_amount: invoiceData.packagingAmount || null,
      preview_base64: invoiceData.previewBase64 || invoiceData.previewUrl || null
    };

    let inserted;
    let insertError;

    if (invoiceData.id) {
      // UPATE EXISTING INVOICE
      const { data, error } = await supabase
        .from('invoices')
        .update(dbInvoice)
        .eq('id', invoiceData.id)
        .select()
        .single();
      
      inserted = data;
      insertError = error;

      if (!error) {
        // Clear out old line items before adding new ones
        await supabase.from('invoice_line_items').delete().eq('invoice_id', invoiceData.id);
      }
    } else {
      // INSERT NEW INVOICE
      const { data, error } = await supabase
        .from('invoices')
        .insert([dbInvoice])
        .select()
        .single();
      
      inserted = data;
      insertError = error;
    }

    if (insertError) {
      console.error('Error saving invoice:', insertError);
      alert('DATABASE ERROR: ' + insertError.message + ' | Details: ' + insertError.details);
      return null;
    }
    
    // Add line items if present
    if (invoiceData.lineItems && invoiceData.lineItems.length > 0) {
       const dbItems = invoiceData.lineItems.map(li => ({
         invoice_id: inserted.id,
         description: li.description || '',
         qty: String(li.qty || ''),
         rate: String(li.rate || ''),
         hsn: String(li.hsn || ''),
         discount: String(li.discount || ''),
         total: String(li.total || '')
       }));
       const { error: lineErr } = await supabase.from('invoice_line_items').insert(dbItems);
       if (lineErr) alert('LINE ITEMS DB ERROR: ' + lineErr.message);
    }
    
    await fetchInvoices();
    return inserted;
  };

  const removeInvoice = async (id) => {
    // Perform a soft delete by updating the is_deleted flag instead of permanently destroying the row
    const { error } = await supabase.from('invoices').update({ is_deleted: true }).eq('id', id);
    if (!error) {
      setInvoices(prev => prev.filter(inv => inv.id !== id));
    } else {
      console.error('Error deleting invoice:', error);
    }
  };

  const clearAllInvoices = async () => {
    // Only clear what we are allowed to
    const { error } = await supabase.from('invoices').delete().eq('org_id', currentUser.orgId);
    if (!error) {
      setInvoices([]);
    }
  };

  const fetchBatchJobs = async () => {
    const { data, error } = await supabase
      .from('batch_jobs')
      .select('*')
      .eq('org_id', currentUser.orgId)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching batch jobs:', error);
    } else if (data) {
      setBatchJobs(data.map(job => ({
        id: job.id,
        orgId: job.org_id,
        filename: job.filename,
        status: job.status,
        totalFiles: job.total_files,
        successCount: job.success_count,
        failCount: job.fail_count,
        results: job.results || [],
        createdAt: job.created_at
      })));
    }
  };

  const addBatchJob = async (job) => {
    const dbJob = {
      org_id: currentUser.orgId,
      filename: job.filename,
      status: job.status || 'Processing',
      total_files: job.totalFiles || 0,
      success_count: job.successCount || 0,
      fail_count: job.failCount || 0,
      results: job.results || []
    };
    
    const { data, error } = await supabase.from('batch_jobs').insert([dbJob]).select().single();
    if (!error) {
      await fetchBatchJobs();
      return data;
    }
    return null;
  };

  const updateBatchJob = async (id, newJobData) => {
    const updates = {};
    if (newJobData.status !== undefined) updates.status = newJobData.status;
    if (newJobData.totalFiles !== undefined) updates.total_files = newJobData.totalFiles;
    if (newJobData.successCount !== undefined) updates.success_count = newJobData.successCount;
    if (newJobData.failCount !== undefined) updates.fail_count = newJobData.failCount;
    if (newJobData.results !== undefined) updates.results = newJobData.results;

    const { error } = await supabase.from('batch_jobs').update(updates).eq('id', id);
    if (!error) await fetchBatchJobs();
  };

  const removeBatchJob = async (id) => {
    const { error } = await supabase.from('batch_jobs').delete().eq('id', id);
    if (!error) {
      setBatchJobs(prev => prev.filter(job => job.id !== id));
    }
  };

  const value = {
    invoices,
    addInvoice,
    removeInvoice,
    clearAllInvoices,
    batchJobs,
    addBatchJob,
    removeBatchJob,
    updateBatchJob
  };

  return (
    <InvoiceContext.Provider value={value}>
      {children}
    </InvoiceContext.Provider>
  );
}