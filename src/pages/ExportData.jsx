import React, { useState } from 'react';
import { useToast } from '../components/Toast';
import { useInvoices } from '../context/InvoiceContext';

export default function ExportData() {
  const { toast } = useToast();
  const { invoices } = useInvoices();

  const [fromDate, setFromDate] = useState('2024-03-01');
  const [toDate, setToDate] = useState(new Date().toISOString().split('T')[0]);
  const [vendorFilter, setVendorFilter] = useState('All Vendors');
  const [sourceFilter, setSourceFilter] = useState('All Sources');

  const uniqueVendors = [...new Set(invoices.map(i => i.vendor).filter(Boolean))];

  const filteredInvoices = invoices.filter(inv => {
    // Basic date parsing block
    const invDate = new Date(inv.date);
    const fromD = new Date(fromDate);
    const toD = new Date(toDate);
    
    // Normalize time to compare cleanly
    fromD.setHours(0,0,0,0);
    toD.setHours(23,59,59,999);
    
    const isWithinDate = isNaN(invDate.getTime()) ? true : (invDate >= fromD && invDate <= toD);
    const matchVendor = vendorFilter === 'All Vendors' || inv.vendor === vendorFilter;
    const matchSource = sourceFilter === 'All Sources' || 
                        (sourceFilter === 'Email only' && inv.source === 'Email') || 
                        (sourceFilter === 'Upload only' && inv.source === 'Upload');

    return isWithinDate && matchVendor && matchSource;
  });

  const handleExcelExport = () => {
    if (filteredInvoices.length === 0) {
      toast('⚠ No invoices match the selected filters', 'amber');
      return;
    }

    const headers = [
      'Invoice No', 'Vendor Name', 'Vendor GSTIN', 'Invoice Date', 'Due Date', 'PO Number',
      'Currency', 'Subtotal (₹)', 'CGST Rate (%)', 'CGST Amount (₹)', 'SGST Rate (%)', 'SGST Amount (₹)',
      'IGST Rate (%)', 'IGST Amount (₹)', 'Total GST (₹)', 'Total Amount (₹)', 'Bank Account', 'IFSC Code', 'Extracted At'
    ];
    
    // Fallback if gst isn't present on old invoices
    const safeGst = (inv) => inv.gst || { cgst_rate: 0, cgst_amount: 0, sgst_rate: 0, sgst_amount: 0, igst_rate: 0, igst_amount: 0, total_gst: 0 };

    const rows = filteredInvoices.map(inv => [
      inv.invoiceNo || 'N/A',
      inv.vendor || 'N/A',
      inv.gstin || 'N/A',
      inv.date || 'N/A',
      inv.dueDate || 'N/A',
      inv.poNumber || 'N/A',
      inv.currency || 'INR',
      inv.subtotal || '0.00',
      `${safeGst(inv).cgst_rate}%`,
      safeGst(inv).cgst_amount,
      `${safeGst(inv).sgst_rate}%`,
      safeGst(inv).sgst_amount,
      `${safeGst(inv).igst_rate}%`,
      safeGst(inv).igst_amount,
      safeGst(inv).total_gst,
      inv.total || '0.00',
      inv.bankAccount || 'N/A',
      inv.ifsc || 'N/A',
      inv.createdAt ? new Date(inv.createdAt).toLocaleString() : 'N/A'
    ]);

    const escapeCSV = (field) => {
      if (field === undefined || field === null) return '""';
      const str = String(field);
      if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };

    const csvContent = [
      headers.map(escapeCSV).join(','),
      ...rows.map(row => row.map(escapeCSV).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    
    link.href = url;
    link.setAttribute('download', `invoices_export_${new Date().toISOString().split('T')[0]}.csv`);
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast(`📊 Downloaded ${filteredInvoices.length} invoices as CSV`, 'green');
  };

  const handleDbPush = () => {
    toast('🗄️ 24 invoices pushed to database', 'blue');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Page Context */}
      <div style={{ color: 'var(--t2)', fontSize: '13px' }}>
        Download as Excel or push to PostgreSQL database.
      </div>

      <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        
        {/* Left Card - Excel Export */}
        <div className="card flex col justify-between">
          <div>
            <h2 style={{ fontSize: '16px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>📊</span> Export to Excel (.xlsx)
            </h2>

            <div className="flex col gap-4" style={{ marginBottom: '24px' }}>
              <div className="flex items-center gap-3">
                <div className="form-group flex-1">
                  <label className="form-label">From Date</label>
                  <input type="date" className="input" value={fromDate} onChange={e => setFromDate(e.target.value)} />
                </div>
                <div className="form-group flex-1">
                  <label className="form-label">To Date</label>
                  <input type="date" className="input" value={toDate} onChange={e => setToDate(e.target.value)} />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Vendor</label>
                <select className="select" value={vendorFilter} onChange={e => setVendorFilter(e.target.value)}>
                  <option>All Vendors</option>
                  {uniqueVendors.map(vendor => (
                    <option key={vendor} value={vendor}>{vendor}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Source</label>
                <select className="select" value={sourceFilter} onChange={e => setSourceFilter(e.target.value)}>
                  <option>All Sources</option>
                  <option>Email only</option>
                  <option>Upload only</option>
                </select>
              </div>

              <div style={{ backgroundColor: 'var(--s2)', padding: '16px', borderRadius: 'var(--rs)', marginTop: '8px' }}>
                <div style={{ fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '12px', color: 'var(--t2)' }}>
                  Include Sheets
                </div>
                <div className="flex col gap-3">
                  <label className="flex items-center gap-2" style={{ cursor: 'pointer' }}>
                    <input type="checkbox" defaultChecked style={{ accentColor: 'var(--green)', width: '16px', height: '16px' }} />
                    <span style={{ fontSize: '13px' }}>Summary <span style={{ color: 'var(--t3)' }}>(1 row per invoice)</span></span>
                  </label>
                  <label className="flex items-center gap-2" style={{ cursor: 'pointer' }}>
                    <input type="checkbox" defaultChecked style={{ accentColor: 'var(--green)', width: '16px', height: '16px' }} />
                    <span style={{ fontSize: '13px' }}>Line Items <span style={{ color: 'var(--t3)' }}>(detailed rows)</span></span>
                  </label>
                  <label className="flex items-center gap-2" style={{ cursor: 'pointer' }}>
                    <input type="checkbox" defaultChecked style={{ accentColor: 'var(--green)', width: '16px', height: '16px' }} />
                    <span style={{ fontSize: '13px' }}>GST Breakdown</span>
                  </label>
                  <label className="flex items-center gap-2" style={{ cursor: 'pointer' }}>
                    <input type="checkbox" style={{ width: '16px', height: '16px' }} />
                    <span style={{ fontSize: '13px' }}>Audit Log</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
          
          <button className="btn bs2 w-full" style={{ padding: '12px' }} onClick={handleExcelExport}>
            Download Excel →
          </button>
        </div>

        {/* Right Card - DB Push */}
        <div className="card flex col justify-between">
          <div>
            <div className="flex items-center justify-between" style={{ marginBottom: '24px' }}>
              <h2 style={{ fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>🗄️</span> Push to PostgreSQL
              </h2>
              <div className="flex items-center gap-2" style={{ backgroundColor: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)', padding: '4px 10px', borderRadius: '12px' }}>
                <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--green)' }}></div>
                <span style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--green)' }}>Connected</span>
              </div>
            </div>

            <div className="mono" style={{ fontSize: '12px', color: 'var(--t2)', marginBottom: '32px', backgroundColor: 'var(--s2)', padding: '12px', borderRadius: 'var(--rs)', border: '1px solid var(--b)' }}>
              supabase · db.xxxx.supabase.co · invoices table
            </div>

            <div className="flex col gap-4">
              <div className="flex items-center justify-between" style={{ paddingBottom: '12px', borderBottom: '1px solid var(--b)' }}>
                <span style={{ color: 'var(--t2)' }}>Ready to push</span>
                <span style={{ fontWeight: 700, color: 'var(--green)' }}>{filteredInvoices.length} invoices</span>
              </div>
              <div className="flex items-center justify-between" style={{ paddingBottom: '12px', borderBottom: '1px solid var(--b)' }}>
                <span style={{ color: 'var(--t2)' }}>Already in DB</span>
                <span style={{ fontWeight: 700 }}>24 invoices</span>
              </div>
              <div className="flex items-center justify-between" style={{ paddingBottom: '12px' }}>
                <span style={{ color: 'var(--t2)' }}>Duplicates blocked</span>
                <span style={{ fontWeight: 700, color: 'var(--red)' }}>2 invoices</span>
              </div>
            </div>
          </div>

          <button className="btn bp w-full" style={{ padding: '12px', marginTop: '32px' }} onClick={handleDbPush}>
            Push to Database →
          </button>
        </div>

      </div>
    </div>
  );
}
