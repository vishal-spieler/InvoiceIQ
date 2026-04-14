import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import ComingSoon from './components/ComingSoon';
import UploadInvoices from './pages/UploadInvoices';
import ReviewEdit from './pages/ReviewEdit';
import AllInvoices from './pages/AllInvoices';
import BatchJobs from './pages/BatchJobs';
import ExportData from './pages/ExportData';
import Dashboard from './pages/Dashboard';
import Vendors from './pages/Vendors';
import InboxMonitor from './pages/InboxMonitor';
import ProcessingQueue from './pages/ProcessingQueue';
import EmailReports from './pages/EmailReports';
import ResendFailures from './pages/ResendFailures';
import FlowDiagram from './pages/FlowDiagram';
import EmailConfig from './pages/EmailConfig';
import ReplyTemplates from './pages/ReplyTemplates';
import Settings from './pages/Settings';
import Login from './pages/Login';

// New Owner & Team Pages
import OwnerOrgs from './pages/OwnerOrgs';
import Employees from './pages/Employees';

import { useAuth } from './context/AuthContext';

const FlaggedRoute = ({ flagKey, children }) => {
  const { currentUser, activeOrg } = useAuth();
  
  if (currentUser?.role === 'owner') return children;
  if (!activeOrg) return <Navigate to="/" replace />;
  
  const orgHasAdminFlag = activeOrg.adminFlags && activeOrg.adminFlags[flagKey];
  const orgHasEmpFlag = activeOrg.employeeFlags && activeOrg.employeeFlags[flagKey];
  
  if (currentUser.role === 'employee') {
    const empHasAccess = currentUser.pageAccess && currentUser.pageAccess[flagKey];
    if (orgHasEmpFlag && empHasAccess) return children;
    return <Navigate to="/dashboard" replace />;
  }

  if (currentUser.role === 'org_admin') {
    if (orgHasAdminFlag) return children;
    return <Navigate to="/dashboard" replace />;
  }
  
  return <Navigate to="/dashboard" replace />;
};

function App() {
  const { currentUser, activeOrg } = useAuth();

  if (!currentUser) {
    return (
      <Routes>
        <Route path="*" element={<Login />} />
      </Routes>
    );
  }

  // Handle Mid-Session Expiry
  if (activeOrg && activeOrg.status === 'Expired') {
    return (
      <div style={{ position: 'fixed', inset: 0, zIndex: 9999, backgroundColor: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="card col items-center text-center gap-4 py-8 px-12" style={{ maxWidth: '400px', border: '1px solid var(--b)' }}>
          <div style={{ fontSize: '48px' }}>⏰</div>
          <h2 style={{ fontSize: '20px', fontWeight: 600 }}>Subscription Expired</h2>
          <p style={{ color: 'var(--t2)', fontSize: '14px', lineHeight: 1.5 }}>
            Your InvoiceIQ subscription ended on <strong style={{ color: 'var(--t)' }}>{activeOrg.expiresAt}</strong>. 
            <br/><br/>
            Contact your admin or InvoiceIQ support to renew.
          </p>
          <button className="btn mt-4" onClick={() => window.location.reload()}>Sign Out</button>
        </div>
      </div>
    );
  }

  // Owner Routing
  if (currentUser.role === 'owner') {
    return (
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/owner/orgs" replace />} />
          <Route path="/owner/orgs" element={<OwnerOrgs />} />
          <Route path="*" element={<Navigate to="/owner/orgs" replace />} />
        </Route>
      </Routes>
    );
  }

  // Org Admin & Employee Routing
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />
        
        {/* Core */}
        <Route path="/upload" element={<FlaggedRoute flagKey="uploadInvoice"><UploadInvoices /></FlaggedRoute>} />
        <Route path="/review" element={<FlaggedRoute flagKey="reviewEdit"><ReviewEdit /></FlaggedRoute>} />
        <Route path="/invoices" element={<FlaggedRoute flagKey="allInvoices"><AllInvoices /></FlaggedRoute>} />
        <Route path="/batch" element={<FlaggedRoute flagKey="batchJobs"><BatchJobs /></FlaggedRoute>} />
        <Route path="/export" element={<FlaggedRoute flagKey="exportData"><ExportData /></FlaggedRoute>} />
        
        {/* Email Pipeline */}
        <Route path="/inbox" element={<FlaggedRoute flagKey="inboxMonitor"><InboxMonitor /></FlaggedRoute>} />
        <Route path="/queue" element={<FlaggedRoute flagKey="processingQueue"><ProcessingQueue /></FlaggedRoute>} />
        <Route path="/reports" element={<FlaggedRoute flagKey="emailReports"><EmailReports /></FlaggedRoute>} />
        <Route path="/failures" element={<FlaggedRoute flagKey="resendFailures"><ResendFailures /></FlaggedRoute>} />
        <Route path="/flow" element={<FlaggedRoute flagKey="flowDiagram"><FlowDiagram /></FlaggedRoute>} />
        
        {/* System (Vendors visible if feature flag. Settings is always visible for Org Admin) */}
        <Route path="/vendors" element={<FlaggedRoute flagKey="vendors"><Vendors /></FlaggedRoute>} />
        <Route path="/email-config" element={<FlaggedRoute flagKey="emailConfig"><EmailConfig /></FlaggedRoute>} />
        <Route path="/templates" element={<FlaggedRoute flagKey="replyTemplates"><ReplyTemplates /></FlaggedRoute>} />
        
        {/* Org Admin ONLY Pages */}
        {currentUser.role === 'org_admin' && (
          <>
            <Route path="/team/employees" element={<Employees />} />
            <Route path="/settings" element={<Settings />} />
          </>
        )}
      </Route>
    </Routes>
  );
}

export default App;
