import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import { Edit } from 'lucide-react';

const PAGE_DEFINITIONS = [
  { key: 'uploadInvoice', label: 'Upload Invoice', desc: 'Upload PDF/ZIP for AI extraction' },
  { key: 'reviewEdit', label: 'Review & Edit', desc: 'Review and correct extracted fields' },
  { key: 'allInvoices', label: 'All Invoices', desc: 'View all invoice records' },
  { key: 'batchJobs', label: 'Batch Jobs', desc: 'Monitor bulk upload jobs' },
  { key: 'exportData', label: 'Export Data', desc: 'Download invoices to Excel' },
  { key: 'inboxMonitor', label: 'Inbox Monitor', desc: 'View incoming email queue' },
  { key: 'processingQueue', label: 'Processing Queue', desc: 'Live extraction job status' },
  { key: 'emailReports', label: 'Email Reports', desc: 'History of sent reply emails' },
  { key: 'resendFailures', label: 'Resend Failures', desc: 'Retry failed extractions' },
  { key: 'flowDiagram', label: 'Flow Diagram', desc: 'Visual pipeline overview' },
  { key: 'vendors', label: 'Vendors', desc: 'Manage vendor templates' },
  { key: 'emailConfig', label: 'Email Config', desc: 'IMAP/SMTP configuration' },
  { key: 'replyTemplates', label: 'Reply Templates', desc: 'Customise vendor reply emails' }
];

