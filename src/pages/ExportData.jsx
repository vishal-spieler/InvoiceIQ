import React, { useState } from 'react';
import ExcelJS from 'exceljs';
import { useToast } from '../components/Toast';
import { useInvoices } from '../context/InvoiceContext';
import { useAuth } from '../context/AuthContext';
import { useVendors } from '../context/VendorContext';

export default function ExportData() {
  const { toast } = useToast();
  const { invoices } = useInvoices();
  const { currentUser } = useAuth();
  const { vendors } = useVendors();

  const scopedInvoices = React.useMemo(() => {
    let scoped = invoices.filter(i => i.orgId === currentUser?.orgId);
    
    if (currentUser?.role === 'vendor' || currentUser?.vendorId) {
      const vObj = vendors.find(v => v.id === currentUser.vendorId);
      const targetVendorName = vObj ? vObj.name : currentUser.name;
      scoped = scoped.filter(i => i.vendorId === currentUser.vendorId || i.vendor === targetVendorName);
    }
    return scoped;
  }, [invoices, currentUser, vendors]);

  const [fromDate, setFromDate] = useState('2024-03-01');
  const [toDate, setToDate] = useState(new Date().toISOString().split('T')[0]);
  const [vendorFilter, setVendorFilter] = useState('All Vendors');
  const [sourceFilter, setSourceFilter] = useState('All Sources');

  const uniqueVendors = [...new Set(scopedInvoices.map(i => i.vendor).filter(Boolean))];

  const filteredInvoices = scopedInvoices.filter(inv => {
    // Basic date parsing block using createdAt (or fallback to true if missing)
    const recordDateStr = inv.createdAt || inv.date;
    const invDate = new Date(recordDateStr);
    const fromD = new Date(fromDate);
    const toD = new Date(toDate);

    // Normalize time to compare cleanly
    fromD.setHours(0, 0, 0, 0);
    toD.setHours(23, 59, 59, 999);

    // If invalid date or null, we just include it
    const isWithinDate = !recordDateStr || isNaN(invDate.getTime()) ? true : (invDate >= fromD && invDate <= toD);
    const matchVendor = vendorFilter === 'All Vendors' || inv.vendor === vendorFilter;
    const matchSource = sourceFilter === 'All Sources' ||
      (sourceFilter === 'Email only' && inv.source === 'Email') ||
      (sourceFilter === 'Upload only' && inv.source === 'Upload');

    return isWithinDate && matchVendor && matchSource;
  });

  const handleExcelExport = async () => {
    if (filteredInvoices.length === 0) {
      toast('⚠ No invoices match the selected filters', 'amber');
      return;
    }

    const safeGst = (inv) => inv.gst || { cgst_rate: 0, cgst_amount: 0, sgst_rate: 0, sgst_amount: 0, igst_rate: 0, igst_amount: 0, total_gst: 0 };

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Invoices');
    worksheet.properties.outlineProperties = { summaryBelow: false, summaryRight: false };

    worksheet.columns = [
      { header: 'Type', key: 'type', width: 12 },
      { header: 'Invoice No', key: 'invoiceNo', width: 22 },
      { header: 'Vendor Name', key: 'vendorName', width: 30 },
      { header: 'Seller GSTIN', key: 'sellerGstin', width: 20 },
      { header: 'Buyer GSTIN', key: 'buyerGstin', width: 20 },
      { header: 'Invoice Date', key: 'date', width: 15 },
      { header: 'Status', key: 'status', width: 12 },
      { header: 'Currency', key: 'currency', width: 10 },
      { header: 'Subtotal', key: 'subtotal', width: 15 },
      { header: 'Packaging (₹)', key: 'packagingAmount', width: 15 },
      { header: 'Total GST', key: 'totalGst', width: 15 },
      { header: 'Total Amount', key: 'total', width: 15 },
      { header: 'Item Description', key: 'desc', width: 40 },
      { header: 'Item HSN', key: 'hsn', width: 15 },
      { header: 'Item Qty', key: 'qty', width: 10 },
      { header: 'Item Rate', key: 'rate', width: 15 },
      { header: 'Item Discount', key: 'discount', width: 12 },
      { header: 'Item Total', key: 'itemTotal', width: 15 }
    ];

    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE1E1E1' } };

    filteredInvoices.forEach(inv => {
      const g = safeGst(inv);
      const mainRow = worksheet.addRow({
        type: 'INVOICE',
        invoiceNo: inv.invoiceNo || 'N/A',
        vendorName: inv.vendor || 'N/A',
        sellerGstin: inv.sellerGstin || 'N/A',
        buyerGstin: inv.buyerGstin || 'N/A',
        date: inv.date || 'N/A',
        status: inv.status || 'Pending',
        currency: inv.currency || 'INR',
        subtotal: inv.subtotal || '0.00',
        packagingAmount: inv.packagingAmount || '0.00',
        totalGst: g.total_gst || 0,
        total: inv.total || '0.00',
        desc: '', hsn: '', qty: '', rate: '', discount: '', itemTotal: ''
      });
      mainRow.font = { bold: true };

      if (inv.lineItems && inv.lineItems.length > 0) {
        inv.lineItems.forEach(li => {
          const childRow = worksheet.addRow({
            type: 'LINE ITEM',
            invoiceNo: '', vendorName: '', sellerGstin: '', buyerGstin: '', date: '', status: '', currency: '',
            subtotal: '', packagingAmount: '', totalGst: '', total: '',
            desc: li.description || '',
            hsn: li.hsn || '',
            qty: li.qty || '',
            rate: li.rate || '',
            discount: li.discount || '',
            itemTotal: li.total || ''
          });
          childRow.outlineLevel = 1;
        });
      }
    });

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.href = url;
    link.download = `invoices_export_${new Date().toISOString().split('T')[0]}.xlsx`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast(`📊 Downloaded ${filteredInvoices.length} invoices as XLSX`, 'green');
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
