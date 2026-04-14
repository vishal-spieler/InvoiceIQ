import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../components/Toast';
import { useInvoices } from '../context/InvoiceContext';
import { useVendors } from '../context/VendorContext';
import { useAuth } from '../context/AuthContext';
import { processInvoice } from '../utils/extraction';

export default function UploadInvoices() {
  const [dragActive, setDragActive] = useState(false);
  const [fileState, setFileState] = useState('idle'); // idle | processing | success
  const [uploadedFile, setUploadedFile] = useState(null); // { name, type }
  const navigate = useNavigate();
  const { toast } = useToast();
  const { invoices, addInvoice, addBatchJob } = useInvoices();
  const { vendors } = useVendors();
  const { currentUser } = useAuth();
  const fileInputRef = useRef(null);
  
  const isVendor = currentUser?.role === 'vendor';
  const [selectedVendor, setSelectedVendor] = useState('');
  const [vendorError, setVendorError] = useState(false);

  const [toggles, setToggles] = useState({
    ocr: true,
    lineItems: true,
    duplicate: true
  });

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      startProcessing(e.dataTransfer.files[0]);
    }
  };

  const startProcessing = async (file) => {
    if (!selectedVendor) {
      setVendorError(true);
      return;
    }
    setVendorError(false);

    const previewUrl = URL.createObjectURL(file);
    // Clear previous extraction data to prevent mock-bleed
    setUploadedFile({ name: file.name, type: file.type, url: previewUrl, extractedData: null, isBatch: false, batchResults: [] });
    setFileState('processing');
    
    try {
      const isZip = file.type === 'application/zip' || file.type === 'application/x-zip-compressed' || file.name.endsWith('.zip');
      const endpoint = isZip ? '/api/batch-extract' : '/api/extract';

      const formData = new FormData();
      formData.append('file', file);

      console.log(`[FRONTEND] Uploading ${file.name} to ${endpoint}...`);
      const response = await fetch(endpoint, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Backend Error: ${errText}`);
      }
      
      const data = await response.json();
      console.log('[FRONTEND] AI Data Received:', data);
      
      if (isZip) {
        setUploadedFile(prev => ({ ...prev, isBatch: true, batchResults: data.results }));
        
        let successCount = 0;
        let failCount = 0;
        if (data.results && Array.isArray(data.results)) {
           data.results.forEach(r => r.status === 'success' ? successCount++ : failCount++);
        }
        
        addBatchJob({
           filename: file.name,
           vendor: selectedVendor,
           orgId: currentUser?.orgId,
           results: data.results,
           successCount,
           failCount,
           totalFiles: data.results ? data.results.length : 0,
           status: failCount > 0 ? 'Errors' : 'Done'
        });
        
        toast(`✅ Batch captured! ${successCount} invoices extracted. Redirecting...`, 'green');
        setTimeout(() => navigate('/batch'), 1500);
      } else {
        setUploadedFile(prev => ({ ...prev, isBatch: false, extractedData: data }));
        toast(`✅ Precision extraction complete!`, 'green');
      }

      setFileState('success');
    } catch (err) {
      console.error('[FRONTEND ERROR]', err);
      setFileState('idle');
      toast(`❌ Extraction failed: ${err.message}`, 'red');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ color: 'var(--t2)', fontSize: '13px' }}>
        Drag and drop PDFs or browse — single file or batch ZIP.
      </div>

      {/* Vendor Selection Bar / Tag */}
      <div style={{ 
        backgroundColor: 'var(--surface)', 
        border: `1px solid ${vendorError ? 'var(--amber)' : 'var(--b)'}`, 
        borderRadius: 'var(--r)', 
        padding: '14px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div className="flex items-center gap-3">
          <div style={{ width: 32, height: 32, borderRadius: '8px', backgroundColor: 'var(--s2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            🏢
          </div>
          <div>
            <div style={{ fontSize: '13px', fontWeight: 600, fontFamily: 'Syne' }}>Select Supplier</div>
            <div className="text-xs text-t2 mt-1">Extractions will be tagged to the selected supplier</div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {selectedVendor && <span className="badge b-s">✓ {selectedVendor}</span>}
          <select 
            className="select" 
            style={{ width: '200px' }}
            value={selectedVendor}
            onChange={e => {
              setSelectedVendor(e.target.value);
              setVendorError(false);
            }}
          >
            <option value="">-- Select Supplier --</option>
            {vendors.map(v => (
              <option key={v.id} value={v.name}>{v.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Drop Zone */}
      <div 
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => {
          if (fileState === 'idle') {
            if (!selectedVendor) {
              setVendorError(true);
              return;
            }
            fileInputRef.current?.click();
          }
        }}
        style={{
          border: `2px dashed ${dragActive ? 'var(--accent)' : 'var(--b2)'}`,
          borderRadius: 'var(--rl)',
          padding: '36px',
          backgroundColor: dragActive ? 'var(--ag)' : 'transparent',
          transition: 'all 0.2s',
          cursor: fileState === 'idle' ? 'pointer' : 'default',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '220px',
          textAlign: 'center'
        }}
      >
        <input 
          type="file" 
          ref={fileInputRef} 
          style={{ display: 'none' }} 
          accept=".pdf,.zip,image/*" 
          onChange={(e) => {
            if (e.target.files?.length) {
              if (!selectedVendor) {
                setVendorError(true);
                return;
              }
              startProcessing(e.target.files[0]);
            }
          }} 
        />
        
        {fileState === 'idle' && (
          <>
            <div style={{ fontSize: '36px', marginBottom: '12px' }}>📎</div>
            <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '8px' }}>Drop invoice PDFs here</h3>
            <p style={{ color: 'var(--t2)', fontSize: '13px' }}>
              <span style={{ color: 'var(--accent)', cursor: 'pointer' }}>or browse files</span> · PDF, ZIP · Max 50 MB
            </p>
            {vendorError && (
              <div style={{ marginTop: '16px', color: 'var(--amber)', fontWeight: 500, display: 'inline-flex', alignItems: 'center', gap: '8px', backgroundColor: 'rgba(245,166,35,0.1)', padding: '6px 12px', borderRadius: '16px' }}>
                ⚠ Please select a vendor before uploading
              </div>
            )}
          </>
        )}

        {fileState === 'processing' && (
          <>
            {/* Spinner */}
            <div style={{
              width: '36px', height: '36px',
              border: '3px solid rgba(79,124,255,0.2)',
              borderTopColor: 'var(--accent)',
              borderRadius: '50%',
              marginBottom: '16px',
              animation: 'spin 1s linear infinite'
            }}></div>
            <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '8px' }}>Processing {uploadedFile?.name || 'Invoice'}…</h3>
            <p style={{ color: 'var(--t2)', fontSize: '13px' }}>Detecting file type · Extracting content · AI extraction</p>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </>
        )}

        {fileState === 'success' && (
          <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
            <div style={{ fontSize: '36px', marginBottom: '12px' }}>✅</div>
            <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '8px', color: 'var(--green)' }}>Extracted Successfully!</h3>
            <p style={{ color: 'var(--t2)', fontSize: '13px', marginBottom: '16px' }}>
              {uploadedFile?.isBatch 
                ? `Processed batch file: ${uploadedFile.name}` 
                : <>Tagged to <strong>{selectedVendor}</strong> · Confidence: 94%</>}
            </p>
            <button 
              className="btn bp" 
              onClick={(e) => { 
                e.stopPropagation(); 
                if (uploadedFile?.isBatch) {
                  setFileState('idle');
                  return;
                }
                if (!uploadedFile?.extractedData) {
                  toast('⚠ Extraction in progress or failed. Please wait.', 'amber');
                  return;
                }
                console.log('[FRONTEND] Navigating to Review with data:', uploadedFile.extractedData);
                navigate('/review', { 
                  state: { 
                    filename: uploadedFile.name, 
                    previewUrl: uploadedFile.url, 
                    fileType: uploadedFile.type,
                    extractedData: uploadedFile.extractedData,
                    vendor: selectedVendor,
                    orgId: currentUser?.orgId
                  } 
                }); 
              }}
            >
              {uploadedFile?.isBatch ? 'Upload More' : 'Review Extraction →'}
            </button>
            <style>{`@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }`}</style>
          </div>
        )}
      </div>

      {/* Grid below */}
      <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        
        {/* Left card - Options */}
        <div className="card">
          <h3 style={{ fontSize: '14px', marginBottom: '16px' }}>Processing Options</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Toggle 1 */}
            <div className="flex items-center justify-between">
              <div>
                <div style={{ fontWeight: 500 }}>Auto OCR for scanned PDFs</div>
                <div style={{ fontSize: '12px', color: 'var(--t2)' }}>Run Tesseract if text fails</div>
              </div>
              <div 
                className={`toggle ${toggles.ocr ? 'on' : ''}`}
                onClick={() => setToggles(p => ({ ...p, ocr: !p.ocr }))}
              ><div className="toggle-knob"></div></div>
            </div>
            {/* Toggle 2 */}
            <div className="flex items-center justify-between">
              <div>
                <div style={{ fontWeight: 500 }}>Extract line items</div>
                <div style={{ fontSize: '12px', color: 'var(--t2)' }}>Parse rows to separate sheet</div>
              </div>
              <div 
                className={`toggle ${toggles.lineItems ? 'on' : ''}`}
                onClick={() => setToggles(p => ({ ...p, lineItems: !p.lineItems }))}
              ><div className="toggle-knob"></div></div>
            </div>
            {/* Toggle 3 */}
            <div className="flex items-center justify-between">
              <div>
                <div style={{ fontWeight: 500 }}>Duplicate check</div>
                <div style={{ fontSize: '12px', color: 'var(--t2)' }}>Block duplicate invoice+vendor</div>
              </div>
              <div 
                className={`toggle ${toggles.duplicate ? 'on' : ''}`}
                onClick={() => setToggles(p => ({ ...p, duplicate: !p.duplicate }))}
              ><div className="toggle-knob"></div></div>
            </div>
          </div>
        </div>

        {/* Right card - Queue */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 style={{ fontSize: '14px', margin: 0 }}>Today's Queue</h3>
            <span className="text-xs text-t2">{invoices.length} invoices</span>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {invoices.length > 0 ? (
              invoices.slice(0, 5).map(inv => (
                <div key={inv.id} className="flex items-center justify-between" style={{ padding: '8px 0', borderBottom: '1px solid var(--b)' }}>
                  <div>
                    <div style={{ fontWeight: 500, display: 'flex', alignItems: 'center', gap: '6px' }}>
                      {inv.filename || inv.invoiceNo || 'Unknown Invoice'}
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--t2)' }}>
                      {inv.vendor} · ₹{inv.total}
                    </div>
                  </div>
                  <span className={`badge ${inv.status === 'Exported' ? 'b-s' : 'b-w'}`}>
                    {inv.status || 'Done'}
                  </span>
                </div>
              ))
            ) : (
              <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--t3)', fontSize: '12px' }}>
                No invoices processed today.
              </div>
            )}

            {fileState === 'processing' && uploadedFile && (
              <div style={{ 
                padding: '10px 12px', 
                backgroundColor: 'var(--ag)', 
                border: '1px solid var(--accent)', 
                borderRadius: 'var(--rs)',
                marginTop: '4px'
              }}>
                <div className="flex items-center justify-between" style={{ marginBottom: '8px' }}>
                  <div>
                    <div style={{ fontWeight: 500, color: 'var(--t)' }}>{uploadedFile.name}</div>
                    <div style={{ fontSize: '12px', color: 'var(--accent)' }}>Processing by AI Engine...</div>
                  </div>
                  <span className="badge b-i">Running</span>
                </div>
                <div className="progress-container">
                  <div className="pb-bl h-full" style={{ width: '50%', animation: 'pulse 1.5s infinite' }}></div>
                </div>
              </div>
            )}
            
          </div>
        </div>

      </div>
    </div>
  );
}
