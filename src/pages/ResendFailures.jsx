import React from 'react';
import { useToast } from '../components/Toast';

export default function ResendFailures() {
  const { toast } = useToast();

  const handleResend = (file) => {
    toast(`🔄 ${file} queued for resend`, 'amber');
  };

  return (
    <div className="col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '4px' }}>Resend Failures</h2>
          <p className="text-t2 text-sm">Failed extractions requiring manual trigger or OCR resolution.</p>
        </div>
        <button className="btn bd" onClick={() => toast('🔄 3 files queued for resend', 'amber')}>Resend All Failed</button>
      </div>

      <div className="card" style={{ padding: 0 }}>
        <table>
          <thead>
            <tr>
              <th>File</th>
              <th>Vendor</th>
              <th>Received</th>
              <th>Reason</th>
              <th>Attempts</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="mono text-xs">ACC_Q1_scan_01.pdf</td>
              <td>Accenture</td>
              <td className="text-xs text-t3">Yesterday</td>
              <td className="text-red">OCR failed — low resolution</td>
              <td>1</td>
              <td><button className="btn bg btn-xs" onClick={() => handleResend('ACC_Q1_scan_01.pdf')}>Resend</button></td>
            </tr>
            <tr>
              <td className="mono text-xs">ACC_Q1_scan_02.pdf</td>
              <td>Accenture</td>
              <td className="text-xs text-t3">Yesterday</td>
              <td className="text-red">OCR failed — corrupted scan</td>
              <td>1</td>
              <td><button className="btn bg btn-xs" onClick={() => handleResend('ACC_Q1_scan_02.pdf')}>Resend</button></td>
            </tr>
            <tr>
              <td className="mono text-xs">TCS_INV_0301.pdf</td>
              <td>TCS Limited</td>
              <td className="text-xs text-t3">3 days ago</td>
              <td className="text-amber">Missing critical field: Total</td>
              <td>2</td>
              <td><button className="btn bg btn-xs" onClick={() => handleResend('TCS_INV_0301.pdf')}>Resend</button></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
