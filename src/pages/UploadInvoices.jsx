import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../components/Toast';
import { processInvoice } from '../utils/extraction';

export default function UploadInvoices() {
  const [dragActive, setDragActive] = useState(false);
  const [fileState, setFileState] = useState('idle'); // idle | processing | success
  const [uploadedFile, setUploadedFile] = useState(null); // { name, type }
  const navigate = useNavigate();
  const { toast } = useToast();
  const fileInputRef = useRef(null);

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
    const previewUrl = URL.createObjectURL(file);
    // Clear previous extraction data to prevent mock-bleed
    setUploadedFile({ name: file.name, type: file.type, url: previewUrl, extractedData: null });
    setFileState('processing');
    
    try {
      const formData = new FormData();
      formData.append('file', file);

      console.log(`[FRONTEND] Uploading ${file.name} for AI extraction...`);
      const response = await fetch('/api/extract', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Backend Error: ${errText}`);
      }
      
      const data = await response.json();
      console.log('[FRONTEND] AI Data Received:', data);
      
      setUploadedFile(prev => ({ ...prev, extractedData: data }));
      setFileState('success');
      toast(`✅ Precision extraction complete!`, 'green');
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

      {/* Drop Zone */}
      <div 
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => {
          if (fileState === 'idle') fileInputRef.current?.click();
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
            if (e.target.files?.length) startProcessing(e.target.files[0]);
          }} 
        />
        
        {fileState === 'idle' && (
          <>
            <div style={{ fontSize: '36px', marginBottom: '12px' }}>📎</div>
            <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '8px' }}>Drop invoice PDFs here</h3>
            <p style={{ color: 'var(--t2)', fontSize: '13px' }}>
              <span style={{ color: 'var(--accent)', cursor: 'pointer' }}>or browse files</span> · PDF, ZIP · Max 50 MB
            </p>
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
              Confidence: 94% — click Review to validate
            </p>
            <button 
              className="btn bp" 
              onClick={(e) => { 
                e.stopPropagation(); 
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
                    extractedData: uploadedFile.extractedData
                  } 
                }); 
              }}
            >
              Review Extraction →
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
          <h3 style={{ fontSize: '14px', marginBottom: '16px' }}>Today's Queue</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            
            <div className="flex items-center justify-between" style={{ padding: '8px 0' }}>
              <div>
                <div style={{ fontWeight: 500, display: 'flex', alignItems: 'center', gap: '6px' }}>
                  Infosys_March_2024.pdf
                </div>
                <div style={{ fontSize: '12px', color: 'var(--t2)' }}>1.2 MB · text</div>
              </div>
              <span className="badge b-s">Done</span>
            </div>
            
            <div className="flex items-center justify-between" style={{ padding: '8px 0', borderTop: '1px solid var(--b)' }}>
              <div>
                <div style={{ fontWeight: 500, display: 'flex', alignItems: 'center', gap: '6px' }}>
                  TCS_Invoice_Q1.pdf
                </div>
                <div style={{ fontSize: '12px', color: 'var(--t2)' }}>2.8 MB · scanned</div>
              </div>
              <span className="badge b-w">Review</span>
            </div>

            <div style={{ 
              padding: '10px 12px', 
              backgroundColor: 'var(--ag)', 
              border: '1px solid var(--accent)', 
              borderRadius: 'var(--rs)',
              marginTop: '4px'
            }}>
              <div className="flex items-center justify-between" style={{ marginBottom: '8px' }}>
                <div>
                  <div style={{ fontWeight: 500, color: 'var(--t)' }}>Wipro_batch.zip</div>
                  <div style={{ fontSize: '12px', color: 'var(--accent)' }}>Processing... 12/24</div>
                </div>
                <span className="badge b-i">Running</span>
              </div>
              <div className="progress-container">
                <div className="pb-bl h-full" style={{ width: '50%' }}></div>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
