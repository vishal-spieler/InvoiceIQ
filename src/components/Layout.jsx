import React from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import { useToast } from './Toast';
import { useAuth } from '../context/AuthContext';

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
  '/settings': 'Settings',
  '/team/employees': 'Employees'
};

export default function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { currentUser, logout, activeOrg } = useAuth();

  const currentTitle = PAGE_NAMES[location.pathname] || 'Dashboard';
  
  if (currentUser?.role === 'owner') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', width: '100vw', height: '100vh', overflow: 'hidden' }}>
        <header style={{
          height: '52px', borderBottom: '1px solid var(--b)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 26px', flexShrink: 0
        }}>
           <div className="flex items-center gap-2">
             <div style={{ width: 28, height: 28, backgroundColor: 'var(--accent)', borderRadius: 'var(--rs)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '14px' }}>⚡</div>
             <h1 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--t2)', margin: 0, fontFamily: 'Syne' }}>InvoiceIQ Owner Console</h1>
           </div>
           <div className="flex items-center gap-4">
             <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg, var(--accent), var(--purple))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '12px', fontWeight: 600 }}>{currentUser.avatar}</div>
             <button className="btn bg btn-sm" onClick={logout}>Sign Out</button>
           </div>
        </header>
        <main className="overflow-y-auto" style={{ flex: 1, padding: '40px 60px', position: 'relative' }}>
          <Outlet />
        </main>
      </div>
    );
  }

  const isEmployee = currentUser?.role === 'employee';

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
            <div style={{ 
              fontSize: '11px', fontWeight: 500, color: 'var(--t2)', 
              backgroundColor: 'var(--s2)', padding: '4px 10px', borderRadius: '4px' 
            }}>
              🏢 {activeOrg?.shortName || "Unknown Org"}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <input type="text" className="input" placeholder="Search invoices..." style={{ width: '200px', height: '32px', padding: '0 12px', fontSize: '13px' }} />
            <button className="btn bp btn-sm" onClick={() => navigate('/upload')}>+ Upload Invoice</button>
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
