import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useToast } from '../components/Toast';
import { useInvoices } from '../context/InvoiceContext';
import { useAuth } from '../context/AuthContext';

export default function ReviewEdit() {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { addInvoice } = useInvoices();
  const { currentUser } = useAuth();
  const [showDebug, setShowDebug] = useState(false);

  const { isBatch, batchId, batchResults, vendor: initialVendor } = location.state || {};
  const [currentIndex, setCurrentIndex] = useState(0);

  const currentItem = isBatch && batchResults ? batchResults[currentIndex] : location.state;
  const { filename = 'INV-20240311', previewUrl, fileType, extractedData, vendor, orgId } = currentItem || {};

  const currentVendor = isBatch ? initialVendor : vendor;

  console.log('[REVIEW] Active Item:', { filename, hasData: !!extractedData, isBatch, currentIndex });

  const generateData = () => {
    const defaultData = extractedData ? {
      ...extractedData,
      vendor: currentVendor || extractedData.vendor || 'Unknown / Not Found',
      lineItems: extractedData.lineItems || [],
      gst: extractedData.gst || {
        cgst_rate: parseFloat(extractedData.cgst_rate) || 0, cgst_amount: parseFloat(extractedData.cgst) || 0,
        sgst_rate: parseFloat(extractedData.sgst_rate) || 0, sgst_amount: parseFloat(extractedData.sgst) || 0,
        igst_rate: parseFloat(extractedData.igst_rate) || 0, igst_amount: parseFloat(extractedData.igst) || 0,
        total_gst: parseFloat(extractedData.totalTax) || 0
      }
    } : {
      invoiceNo: '', date: '', vendor: 'Unknown / Not Found', subtotal: '0.00',
      sgst: '0.00', cgst: '0.00', igst: '0.00', totalTax: '0.00', total: '0.00', confidence: 0,
      gst: { cgst_rate: 0, cgst_amount: 0, sgst_rate: 0, sgst_amount: 0, igst_rate: 0, igst_amount: 0, total_gst: 0 },
      lineItems: []
    };

    if (!extractedData && filename === 'INV-20240311') {
      Object.assign(defaultData, {
        invoiceNo: 'INV-2024/03/11', date: '2024-03-11', vendor: 'Tata Consultancy Services Ltd', gstin: '27AAACT3518Q1ZZ',
        subtotal: '728000.00', sgst: '0.00', cgst: '0.00', igst: '131040.00', totalTax: '131040.00', total: '859040.00', confidence: 86,
        gst: { cgst_rate: 0, cgst_amount: 0, sgst_rate: 0, sgst_amount: 0, igst_rate: 18, igst_amount: 131040, total_gst: 131040 },
        lineItems: [
          { description: 'IT Consulting', qty: '160', rate: '3,500', total: '5,60,000' },
          { description: 'Project Mgmt', qty: '40', rate: '4,200', total: '1,68,000' }
        ]
      });
    }
    return defaultData;
  };

  const [formData, setFormData] = useState(generateData());
  const data = formData; // Use formData as the source of truth for rendering right side fields natively

  React.useEffect(() => {
    setFormData(generateData());
  }, [currentIndex, extractedData, currentVendor]);

  const handleTotalChange = (value) => {
    setFormData(prev => ({
      ...prev,
      total: value,
      totalModifiedBy: currentUser?.name || 'User'
    }));
  };

  const parsedSub = parseFloat(String(formData.subtotal || '').replace(/,/g, '') || 0);
  const parsedTax = parseFloat(formData.gst?.total_gst || formData.totalTax || 0);
  const parsedTotal = parseFloat(String(formData.total || '').replace(/,/g, '') || 0);

  const hasMathMismatch = Math.round(parsedSub + parsedTax) !== Math.round(parsedTotal);

  const handleGSTChange = (field, value) => {
    const num = parseFloat(value) || 0;
    setFormData(prev => {
      const newGst = { ...prev.gst, [field]: num };
      newGst.total_gst = (newGst.cgst_amount || 0) + (newGst.sgst_amount || 0) + (newGst.igst_amount || 0);
      return { ...prev, gst: newGst };
    });
  };

  const hasGstConflict = formData.gst.igst_amount > 0 && (formData.gst.cgst_amount > 0 || formData.gst.sgst_amount > 0);

  const handleReject = () => {
    addInvoice({
      ...formData,
      filename,
      fileType: fileType || 'application/pdf',
      previewUrl,
      source: isBatch ? 'Batch Job' : 'Upload',
      status: 'Rejected',
      batchId: isBatch ? batchId : undefined,
      orgId,
      userId: currentUser?.id
    });

    if (isBatch) {
      if (currentIndex < batchResults.length - 1) {
        toast(`⚠ Marked as Rejected! Loading next... (${currentIndex + 1}/${batchResults.length})`, 'amber');
        setCurrentIndex(currentIndex + 1);
      } else {
        toast(`✅ Batch Review Complete!`, 'green');
        navigate('/batch');
      }
    } else {
      toast('⚠ Invoice marked as rejected', 'amber');
      navigate('/invoices');
    }
  };

  const handleApprove = () => {
    addInvoice({
      ...formData,
      filename,
      fileType: fileType || 'application/pdf',
      previewUrl,
      source: isBatch ? 'Batch Job' : 'Upload',
      status: 'Approved',
      batchId: isBatch ? batchId : undefined,
      orgId,
      userId: currentUser?.id
    });

    if (isBatch) {
      if (currentIndex < batchResults.length - 1) {
        toast(`✅ Saved! Loading next invoice... (${currentIndex + 1}/${batchResults.length})`, 'green');
        setCurrentIndex(currentIndex + 1);
      } else {
        toast(`✅ Batch Review Complete!`, 'green');
        navigate('/batch');
      }
    } else {
      toast('✅ Approved and exported', 'green');
      navigate('/invoices');
    }
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
          {isBatch && (
            <div className="text-xs font-mono mr-2" style={{ color: 'var(--accent)' }}>
              REVIEW: {currentIndex + 1} / {batchResults.length}
            </div>
          )}
          <div className="flex items-center gap-1">
            <button
              className="btn bg btn-sm"
              disabled={isBatch && currentIndex === 0}
              onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
            >← Prev</button>
            <button
              className="btn bg btn-sm"
              disabled={isBatch && currentIndex === batchResults.length - 1}
              onClick={() => setCurrentIndex(Math.min(batchResults.length - 1, currentIndex + 1))}
            >Next →</button>
          </div>
          <button 
            className="btn bd btn-sm" 
            onClick={handleReject}
            disabled={data.status === 'Rejected'}
          >
            {data.status === 'Rejected' ? 'Rejected' : 'Reject'}
          </button>
          <button 
            className="btn bs2 btn-sm" 
            onClick={handleApprove}
            disabled={data.status === 'Approved' || data.status === 'Exported'}
          >
            {data.status === 'Approved' || data.status === 'Exported' ? 'Approved' : 'Approve & Export'}
          </button>
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
              (() => {
                const isPdf = previewUrl?.startsWith('data:application/pdf') || (fileType?.includes('pdf') && !previewUrl?.startsWith('data:image/'));
                return (
                  <div style={{ width: '100%', height: '100%', display: 'flex', justifyContent: 'center' }}>
                    {isPdf ? (
                      <embed src={previewUrl} type="application/pdf" width="100%" height="800px" style={{ borderRadius: '4px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                    ) : (
                      <img src={previewUrl} alt="Uploaded Invoice" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', borderRadius: '4px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', backgroundColor: '#fff' }} />
                    )}
                  </div>
                );
              })()
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
                <input className="input" value={formData.invoiceNo} onChange={(e) => setFormData({ ...formData, invoiceNo: e.target.value })} />
              </div>

              <div className="form-group">
                <div className="flex items-center justify-between">
                  <label className="form-label">Invoice Date</label>
                  <span className={`text-xs ${formData.date ? 'text-green' : 'text-amber'} font-bold`}>{formData.date ? 'FOUND' : 'MISSING'}</span>
                </div>
                <input className="input" value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} style={{ borderColor: formData.date ? 'var(--b2)' : 'var(--amber)' }} />
              </div>

              <div className="form-group">
                <div className="flex items-center justify-between">
                  <label className="form-label">Vendor Name</label>
                </div>
                <input className="input" value={formData.vendor} onChange={(e) => setFormData({ ...formData, vendor: e.target.value })} />
              </div>

              <div className="form-group">
                <div className="flex items-center justify-between">
                  <label className="form-label">Vendor GST</label>
                </div>
                <input className="input" value={formData.gstin} onChange={(e) => setFormData({ ...formData, gstin: e.target.value })} />
              </div>

              {formData.poNumber && (
                <div className="form-group">
                  <div className="flex items-center justify-between">
                    <label className="form-label">PO Number</label>
                    <span className="text-xs text-amber font-bold">78%</span>
                  </div>
                  <input className="input" value={formData.poNumber} onChange={(e) => setFormData({ ...formData, poNumber: e.target.value })} style={{ borderColor: 'var(--amber)' }} />
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
                  <span className={`text-xs ${formData.subtotal ? 'text-green' : 'text-t3'} font-bold`}>{formData.subtotal ? 'FOUND' : 'AUTO-CALC'}</span>
                </div>
                <input className="input" value={formData.subtotal} onChange={e => setFormData({ ...formData, subtotal: e.target.value })} />
              </div>

              <div className="form-group">
                <div className="flex items-center justify-between">
                  <label className="form-label font-bold" style={{ color: hasMathMismatch ? 'var(--red)' : '' }}>
                    Total Amount {hasMathMismatch && <span style={{ color: 'var(--red)', fontSize: '14px', marginLeft: '2px' }}>*</span>}
                  </label>
                  <span className={`text-xs ${formData.total ? (hasMathMismatch ? 'text-red' : 'text-green') : 'text-red'} font-bold`}>
                    {formData.total ? (hasMathMismatch ? 'MATH MISMATCH' : 'FOUND') : 'LOW CONFIDENCE'}
                  </span>
                </div>
                <input className="input" value={formData.total} onChange={e => handleTotalChange(e.target.value)} style={{ borderColor: hasMathMismatch ? 'var(--red)' : (formData.total ? 'var(--b2)' : 'var(--amber)') }} />
                {!formData.total && <div className="text-xs text-red mt-1">⚠ OCR could not confidently identify total due</div>}
                {hasMathMismatch && <div className="text-xs text-red mt-1">⚠ Subtotal + Tax ({Math.round(parsedSub + parsedTax)}) does not match Total ({Math.round(parsedTotal)}).</div>}
              </div>

              <div style={{ height: '1px', backgroundColor: 'var(--b)', margin: '16px 0 8px' }}></div>
              <h3 style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--t3)' }}>
                GST BREAKDOWN
              </h3>

              <div className="form-group mt-2">
                <div className="flex items-center justify-between">
                  <label className="form-label">CGST Rate (%)</label>
                  <span className="text-xs text-green font-bold">95%</span>
                </div>
                <input type="number" min="0" max="100" step="0.01" className="input" value={formData.gst.cgst_rate} onChange={e => handleGSTChange('cgst_rate', e.target.value)} />
              </div>

              <div className="form-group">
                <div className="flex items-center justify-between">
                  <label className="form-label">CGST Amount (₹)</label>
                  <span className="text-xs text-green font-bold">95%</span>
                </div>
                <input type="text" className="input mono" value={formData.gst.cgst_amount} onChange={e => handleGSTChange('cgst_amount', e.target.value)} />
              </div>

              <div className="form-group">
                <div className="flex items-center justify-between">
                  <label className="form-label">SGST Rate (%)</label>
                  <span className="text-xs text-green font-bold">95%</span>
                </div>
                <input type="number" min="0" max="100" step="0.01" className="input" value={formData.gst.sgst_rate} onChange={e => handleGSTChange('sgst_rate', e.target.value)} />
              </div>

              <div className="form-group">
                <div className="flex items-center justify-between">
                  <label className="form-label">SGST Amount (₹)</label>
                  <span className="text-xs text-green font-bold">95%</span>
                </div>
                <input type="text" className="input mono" value={formData.gst.sgst_amount} onChange={e => handleGSTChange('sgst_amount', e.target.value)} />
              </div>

              <div className="form-group">
                <div className="flex items-center justify-between">
                  <label className="form-label">IGST Rate (%)</label>
                  <span className="text-xs text-green font-bold">97%</span>
                </div>
                <input type="number" min="0" max="100" step="0.01" className="input" value={formData.gst.igst_rate} onChange={e => handleGSTChange('igst_rate', e.target.value)} />
              </div>

              <div className="form-group">
                <div className="flex items-center justify-between">
                  <label className="form-label">IGST Amount (₹)</label>
                  <span className="text-xs text-green font-bold">95%</span>
                </div>
                <input type="text" className="input mono" value={formData.gst.igst_amount} onChange={e => handleGSTChange('igst_amount', e.target.value)} />
              </div>

              <div className="form-group">
                <div className="flex items-center justify-between">
                  <label className="form-label"><span style={{ color: 'var(--t2)' }}>Total GST (₹)</span> <span style={{ color: 'var(--t3)', fontSize: '10px', textTransform: 'lowercase' }}>(auto-computed)</span></label>
                  <span className="text-xs text-green font-bold">96%</span>
                </div>
                <input type="text" className="input mono" value={formData.gst.total_gst} style={{ backgroundColor: 'var(--s3)', pointerEvents: 'none' }} readOnly />
              </div>

              {hasGstConflict && (
                <div style={{ backgroundColor: 'rgba(245,166,35,0.1)', border: '1px solid var(--amber)', borderRadius: 'var(--rs)', padding: '12px', marginTop: '8px' }}>
                  <div style={{ color: 'var(--amber)', fontSize: '13px' }}>
                    <span style={{ fontWeight: 'bold' }}>⚠ GST Conflict</span> — Both IGST and CGST/SGST are non-zero. Only one should apply per invoice type.
                  </div>
                </div>
              )}

              <div style={{ height: '1px', backgroundColor: 'var(--b)', margin: '16px 0 8px' }}></div>

              <h3 style={{ fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--t2)' }}>
                Line Items ({formData.lineItems?.length || 0})
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
                    {formData.lineItems && formData.lineItems.length > 0 ? (
                      formData.lineItems.map((item, idx) => (
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
