import React from 'react';
import { useToast } from '../components/Toast';

export default function ExportData() {
  const { toast } = useToast();

  const handleExcelExport = () => {
    toast('📊 Downloaded: invoices_march_2024.xlsx', 'green');
  };

  const handleDbPush = () => {
    toast('🗄️ 24 invoices pushed to database', 'blue');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Page Context */}
      <div style={{ color: 'var(--t2)', fontSize: '13px' }}>
        Download as Excel or push to PostgreSQL database.
      </div>

      <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        
        {/* Left Card - Excel Export */}
        <div className="card flex col justify-between">
          <div>
            <h2 style={{ fontSize: '16px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>📊</span> Export to Excel (.xlsx)
            </h2>

            <div className="flex col gap-4" style={{ marginBottom: '24px' }}>
              <div className="flex items-center gap-3">
                <div className="form-group flex-1">
                  <label className="form-label">From Date</label>
                  <input type="date" className="input" defaultValue="2024-03-01" />
                </div>
                <div className="form-group flex-1">
                  <label className="form-label">To Date</label>
                  <input type="date" className="input" defaultValue="2024-03-31" />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Vendor</label>
                <select className="select">
                  <option>All Vendors</option>
                  <option>TCS</option>
                  <option>Infosys</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Source</label>
                <select className="select">
                  <option>All Sources</option>
                  <option>Email only</option>
                  <option>Upload only</option>
                </select>
              </div>

              <div style={{ backgroundColor: 'var(--s2)', padding: '16px', borderRadius: 'var(--rs)', marginTop: '8px' }}>
                <div style={{ fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '12px', color: 'var(--t2)' }}>
                  Include Sheets
                </div>
                <div className="flex col gap-3">
                  <label className="flex items-center gap-2" style={{ cursor: 'pointer' }}>
                    <input type="checkbox" defaultChecked style={{ accentColor: 'var(--green)', width: '16px', height: '16px' }} />
                    <span style={{ fontSize: '13px' }}>Summary <span style={{ color: 'var(--t3)' }}>(1 row per invoice)</span></span>
                  </label>
                  <label className="flex items-center gap-2" style={{ cursor: 'pointer' }}>
                    <input type="checkbox" defaultChecked style={{ accentColor: 'var(--green)', width: '16px', height: '16px' }} />
                    <span style={{ fontSize: '13px' }}>Line Items <span style={{ color: 'var(--t3)' }}>(detailed rows)</span></span>
                  </label>
                  <label className="flex items-center gap-2" style={{ cursor: 'pointer' }}>
                    <input type="checkbox" style={{ width: '16px', height: '16px' }} />
                    <span style={{ fontSize: '13px' }}>Audit Log</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
          
          <button className="btn bs2 w-full" style={{ padding: '12px' }} onClick={handleExcelExport}>
            Download Excel →
          </button>
        </div>

        {/* Right Card - DB Push */}
        <div className="card flex col justify-between">
          <div>
            <div className="flex items-center justify-between" style={{ marginBottom: '24px' }}>
              <h2 style={{ fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>🗄️</span> Push to PostgreSQL
              </h2>
              <div className="flex items-center gap-2" style={{ backgroundColor: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)', padding: '4px 10px', borderRadius: '12px' }}>
                <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--green)' }}></div>
                <span style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--green)' }}>Connected</span>
              </div>
            </div>

            <div className="mono" style={{ fontSize: '12px', color: 'var(--t2)', marginBottom: '32px', backgroundColor: 'var(--s2)', padding: '12px', borderRadius: 'var(--rs)', border: '1px solid var(--b)' }}>
              supabase · db.xxxx.supabase.co · invoices table
            </div>

            <div className="flex col gap-4">
              <div className="flex items-center justify-between" style={{ paddingBottom: '12px', borderBottom: '1px solid var(--b)' }}>
                <span style={{ color: 'var(--t2)' }}>Ready to push</span>
                <span style={{ fontWeight: 700, color: 'var(--green)' }}>24 invoices</span>
              </div>
              <div className="flex items-center justify-between" style={{ paddingBottom: '12px', borderBottom: '1px solid var(--b)' }}>
                <span style={{ color: 'var(--t2)' }}>Already in DB</span>
                <span style={{ fontWeight: 700 }}>123 invoices</span>
              </div>
              <div className="flex items-center justify-between" style={{ paddingBottom: '12px' }}>
                <span style={{ color: 'var(--t2)' }}>Duplicates blocked</span>
                <span style={{ fontWeight: 700, color: 'var(--red)' }}>2 invoices</span>
              </div>
            </div>
          </div>

          <button className="btn bp w-full" style={{ padding: '12px', marginTop: '32px' }} onClick={handleDbPush}>
            Push to Database →
          </button>
        </div>

      </div>
    </div>
  );
}
