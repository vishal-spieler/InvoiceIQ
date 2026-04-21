import { FileText, Target, Mail, AlertTriangle, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useVendors } from '../context/VendorContext';
import { useInvoices } from '../context/InvoiceContext';

export default function Dashboard() {
  const { currentUser } = useAuth();
  const { vendors } = useVendors();
  const { invoices } = useInvoices();
  const navigate = useNavigate();

  const isOrg = currentUser?.role === 'org_admin' || currentUser?.role === 'employee';
  
  // Real live invoice pipeline compute
  const myInvoices = invoices.filter(i => i.orgId === currentUser?.orgId);
  
  const pendingCount = myInvoices.filter(i => i.status === 'Pending' || i.status === 'Needs Review').length;
  const exportedCount = myInvoices.filter(i => i.status === 'Exported' || i.status === 'Approved').length;
  const avgAccuracy = myInvoices.length ? `${Math.round(myInvoices.reduce((acc, curr) => acc + (Number(curr.confidence) || 0), 0) / myInvoices.length)}%` : '0%';

  const stats = {
    totalBox: { label: 'Total Invoices', val: myInvoices.length, color: 'var(--accent)', icon: <FileText size={12} />, bg: 'rgba(79,124,255,0.1)' },
    accBox: { label: 'Exported & Approved', val: exportedCount, color: 'var(--teal)', icon: <Target size={12} />, bg: 'rgba(34,211,176,0.1)' },
    emBox: { label: 'Pending Review', val: pendingCount, color: 'var(--amber)', icon: <Clock size={12} />, bg: 'rgba(245,166,35,0.1)' },
    revBox: { label: 'Average Accuracy', val: avgAccuracy, color: 'var(--green)', icon: <Target size={12} />, bg: 'rgba(34,197,94,0.1)' }
  };

  return (
    <div className="col gap-4">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div className="col">
          <h1 style={{ fontSize: '24px', fontWeight: 700, fontFamily: 'Syne', marginBottom: '4px' }}>
            {isOrg ? `Welcome, ${currentUser.name}` : `Good morning, ${currentUser.name.split(' ')[0]} 👋`}
          </h1>
          <div style={{ color: 'var(--t2)', fontSize: '14px' }}>
            {isOrg ? 'Your live invoice processing dashboard.' : 'Invoice pipeline overview — today\'s snapshot.'}
          </div>
        </div>
        <div className="flex gap-2">
          <select className="input" style={{ width: '130px', height: '32px', fontSize: '13px' }}>
            <option>All Time</option>
            <option>Last 30 days</option>
            <option>Last 7 days</option>
          </select>
          <button className="btn bg btn-sm" style={{ height: '32px' }} onClick={() => navigate('/export')}>Export Report</button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
        <div className="card hover:bg-s2" style={{ borderTop: `3px solid ${stats.totalBox.color}`, cursor: 'pointer', transition: 'background-color 0.2s' }} onClick={() => navigate('/invoices', { state: { statusFilter: 'All' } })}>
          <div className="flex justify-between items-start mb-2">
            <span className="text-t3 text-xs font-bold" style={{ textTransform: 'uppercase', letterSpacing: '0.08em' }}>{stats.totalBox.label}</span>
            <div style={{ width: 24, height: 24, borderRadius: 4, backgroundColor: stats.totalBox.bg, color: stats.totalBox.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{stats.totalBox.icon}</div>
          </div>
          <div style={{ fontSize: '28px', fontWeight: 700, fontFamily: 'Syne' }}>{stats.totalBox.val}</div>
          <div className="text-xs mt-1 font-medium" style={{ color: 'var(--green)' }}>Live Database Count</div>
        </div>
        <div className="card hover:bg-s2" style={{ borderTop: `3px solid ${stats.accBox.color}`, cursor: 'pointer', transition: 'background-color 0.2s' }} onClick={() => navigate('/invoices', { state: { statusFilter: 'Done' } })}>
          <div className="flex justify-between items-start mb-2">
            <span className="text-t3 text-xs font-bold" style={{ textTransform: 'uppercase', letterSpacing: '0.08em' }}>{stats.accBox.label}</span>
            <div style={{ width: 24, height: 24, borderRadius: 4, backgroundColor: stats.accBox.bg, color: stats.accBox.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{stats.accBox.icon}</div>
          </div>
          <div style={{ fontSize: '28px', fontWeight: 700, fontFamily: 'Syne' }}>{stats.accBox.val}</div>
          <div className="text-xs mt-1 font-medium" style={{ color: 'var(--teal)' }}>Successfully pushed</div>
        </div>
        <div className="card hover:bg-s2" style={{ borderTop: `3px solid ${stats.emBox.color}`, cursor: 'pointer', transition: 'background-color 0.2s' }} onClick={() => navigate('/invoices', { state: { statusFilter: 'Action Required' } })}>
          <div className="flex justify-between items-start mb-2">
            <span className="text-t3 text-xs font-bold" style={{ textTransform: 'uppercase', letterSpacing: '0.08em' }}>{stats.emBox.label}</span>
            <div style={{ width: 24, height: 24, borderRadius: 4, backgroundColor: stats.emBox.bg, color: stats.emBox.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{stats.emBox.icon}</div>
          </div>
          <div style={{ fontSize: '28px', fontWeight: 700, fontFamily: 'Syne' }}>{stats.emBox.val}</div>
          <div className="text-xs mt-1 font-medium text-amber">Requires your attention</div>
        </div>
        <div className="card hover:bg-s2" style={{ borderTop: `3px solid ${stats.revBox.color}`, cursor: 'pointer', transition: 'background-color 0.2s' }} onClick={() => navigate('/invoices')}>
          <div className="flex justify-between items-start mb-2">
            <span className="text-t3 text-xs font-bold" style={{ textTransform: 'uppercase', letterSpacing: '0.08em' }}>{stats.revBox.label}</span>
            <div style={{ width: 24, height: 24, borderRadius: 4, backgroundColor: stats.revBox.bg, color: stats.revBox.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{stats.revBox.icon}</div>
          </div>
          <div style={{ fontSize: '28px', fontWeight: 700, fontFamily: 'Syne', color: stats.revBox.color }}>{stats.revBox.val}</div>
          <div className="text-xs mt-1 font-medium" style={{ color: stats.revBox.color }}>Extraction precision</div>
        </div>
      </div>

      <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
        {/* Left column */}
        <div className="card col gap-4" style={{ gridColumn: 'span 3' }}>
          <div className="flex justify-between items-center mb-2">
            <h3 style={{ fontSize: '15px', fontWeight: 600 }}>My Recent Invoices</h3>
          </div>
          <div className="overflow-x-auto">
            <table style={{ width: '100%', fontSize: '12px' }}>
              <thead>
                <tr>
                  <th style={{ textAlign: 'left', padding: '8px', color: 'var(--t2)', borderBottom: '1px solid var(--b)' }}>Invoice No</th>
                  <th style={{ textAlign: 'left', padding: '8px', color: 'var(--t2)', borderBottom: '1px solid var(--b)' }}>Vendor</th>
                  <th style={{ textAlign: 'left', padding: '8px', color: 'var(--t2)', borderBottom: '1px solid var(--b)' }}>Date</th>
                  <th style={{ textAlign: 'right', padding: '8px', color: 'var(--t2)', borderBottom: '1px solid var(--b)' }}>Total</th>
                  <th style={{ textAlign: 'center', padding: '8px', color: 'var(--t2)', borderBottom: '1px solid var(--b)' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {myInvoices.slice(0, 5).map(inv => (
                  <tr key={inv.id} className="hover:bg-s2" style={{ cursor: 'pointer' }} onClick={() => navigate('/review', { state: { extractedData: inv, filename: inv.filename || inv.invoiceNo, fileType: inv.fileType || 'application/pdf', previewUrl: inv.previewBase64 || inv.previewUrl } })}>
                    <td style={{ padding: '8px', borderBottom: '1px solid var(--b)', fontWeight: 500, color: 'var(--accent)' }}>{inv.invoiceNo || 'Unknown'}</td>
                    <td style={{ padding: '8px', borderBottom: '1px solid var(--b)' }}>{inv.vendor || '-'}</td>
                    <td style={{ padding: '8px', borderBottom: '1px solid var(--b)' }}>{inv.date || '-'}</td>
                    <td style={{ padding: '8px', borderBottom: '1px solid var(--b)', textAlign: 'right', fontFamily: 'DM Mono' }}>₹{inv.total || '0.00'}</td>
                    <td style={{ padding: '8px', borderBottom: '1px solid var(--b)', textAlign: 'center' }}>
                      <span className={`badge ${inv.status === 'Exported' || inv.status === 'Approved' ? 'b-s' : (inv.status === 'Needs Review' ? 'b-w' : inv.status === 'Rejected' ? 'b-r' : 'b-i')}`}>
                        {inv.status || 'Pending'}
                      </span>
                    </td>
                  </tr>
                ))}
                {myInvoices.length === 0 && (
                  <tr>
                    <td colSpan="5" style={{ padding: '24px', textAlign: 'center', color: 'var(--t2)' }}>No recent invoices uploaded yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right column */}
        <div className="col gap-4" style={{ gridColumn: 'span 1' }}>
          <div className="card col gap-4">
            <h3 style={{ fontSize: '15px', fontWeight: 600 }}>Your Extraction Accuracy</h3>
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
              {myInvoices.slice(0, 4).map(inv => (
                <div key={inv.id} className="flex gap-3 items-start text-sm hover:opacity-80" style={{ cursor: 'pointer' }} onClick={() => navigate('/review', { state: { extractedData: inv, filename: inv.filename || inv.invoiceNo, fileType: inv.fileType || 'application/pdf', previewUrl: inv.previewBase64 || inv.previewUrl } })}>
                  <div style={{ width: 6, height: 6, backgroundColor: inv.status === 'Exported' || inv.status === 'Approved' ? 'var(--green)' : inv.status === 'Rejected' ? 'var(--red)' : 'var(--amber)', borderRadius: '1px', marginTop: 6, flexShrink: 0 }}></div>
                  <div>
                    <div className="text-t"><span style={{ fontWeight: 600 }}>{inv.invoiceNo}</span> — {inv.status === 'Exported' || inv.status === 'Approved' ? 'Successfully parsed and exported to DB' : inv.status === 'Rejected' ? 'Rejected invoice.' : 'Needs review and active attention.'}</div>
                    <div className="text-xs text-t3 mt-1">{inv.vendor}</div>
                  </div>
                </div>
              ))}
              {myInvoices.length === 0 && (
                <div className="text-xs text-t3 text-center py-4">No recent activity detected.</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}