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
import { useFeatureFlags } from './context/FeatureFlagContext';

const FlaggedRoute = ({ flagKey, children }) => {
  const { flags } = useFeatureFlags();
  if (!flags[flagKey]) return <Navigate to="/dashboard" replace />;
  return children;
};

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />
        {/* Core */}
        <Route path="/upload" element={<UploadInvoices />} />
        <Route path="/review" element={<ReviewEdit />} />
        <Route path="/invoices" element={<AllInvoices />} />
        <Route path="/batch" element={<BatchJobs />} />
        <Route path="/export" element={<ExportData />} />
        
        {/* All Other Pages */}
        <Route path="/inbox" element={<FlaggedRoute flagKey="inboxMonitor"><InboxMonitor /></FlaggedRoute>} />
        <Route path="/queue" element={<FlaggedRoute flagKey="processingQueue"><ProcessingQueue /></FlaggedRoute>} />
        <Route path="/reports" element={<FlaggedRoute flagKey="emailReports"><EmailReports /></FlaggedRoute>} />
        <Route path="/failures" element={<FlaggedRoute flagKey="resendFailures"><ResendFailures /></FlaggedRoute>} />
        <Route path="/flow" element={<FlaggedRoute flagKey="flowDiagram"><FlowDiagram /></FlaggedRoute>} />
        
        <Route path="/vendors" element={<Vendors />} />
        <Route path="/email-config" element={<FlaggedRoute flagKey="emailConfig"><EmailConfig /></FlaggedRoute>} />
        <Route path="/templates" element={<FlaggedRoute flagKey="replyTemplates"><ReplyTemplates /></FlaggedRoute>} />
        <Route path="/settings" element={<Settings />} />
      </Route>
    </Routes>
  );
}

export default App;
