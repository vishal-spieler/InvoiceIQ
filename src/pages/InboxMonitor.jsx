import React from 'react';

export default function InboxMonitor() {
  return (
    <div className="col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '4px' }}>Inbox Monitor</h2>
          <p className="text-t2 text-sm">Real-time view of invoices arriving via email.</p>
        </div>
        <button className="btn bg" onClick={() => {}} disabled>Send Test Email</button>
      </div>

      <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
        <div className="card text-center"><div className="text-2xl font-bold font-syne text-t">18</div><div className="text-xs text-t2 mt-1 uppercase text-t3">Received Today</div></div>
        <div className="card text-center"><div className="text-2xl font-bold font-syne text-teal">13</div><div className="text-xs text-t2 mt-1 uppercase text-t3">Auto-Processed</div></div>
        <div className="card text-center"><div className="text-2xl font-bold font-syne text-amber">2</div><div className="text-xs text-t2 mt-1 uppercase text-t3">Pending Review</div></div>
        <div className="card text-center"><div className="text-2xl font-bold font-syne text-red">3</div><div className="text-xs text-t2 mt-1 uppercase text-t3">Failed</div></div>
      </div>

      <div className="card" style={{ padding: 0 }}>
        <table>
          <thead>
            <tr>
              <th>Sender</th>
              <th>Subject</th>
              <th>Attachments</th>
              <th>Time</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <div className="flex items-center gap-2">
                  <div style={{ width: 28, height: 28, borderRadius: '50%', backgroundColor: 'var(--accent)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 'bold' }}>AP</div>
                  <div>Accounts<div className="text-xs text-t2">accounts@partner.com</div></div>
                </div>
              </td>
              <td>Invoice submission — March batch (3 files)</td>
              <td className="text-xs text-t2">TCS_INV_0312.pdf, _0313, _0314</td>
              <td className="text-xs text-t3">09:41 AM</td>
              <td><span className="badge b-i">New</span></td>
            </tr>
            <tr>
              <td>
                <div className="flex items-center gap-2">
                  <div style={{ width: 28, height: 28, borderRadius: '50%', backgroundColor: 'var(--teal)', color: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 'bold' }}>IN</div>
                  <div>Infosys<div className="text-xs text-t2">billing@infosys.com</div></div>
                </div>
              </td>
              <td>Infosys Q1 Invoices — 5 PDFs</td>
              <td className="text-xs text-t2">INF_2024_001, _002, +3 more</td>
              <td className="text-xs text-t3">08:27 AM</td>
              <td><span className="badge b-p">Processing</span></td>
            </tr>
            <tr>
              <td>
                <div className="flex items-center gap-2">
                  <div style={{ width: 28, height: 28, borderRadius: '50%', backgroundColor: 'var(--green)', color: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 'bold' }}>WI</div>
                  <div>Wipro<div className="text-xs text-t2">finance@wipro.com</div></div>
                </div>
              </td>
              <td>Wipro March 2024 Invoices</td>
              <td className="text-xs text-t2">WIP_INV_031, _032</td>
              <td className="text-xs text-t3">Yesterday</td>
              <td><span className="badge b-s">Done</span></td>
            </tr>
            <tr>
              <td>
                <div className="flex items-center gap-2">
                  <div style={{ width: 28, height: 28, borderRadius: '50%', backgroundColor: 'var(--red)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 'bold' }}>AC</div>
                  <div>Accenture<div className="text-xs text-t2">noreply@accenture.com</div></div>
                </div>
              </td>
              <td>RE: Invoice resubmission (2 files)</td>
              <td className="text-xs text-t2">ACC_Q1_scan_01, _02</td>
              <td className="text-xs text-t3">Yesterday</td>
              <td><span className="badge b-e">Failed</span></td>
            </tr>
            <tr>
              <td>
                <div className="flex items-center gap-2">
                  <div style={{ width: 28, height: 28, borderRadius: '50%', backgroundColor: 'var(--purple)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 'bold' }}>HC</div>
                  <div>HCL<div className="text-xs text-t2">billing@hcl.com</div></div>
                </div>
              </td>
              <td>HCL Technologies — Invoice Feb 2024</td>
              <td className="text-xs text-t2">HCL_INV_FEB24</td>
              <td className="text-xs text-t3">2 days ago</td>
              <td><span className="badge b-s">Done</span></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
