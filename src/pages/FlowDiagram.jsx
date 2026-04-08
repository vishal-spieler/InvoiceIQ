import React from 'react';

export default function FlowDiagram() {
  return (
    <div className="col gap-6">
      <div>
        <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '4px' }}>Email Ingestion Flow</h2>
        <p className="text-t2 text-sm">Automated pipeline processing steps from email arrival to export.</p>
      </div>

      <div className="grid gap-6" style={{ gridTemplateColumns: '1fr 1fr' }}>
        {/* Success Path */}
        <div className="card col gap-4" style={{ position: 'relative' }}>
          <h3 className="text-green text-sm flex items-center gap-2 mb-2"><span>✅</span> Success Path</h3>
          <div style={{ position: 'absolute', top: '70px', bottom: '40px', left: '32px', width: '2px', backgroundColor: 'var(--s3)', zIndex: 0 }}></div>
          
          {[
            { num: 1, step: 'Email arrives at monitored inbox', sub: 'IMAP poll every 2 min' },
            { num: 2, step: 'PDF attachments extracted', sub: 'imaplib stdlib · zero cost' },
            { num: 3, step: 'PDF type detected', sub: 'Text vs scanned' },
            { num: 4, step: 'AI extraction runs', sub: 'LLM field extraction' },
            { num: 5, step: 'Confidence >= 75%', sub: 'All critical fields found' },
            { num: 6, step: 'Success reply + Excel', sub: 'Sent to vendor automatically' }
          ].map(s => (
            <div key={s.num} className="flex items-start gap-4" style={{ position: 'relative', zIndex: 1 }}>
              <div style={{ width: 24, height: 24, borderRadius: '50%', backgroundColor: 'var(--surface)', border: '2px solid var(--accent)', color: 'var(--t)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 'bold' }}>{s.num}</div>
              <div>
                <div style={{ fontWeight: 500, fontSize: '13px' }}>{s.step}</div>
                <div style={{ fontSize: '11px', color: 'var(--t2)' }}>{s.sub}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Failure Path */}
        <div className="card col gap-4" style={{ position: 'relative' }}>
          <h3 className="text-red text-sm flex items-center gap-2 mb-2"><span>❌</span> Failure & Retry Path</h3>
          <div style={{ position: 'absolute', top: '70px', bottom: '200px', left: '32px', width: '2px', backgroundColor: 'var(--s3)', zIndex: 0 }}></div>
          
          {[
            { num: 1, step: 'OCR/extraction fails', sub: 'Confidence below threshold', tag: 'Threshold: 75%' },
            { num: 2, step: 'Failure report email sent', sub: 'Exact file, reason, resubmission instructions', tag: 'Immediate reply' },
            { num: 3, step: 'System watches for reply', sub: 'Thread matching via IMAP' },
            { num: 4, step: 'Resubmission auto-processed', sub: 'Full pipeline re-runs' }
          ].map(s => (
            <div key={s.num} className="flex items-start gap-4" style={{ position: 'relative', zIndex: 1 }}>
              <div style={{ width: 24, height: 24, borderRadius: '50%', backgroundColor: 'var(--surface)', border: '2px solid var(--red)', color: 'var(--t)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 'bold' }}>{s.num}</div>
              <div>
                <div style={{ fontWeight: 500, fontSize: '13px' }}>{s.step} {s.tag && <span className="badge b-w ml-2" style={{ scale: '0.8', transformOrigin: 'left' }}>{s.tag}</span>}</div>
                <div style={{ fontSize: '11px', color: 'var(--t2)' }}>{s.sub}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="card">
        <h3 style={{ fontSize: '13px', fontWeight: 'bold', marginBottom: '12px' }}>Free Tools — Email Layer</h3>
        <div className="flex gap-3 flex-wrap">
          <div className="badge b-n" style={{ padding: '4px 10px', fontSize: '12px' }}>imaplib + email (stdlib) · zero cost</div>
          <div className="badge b-n" style={{ padding: '4px 10px', fontSize: '12px' }}>smtplib / aiosmtplib · free</div>
          <div className="badge b-n" style={{ padding: '4px 10px', fontSize: '12px', borderStyle: 'dashed' }}>Postmark Inbound (alt) · 100/mo free</div>
          <div className="badge b-n" style={{ padding: '4px 10px', fontSize: '12px', borderStyle: 'dashed' }}>Gmail API (alt) · OAuth2, free quota</div>
        </div>
      </div>
    </div>
  );
}
