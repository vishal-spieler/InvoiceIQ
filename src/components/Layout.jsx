import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';

const PAGE_NAMES = {
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
          padding: '0 26px',
          flexShrink: 0
        }}>
          <h1 style={{ fontSize: '18px', fontWeight: 700, margin: 0 }}>
            {currentTitle}
          </h1>
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
