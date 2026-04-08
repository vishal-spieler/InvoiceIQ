import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useInvoices } from '../context/InvoiceContext';

export default function BatchJobs() {
  const navigate = useNavigate();
  const { batchJobs } = useInvoices();

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
        
        {batchJobs.slice(0, 3).map(job => {
          const isError = job.status === 'Errors';
          const isDone = job.status === 'Done';
          const badgeClass = isError ? 'b-e' : isDone ? 'b-s' : 'b-i';
          const borderClass = isError ? 'var(--red)' : isDone ? 'var(--green)' : 'var(--accent)';
          
          return (
            <div key={job.id} className="card" style={{ borderLeft: `3px solid ${borderClass}` }}>
              <div className="flex items-center justify-between" style={{ marginBottom: '16px' }}>
                <div style={{ fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={job.filename}>
                  {job.filename}
                </div>
                <span className={`badge ${badgeClass}`}>{job.status}</span>
              </div>
              <div style={{ color: 'var(--t2)', fontSize: '13px', marginBottom: '16px' }}>
                {job.totalFiles} files · {new Date(job.createdAt).toLocaleDateString()}
              </div>
              <div>
                <div className="progress-container" style={{ marginBottom: '8px' }}>
                  <div className={`h-full ${isError ? 'pb-am' : isDone ? 'pb-gr' : 'pb-bl'}`} style={{ width: '100%' }}></div>
                </div>
                <div style={{ color: borderClass, fontSize: '12px', fontWeight: 500 }}>
                  {job.successCount}/{job.totalFiles} passed {job.failCount > 0 && `· ${job.failCount} errors`}
                </div>
              </div>
              <div style={{ marginTop: '16px', borderTop: '1px solid var(--b)', paddingTop: '12px', display: 'flex', justifyContent: 'flex-end' }}>
                <button 
                  className="btn bg btn-sm" 
                  onClick={() => navigate('/review', { state: { isBatch: true, batchId: job.id, batchResults: job.results, vendor: job.vendor } })}
                >
                  Review Batch →
                </button>
              </div>
            </div>
          );
        })}

        {batchJobs.length === 0 && (
          <div style={{ gridColumn: '1 / -1', padding: '40px', textAlign: 'center', backgroundColor: 'var(--surface)', borderRadius: 'var(--r)', border: '1px dashed var(--b2)', color: 'var(--t2)' }}>
            <div style={{ fontSize: '32px', marginBottom: '12px' }}>📁</div>
            <div style={{ fontWeight: 500, color: 'var(--t)' }}>No batch jobs yet</div>
            <div style={{ fontSize: '13px', marginTop: '4px' }}>Upload a ZIP file containing invoices to start your first batch job.</div>
          </div>
        )}
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
              {batchJobs.map(job => (
                <tr key={job.id}>
                  <td className="mono" style={{ color: 'var(--t2)' }}>{job.id}</td>
                  <td>{job.filename}</td>
                  <td><div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', backgroundColor: 'var(--s2)', padding: '2px 8px', borderRadius: 'var(--rs)', fontSize: '12px' }}>📤 Upload</div></td>
                  <td>{job.totalFiles}</td>
                  <td style={{ color: 'var(--green)' }}>{job.successCount}</td>
                  <td style={{ color: job.failCount > 0 ? 'var(--red)' : 'inherit' }}>{job.failCount}</td>
                  <td className="mono text-t2">—</td>
                  <td className="flex items-center gap-2">
                    <span className={`badge ${job.status === 'Errors' ? 'b-e' : 'b-s'}`}>{job.status}</span>
                    <button className="btn bg btn-xs ml-auto" onClick={() => navigate('/review', { state: { isBatch: true, batchId: job.id, batchResults: job.results, vendor: job.vendor } })}>Review</button>
                  </td>
                </tr>
              ))}
              {batchJobs.length === 0 && (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '24px', color: 'var(--t3)' }}>No history available</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
