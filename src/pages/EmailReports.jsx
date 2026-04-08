import React from 'react';

export default function EmailReports() {
  return (
    <div className="col gap-6">
      <div>
        <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '4px' }}>Email Reports</h2>
        <p className="text-t2 text-sm">Automated replies sent to vendors and operators.</p>
      </div>

      <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
        <div className="card"><div className="text-xs text-t3 uppercase mb-1">Emails Sent</div><div className="text-2xl font-bold font-syne">31</div></div>
        <div className="card"><div className="text-xs text-t3 uppercase mb-1">Success Replies</div><div className="text-2xl font-bold font-syne text-green">26</div></div>
        <div className="card"><div className="text-xs text-t3 uppercase mb-1">Failure Replies</div><div className="text-2xl font-bold font-syne text-red">5</div></div>
      </div>

      <div className="card" style={{ padding: 0 }}>
        <table>
          <thead>
            <tr>
              <th>Email ID</th>
              <th>Vendor</th>
              <th>Sent At</th>
              <th>Type</th>
              <th>Files</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr><td className="mono text-xs">rpt_001</td><td>Infosys Ltd</td><td className="text-xs text-t3">08:31 AM today</td><td>Success reply</td><td>5/5</td><td><span className="text-green text-xs font-bold">● Delivered</span></td></tr>
            <tr><td className="mono text-xs">rpt_002</td><td>TCS Limited</td><td className="text-xs text-t3">07:50 AM today</td><td>Failure reply</td><td>2/3</td><td><span className="text-green text-xs font-bold">● Delivered</span></td></tr>
            <tr><td className="mono text-xs">rpt_003</td><td>Wipro Ltd</td><td className="text-xs text-t3">Yesterday 4:12 PM</td><td>Success reply</td><td>2/2</td><td><span className="text-green text-xs font-bold">● Delivered</span></td></tr>
            <tr><td className="mono text-xs">rpt_004</td><td>Accenture</td><td className="text-xs text-t3">Yesterday 2:05 PM</td><td>Failure reply</td><td>0/2</td><td><span className="text-red text-xs font-bold">● Bounced</span></td></tr>
            <tr><td className="mono text-xs">rpt_005</td><td>HCL Tech</td><td className="text-xs text-t3">2 days ago</td><td>Success reply</td><td>1/1</td><td><span className="text-green text-xs font-bold">● Delivered</span></td></tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
