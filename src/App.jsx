import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import ComingSoon from './components/ComingSoon';
import UploadInvoices from './pages/UploadInvoices';
import ReviewEdit from './pages/ReviewEdit';
import AllInvoices from './pages/AllInvoices';
import BatchJobs from './pages/BatchJobs';
import ExportData from './pages/ExportData';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Navigate to="/upload" replace />} />
        {/* Core */}
        <Route path="/upload" element={<UploadInvoices />} />
        <Route path="/review" element={<ReviewEdit />} />
        <Route path="/invoices" element={<AllInvoices />} />
        <Route path="/batch" element={<BatchJobs />} />
        <Route path="/export" element={<ExportData />} />
        
        {/* All Other Coming Soon Pages */}
        <Route path="/inbox" element={<ComingSoon title="Inbox Monitor" />} />
        <Route path="/queue" element={<ComingSoon title="Processing Queue" />} />
        <Route path="/reports" element={<ComingSoon title="Email Reports" />} />
        <Route path="/failures" element={<ComingSoon title="Resend Failures" />} />
        <Route path="/flow" element={<ComingSoon title="Email Ingestion Flow" />} />
        
        <Route path="/vendors" element={<ComingSoon title="Vendors" />} />
        <Route path="/email-config" element={<ComingSoon title="Email Configuration" />} />
        <Route path="/templates" element={<ComingSoon title="Reply Templates" />} />
        <Route path="/settings" element={<ComingSoon title="Settings" />} />
      </Route>
    </Routes>
  );
}

export default App;
