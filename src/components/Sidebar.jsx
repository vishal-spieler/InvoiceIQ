import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  Upload, Search, FileText, Layers, Download,
  Inbox, List, Mail, AlertCircle, GitBranch,
  Settings, LayoutTemplate, Briefcase,
  LayoutDashboard, Users
} from 'lucide-react';

const NavSection = ({ title, children }) => {
  const validChildren = React.Children.toArray(children).filter(child => child && typeof child === 'object');
  if (validChildren.length === 0) return null;

  return (
    <div style={{ marginBottom: '10px' }}>
      {title && (
        <div style={{ padding: '0 16px', fontSize: '11px', fontWeight: '700', color: 'var(--t3)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          {title}
        </div>
      )}
      <ul style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
        {validChildren}
      </ul>
    </div>
  );
};

const NavItem = ({ to, icon, label, badge, badgeColor = 'b-n' }) => {
  return (
    <li>
      <NavLink
        to={to}
        style={({ isActive }) => ({
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '5px 9px', margin: '0 8px', borderRadius: 'var(--rs)',
          fontWeight: 500, fontSize: '13px', textDecoration: 'none',
          color: isActive ? 'var(--accent)' : 'var(--t2)',
          backgroundColor: isActive ? 'var(--ag)' : 'transparent',
          borderLeft: isActive ? '2px solid var(--accent)' : '2px solid transparent',
          transition: 'all 0.2s'
        })}
        className="nav-link-hover"
      >
        {({ isActive }) => (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <span style={{ opacity: isActive ? 1 : 0.6 }}>{icon}</span>
              {label}
            </div>
            {badge && <span className={`badge ${badgeColor}`}>{badge}</span>}
          </>
        )}
      </NavLink>
      <style>{`
        .nav-link-hover:hover { background-color: var(--s2); color: var(--t); }
      `}</style>
    </li>
  );
};

import { useAuth } from '../context/AuthContext';

export default function Sidebar() {
  const { currentUser, logout, activeOrg } = useAuth();

  const adminFlags = activeOrg?.adminFlags || {};
  const employeeFlags = activeOrg?.employeeFlags || {};
  const empAccess = currentUser?.pageAccess || {};
  const isEmp = currentUser?.role === 'employee';
  const isAdmin = currentUser?.role === 'org_admin';

  const canSee = (page) => {
    if (isAdmin && !adminFlags[page]) return false;
    if (isEmp && (!employeeFlags[page] || !empAccess[page])) return false;
    return true;
  };

  const hasCore = canSee('uploadInvoice') || canSee('reviewEdit') || canSee('allInvoices') || canSee('batchJobs') || canSee('exportData');
  const hasPipeline = canSee('inboxMonitor') || canSee('processingQueue') || canSee('emailReports') || canSee('resendFailures') || canSee('flowDiagram');
  const hasSystem = canSee('vendors') || canSee('emailConfig') || canSee('replyTemplates') || isAdmin;

  return (
    <div style={{
      width: '220px', height: '100vh', backgroundColor: 'var(--surface)', borderRight: '1px solid var(--b)',
      display: 'flex', flexDirection: 'column', position: 'fixed', left: 0, top: 0, zIndex: 10
    }}>
      {/* Logo/Brand Area */}
      <div style={{ padding: '15px 15px 10px', display: 'flex', alignItems: 'center', gap: '5px' }}>
        <div style={{
          width: '28px', height: '28px', backgroundColor: 'var(--accent)', borderRadius: 'var(--rs)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff'
        }}>
          <FileText size={16} />
        </div>
        <div>
          <h2 style={{ fontSize: '16px', lineHeight: 1 }}>InvoiceIQ</h2>
          {activeOrg && (
            <span style={{ fontSize: '11px', color: 'var(--t2)', backgroundColor: 'var(--s2)', padding: '2px 6px', borderRadius: '4px', fontWeight: 500 }}>
              {'v1.0 · Full Suite'}
            </span>
          )}
        </div>
      </div>

      {/* Nav Scroll Area */}
      <div className="overflow-y-auto flex-1" style={{ paddingTop: '8px' }}>
        <NavSection title="CORE">
          <NavItem to="/dashboard" icon={<LayoutDashboard size={16} />} label="Dashboard" />
        </NavSection>

        {hasCore && (
          <NavSection title="UPLOAD & PROCESS">
            {canSee('uploadInvoice') && <NavItem to="/upload" icon={<Upload size={16} />} label="Upload Invoice" />}
            {canSee('reviewEdit') && <NavItem to="/review" icon={<Search size={16} />} label="Review & Edit" badge="3" badgeColor="b-w" />}
            {canSee('allInvoices') && <NavItem to="/invoices" icon={<FileText size={16} />} label="All Invoices" badge={147} badgeColor="b-i" />}
            {canSee('batchJobs') && <NavItem to="/batch" icon={<Layers size={16} />} label="Batch Jobs" />}
            {canSee('exportData') && <NavItem to="/export" icon={<Download size={16} />} label="Export Data" />}
          </NavSection>
        )}

        {hasPipeline && (
          <NavSection title="EMAIL PIPELINE">
            {canSee('inboxMonitor') && <NavItem to="/inbox" icon={<Inbox size={16} />} label="Inbox Monitor" badge="4" badgeColor="b-e" />}
            {canSee('processingQueue') && <NavItem to="/queue" icon={<List size={16} />} label="Processing Queue" badge="2" badgeColor="b-i" />}
            {canSee('emailReports') && <NavItem to="/reports" icon={<Mail size={16} />} label="Email Reports" />}
            {canSee('resendFailures') && <NavItem to="/failures" icon={<AlertCircle size={16} />} label="Resend Failures" badge="3" badgeColor="b-e" />}
            {canSee('flowDiagram') && <NavItem to="/flow" icon={<GitBranch size={16} />} label="Flow Diagram" />}
          </NavSection>
        )}

        {hasSystem && (
          <NavSection title="SYSTEM">
            {canSee('vendors') && <NavItem to="/vendors" icon={<Briefcase size={16} />} label="Vendors" />}
            {canSee('emailConfig') && <NavItem to="/email-config" icon={<Mail size={16} />} label="Email Config" />}
            {canSee('replyTemplates') && <NavItem to="/templates" icon={<LayoutTemplate size={16} />} label="Reply Templates" />}
            {isAdmin && <NavItem to="/settings" icon={<Settings size={16} />} label="Settings" />}
          </NavSection>
        )}

        {isAdmin && (
          <NavSection title="TEAM">
            <NavItem to="/team/employees" icon={<Users size={16} />} label="Employees" />
          </NavSection>
        )}

        {(!hasCore && !hasPipeline && !hasSystem && isEmp) && (
          <div style={{ padding: '32px 24px', textAlign: 'center', color: 'var(--t2)', fontSize: '12px' }}>
            🔒 No pages have been enabled for your account yet. Contact your organisation admin.
          </div>
        )}
      </div>

      {/* Footer User Profile */}
      <div className="col gap-2" style={{ padding: '16px 20px', borderTop: '1px solid var(--b)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }} className="user-profile-hover">
          <div style={{
            width: '32px', height: '32px', borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--teal), var(--accent))',
            color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '12px', fontWeight: 600
          }}>
            {currentUser?.avatar || 'U'}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--t)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {currentUser?.name || "User"}
            </div>
            <div style={{ fontSize: '11px', color: 'var(--t2)' }}>
              {isAdmin ? 'Org Admin' : 'Employee'}
            </div>
          </div>
        </div>
        <button
          onClick={logout}
          style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '11px', color: 'var(--t3)', textAlign: 'left', padding: '4px 0', textDecoration: 'underline' }}
          className="signout-btn"
        >
          Sign Out
        </button>
      </div>
      <style>{`
        .user-profile-hover:hover { opacity: 0.9; }
        .signout-btn:hover { color: var(--red) !important; }
      `}</style>
    </div>
  );
}
