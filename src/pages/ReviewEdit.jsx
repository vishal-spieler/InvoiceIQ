import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useToast } from '../components/Toast';
import { useInvoices } from '../context/InvoiceContext';

export default function ReviewEdit() {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { addInvoice } = useInvoices();
  const [showDebug, setShowDebug] = useState(false);
  
  const { filename = 'INV-20240311', previewUrl, fileType, extractedData } = location.state || {};
  
  console.log('[REVIEW] Received State:', { filename, hasData: !!extractedData });

  const data = extractedData || {
    invoiceNo: '', // Start with empty if no data provided
    date: '',
    vendor: 'Unknown / Not Found',
    sgst: '0.00',
    cgst: '0.00',
    igst: '0.00',
    totalTax: '0.00',
    total: '0.00',
    confidence: 0,
    lineItems: []
  };

  // Default fallback if we are just viewing the page without an upload (for demo/dev)
  if (!extractedData && filename === 'INV-20240311') {
    Object.assign(data, {
      invoiceNo: 'INV-2024/03/11',
      date: '2024-03-11',
      vendor: 'Tata Consultancy Services Ltd',
      gstin: '27AAACT3518Q1ZZ',
      subtotal: '728000.00',
      sgst: '0.00',
      cgst: '0.00',
      igst: '131040.00',
      totalTax: '131040.00',
      total: '859040.00',
      confidence: 86,
      lineItems: [
        { description: 'IT Consulting', qty: '160', rate: '3,500', total: '5,60,000' },
        { description: 'Project Mgmt', qty: '40', rate: '4,200', total: '1,68,000' }
      ]
    });
  }

  const handleApprove = () => {
    addInvoice({
      ...data,
      filename,
      fileType,
      previewUrl,
      source: 'Upload',
      status: 'Exported'
    });
    toast('✅ Approved and exported', 'green');
    navigate('/invoices');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', marginTop: '-22px' }}>
      
      {/* Header local to component space to push split layout appropriately */}
      <div className="flex items-center justify-between" style={{ padding: '16px 0', borderBottom: '1px solid var(--b)', marginBottom: '16px' }}>
        <div>
          <div style={{ color: 'var(--t2)', fontSize: '13px' }}>
            {filename} · {data.vendor} · Confidence: {data.confidence}%
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <button className="btn bg btn-sm">← Prev</button>
            <button className="btn bg btn-sm">Next →</button>
          </div>
          <button className="btn bd btn-sm">Reject</button>
          <button className="btn bs2 btn-sm" onClick={handleApprove}>Approve & Export</button>
        </div>
      </div>

      {/* Split Layout */}
      <div className="grid" style={{ 
        flex: 1, 
        gridTemplateColumns: '1fr 1fr', 
        gap: '24px', 
        height: 'calc(100vh - 168px)',
        minHeight: '0'
      }}>
        
        {/* Left Panel - PDF Viewer */}
        <div className="flex col card" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="flex items-center justify-between" style={{ padding: '12px 16px', borderBottom: '1px solid var(--b)', backgroundColor: 'var(--surface)' }}>
            <div className="flex items-center gap-2">
              <button className="btn bg btn-xs">◀</button>
              <span className="mono text-xs">Page 1/1</span>
              <button className="btn bg btn-xs">▶</button>
            </div>
            <button className="btn bg btn-xs">Zoom</button>
          </div>
          
          <div className="flex-1 overflow-y-auto" style={{ padding: '24px', backgroundColor: '#e8eaf0', display: 'flex', justifyContent: 'center' }}>
            {previewUrl ? (
              <div style={{ width: '100%', height: '100%', display: 'flex', justifyContent: 'center' }}>
                {fileType?.includes('pdf') ? (
                  <embed src={previewUrl} type="application/pdf" width="100%" height="800px" style={{ borderRadius: '4px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                ) : (
                  <img src={previewUrl} alt="Uploaded Invoice" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', borderRadius: '4px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', backgroundColor: '#fff' }} />
                )}
              </div>
            ) : (
              <div style={{ 
                backgroundColor: '#fff', 
                padding: '40px', 
                borderRadius: '4px', 
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                width: '100%',
                maxWidth: '600px',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>📄</div>
                <h2 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '8px' }}>File Preview Unavailable</h2>
                <p style={{ color: 'var(--t2)', fontSize: '14px', maxWidth: '300px' }}>
                  The source file for "{filename}" is not available in the current browsing session. You must re-upload an invoice to fetch its local preview.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right Panel - Extracted Fields */}
        <div className="flex col card" style={{ padding: 0, overflow: 'hidden' }}>
          
          <div className="flex items-center justify-between" style={{ padding: '16px 20px', borderBottom: '1px solid var(--b)' }}>
            <div>
              <h2 style={{ fontSize: '16px', marginBottom: '4px' }}>Extracted Fields</h2>
              <div style={{ fontSize: '12px', color: 'var(--amber)' }}>3 fields need review</div>
            </div>
            
            {/* SVG Confidence Ring */}
            <div style={{ position: 'relative', width: '48px', height: '48px' }}>
              <svg viewBox="0 0 36 36" style={{ width: '100%', height: '100%' }}>
                <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="var(--s3)" strokeWidth="3" />
                <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke={data.confidence >= 90 ? 'var(--green)' : data.confidence >= 75 ? 'var(--amber)' : 'var(--red)'} strokeWidth="3" strokeDasharray={`${data.confidence}, 100`} />
              </svg>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 700 }}>
                {data.confidence}%
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto" style={{ padding: '20px' }}>
            <div className="flex col gap-4">
              
              <div className="form-group">
                <div className="flex items-center justify-between">
                  <label className="form-label">Invoice Number</label>
                  <span className={`text-xs ${data.invoiceNo ? 'text-green' : 'text-red'} font-bold`}>{data.invoiceNo ? 'FOUND' : 'MISSING'}</span>
                </div>
                <input className="input" defaultValue={data.invoiceNo} />
              </div>

              <div className="form-group">
                <div className="flex items-center justify-between">
                  <label className="form-label">Invoice Date</label>
                  <span className={`text-xs ${data.date ? 'text-green' : 'text-amber'} font-bold`}>{data.date ? 'FOUND' : 'MISSING'}</span>
                </div>
                <input className="input" defaultValue={data.date} style={{ borderColor: data.date ? 'var(--b2)' : 'var(--amber)' }} />
              </div>

              <div className="form-group">
                <div className="flex items-center justify-between">
                  <label className="form-label">Vendor Name</label>
                </div>
                <input className="input" defaultValue={data.vendor} />
              </div>

              <div className="form-group">
                <div className="flex items-center justify-between">
                  <label className="form-label">Vendor GST</label>
                </div>
                <input className="input" defaultValue={data.gstin} />
              </div>

              {data.poNumber && (
                <div className="form-group">
                  <div className="flex items-center justify-between">
                    <label className="form-label">PO Number</label>
                    <span className="text-xs text-amber font-bold">78%</span>
                  </div>
                  <input className="input" defaultValue={data.poNumber} style={{ borderColor: 'var(--amber)' }} />
                </div>
              )}

              <div className="form-group">
                <div className="flex items-center justify-between">
                  <label className="form-label">Currency</label>
                </div>
                <input className="input" defaultValue="INR" />
              </div>

              <div className="form-group">
                <div className="flex items-center justify-between">
                  <label className="form-label">Subtotal</label>
                  <span className={`text-xs ${data.subtotal ? 'text-green' : 'text-t3'} font-bold`}>{data.subtotal ? 'FOUND' : 'AUTO-CALC'}</span>
                </div>
                <input className="input" defaultValue={data.subtotal} />
              </div>

              <div className="form-group">
                <div className="flex items-center justify-between">
                  <label className="form-label">SGST</label>
                  <span className={`text-xs ${data.sgst ? 'text-green' : 'text-t3'} font-bold`}>
                    {data.sgst ? (data.totalTax && parseFloat(data.sgst) === parseFloat(data.totalTax) / 2 ? 'INFERRED' : 'FOUND') : 'MISSING'}
                  </span>
                </div>
                <input className="input" defaultValue={data.sgst} />
              </div>

              <div className="form-group">
                <div className="flex items-center justify-between">
                  <label className="form-label">CGST</label>
                  <span className={`text-xs ${data.cgst ? 'text-green' : 'text-t3'} font-bold`}>
                    {data.cgst ? (data.totalTax && parseFloat(data.cgst) === parseFloat(data.totalTax) / 2 ? 'INFERRED' : 'FOUND') : 'MISSING'}
                  </span>
                </div>
                <input className="input" defaultValue={data.cgst} />
              </div>

              <div className="form-group">
                <div className="flex items-center justify-between">
                  <label className="form-label">IGST</label>
                  <span className={`text-xs ${data.igst ? 'text-green' : 'text-t3'} font-bold`}>{data.igst ? 'FOUND' : 'MISSING'}</span>
                </div>
                <input className="input" defaultValue={data.igst} />
              </div>

              <div className="form-group">
                <div className="flex items-center justify-between">
                  <label className="form-label">Total Tax</label>
                  <span className={`text-xs ${data.totalTax ? 'text-green' : 'text-t3'} font-bold`}>{data.totalTax ? 'FOUND' : 'AUTO-CALC'}</span>
                </div>
                <input className="input" defaultValue={data.totalTax} />
              </div>

              <div className="form-group">
                <div className="flex items-center justify-between">
                  <label className="form-label border-red">Total Amount</label>
                  <span className={`text-xs ${data.total ? 'text-green' : 'text-red'} font-bold`}>{data.total ? 'FOUND' : 'LOW CONFIDENCE'}</span>
                </div>
                <input className="input" defaultValue={data.total} style={{ borderColor: data.total ? 'var(--b2)' : 'var(--red)' }} />
                {!data.total && <div className="text-xs text-red mt-1">⚠ OCR could not confidently identify total due</div>}
              </div>

              <div style={{ height: '1px', backgroundColor: 'var(--b)', margin: '16px 0 8px' }}></div>
              
              <h3 style={{ fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--t2)' }}>
                Line Items ({data.lineItems?.length || 0})
              </h3>
              
              <div style={{ backgroundColor: 'var(--s2)', borderRadius: 'var(--rs)', overflow: 'hidden', border: '1px solid var(--b)' }}>
                <table style={{ minWidth: '100%', tableLayout: 'fixed' }}>
                  <thead>
                    <tr>
                      <th style={{ width: '32%' }}>Description</th>
                      <th style={{ width: '12%' }}>HSN</th>
                      <th style={{ width: '10%' }}>Qty</th>
                      <th style={{ width: '16%' }}>Rate</th>
                      <th style={{ width: '14%' }}>Discount</th>
                      <th style={{ width: '16%' }}>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.lineItems && data.lineItems.length > 0 ? (
                      data.lineItems.map((item, idx) => (
                        <tr key={idx} style={{ backgroundColor: 'transparent' }}>
                          <td style={{ fontSize: '12px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={item.description}>
                            {item.description}
                          </td>
                          <td style={{ fontSize: '12px', color: 'var(--t3)' }}>{item.hsn || '—'}</td>
                          <td style={{ fontSize: '12px' }}>{item.qty}</td>
                          <td style={{ fontSize: '12px' }}>{item.rate}</td>
                          <td style={{ fontSize: '12px', color: item.discount ? 'var(--green)' : 'inherit' }}>{item.discount || '-'}</td>
                          <td style={{ fontSize: '12px' }}>{item.total}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="4" style={{ textAlign: 'center', padding: '20px', color: 'var(--t3)', fontSize: '12px' }}>
                          No line items detected in document text.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div style={{ height: '1px', backgroundColor: 'var(--b)', margin: '8px 0' }}></div>

              <div style={{ backgroundColor: 'rgba(245,166,35,0.1)', border: '1px solid var(--amber)', borderRadius: 'var(--rs)', padding: '12px', fontSize: '12px', color: 'var(--amber)' }}>
                <strong>Validation Warning</strong> — Subtotal+Tax matches Total. Date format corrected to ISO 8601.
              </div>

              {/* Debug Section */}
              <div style={{ marginTop: '24px', borderTop: '1px solid var(--b)', paddingTop: '16px' }}>
                <button 
                  className="btn bg btn-xs" 
                  onClick={() => setShowDebug(!showDebug)}
                  style={{ opacity: 0.5 }}
                >
                  {showDebug ? 'Hide Diagnostics' : 'Show OCR Diagnostics'}
                </button>
                
                {showDebug && (
                  <div style={{ marginTop: '12px', backgroundColor: '#000', padding: '12px', borderRadius: '4px', fontSize: '11px', color: '#0f0', fontFamily: 'monospace', overflowX: 'auto' }}>
                    <div style={{ marginBottom: '8px', color: '#fff', borderBottom: '1px solid #333', paddingBottom: '4px' }}>RAW OCR TEXT:</div>
                    <pre style={{ whiteSpace: 'pre-wrap', marginBottom: '16px' }}>{extractedData?.rawText || 'No raw text available.'}</pre>
                    
                    <div style={{ marginBottom: '8px', color: '#fff', borderBottom: '1px solid #333', paddingBottom: '4px' }}>PARSED JSON:</div>
                    <pre>{JSON.stringify(data, null, 2)}</pre>
                  </div>
                )}
              </div>

            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
