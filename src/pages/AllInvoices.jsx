import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useInvoices } from '../context/InvoiceContext';
import { useAuth } from '../context/AuthContext';
import { useVendors } from '../context/VendorContext';

export default function AllInvoices() {
  const navigate = useNavigate();
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

  const location = useLocation();
  const [statusFilter, setStatusFilter] = useState(location.state?.statusFilter || 'All');
  const [vendorFilter, setVendorFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const uniqueVendors = [...new Set(scopedInvoices.map(i => i.vendor).filter(Boolean))];

  const filteredInvoices = scopedInvoices.filter(inv => {
    let matchStatus = false;
    if (statusFilter === 'All') matchStatus = true;
    else if (statusFilter === 'Done') matchStatus = ['Exported', 'Approved'].includes(inv.status);
    else if (statusFilter === 'Action Required') matchStatus = ['Pending', 'Needs Review'].includes(inv.status);
    else matchStatus = inv.status === statusFilter;

    const matchVendor = vendorFilter === 'All' || inv.vendor === vendorFilter;
    const searchLower = searchQuery.toLowerCase();
    const matchSearch = !searchQuery ||
      (inv.vendor && inv.vendor.toLowerCase().includes(searchLower)) ||
      (inv.invoiceNo && inv.invoiceNo.toLowerCase().includes(searchLower));
    return matchStatus && matchVendor && matchSearch;
  });

  const handleRowClick = () => navigate('/review');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

      {/* Page Context Row */}
      <div className="flex items-center justify-between">
        <div style={{ color: 'var(--t2)', fontSize: '13px' }}>
          {scopedInvoices.length} invoices · {scopedInvoices.filter(i => i.status === 'Pending').length} pending review
        </div>
        <div className="flex items-center gap-3">
          <select className="select" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            <option value="All">All Status</option>
            <option value="Action Required">Action Required</option>
            <option value="Done">Done (Approved/Exported)</option>
            <option value="Approved">Approved</option>
            <option value="Exported">Exported</option>
            <option value="Rejected">Rejected</option>
            <option value="Pending">Pending</option>
          </select>
          <select className="select" value={vendorFilter} onChange={e => setVendorFilter(e.target.value)}>
            <option value="All">All Vendors</option>
            {uniqueVendors.map(vendor => (
              <option key={vendor} value={vendor}>{vendor}</option>
            ))}
          </select>
          <button className="btn bg" onClick={() => navigate('/export')}>Export All</button>
        </div>
      </div>

      {/* Table Card */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="flex items-center justify-between" style={{ padding: '16px 20px', borderBottom: '1px solid var(--b)' }}>
          <h2 style={{ fontSize: '16px' }}>Invoice Records</h2>
          <input
            className="input"
            placeholder="Filter..."
            style={{ width: '170px' }}
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="overflow-y-auto w-full">
          <table style={{ minWidth: '900px' }}>
            <thead>
              <tr>
                <th style={{ width: '40px', textAlign: 'center' }}>☐</th>
                <th>Invoice No.</th>
                <th>Vendor</th>
                <th>Date</th>
                <th>Total (INR)</th>
                <th>Source</th>
                <th>Confidence</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredInvoices.length > 0 ? (
                filteredInvoices.map((inv) => (
                  <tr key={inv.id} style={{ cursor: 'pointer' }} onClick={() => navigate('/review', { state: { extractedData: inv, filename: inv.filename || inv.invoiceNo, fileType: inv.fileType || 'application/pdf', previewUrl: inv.previewBase64 || inv.previewUrl } })}>
                    <td style={{ textAlign: 'center' }} onClick={e => e.stopPropagation()}>☐</td>
                    <td>{inv.invoiceNo || 'Unknown'}</td>
                    <td>{inv.vendor}</td>
                    <td>{inv.date}</td>
                    <td>₹{inv.total}</td>
                    <td>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', backgroundColor: 'var(--s2)', padding: '2px 8px', borderRadius: 'var(--rs)', fontSize: '12px' }}>
                        {inv.source === 'Upload' ? '📤 Upload' : '📧 Email'}
                      </div>
                    </td>
                    <td>
                      <div className="flex items-center gap-2">
                        <div className="progress-container" style={{ width: '60px' }}>
                          <div className={`h-full ${inv.confidence >= 90 ? 'pb-gr' : inv.confidence >= 70 ? 'pb-am' : 'pb-red'}`} style={{ width: `${Math.min(100, Math.max(0, inv.confidence))}%` }}></div>
                        </div>
                        <span className={`text-xs font-bold ${inv.confidence >= 90 ? 'text-green' : inv.confidence >= 70 ? 'text-amber' : 'text-red'}`}>{inv.confidence}%</span>
                      </div>
                    </td>
                    <td><span className={`badge ${inv.status === 'Exported' || inv.status === 'Approved' ? 'b-s' : inv.status === 'Rejected' ? 'b-r' : 'b-w'}`}>{inv.status || 'Pending'}</span></td>
                    <td><button className="btn bg btn-xs" onClick={e => { e.stopPropagation(); navigate('/review', { state: { extractedData: inv, filename: inv.filename || inv.invoiceNo, fileType: inv.fileType || 'application/pdf', previewUrl: inv.previewBase64 || inv.previewUrl } }); }}>View</button></td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="9" style={{ textAlign: 'center', padding: '32px', color: 'var(--t2)' }}>
                    No invoices processed yet. Head over to Uploads to process an invoice.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Pagination */}
        <div className="flex items-center justify-between" style={{ padding: '16px 20px', borderTop: '1px solid var(--b)', fontSize: '13px', color: 'var(--t2)' }}>
          <div>Showing {filteredInvoices.length} of {scopedInvoices.length}</div>
          <div className="flex items-center gap-1">
            <button className="btn bg btn-sm" style={{ padding: '4px 8px' }}>← Prev</button>
            <button className="btn" style={{ padding: '4px 10px', backgroundColor: 'var(--accent)', color: '#fff' }}>1</button>
            <button className="btn bg" style={{ padding: '4px 10px', border: 'none' }}>2</button>
            <button className="btn bg" style={{ padding: '4px 10px', border: 'none' }}>3</button>
            <button className="btn bg btn-sm" style={{ padding: '4px 8px' }}>Next →</button>
          </div>
        </div>
      </div>
    </div>
  );
}
