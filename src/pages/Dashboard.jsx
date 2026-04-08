import React from 'react';
import { FileText, Target, Mail, AlertTriangle } from 'lucide-react';

export default function Dashboard() {
  return (
    <div className="col gap-4">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
         <div className="col">
            <h1 style={{ fontSize: '24px', fontWeight: 700, fontFamily: 'Syne', marginBottom: '4px' }}>Good morning, Priya 👋</h1>
            <div style={{ color: 'var(--t2)', fontSize: '14px' }}>Invoice pipeline overview — today's snapshot.</div>
         </div>
         <div className="flex gap-2">
            <select className="input" style={{ width: '130px', height: '32px', fontSize: '13px' }}>
               <option>Last 30 days</option>
               <option>Last 7 days</option>
            </select>
            <button className="btn bg btn-sm" style={{ height: '32px' }}>Export Report</button>
         </div>
      </div>

      {/* Stats Row */}
      <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
        <div className="card" style={{ borderTop: '3px solid var(--accent)' }}>
           <div className="flex justify-between items-start mb-2">
             <span className="text-t3 text-xs font-bold" style={{ textTransform: 'uppercase', letterSpacing: '0.08em' }}>Total Processed</span>
             <div style={{ width: 24, height: 24, borderRadius: 4, backgroundColor: 'var(--s3)', color: 'var(--t2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><FileText size={12} /></div>
           </div>
           <div style={{ fontSize: '28px', fontWeight: 700, fontFamily: 'Syne' }}>1,247</div>
           <div className="text-xs mt-1 font-medium" style={{ color: 'var(--green)' }}>↑ 18% vs last month</div>
        </div>
        <div className="card" style={{ borderTop: '3px solid var(--teal)' }}>
           <div className="flex justify-between items-start mb-2">
             <span className="text-t3 text-xs font-bold" style={{ textTransform: 'uppercase', letterSpacing: '0.08em' }}>Accuracy Rate</span>
             <div style={{ width: 24, height: 24, borderRadius: 4, backgroundColor: 'rgba(239,68,68,0.1)', color: 'var(--red)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Target size={12} /></div>
           </div>
           <div style={{ fontSize: '28px', fontWeight: 700, fontFamily: 'Syne' }}>94.2%</div>
           <div className="text-xs mt-1 font-medium" style={{ color: 'var(--green)' }}>↑ 2.1% improvement</div>
        </div>
        <div className="card" style={{ borderTop: '3px solid var(--amber)' }}>
           <div className="flex justify-between items-start mb-2">
             <span className="text-t3 text-xs font-bold" style={{ textTransform: 'uppercase', letterSpacing: '0.08em' }}>Emails Processed</span>
             <div style={{ width: 24, height: 24, borderRadius: 4, backgroundColor: 'rgba(79,124,255,0.1)', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Mail size={12} /></div>
           </div>
           <div style={{ fontSize: '28px', fontWeight: 700, fontFamily: 'Syne' }}>18</div>
           <div className="text-xs mt-1 font-medium text-t3">today · 3 via email</div>
        </div>
        <div className="card" style={{ borderTop: '3px solid var(--red)' }}>
           <div className="flex justify-between items-start mb-2">
             <span className="text-t3 text-xs font-bold" style={{ textTransform: 'uppercase', letterSpacing: '0.08em' }}>Pending Review</span>
             <div style={{ width: 24, height: 24, borderRadius: 4, backgroundColor: 'rgba(239,68,68,0.1)', color: 'var(--red)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><AlertTriangle size={12} /></div>
           </div>
           <div style={{ fontSize: '28px', fontWeight: 700, fontFamily: 'Syne', color: 'var(--red)' }}>3</div>
           <div className="text-xs mt-1 font-medium" style={{ color: 'var(--red)' }}>needs attention</div>
        </div>
      </div>

      <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
        {/* Left column - Vendor Volume */}
        <div className="card col gap-4" style={{ gridColumn: 'span 3' }}>
          <div className="flex justify-between items-center">
             <h3 style={{ fontSize: '15px', fontWeight: 600 }}>Processing Volume</h3>
             <div className="flex gap-3 text-xs text-t2">
               <div className="flex items-center gap-1.5"><div style={{ width: 8, height: 8, backgroundColor: 'var(--accent)', borderRadius: '2px' }}></div>Upload</div>
               <div className="flex items-center gap-1.5"><div style={{ width: 8, height: 8, backgroundColor: 'var(--t3)', borderRadius: '2px' }}></div>Email</div>
             </div>
          </div>
          
          <div className="flex text-xs text-t3 font-medium px-4 mt-2">
            <div style={{ width: '40px' }}></div>
            <div className="flex-1 flex justify-between pr-5">
              <span>Oct</span><span>Nov</span><span>Dec</span><span>Jan</span><span>Feb</span><span>Mar</span>
            </div>
            <div style={{ width: '30px' }}></div>
          </div>

          <div className="col" style={{ gap: '2px' }}>
            {[
              { name: 'Infosys', count: 312, percent: 78, color: 'var(--accent)' },
              { name: 'TCS', count: 244, percent: 61, color: 'var(--teal)' },
              { name: 'Wipro', count: 188, percent: 45, color: 'var(--purple)' },
              { name: 'Others', count: 148, percent: 35, color: 'var(--t3)' },
            ].map(v => (
              <div key={v.name} className="flex gap-3 items-center">
                <div style={{ width: '45px' }} className="text-right text-xs text-t2 font-medium">{v.name}</div>
                <div className="flex-1 flex items-center" style={{ backgroundColor: 'var(--b2)', borderRadius: '2px', overflow: 'hidden' }}>
                  <div style={{ width: `${v.percent}%`, height: '28px', background: v.color, display: 'flex', alignItems: 'center', paddingLeft: '8px', color: '#fff', fontSize: '11px', fontWeight: 600 }}>
                    {v.percent}%
                  </div>
                </div>
                <div style={{ width: '30px' }} className="text-right text-xs text-t2 font-bold">{v.count}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Right column */}
        <div className="col gap-4" style={{ gridColumn: 'span 1' }}>
          <div className="card col gap-4">
            <h3 style={{ fontSize: '15px', fontWeight: 600 }}>Field Accuracy</h3>
            <div className="col gap-4 mt-1">
              {[
                { label: 'Invoice Number', val: '98.4%', w: 98.4, cl: 'var(--green)' },
                { label: 'Total Amount', val: '97.1%', w: 97.1, cl: 'var(--green)' },
                { label: 'Vendor Name', val: '95.8%', w: 95.8, cl: 'var(--accent)' },
                { label: 'Invoice Date', val: '89.2%', w: 89.2, cl: 'var(--amber)' },
                { label: 'Line Items', val: '82.5%', w: 82.5, cl: 'var(--amber)' },
              ].map(f => (
                <div key={f.label} className="col gap-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-t2">{f.label}</span>
                    <span className="font-medium" style={{ color: f.cl }}>{f.val}</span>
                  </div>
                  <div className="progress-container" style={{ height: '4px', backgroundColor: 'var(--b2)' }}>
                    <div className="h-full" style={{ width: `${f.w}%`, backgroundColor: f.cl, borderRadius: '2px' }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="card col gap-4">
            <h3 style={{ fontSize: '15px', fontWeight: 600 }}>Recent Activity</h3>
            <div className="col gap-4 mt-1">
              <div className="flex gap-3 items-start text-sm">
                <div style={{ width: 6, height: 6, backgroundColor: 'var(--green)', borderRadius: '1px', marginTop: 6, flexShrink: 0 }}></div>
                <div>
                  <div className="text-t">Email from <span style={{ color: 'var(--accent)', fontWeight: 500 }}>[email protected]</span> — 5 invoices extracted</div>
                  <div className="text-xs text-t3 mt-1">2 min ago</div>
                </div>
              </div>
              <div className="flex gap-3 items-start text-sm">
                <div style={{ width: 6, height: 6, backgroundColor: 'var(--amber)', borderRadius: '1px', marginTop: 6, flexShrink: 0 }}></div>
                <div>
                  <div className="text-t"><span style={{ fontWeight: 600 }}>INV-20240311</span> flagged — low confidence on Total</div>
                  <div className="text-xs text-t3 mt-1">18 min ago</div>
                </div>
              </div>
              <div className="flex gap-3 items-start text-sm">
                <div style={{ width: 6, height: 6, backgroundColor: 'var(--red)', borderRadius: '1px', marginTop: 6, flexShrink: 0 }}></div>
                <div>
                  <div className="text-t">Failure reply sent to <span style={{ color: 'var(--accent)', fontWeight: 500 }}>[email protected]</span> — 2 files</div>
                  <div className="text-xs text-t3 mt-1">1 hr ago</div>
                </div>
              </div>
              <div className="flex gap-3 items-start text-sm">
                <div style={{ width: 6, height: 6, backgroundColor: 'var(--accent)', borderRadius: '1px', marginTop: 6, flexShrink: 0 }}></div>
                <div>
                  <div className="text-t">Batch <span style={{ fontWeight: 500 }}>batch_0323</span> complete (48 invoices)</div>
                  <div className="text-xs text-t3 mt-1">2 hr ago</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
