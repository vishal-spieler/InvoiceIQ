import React from 'react';
import { useToast } from '../components/Toast';

export default function ReplyTemplates() {
  const { toast } = useToast();

  const successChips = ['{{vendor_name}}', '{{total_count}}', '{{success_count}}', '{{received_at}}', '{{success_table}}', '{{job_id}}'];
  const failureChips = ['{{vendor_name}}', '{{failed_count}}', '{{failure_section}}', '{{job_id}}'];

  return (
    <div className="col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '4px' }}>Reply Templates</h2>
          <p className="text-t2 text-sm">Automated email responses sent based on extraction results.</p>
        </div>
        <button className="btn bp" onClick={() => toast('✅ Templates saved', 'green')}>Save Templates</button>
      </div>

      <div className="grid gap-6" style={{ gridTemplateColumns: '1fr 1fr' }}>
        {/* Success Template */}
        <div className="card col gap-4">
          <h3 className="text-green text-sm flex items-center gap-2"><span>✅</span> Success Template</h3>
          
          <div className="form-group">
            <label className="form-label">Subject</label>
            <input type="text" className="input" defaultValue="✅ Invoice Processing Report — {{success_count}}/{{total_count}} Successful" />
          </div>
          
          <div className="form-group">
            <label className="form-label">Greeting</label>
            <input type="text" className="input" defaultValue="Dear {{vendor_name}} Team," />
          </div>

          <div className="form-group">
            <label className="form-label">Body</label>
            <textarea className="input" rows={7} defaultValue={"We have successfully processed your invoice submission.\n\nBelow are the details parsed from your attachments:\n\n{{success_table}}\n\nThank you for working with us."} style={{ resize: 'vertical' }}></textarea>
          </div>

          <div className="flex justify-between items-center py-2 border-b" style={{ borderBottomColor: 'var(--b)' }}>
            <span style={{ fontSize: '13px' }}>Attach .xlsx to success replies</span>
            <div className={`toggle on`}><div className="toggle-knob"></div></div>
          </div>

          <div style={{ padding: '12px', backgroundColor: 'var(--s2)', borderRadius: 'var(--rs)', border: '1px solid var(--b)' }}>
            <div className="text-xs text-t2 uppercase mb-2" style={{ letterSpacing: '0.05em' }}>Variables</div>
            <div className="flex flex-wrap gap-2">
              {successChips.map(c => <span key={c} className="badge b-n" style={{ cursor: 'pointer', backgroundColor: 'var(--surface)' }}>{c}</span>)}
            </div>
          </div>
        </div>

        {/* Failure Template */}
        <div className="card col gap-4">
          <h3 className="text-red text-sm flex items-center gap-2"><span>⚠️</span> Failure Template</h3>
          
          <div className="form-group">
            <label className="form-label">Subject</label>
            <input type="text" className="input" defaultValue="⚠️ Invoice Report — {{failed_count}} file(s) need resubmission" />
          </div>
          
          <div className="form-group">
            <label className="form-label">Greeting</label>
            <input type="text" className="input" defaultValue="Dear {{vendor_name}} Team," />
          </div>

          <div className="form-group">
            <label className="form-label">Body</label>
            <textarea className="input" rows={4} defaultValue={"We encountered issues processing some invoices from your recent submission.\n\n{{failure_section}}"} style={{ resize: 'vertical' }}></textarea>
          </div>

          <div className="form-group">
            <label className="form-label">Resubmission Instruction</label>
            <textarea className="input" rows={2} defaultValue={"Simply reply to this email with corrected PDF files."} style={{ resize: 'vertical' }}></textarea>
          </div>

          <div style={{ padding: '12px', backgroundColor: 'var(--s2)', borderRadius: 'var(--rs)', border: '1px solid var(--b)', marginTop: 'auto' }}>
            <div className="text-xs text-t2 uppercase mb-2" style={{ letterSpacing: '0.05em' }}>Variables</div>
            <div className="flex flex-wrap gap-2">
              {failureChips.map(c => <span key={c} className="badge b-n" style={{ cursor: 'pointer', backgroundColor: 'var(--surface)' }}>{c}</span>)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
