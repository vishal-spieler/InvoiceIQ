import { FileText, Target, Mail, AlertTriangle, Clock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useVendors } from '../context/VendorContext';
import { useInvoices } from '../context/InvoiceContext';

export default function Dashboard() {
  const { currentUser } = useAuth();
  const { vendors } = useVendors();
  const { invoices } = useInvoices();

  const isOrg = currentUser?.role === 'org_admin' || currentUser?.role === 'employee';
  const vendor = isOrg ? vendors.find(v => v.id === currentUser.vendorId) : null;
  const myInvoices = isOrg ? invoices.filter(i => i.orgId === currentUser.orgId || !i.orgId) : [];

  const stats = isOrg ? {
    totalBox: { label: 'My Invoices', val: vendor?.invoices || 0, color: 'var(--accent)', icon: <FileText size={12} />, bg: 'var(--ag)' },
    accBox:   { label: 'Processed', val: Math.max(0, (vendor?.invoices || 0) - 2), color: 'var(--teal)', icon: <Target size={12} />, bg: 'rgba(34,211,176,0.1)' },
    emBox:    { label: 'Pending Review', val: 2, color: 'var(--amber)', icon: <Clock size={12} />, bg: 'rgba(245,166,35,0.1)' },
    revBox:   { label: 'Accuracy', val: `${vendor?.accuracy || 0}%`, color: 'var(--green)', icon: <Target size={12} />, bg: 'rgba(34,197,94,0.1)' }
  } : {
    totalBox: { label: 'Total Processed', val: '1,247', color: 'var(--accent)', icon: <FileText size={12} />, bg: 'var(--s3)' },
    accBox:   { label: 'Accuracy Rate', val: '94.2%', color: 'var(--teal)', icon: <Target size={12} />, bg: 'rgba(239,68,68,0.1)' },
    emBox:    { label: 'Emails Processed', val: '18', color: 'var(--amber)', icon: <Mail size={12} />, bg: 'rgba(79,124,255,0.1)' },
    revBox:   { label: 'Pending Review', val: '3', color: 'var(--red)', icon: <AlertTriangle size={12} />, bg: 'rgba(239,68,68,0.1)' }
  };

  return (
    <div className="col gap-4">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
         <div className="col">
            <h1 style={{ fontSize: '24px', fontWeight: 700, fontFamily: 'Syne', marginBottom: '4px' }}>
              {isOrg ? `Welcome, ${currentUser.name}` : 'Good morning, Priya 👋'}
            </h1>
            <div style={{ color: 'var(--t2)', fontSize: '14px' }}>
              {isOrg ? 'Your invoice processing dashboard.' : 'Invoice pipeline overview — today\'s snapshot.'}
            </div>
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
        <div className="card" style={{ borderTop: `3px solid ${stats.totalBox.color}` }}>
           <div className="flex justify-between items-start mb-2">
             <span className="text-t3 text-xs font-bold" style={{ textTransform: 'uppercase', letterSpacing: '0.08em' }}>{stats.totalBox.label}</span>
             <div style={{ width: 24, height: 24, borderRadius: 4, backgroundColor: stats.totalBox.bg, color: stats.totalBox.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{stats.totalBox.icon}</div>
           </div>
           <div style={{ fontSize: '28px', fontWeight: 700, fontFamily: 'Syne' }}>{stats.totalBox.val}</div>
           <div className="text-xs mt-1 font-medium" style={{ color: 'var(--green)' }}>{isOrg ? 'Updated recently' : '↑ 18% vs last month'}</div>
        </div>
        <div className="card" style={{ borderTop: `3px solid ${stats.accBox.color}` }}>
           <div className="flex justify-between items-start mb-2">
             <span className="text-t3 text-xs font-bold" style={{ textTransform: 'uppercase', letterSpacing: '0.08em' }}>{stats.accBox.label}</span>
             <div style={{ width: 24, height: 24, borderRadius: 4, backgroundColor: stats.accBox.bg, color: stats.accBox.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{stats.accBox.icon}</div>
           </div>
           <div style={{ fontSize: '28px', fontWeight: 700, fontFamily: 'Syne' }}>{stats.accBox.val}</div>
           <div className="text-xs mt-1 font-medium" style={{ color: 'var(--green)' }}>{isOrg ? 'Fully processed' : '↑ 2.1% improvement'}</div>
        </div>
        <div className="card" style={{ borderTop: `3px solid ${stats.emBox.color}` }}>
           <div className="flex justify-between items-start mb-2">
             <span className="text-t3 text-xs font-bold" style={{ textTransform: 'uppercase', letterSpacing: '0.08em' }}>{stats.emBox.label}</span>
             <div style={{ width: 24, height: 24, borderRadius: 4, backgroundColor: stats.emBox.bg, color: stats.emBox.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{stats.emBox.icon}</div>
           </div>
           <div style={{ fontSize: '28px', fontWeight: 700, fontFamily: 'Syne' }}>{stats.emBox.val}</div>
           <div className="text-xs mt-1 font-medium text-t3">{isOrg ? 'Awaiting your action' : 'today · 3 via email'}</div>
        </div>
        <div className="card" style={{ borderTop: `3px solid ${stats.revBox.color}` }}>
           <div className="flex justify-between items-start mb-2">
             <span className="text-t3 text-xs font-bold" style={{ textTransform: 'uppercase', letterSpacing: '0.08em' }}>{stats.revBox.label}</span>
             <div style={{ width: 24, height: 24, borderRadius: 4, backgroundColor: stats.revBox.bg, color: stats.revBox.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{stats.revBox.icon}</div>
           </div>
           <div style={{ fontSize: '28px', fontWeight: 700, fontFamily: 'Syne', color: stats.revBox.color }}>{stats.revBox.val}</div>
           <div className="text-xs mt-1 font-medium" style={{ color: stats.revBox.color }}>{isOrg ? 'Extraction precision' : 'needs attention'}</div>
        </div>
      </div>

      <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
        {/* Left column */}
        <div className="card col gap-4" style={{ gridColumn: 'span 3' }}>
          {isOrg ? (
            <>
              <div className="flex justify-between items-center mb-2">
                <h3 style={{ fontSize: '15px', fontWeight: 600 }}>My Recent Invoices</h3>
              </div>
              <div className="overflow-x-auto">
                <table style={{ width: '100%', fontSize: '12px' }}>
                  <thead>
                    <tr>
                      <th style={{ textAlign: 'left', padding: '8px', color: 'var(--t2)', borderBottom: '1px solid var(--b)' }}>Invoice No</th>
                      <th style={{ textAlign: 'left', padding: '8px', color: 'var(--t2)', borderBottom: '1px solid var(--b)' }}>Date</th>
                      <th style={{ textAlign: 'right', padding: '8px', color: 'var(--t2)', borderBottom: '1px solid var(--b)' }}>Total</th>
                      <th style={{ textAlign: 'center', padding: '8px', color: 'var(--t2)', borderBottom: '1px solid var(--b)' }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {myInvoices.slice(0, 5).map(inv => (
                      <tr key={inv.id} className="hover:bg-s2">
                        <td style={{ padding: '8px', borderBottom: '1px solid var(--b)', fontWeight: 500, color: 'var(--accent)' }}>{inv.invoiceNumber || 'Processing...'}</td>
                        <td style={{ padding: '8px', borderBottom: '1px solid var(--b)' }}>{inv.date || '-'}</td>
                        <td style={{ padding: '8px', borderBottom: '1px solid var(--b)', textAlign: 'right', fontFamily: 'DM Mono' }}>{inv.totalAmount || '-'}</td>
                        <td style={{ padding: '8px', borderBottom: '1px solid var(--b)', textAlign: 'center' }}>
                          <span className={`badge ${inv.status === 'Extracted' ? 'b-s' : (inv.status === 'Needs Review' ? 'b-w' : 'b-i')}`}>
                            {inv.status || 'Extracted'}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {myInvoices.length === 0 && (
                      <tr>
                        <td colSpan="4" style={{ padding: '24px', textAlign: 'center', color: 'var(--t2)' }}>No recent invoices uploaded yet.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <>
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
            </>
          )}
        </div>

        {/* Right column */}
        <div className="col gap-4" style={{ gridColumn: 'span 1' }}>
          <div className="card col gap-4">
            <h3 style={{ fontSize: '15px', fontWeight: 600 }}>{isOrg ? 'Your Extraction Accuracy' : 'Field Accuracy'}</h3>
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
