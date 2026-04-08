import React from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import { useToast } from './Toast';

const PAGE_NAMES = {
  '/dashboard': 'Dashboard',
  '/upload': 'Upload Invoices',
  '/review': 'Review Extraction',
  '/invoices': 'All Invoices',
  '/batch': 'Batch Jobs',
  '/export': 'Export Data',
  '/inbox': 'Inbox Monitor',
  '/queue': 'Processing Queue',
  '/reports': 'Email Reports',
  '/failures': 'Resend Failures',
  '/flow': 'Email Ingestion Flow',
  '/vendors': 'Vendors',
  '/email-config': 'Email Configuration',
  '/templates': 'Reply Templates',
  '/settings': 'Settings'
};

export default function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const currentTitle = PAGE_NAMES[location.pathname] || 'Dashboard';

  return (
    <div style={{ display: 'flex', width: '100vw', height: '100vh', overflow: 'hidden' }}>
      {/* Sidebar - fixed width */}
      <Sidebar />
      
      {/* Main Content Area */}
      <div style={{ 
        flex: 1, 
        marginLeft: '220px', /* offset for fixed sidebar */
        display: 'flex', 
        flexDirection: 'column' 
      }}>
        {/* Topbar */}
        <header style={{
          height: '52px',
          borderBottom: '1px solid var(--b)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 26px',
          flexShrink: 0
        }}>
          <h1 style={{ fontSize: '18px', fontWeight: 700, margin: 0 }}>
            {currentTitle}
          </h1>
          
          <div className="flex items-center justify-center gap-2" style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)' }}>
            <div style={{ width: 8, height: 8, backgroundColor: 'var(--green)', borderRadius: '50%', animation: 'pulse 2s infinite' }}></div>
            <span className="mono text-xs text-accent font-medium" style={{ color: 'var(--accent)' }}>[email protected]</span>
          </div>

          <div className="flex items-center gap-3">
            <input type="text" className="input" placeholder="Search invoices..." style={{ width: '200px', height: '32px', padding: '0 12px', fontSize: '13px' }} />
            <button className="btn bg btn-sm" onClick={() => toast('📧 Test email sent to inbox', 'blue')}>Send Test Email</button>
            <button className="btn bp btn-sm" onClick={() => navigate('/upload')}>+ Upload PDF</button>
          </div>
        </header>

        {/* Scrollable Content */}
        <main className="overflow-y-auto" style={{ 
          flex: 1, 
          padding: '22px 26px',
          position: 'relative'
        }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
