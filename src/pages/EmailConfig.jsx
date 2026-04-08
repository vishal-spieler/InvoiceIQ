import React from 'react';
import { useToast } from '../components/Toast';

export default function EmailConfig() {
  const { toast } = useToast();

  return (
    <div className="col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '4px' }}>Email Configuration</h2>
          <p className="text-t2 text-sm">IMAP/SMTP connection settings and processing routing rules.</p>
        </div>
        <button className="btn bp" onClick={() => toast('✅ Configuration saved', 'green')}>Save Settings</button>
      </div>

      <div className="grid gap-6" style={{ gridTemplateColumns: '1fr 1fr' }}>
        {/* Left Column */}
        <div className="col gap-6">
          <div className="card col gap-4">
            <h3 style={{ fontSize: '15px' }}>Monitored Inbox</h3>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input type="text" className="input" defaultValue="invoices@yourcompany.com" />
            </div>
            <div className="form-group">
              <label className="form-label">Protocol</label>
              <select className="select">
                <option>IMAP (recommended)</option>
                <option>Gmail API</option>
                <option>Microsoft Graph API</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">IMAP Host</label>
              <input type="text" className="input" defaultValue="imap.gmail.com" />
            </div>
            <div className="flex gap-4">
              <div className="form-group flex-1">
                <label className="form-label">Port</label>
                <input type="text" className="input" defaultValue="993" />
              </div>
              <div className="form-group flex-1">
                <label className="form-label">SSL</label>
                <select className="select"><option>SSL/TLS</option><option>STARTTLS</option><option>None</option></select>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">App Password</label>
              <input type="password" className="input mono" defaultValue="xxxx-xxxx-xxxx-xxxx" />
            </div>
            <div className="form-group">
              <label className="form-label">Poll Interval</label>
              <select className="select"><option>Every 2 minutes</option><option>Every 5 minutes</option><option>Hourly</option></select>
            </div>
            <div className="mt-2 text-right">
              <button className="btn bt" onClick={() => toast('🔗 Connection test passed!', 'green')}>Test Connection</button>
            </div>
          </div>

          <div className="card col gap-4">
            <h3 style={{ fontSize: '15px' }}>Reply Email (SMTP)</h3>
            <div className="form-group">
              <label className="form-label">Reply From Name</label>
              <input type="text" className="input" defaultValue="InvoiceIQ Automation" />
            </div>
            <div className="form-group">
              <label className="form-label">Reply From Address</label>
              <input type="text" className="input" defaultValue="invoices@yourcompany.com" />
            </div>
            <div className="form-group">
              <label className="form-label">SMTP Host</label>
              <input type="text" className="input" defaultValue="smtp.gmail.com" />
            </div>
            <div className="form-group">
              <label className="form-label">CC on all replies</label>
              <input type="text" className="input" defaultValue="finance-ops@yourcompany.com" />
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="col gap-6">
          <div className="card col gap-4">
            <h3 style={{ fontSize: '15px' }}>Processing Rules</h3>
            <div className="col gap-3">
              {[
                { l: 'Auto-process on arrival', t: true },
                { l: 'Accept whitelist only', t: true },
                { l: 'Attach Excel in success reply', t: true },
                { l: 'Immediate failure notification', t: true },
                { l: 'Auto-accept resubmissions', t: true },
                { l: 'Duplicate check', t: true }
              ].map((r, i) => (
                <div key={i} className="flex justify-between items-center py-1">
                  <span style={{ fontSize: '13px' }}>{r.l}</span>
                  <div className={`toggle ${r.t ? 'on' : ''}`}><div className="toggle-knob"></div></div>
                </div>
              ))}
              <div className="flex justify-between items-center py-1 border-t pt-3" style={{ borderTop: '1px solid var(--b)' }}>
                <span style={{ fontSize: '13px' }}>Confidence threshold</span>
                <input type="text" className="input text-center" defaultValue="0.80" style={{ width: '60px', padding: '4px 8px' }} />
              </div>
            </div>
          </div>

          <div className="card col gap-4">
            <h3 style={{ fontSize: '15px' }}>Sender Whitelist</h3>
            <div className="col gap-2">
              {[
                'billing@infosys.com',
                'accounts@partner.com',
                'finance@wipro.com',
                'noreply@accenture.com'
              ].map(e => (
                <div key={e} className="flex justify-between items-center" style={{ padding: '8px 12px', backgroundColor: 'var(--s2)', borderRadius: 'var(--rs)', border: '1px solid var(--b)' }}>
                  <span className="mono text-xs text-t2">{e}</span>
                  <button className="btn bg btn-xs">Remove</button>
                </div>
              ))}
              <div className="flex gap-2 mt-2">
                <input type="text" className="input flex-1" placeholder="Add email address..." />
                <button className="btn bp">+ Add</button>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
