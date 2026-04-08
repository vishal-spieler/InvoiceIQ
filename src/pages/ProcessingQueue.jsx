import React from 'react';

export default function ProcessingQueue() {
  return (
    <div className="col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '4px' }}>Processing Queue</h2>
          <p className="text-t2 text-sm">Active extraction and OCR jobs running in the background.</p>
        </div>
        <button className="btn bg">Pause Queue</button>
      </div>

      <div className="card" style={{ borderColor: 'var(--accent)', borderWidth: '2px', backgroundColor: 'var(--ag)' }}>
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: 'bold', color: 'var(--t)' }}>Infosys Q1 Invoices — Active Job</h3>
            <div className="text-xs text-t2 mt-1 mono">accounts@infosys.com · 08:27 AM · job_2403230827</div>
          </div>
          <span className="badge b-i">Live</span>
        </div>
        
        <div className="col gap-2 bg-surface" style={{ backgroundColor: 'var(--surface)', padding: '16px', borderRadius: '8px' }}>
          <div className="grid text-xs text-t3 uppercase mb-2" style={{ gridTemplateColumns: '2fr 1fr 1fr 1fr' }}>
            <span>File</span>
            <span>Size</span>
            <span>Step</span>
            <span>Status</span>
          </div>
          
          <div className="grid text-sm pb-2 border-b" style={{ gridTemplateColumns: '2fr 1fr 1fr 1fr', borderBottom: '1px solid var(--b)' }}>
            <span className="mono">INF_2024_001.pdf</span><span className="text-t2">1.1 MB</span><span className="text-t2">AI Extraction</span><span className="text-green">✅ Done</span>
          </div>
          <div className="grid text-sm pb-2 border-b" style={{ gridTemplateColumns: '2fr 1fr 1fr 1fr', borderBottom: '1px solid var(--b)' }}>
            <span className="mono">INF_2024_002.pdf</span><span className="text-t2">980 KB</span><span className="text-t2">AI Extraction</span><span className="text-green">✅ Done</span>
          </div>
          <div className="grid text-sm pb-2 border-b" style={{ gridTemplateColumns: '2fr 1fr 1fr 1fr', borderBottom: '1px solid var(--b)' }}>
            <span className="mono">INF_2024_003.pdf</span><span className="text-t2">2.3 MB</span><span className="text-t2">OCR → Extract</span><span className="text-accent flex items-center gap-2"><div style={{ width: 12, height: 12, borderRadius: '50%', border: '2px solid var(--accent)', borderTopColor: 'transparent', animation: 'spin 1s linear infinite' }} /> Running</span>
          </div>
          <div className="grid text-sm pb-2 border-b" style={{ gridTemplateColumns: '2fr 1fr 1fr 1fr', borderBottom: '1px solid var(--b)' }}>
            <span className="mono text-t3">INF_2024_004.pdf</span><span className="text-t3">1.4 MB</span><span className="text-t3">Queued</span><span className="text-t3 flex items-center gap-1">⏳ Waiting</span>
          </div>
          <div className="grid text-sm" style={{ gridTemplateColumns: '2fr 1fr 1fr 1fr' }}>
            <span className="mono text-t3">INF_2024_005.pdf</span><span className="text-t3">1.8 MB</span><span className="text-t3">Queued</span><span className="text-t3 flex items-center gap-1">⏳ Waiting</span>
          </div>
        </div>
        
        <div className="mt-4">
          <div className="flex justify-between text-xs mb-1">
            <span className="text-accent">40% Complete (2/5)</span>
            <span className="text-t3">Est. remaining: 15s</span>
          </div>
          <div className="progress-container"><div className="pb-bl h-full" style={{ width: '40%' }}></div></div>
        </div>
        <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
      </div>

      <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
        <div className="card-sm text-center"><div className="text-xl font-bold font-syne">5</div><div className="text-xs text-t2 mt-1 uppercase text-t3">In Queue</div></div>
        <div className="card-sm text-center"><div className="text-xl font-bold font-syne text-accent">1</div><div className="text-xs text-t2 mt-1 uppercase text-t3">Processing Now</div></div>
        <div className="card-sm text-center"><div className="text-xl font-bold font-syne text-green">13</div><div className="text-xs text-t2 mt-1 uppercase text-t3">Completed Today</div></div>
      </div>
    </div>
  );
}
