import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Upload, Search, FileText, Layers, Download, 
  Inbox, List, Mail, AlertCircle, GitBranch, 
  Users, Settings, LayoutTemplate, Briefcase 
} from 'lucide-react';
import classNames from 'classnames';

const NavSection = ({ title, children }) => (
  <div style={{ marginBottom: '24px' }}>
    {title && (
      <div style={{ 
        padding: '0 16px', 
        fontSize: '11px', 
        fontWeight: '700', 
        color: 'var(--t3)',
        marginBottom: '8px',
        textTransform: 'uppercase',
        letterSpacing: '0.5px'
      }}>
        {title}
      </div>
    )}
    <ul style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
      {children}
    </ul>
  </div>
);

const NavItem = ({ to, icon, label, badge, badgeColor = 'b-n' }) => {
  return (
    <li>
      <NavLink 
        to={to} 
        style={({ isActive }) => ({
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '8px 16px',
          margin: '0 8px',
          borderRadius: 'var(--rs)',
          fontWeight: 500,
          fontSize: '13px',
          textDecoration: 'none',
          color: isActive ? 'var(--accent)' : 'var(--t2)',
          backgroundColor: isActive ? 'var(--ag)' : 'transparent',
          borderLeft: isActive ? '2px solid var(--accent)' : '2px solid transparent',
          transition: 'all 0.2s'
        })}
        className="nav-link-hover"
      >
        {({ isActive }) => (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ opacity: isActive ? 1 : 0.6 }}>{icon}</span>
              {label}
            </div>
            {badge && (
              <span className={`badge ${badgeColor}`}>{badge}</span>
            )}
          </>
        )}
      </NavLink>
      <style>{`
        .nav-link-hover:hover {
          background-color: var(--s2);
          color: var(--t);
        }
      `}</style>
    </li>
  );
};

export default function Sidebar() {
  return (
    <div style={{
      width: '220px',
      height: '100vh',
      backgroundColor: 'var(--surface)',
      borderRight: '1px solid var(--b)',
      display: 'flex',
      flexDirection: 'column',
      position: 'fixed',
      left: 0,
      top: 0,
      zIndex: 10
    }}>
      {/* Logo/Brand Area */}
      <div style={{ padding: '24px 24px 16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{ 
          width: '28px', height: '28px', 
          backgroundColor: 'var(--accent)', 
          borderRadius: 'var(--rs)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#fff', fontWeight: 'bold'
        }}>
          IQ
        </div>
        <div>
          <h2 style={{ fontSize: '16px', lineHeight: 1 }}>InvoiceIQ</h2>
          <span style={{ fontSize: '11px', color: 'var(--t2)', fontFamily: 'DM Mono' }}>v1.0 · Core</span>
        </div>
      </div>

      {/* Nav Scroll Area */}
      <div className="overflow-y-auto flex-1" style={{ paddingTop: '8px' }}>
        <NavSection title="Core">
          <NavItem to="/upload" icon={<Upload size={16} />} label="Upload Invoices" />
          <NavItem to="/review" icon={<Search size={16} />} label="Review & Edit" badge="3" badgeColor="b-w" />
          <NavItem to="/invoices" icon={<FileText size={16} />} label="All Invoices" badge="147" badgeColor="b-i" />
          <NavItem to="/batch" icon={<Layers size={16} />} label="Batch Jobs" />
          <NavItem to="/export" icon={<Download size={16} />} label="Export Data" />
        </NavSection>

        <NavSection title="Email Pipeline">
          <NavItem to="/inbox" icon={<Inbox size={16} />} label="Inbox Monitor" />
          <NavItem to="/queue" icon={<List size={16} />} label="Processing Queue" />
          <NavItem to="/reports" icon={<Mail size={16} />} label="Email Reports" />
          <NavItem to="/failures" icon={<AlertCircle size={16} />} label="Resend Failures" />
          <NavItem to="/flow" icon={<GitBranch size={16} />} label="Email Ingestion Flow" />
        </NavSection>

        <NavSection title="Configuration">
          <NavItem to="/vendors" icon={<Briefcase size={16} />} label="Vendors" />
          <NavItem to="/email-config" icon={<Mail size={16} />} label="Email Configuration" />
          <NavItem to="/templates" icon={<LayoutTemplate size={16} />} label="Reply Templates" />
          <NavItem to="/settings" icon={<Settings size={16} />} label="Settings" />
        </NavSection>
      </div>

      {/* Footer User Profile */}
      <div style={{
        padding: '16px 20px',
        borderTop: '1px solid var(--b)',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        cursor: 'pointer'
      }} className="user-profile-hover">
        <div style={{
          width: '32px', height: '32px', borderRadius: '50%',
          background: 'linear-gradient(135deg, var(--accent), var(--purple))',
          color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '12px', fontWeight: 600
        }}>
          PS
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--t)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Priya Sharma</div>
          <div style={{ fontSize: '11px', color: 'var(--t2)' }}>Finance Ops</div>
        </div>
      </div>
      <style>{`
        .user-profile-hover:hover { background-color: var(--s2); }
      `}</style>
    </div>
  );
}