export default function Employees() {
  const { currentUser, activeOrg, employees, addEmployee, updateEmployee } = useAuth();
  const { toast } = useToast();

  const myEmployees = employees.filter(e => e.orgId === currentUser.orgId);
  const employeeFlags = activeOrg?.employeeFlags || {};
  const adminFlags = activeOrg?.adminFlags || {};

  const [showModal, setShowModal] = useState(false);
  const [editingEmp, setEditingEmp] = useState(null);

  const [mName, setMName] = useState('');
  const [mEmail, setMEmail] = useState('');
  const [mPass, setMPass] = useState('');
  const [mActive, setMActive] = useState(true);
  const [mAccess, setMAccess] = useState({});

  const availablePages = PAGE_DEFINITIONS.filter(p => employeeFlags[p.key] && adminFlags[p.key]);

  const openModal = (emp = null) => {
    setEditingEmp(emp);
    setMName(emp ? emp.name : '');
    setMEmail(emp ? emp.email : '');
    setMPass(emp ? emp.password : '');
    setMActive(emp ? emp.active : true);
    
    if (emp) {
      setMAccess({ ...emp.pageAccess });
    } else {
      const defaults = {};
      availablePages.forEach(p => defaults[p.key] = true);
      setMAccess(defaults);
    }
    
    setShowModal(true);
  };

  const handleSelectAll = (select) => {
    const nextAccess = {};
    if (select) {
      availablePages.forEach(p => nextAccess[p.key] = true);
    }
    setMAccess(nextAccess);
  };

  const saveModal = () => {
    if (!mName || !mEmail || (!mPass && !editingEmp)) {
      return toast('Please fill all required fields', 'amber');
    }

    const data = {
      name: mName,
      email: mEmail,
      active: mActive,
      pageAccess: mAccess,
      password: mPass || editingEmp?.password, // fallback to existing pass
      avatar: mName.substring(0, 2).toUpperCase(),
      orgId: currentUser.orgId
    };

    if (editingEmp) {
      const res = updateEmployee(editingEmp.id, data);
      toast('✅ Employee updated', 'green');
      setShowModal(false);
    } else {
      const res = addEmployee(data);
      if (res.success) {
        toast('✅ Employee account created', 'green');
        setShowModal(false);
      } else {
        toast(res.error, 'red');
      }
    }
  };

  return (
    <div className="col gap-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: 700, fontFamily: 'Syne', margin: 0 }}>Employees</h2>
          <div className="text-sm text-t2 mt-1">Manage your team's login accounts and page access.</div>
        </div>
        <button className="btn bp" onClick={() => openModal()}>+ Add Employee</button>
      </div>

      <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
        <div className="card" style={{ borderTop: '3px solid var(--accent)' }}>
          <div className="text-xs text-t3 font-bold uppercase tracking-wider mb-2">Total Employees</div>
          <div style={{ fontSize: '28px', fontWeight: 700, color: 'var(--accent)' }}>{myEmployees.length}</div>
        </div>
        <div className="card" style={{ borderTop: '3px solid var(--green)' }}>
          <div className="text-xs text-t3 font-bold uppercase tracking-wider mb-2">Active</div>
          <div style={{ fontSize: '28px', fontWeight: 700, color: 'var(--green)' }}>{myEmployees.filter(e => e.active).length}</div>
        </div>
        <div className="card" style={{ borderTop: '3px solid var(--red)' }}>
          <div className="text-xs text-t3 font-bold uppercase tracking-wider mb-2">Inactive</div>
          <div style={{ fontSize: '28px', fontWeight: 700, color: 'var(--red)' }}>{myEmployees.filter(e => !e.active).length}</div>
        </div>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table style={{ width: '100%', fontSize: '13px', textAlign: 'left' }}>
          <thead>
            <tr>
              <th style={{ padding: '12px 16px', borderBottom: '1px solid var(--b)' }}>EMPLOYEE</th>
              <th style={{ padding: '12px 16px', borderBottom: '1px solid var(--b)' }}>PAGE ACCESS</th>
              <th style={{ padding: '12px 16px', borderBottom: '1px solid var(--b)', textAlign: 'center' }}>STATUS</th>
              <th style={{ padding: '12px 16px', borderBottom: '1px solid var(--b)', textAlign: 'right' }}>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {myEmployees.map(emp => {
              const accessKeys = Object.keys(emp.pageAccess).filter(k => emp.pageAccess[k] && employeeFlags[k]);
              return (
                <tr key={emp.id} className="hover:bg-s2">
                  <td style={{ padding: '12px 16px', borderBottom: '1px solid var(--b)' }}>
                    <div className="flex items-center gap-3">
                      <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg, var(--teal), var(--accent))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '12px', fontWeight: 600 }}>
                        {emp.avatar}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, color: 'var(--t)' }}>{emp.name}</div>
                        <div style={{ fontSize: '11px', color: 'var(--t2)', fontFamily: 'DM Mono' }}>{emp.email}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '12px 16px', borderBottom: '1px solid var(--b)' }}>
                    <div className="flex flex-wrap gap-2">
                      {accessKeys.slice(0, 4).map(k => (
                        <div key={k} style={{ fontSize: '10px', backgroundColor: 'var(--s2)', border: '1px solid var(--b2)', padding: '2px 6px', borderRadius: '4px', color: 'var(--t2)' }}>
                          {PAGE_DEFINITIONS.find(p => p.key === k)?.label || k}
                        </div>
                      ))}
                      {accessKeys.length > 4 && (
                        <div style={{ fontSize: '10px', backgroundColor: 'var(--b)', padding: '2px 6px', borderRadius: '4px', color: 'var(--t2)' }}>
                          +{accessKeys.length - 4} more
                        </div>
                      )}
                      {accessKeys.length === 0 && <span className="text-t3 italic text-xs">No access</span>}
                    </div>
                  </td>
                  <td style={{ padding: '12px 16px', borderBottom: '1px solid var(--b)', textAlign: 'center' }}>
                    <span className={`badge ${emp.active ? 'b-s' : 'b-e'}`}>{emp.active ? 'Active' : 'Inactive'}</span>
                  </td>
                  <td style={{ padding: '12px 16px', borderBottom: '1px solid var(--b)', textAlign: 'right' }}>
                    <div className="flex justify-end gap-2">
                      <button className="btn bg btn-xs" onClick={() => openModal(emp)}><Edit size={12} className="mr-1" /> Edit</button>
                      {emp.active ? (
                        <button className="btn btn-xs" style={{ color: 'var(--red)', backgroundColor: 'rgba(239, 68, 68, 0.1)' }} onClick={() => { updateEmployee(emp.id, { active: false }); toast('User deactivated', 'amber'); }}>Deactivate</button>
                      ) : (
                        <button className="btn btn-xs" style={{ color: 'var(--green)', backgroundColor: 'rgba(34, 197, 94, 0.1)' }} onClick={() => { updateEmployee(emp.id, { active: true }); toast('User activated', 'green'); }}>Activate</button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="card col gap-4" style={{ width: '480px', backgroundColor: 'var(--surface)', maxHeight: '90vh', overflowY: 'auto' }}>
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: 600 }}>{editingEmp ? 'Edit Employee' : 'Add Employee'}</h3>
              <p className="text-xs text-t2 mt-1">Create login for a team member and set their page access.</p>
            </div>

            <div className="form-group"><label className="form-label">FULL NAME</label><input className="input" value={mName} onChange={e => setMName(e.target.value)} /></div>
            <div className="form-group"><label className="form-label">EMAIL ADDRESS</label><input type="email" className="input" value={mEmail} onChange={e => setMEmail(e.target.value)} disabled={!!editingEmp} /></div>
            <div className="form-group">
              <label className="form-label">PASSWORD {editingEmp && <span className="text-t3 lowercase normal-case">(leave blank to keep current)</span>}</label>
              <input type="text" className="input" value={mPass} onChange={e => setMPass(e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">STATUS</label>
              <select className="select" value={mActive ? 'active' : 'inactive'} onChange={e => setMActive(e.target.value === 'active')}>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            <div style={{ borderTop: '1px solid var(--b)', margin: '8px 0' }}></div>

            <div className="col gap-2">
              <div className="flex justify-between items-center">
                <div>
                  <h4 style={{ fontSize: '13px', fontWeight: 600, fontFamily: 'Syne' }}>Page Access</h4>
                  <p className="text-xs text-t2">Only pages your plan allows you to grant are shown. Contact InvoiceIQ to expand employee access.</p>
                </div>
                {availablePages.length > 0 && (
                  <div className="flex gap-2">
                    <button className="btn bg btn-xs" onClick={() => handleSelectAll(true)}>Select All</button>
                    <button className="btn bg btn-xs" onClick={() => handleSelectAll(false)}>Clear</button>
                  </div>
                )}
              </div>

              <div className="col gap-0 mt-2 bg-s2 rounded p-2" style={{ border: '1px solid var(--b)' }}>
                {availablePages.map(page => (
                  <div key={page.key} className="flex justify-between items-center py-2" style={{ borderBottom: '1px solid var(--b)' }}>
                    <div>
                      <div className="text-xs font-medium text-t">{page.label}</div>
                      <div className="text-xs text-t3 mt-0.5">{page.desc}</div>
                    </div>
                    <div className={`toggle ${mAccess[page.key] ? 'on' : ''}`} onClick={() => setMAccess({ ...mAccess, [page.key]: !mAccess[page.key] })}>
                      <div className="toggle-knob"></div>
                    </div>
                  </div>
                ))}
                {availablePages.length === 0 && (
                  <div style={{ backgroundColor: 'rgba(245, 166, 35, 0.1)', padding: '12px', borderRadius: '4px', textAlign: 'center', marginTop: '8px' }}>
                    <p className="text-sm text-amber">🔒 Your current plan does not allow granting page access to employees. Contact InvoiceIQ support.</p>
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-4">
              <button className="btn btn-cancel" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn bp" onClick={saveModal}>{editingEmp ? 'Save Changes' : 'Add Employee'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
