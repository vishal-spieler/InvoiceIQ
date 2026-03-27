import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function BatchJobs() {
  const navigate = useNavigate();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Page Context Row */}
      <div className="flex items-center justify-between">
        <div style={{ color: 'var(--t2)', fontSize: '13px' }}>
          Upload and monitor large batches.
        </div>
        <button className="btn bp" onClick={() => navigate('/upload')}>
          + New Batch
        </button>
      </div>

      {/* Grid Status Cards */}
      <div className="grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
        
        {/* Card 1 */}
        <div className="card" style={{ borderLeft: '3px solid var(--accent)' }}>
          <div className="flex items-center justify-between" style={{ marginBottom: '16px' }}>
            <div style={{ fontWeight: 500 }}>Wipro_batch_032024.zip</div>
            <span className="badge b-i">Running</span>
          </div>
          <div style={{ color: 'var(--t2)', fontSize: '13px', marginBottom: '16px' }}>
            24 files · Started 14 min ago
          </div>
          <div>
            <div className="progress-container" style={{ marginBottom: '8px' }}>
              <div className="pb-bl h-full" style={{ width: '50%' }}></div>
            </div>
            <div style={{ color: 'var(--t3)', fontSize: '12px' }}>
              12/24 completed
            </div>
          </div>
        </div>

        {/* Card 2 */}
        <div className="card" style={{ borderLeft: '3px solid var(--green)' }}>
          <div className="flex items-center justify-between" style={{ marginBottom: '16px' }}>
            <div style={{ fontWeight: 500 }}>Infosys_Q1_invoices.zip</div>
            <span className="badge b-s">Done</span>
          </div>
          <div style={{ color: 'var(--t2)', fontSize: '13px', marginBottom: '16px' }}>
            48 files · 2 hr ago · 96% accuracy
          </div>
          <div>
            <div className="progress-container" style={{ marginBottom: '8px' }}>
              <div className="pb-gr h-full" style={{ width: '100%' }}></div>
            </div>
            <div style={{ color: 'var(--green)', fontSize: '12px', fontWeight: 500 }}>
              48/48 · 0 errors
            </div>
          </div>
        </div>

        {/* Card 3 */}
        <div className="card" style={{ borderLeft: '3px solid var(--red)' }}>
          <div className="flex items-center justify-between" style={{ marginBottom: '16px' }}>
            <div style={{ fontWeight: 500 }}>Accenture_old_scans.zip</div>
            <span className="badge b-e">Errors</span>
          </div>
          <div style={{ color: 'var(--t2)', fontSize: '13px', marginBottom: '16px' }}>
            12 files · 2 days ago · 4 failed OCR
          </div>
          <div>
            <div className="progress-container" style={{ marginBottom: '8px' }}>
              <div className="pb-am h-full" style={{ width: '67%' }}></div>
            </div>
            <div style={{ color: 'var(--red)', fontSize: '12px', fontWeight: 500 }}>
              8/12 · 4 OCR failed
            </div>
          </div>
        </div>

      </div>

      {/* History Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--b)' }}>
          <h2 style={{ fontSize: '16px' }}>Job History</h2>
        </div>

        <div className="overflow-y-auto w-full">
          <table style={{ minWidth: '800px' }}>
            <thead>
              <tr>
                <th>Job ID</th>
                <th>File</th>
                <th>Source</th>
                <th>Files</th>
                <th>Pass</th>
                <th>Fail</th>
                <th>Duration</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="mono" style={{ color: 'var(--t2)' }}>batch_0323</td>
                <td>Infosys_Q1.zip</td>
                <td><div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', backgroundColor: 'var(--s2)', padding: '2px 8px', borderRadius: 'var(--rs)', fontSize: '12px' }}>📤 Upload</div></td>
                <td>48</td>
                <td style={{ color: 'var(--green)' }}>48</td>
                <td>0</td>
                <td className="mono text-t2">4m 12s</td>
                <td><span className="badge b-s">Done</span></td>
              </tr>
              <tr>
                <td className="mono" style={{ color: 'var(--t2)' }}>email_0322</td>
                <td>TCS Batch Email</td>
                <td><div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', backgroundColor: 'var(--s2)', padding: '2px 8px', borderRadius: 'var(--rs)', fontSize: '12px' }}>📧 Email</div></td>
                <td>5</td>
                <td style={{ color: 'var(--green)' }}>5</td>
                <td>0</td>
                <td className="mono text-t2">28s</td>
                <td><span className="badge b-s">Done</span></td>
              </tr>
              <tr>
                <td className="mono" style={{ color: 'var(--t2)' }}>batch_0319</td>
                <td>Accenture.zip</td>
                <td><div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', backgroundColor: 'var(--s2)', padding: '2px 8px', borderRadius: 'var(--rs)', fontSize: '12px' }}>📤 Upload</div></td>
                <td>12</td>
                <td style={{ color: 'var(--green)' }}>8</td>
                <td style={{ color: 'var(--red)' }}>4</td>
                <td className="mono text-t2">2m 05s</td>
                <td><span className="badge b-e">Errors</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
