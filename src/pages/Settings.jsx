import React, { useState } from 'react';
import { useToast } from '../components/Toast';
import { useAuth } from '../context/AuthContext';

export default function Settings() {
  const { toast } = useToast();
  const { currentUser, activeOrg } = useAuth();
  const [activeTab, setActiveTab] = useState('Extraction Engine');

  const adminFlags = activeOrg?.adminFlags || {};
  const employeeFlags = activeOrg?.employeeFlags || {};

  return (
    <div className="col gap-6" style={{ height: '100%' }}>
      <div className="flex items-center justify-between">
        <div>
          <h2 style={{ fontSize: '18px', fontWeight: 700, margin: 0 }}>System Settings</h2>
        </div>
        <button className="btn bp" onClick={() => toast('✅ Settings saved', 'green')}>Save Changes</button>
      </div>

      <div className="grid gap-6 h-full" style={{ gridTemplateColumns: '240px 1fr', alignItems: 'start' }}>
        {/* Left Nav */}
        <div className="card" style={{ padding: '8px' }}>
          <ul className="col gap-1">
            {['Extraction Engine', 'Feature Flags', 'Database Connection', 'Notifications', 'API Keys'].map((item) => {
              const isActive = item === activeTab;
              return (
                <li key={item} style={{ 
                  padding: '10px 16px', 
                  borderRadius: '6px', 
                  backgroundColor: isActive ? 'var(--ag)' : 'transparent',
                  color: isActive ? 'var(--accent)' : 'var(--t2)',
                  borderLeft: isActive ? '2px solid var(--accent)' : '2px solid transparent',
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontWeight: isActive ? 600 : 400
                }} onClick={() => setActiveTab(item)}>
                  {item}
                </li>
              );
            })}
          </ul>
        </div>

        {/* Right Content */}
        <div className="card col gap-6">
          
          {activeTab === 'Extraction Engine' && (
            <>
              <h3 style={{ fontSize: '16px' }}>Extraction Engine</h3>
              
              <div className="grid gap-6" style={{ gridTemplateColumns: '1fr 1fr' }}>
                <div className="form-group">
                  <label className="form-label">LLM Provider</label>
                  <select className="select">
                    <option>Groq (llama-3.1-8b) — Free</option>
                    <option>Ollama Local — Free</option>
                    <option>Claude Haiku — Paid</option>
                    <option>Gemini Flash — Free Tier</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label className="form-label">Confidence Threshold</label>
                  <input type="text" className="input" defaultValue="0.80" />
                </div>
              </div>

              <div style={{ height: '1px', backgroundColor: 'var(--b)', margin: '8px 0' }}></div>

              <div className="col gap-4">
                {[
                  { l: 'OCR fallback', d: 'Run Tesseract if AI fails', on: true },
                  { l: 'Extract line items', d: 'Parse rows to separate sheet', on: true },
                  { l: 'Duplicate detection', d: 'Block duplicate invoice numbers per vendor', on: true },
                  { l: 'Auto-validate math', d: 'Check if subtotal + tax = total', on: true },
                  { l: 'Email ingestion active', d: 'Continue polling IMAP in background', on: true }
                ].map((t, i) => (
                  <div key={i} className="flex justify-between items-center py-2">
                    <div>
                      <div style={{ fontWeight: 500, fontSize: '14px' }}>{t.l}</div>
                      <div style={{ fontSize: '12px', color: 'var(--t2)' }}>{t.d}</div>
                    </div>
                    <div className={`toggle ${t.on ? 'on' : ''}`}><div className="toggle-knob"></div></div>
                  </div>
                ))}
              </div>
            </>
          )}

          {activeTab === 'Feature Flags' && (
            <>
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 style={{ fontSize: '16px', marginBottom: '4px' }}>Feature Flags</h3>
                  <p className="text-t2 text-xs">Control which modules are visible in the system.</p>
                </div>
              </div>

              <div className="grid gap-6" style={{ gridTemplateColumns: '1fr 1fr' }}>
                <div className="col" style={{ padding: '16px', border: '1px solid var(--b)', borderRadius: 'var(--rs)', backgroundColor: 'var(--s2)', pointerEvents: 'none', opacity: 0.6 }}>
                  <div className="flex justify-between mb-4">
                    <div>
                      <div style={{ fontSize: '10px', color: 'var(--t3)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700 }}>Your Access</div>
                      <div style={{ fontSize: '11px', color: 'var(--t2)', marginTop: '2px' }}>Pages you can access, set by InvoiceIQ.</div>
                    </div>
                    <span style={{ fontSize: '14px', color: 'var(--t3)' }}>🔒</span>
                  </div>
                  
                  <div className="col gap-0">
                    {[
                      { label: 'Upload Invoice', key: 'uploadInvoice' },
                      { label: 'Review & Edit', key: 'reviewEdit' },
                      { label: 'All Invoices', key: 'allInvoices' },
                      { label: 'Batch Jobs', key: 'batchJobs' },
                      { label: 'Export Data', key: 'exportData' },
                      { label: 'Inbox Monitor', key: 'inboxMonitor' },
                      { label: 'Processing Queue', key: 'processingQueue' },
                      { label: 'Email Reports', key: 'emailReports' },
                      { label: 'Resend Failures', key: 'resendFailures' },
                      { label: 'Flow Diagram', key: 'flowDiagram' },
                      { label: 'Vendors', key: 'vendors' },
                      { label: 'Email Config', key: 'emailConfig' },
                      { label: 'Reply Templates', key: 'replyTemplates' },
                    ].map(flag => (
                      <div key={`admin-${flag.key}`} className="flex justify-between items-center py-2" style={{ borderBottom: '1px solid var(--b)' }}>
                        <span style={{ fontSize: '12px', fontWeight: 500, color: 'var(--t)' }}>{flag.label}</span>
                        <div className={`toggle ${adminFlags[flag.key] ? 'on' : ''}`}>
                          <div className="toggle-knob"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="col" style={{ padding: '16px', border: '1px solid var(--b)', borderRadius: 'var(--rs)', backgroundColor: 'var(--s2)', pointerEvents: 'none', opacity: 0.6 }}>
                  <div className="flex justify-between mb-4">
                    <div>
                      <div style={{ fontSize: '10px', color: 'var(--t3)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700 }}>Employee Ceiling</div>
                      <div style={{ fontSize: '11px', color: 'var(--t2)', marginTop: '2px' }}>Pages you can assign to your employees.</div>
                    </div>
                    <span style={{ fontSize: '14px', color: 'var(--t3)' }}>🔒</span>
                  </div>
                  
                  <div className="col gap-0">
                    {[
                      { label: 'Upload Invoice', key: 'uploadInvoice' },
                      { label: 'Review & Edit', key: 'reviewEdit' },
                      { label: 'All Invoices', key: 'allInvoices' },
                      { label: 'Batch Jobs', key: 'batchJobs' },
                      { label: 'Export Data', key: 'exportData' },
                      { label: 'Inbox Monitor', key: 'inboxMonitor' },
                      { label: 'Processing Queue', key: 'processingQueue' },
                      { label: 'Email Reports', key: 'emailReports' },
                      { label: 'Resend Failures', key: 'resendFailures' },
                      { label: 'Flow Diagram', key: 'flowDiagram' },
                      { label: 'Vendors', key: 'vendors' },
                      { label: 'Email Config', key: 'emailConfig' },
                      { label: 'Reply Templates', key: 'replyTemplates' },
                    ].map(flag => (
                      <div key={`emp-${flag.key}`} className="flex justify-between items-center py-2" style={{ borderBottom: '1px solid var(--b)' }}>
                        <span style={{ fontSize: '12px', fontWeight: 500, color: 'var(--t)' }}>{flag.label}</span>
                        <div className={`toggle ${employeeFlags[flag.key] ? 'on' : ''}`}>
                          <div className="toggle-knob"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div style={{ fontSize: '11px', color: 'var(--amber)', backgroundColor: 'rgba(245, 166, 35, 0.1)', padding: '10px 16px', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '6px', border: '1px solid var(--amber)' }}>
                🔒 Feature access is managed by InvoiceIQ. Contact support to update your plan.
              </div>
            </>
          )}

          {activeTab !== 'Extraction Engine' && activeTab !== 'Feature Flags' && (
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--t3)' }}>
              {activeTab} settings coming soon in Phase 3.
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
