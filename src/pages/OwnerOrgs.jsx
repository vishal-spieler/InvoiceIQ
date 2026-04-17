import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';

const FLAG_DEFAULTS = {
  uploadInvoice: true, reviewEdit: true, allInvoices: true, batchJobs: true, exportData: true,
  inboxMonitor: true, processingQueue: true, emailReports: true, resendFailures: true, flowDiagram: true,
  vendors: true, emailConfig: true, replyTemplates: true
};

export default function OwnerOrgs() {
  const { orgs, updateOrg, addOrg } = useAuth();
  const { toast } = useToast();

  const [showCreate, setShowCreate] = useState(false);
  const [showManage, setShowManage] = useState(null); // holds org object
  const [manageTab, setManageTab] = useState('details');

  // Create Form State
  const [cName, setCName] = useState('');
  const [cShort, setCShort] = useState('');
  const [cIndustry, setCIndustry] = useState('IT Services');
  const [cPlan, setCPlan] = useState('Starter');
  const [cExpiry, setCExpiry] = useState('');
  const [cAdminName, setCAdminName] = useState('');
  const [cAdminEmail, setCAdminEmail] = useState('');
  const [cAdminPass, setCAdminPass] = useState('');
  const [cFlagsExpanded, setCFlagsExpanded] = useState(false);

  const [cAdminFlags, setCAdminFlags] = useState({ ...FLAG_DEFAULTS });
  const [cEmpFlags, setCEmpFlags] = useState({ ...FLAG_DEFAULTS });

  const handleCreate = () => {
    if (!cName || !cShort || !cExpiry || !cAdminName || !cAdminEmail || !cAdminPass) {
      return toast('Please fill all required fields', 'amber');
    }
    if (new Date(cExpiry) < new Date()) {
      return toast('Expiry must be a future date', 'red');
    }

    const res = addOrg(
      { name: cName, shortName: cShort, industry: cIndustry, plan: cPlan, expiresAt: cExpiry, status: 'Active', adminFlags: cAdminFlags, employeeFlags: cEmpFlags, email: cAdminEmail },
      { name: cAdminName, email: cAdminEmail, password: cAdminPass, avatar: cAdminName.substring(0, 2).toUpperCase() }
    );

    if (res.success) {
      toast('🏢 Organisation created — credentials ready', 'green');
      setShowCreate(false);
    } else {
      toast(res.error, 'red');
    }
  };

  const handleManageUpdate = () => {
    updateOrg(showManage.id, {
      name: showManage.name,
      shortName: showManage.shortName,
      industry: showManage.industry,
      plan: showManage.plan,
      expiresAt: showManage.expiresAt
    });
    toast('✅ Organisation updated', 'green');
    setShowManage(null);
  };

  return (
    <div className="col gap-6" style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <div className="flex justify-between items-center">
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: 700, fontFamily: 'Syne', margin: 0 }}>Organisations</h2>
          <div className="text-sm text-t2 mt-1">Manage all client accounts, subscriptions, and feature access.</div>
        </div>
        <button className="btn bp" onClick={() => setShowCreate(true)}>+ New Organisation</button>
      </div>

      <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
        <div className="card" style={{ borderTop: '3px solid var(--accent)' }}>
          <div className="text-xs text-t3 font-bold uppercase tracking-wider mb-2">Total Orgs</div>
          <div style={{ fontSize: '28px', fontWeight: 700, color: 'var(--accent)' }}>{orgs.length}</div>
        </div>
        <div className="card" style={{ borderTop: '3px solid var(--green)' }}>
          <div className="text-xs text-t3 font-bold uppercase tracking-wider mb-2">Active</div>
          <div style={{ fontSize: '28px', fontWeight: 700, color: 'var(--green)' }}>{orgs.filter(o => o.status === 'Active').length}</div>
        </div>
        <div className="card" style={{ borderTop: '3px solid var(--amber)' }}>
          <div className="text-xs text-t3 font-bold uppercase tracking-wider mb-2">Expired</div>
          <div style={{ fontSize: '28px', fontWeight: 700, color: 'var(--amber)' }}>{orgs.filter(o => o.status === 'Expired').length}</div>
        </div>
        <div className="card" style={{ borderTop: '3px solid var(--red)' }}>
          <div className="text-xs text-t3 font-bold uppercase tracking-wider mb-2">Suspended</div>
          <div style={{ fontSize: '28px', fontWeight: 700, color: 'var(--red)' }}>{orgs.filter(o => o.status === 'Suspended').length}</div>
        </div>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table style={{ width: '100%', fontSize: '13px', textAlign: 'left' }}>
          <thead>
            <tr>
              <th style={{ padding: '12px 16px', borderBottom: '1px solid var(--b)' }}>ORG NAME</th>
              <th style={{ padding: '12px 16px', borderBottom: '1px solid var(--b)' }}>PLAN</th>
              <th style={{ padding: '12px 16px', borderBottom: '1px solid var(--b)' }}>ORG ADMIN EMAIL</th>
              <th style={{ padding: '12px 16px', borderBottom: '1px solid var(--b)' }}>EXPIRES</th>
              <th style={{ padding: '12px 16px', borderBottom: '1px solid var(--b)', textAlign: 'center' }}>STATUS</th>
              <th style={{ padding: '12px 16px', borderBottom: '1px solid var(--b)', textAlign: 'right' }}>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {orgs.map(org => {
              const isPast = new Date(org.expiresAt) < new Date();
              return (
                <tr key={org.id} className="hover:bg-s2">
                  <td style={{ padding: '12px 16px', borderBottom: '1px solid var(--b)' }}>
                    <div className="flex items-center gap-3">
                      <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg, var(--accent), var(--teal))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '12px', fontWeight: 600 }}>
                        {org.shortName.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, color: 'var(--t)' }}>{org.name}</div>
                        <div style={{ fontSize: '11px', color: 'var(--t2)' }}>{org.industry}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '12px 16px', borderBottom: '1px solid var(--b)' }}>
                    <span className="badge" style={{ backgroundColor: 'rgba(79,124,255,0.1)', color: 'var(--accent)' }}>{org.plan}</span>
                  </td>
                  <td style={{ padding: '12px 16px', borderBottom: '1px solid var(--b)', fontFamily: 'DM Mono', fontSize: '11px', color: 'var(--t2)' }}>
                    {org.email}
                  </td>
                  <td style={{ padding: '12px 16px', borderBottom: '1px solid var(--b)' }}>
                    <div style={{ color: isPast ? 'var(--red)' : 'var(--t)', fontWeight: isPast ? 600 : 400 }}>{org.expiresAt}</div>
                    {isPast && <div style={{ fontSize: '10px', color: 'var(--red)', marginTop: 2 }}>Expired</div>}
                  </td>
                  <td style={{ padding: '12px 16px', borderBottom: '1px solid var(--b)', textAlign: 'center' }}>
                    <span className={`badge ${org.status === 'Active' ? 'b-s' : (org.status === 'Expired' ? 'b-w' : 'b-e')}`}>{org.status}</span>
                  </td>
                  <td style={{ padding: '12px 16px', borderBottom: '1px solid var(--b)', textAlign: 'right' }}>
                    <div className="flex justify-end gap-2">
                      <button className="btn bg btn-xs" onClick={() => setShowManage({ ...org })}>Manage</button>
                      {org.status === 'Active' && <button className="btn btn-xs" style={{ color: 'var(--red)', backgroundColor: 'rgba(239, 68, 68, 0.1)' }} onClick={() => { updateOrg(org.id, { status: 'Suspended' }); toast(`🔒 ${org.name} suspended`, 'amber'); }}>Suspend</button>}
                      {org.status === 'Suspended' && <button className="btn btn-xs" style={{ color: 'var(--green)', backgroundColor: 'rgba(34, 197, 94, 0.1)' }} onClick={() => { updateOrg(org.id, { status: 'Active' }); toast(`✅ ${org.name} activated`, 'green'); }}>Activate</button>}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {showCreate && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="card col gap-4" style={{ width: '600px', backgroundColor: 'var(--surface)', maxHeight: '90vh', overflowY: 'auto' }}>
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: 600 }}>Create Organisation</h3>
              <p className="text-xs text-t2 mt-1">Set up a new client account.</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="form-group"><label className="form-label">ORGANISATION NAME</label><input className="input" placeholder="e.g. Infosys Limited" value={cName} onChange={e => setCName(e.target.value)} /></div>
              <div className="form-group"><label className="form-label">SHORT NAME</label><input className="input" placeholder="e.g. Infosys" maxLength={12} value={cShort} onChange={e => setCShort(e.target.value)} /></div>
              <div className="form-group"><label className="form-label">INDUSTRY</label>
                <select className="select" value={cIndustry} onChange={e => setCIndustry(e.target.value)}>
                  <option>IT Services</option><option>Manufacturing</option><option>Retail</option><option>Healthcare</option><option>Finance</option><option>Other</option>
                </select>
              </div>
              <div className="form-group"><label className="form-label">PLAN</label>
                <select className="select" value={cPlan} onChange={e => setCPlan(e.target.value)}><option>Starter</option><option>Professional</option><option>Enterprise</option></select>
              </div>
              <div className="form-group"><label className="form-label">EXPIRY DATE</label><input type="date" className="input" value={cExpiry} onChange={e => setCExpiry(e.target.value)} /></div>
            </div>

            <div style={{ borderTop: '1px solid var(--b)', margin: '8px 0' }}></div>

            <div className="grid grid-cols-2 gap-4">
              <div className="form-group"><label className="form-label">ORG ADMIN NAME</label><input className="input" placeholder="e.g. Arjun Patel" value={cAdminName} onChange={e => setCAdminName(e.target.value)} /></div>
              <div className="form-group"><label className="form-label">ORG ADMIN EMAIL</label><input type="email" className="input" value={cAdminEmail} onChange={e => setCAdminEmail(e.target.value)} /></div>
              <div className="form-group" style={{ gridColumn: 'span 2' }}><label className="form-label">ORG ADMIN PASSWORD</label><input type="text" className="input" placeholder="min 8 chars" value={cAdminPass} onChange={e => setCAdminPass(e.target.value)} /></div>
            </div>

            <div style={{ borderTop: '1px solid var(--b)', margin: '8px 0' }}></div>

            <div>
              <div className="flex justify-between items-center cursor-pointer" onClick={() => setCFlagsExpanded(!cFlagsExpanded)}>
                <label className="form-label m-0" style={{ fontFamily: 'Syne', fontSize: '13px', fontWeight: 600 }}>Feature Access</label>
                <div style={{ color: 'var(--accent)', fontSize: '18px' }}>{cFlagsExpanded ? '▲' : '▼'}</div>
              </div>
              {cFlagsExpanded && (
                <div className="grid grid-cols-2 gap-4 mt-3">
                  <div className="col gap-0 p-3 bg-s2 rounded" style={{ border: '1px solid var(--b)' }}>
                    <div style={{ fontSize: '10px', fontWeight: 700, color: 'var(--t3)', textTransform: 'uppercase', marginBottom: '8px' }}>Admin Access</div>
                    {Object.keys(cAdminFlags).map(key => (
                      <div key={`admin-${key}`} className="flex justify-between items-center py-2" style={{ borderBottom: '1px solid var(--b)' }}>
                        <span className="text-xs font-medium">{key}</span>
                        <div className={`toggle ${cAdminFlags[key] ? 'on' : ''}`} onClick={() => setCAdminFlags({ ...cAdminFlags, [key]: !cAdminFlags[key] })}>
                          <div className="toggle-knob"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="col gap-0 p-3 bg-s2 rounded" style={{ border: '1px solid var(--b)' }}>
                    <div style={{ fontSize: '10px', fontWeight: 700, color: 'var(--t3)', textTransform: 'uppercase', marginBottom: '8px' }}>Employee Ceiling</div>
                    {Object.keys(cEmpFlags).map(key => (
                      <div key={`emp-${key}`} className="flex justify-between items-center py-2" style={{ borderBottom: '1px solid var(--b)' }}>
                        <span className="text-xs font-medium">{key}</span>
                        <div className={`toggle ${cEmpFlags[key] ? 'on' : ''}`} onClick={() => setCEmpFlags({ ...cEmpFlags, [key]: !cEmpFlags[key] })}>
                          <div className="toggle-knob"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 mt-4">
              <button className="btn btn-cancel" onClick={() => setShowCreate(false)}>Cancel</button>
              <button className="btn bp" onClick={handleCreate}>Create Organisation</button>
            </div>
          </div>
        </div>
      )}

      {showManage && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="card col gap-4" style={{ width: manageTab === 'flags' ? '700px' : '460px', backgroundColor: 'var(--surface)', transition: 'width 0.2s' }}>
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: 600 }}>Manage {showManage.name}</h3>
            </div>

            <div className="flex gap-4 border-b border-b">
              <div className={`cursor-pointer pb-2 font-medium text-sm ${manageTab === 'details' ? 'text-accent border-b-2 border-accent' : 'text-t2'}`} onClick={() => setManageTab('details')}>Account Details</div>
              <div className={`cursor-pointer pb-2 font-medium text-sm ${manageTab === 'flags' ? 'text-accent border-b-2 border-accent' : 'text-t2'}`} onClick={() => setManageTab('flags')}>Feature Flags</div>
            </div>

            {manageTab === 'details' && (
              <div className="col gap-4">
                <div className="form-group"><label className="form-label">ORG NAME</label><input className="input" value={showManage.name} onChange={e => setShowManage({ ...showManage, name: e.target.value })} /></div>
                <div className="form-group"><label className="form-label">SHORT NAME</label><input className="input" value={showManage.shortName} onChange={e => setShowManage({ ...showManage, shortName: e.target.value })} /></div>
                <div className="form-group"><label className="form-label">EXPIRY DATE</label><input type="date" className="input" value={showManage.expiresAt} onChange={e => setShowManage({ ...showManage, expiresAt: e.target.value })} /></div>
                <div className="form-group"><label className="form-label">ORG ADMIN EMAIL</label><input className="input bg-s2 text-t3" disabled value={showManage.email} /></div>

                <div className="flex justify-end gap-2 mt-4">
                  <button className="btn btn-cancel" onClick={() => setShowManage(null)}>Cancel</button>
                  <button className="btn bp" onClick={handleManageUpdate}>Update Details</button>
                </div>
              </div>
            )}

            {manageTab === 'flags' && (
              <div className="grid gap-6 overflow-y-auto" style={{ gridTemplateColumns: '1fr 1fr', maxHeight: '500px' }}>
                <div className="col gap-0">
                  <div style={{ marginBottom: '12px' }}>
                    <div style={{ fontSize: '10px', fontWeight: 700, color: 'var(--t3)', textTransform: 'uppercase' }}>Org Admin Access</div>
                    <div style={{ fontSize: '12px', color: 'var(--t2)' }}>Pages this org's admin can see and use</div>
                  </div>
                  {Object.keys(showManage.adminFlags).map(key => {
                    const isOn = showManage.adminFlags[key];
                    return (
                      <div key={`admin-${key}`} className="flex justify-between items-center py-2" style={{ borderBottom: '1px solid var(--b)' }}>
                        <span className="text-xs font-medium">{key}</span>
                        <div className={`toggle ${isOn ? 'on' : ''}`} onClick={() => {
                          const newFlags = { ...showManage.adminFlags, [key]: !isOn };
                          updateOrg(showManage.id, { adminFlags: newFlags });
                          setShowManage({ ...showManage, adminFlags: newFlags });
                          toast(`${!isOn ? '✅' : '⚠️'} ${key} ${!isOn ? 'enabled' : 'disabled'} for Admin · ${showManage.shortName}`, !isOn ? 'green' : 'amber');
                        }}>
                          <div className="toggle-knob"></div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="col gap-0" style={{ borderLeft: '1px solid var(--b)', paddingLeft: '24px' }}>
                  <div style={{ marginBottom: '12px' }}>
                    <div style={{ fontSize: '10px', fontWeight: 700, color: 'var(--t3)', textTransform: 'uppercase' }}>Employee Access Ceiling</div>
                    <div style={{ fontSize: '12px', color: 'var(--t2)' }}>Pages this org's admin can assign to employees</div>
                  </div>
                  {Object.keys(showManage.employeeFlags).map(key => {
                    const isOn = showManage.employeeFlags[key];
                    const adminIsOff = !showManage.adminFlags[key];
                    return (
                      <div key={`emp-${key}`} className="flex justify-between items-center py-2" style={{ borderBottom: '1px solid var(--b)' }}>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-medium">{key}</span>
                          {adminIsOff && <span style={{ fontSize: '10px', color: 'var(--amber)', background: 'rgba(245,166,35,0.1)', padding: '2px 4px', borderRadius: '4px' }}>⚠ Admin can't see this page</span>}
                        </div>
                        <div className={`toggle ${isOn ? 'on' : ''}`} onClick={() => {
                          const newFlags = { ...showManage.employeeFlags, [key]: !isOn };
                          updateOrg(showManage.id, { employeeFlags: newFlags });
                          setShowManage({ ...showManage, employeeFlags: newFlags });
                          toast(`${!isOn ? '✅' : '⚠️'} ${key} ${!isOn ? 'enabled' : 'disabled'} for Employees · ${showManage.shortName}`, !isOn ? 'green' : 'amber');
                        }}>
                          <div className="toggle-knob"></div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="flex justify-end gap-2 mt-4" style={{ gridColumn: 'span 2' }}>
                  <button className="btn bg" onClick={() => setShowManage(null)}>Done</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
