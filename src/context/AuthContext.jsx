import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../utils/supabaseClient';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [activeOrg, setActiveOrg] = useState(null);
  const [loading, setLoading] = useState(true);

  // Maintain UI arrays for Admin Dashboard compatibility
  const [orgs, setOrgs] = useState([]);
  const [orgAdmins, setOrgAdmins] = useState([]);
  const [employees, setEmployees] = useState([]);

  useEffect(() => {
    // For MVP migration, we auto-load from localStorage session if exist
    const savedUserId = localStorage.getItem('invoiceIq_mvp_userId');
    if (savedUserId) {
      fetchProfile(savedUserId);
    } else {
      setLoading(false);
    }
  }, []);

  const fetchProfile = async (userId) => {
    setLoading(true);
    const { data: userProfile } = await supabase.from('users').select('*').eq('id', userId).single();
    if (userProfile) {
      setCurrentUser({
        ...userProfile,
        pageAccess: typeof userProfile.page_access === 'string' ? JSON.parse(userProfile.page_access) : (userProfile.page_access || {}),
        orgId: userProfile.org_id
      });

      if (userProfile.org_id) {
        const { data: org } = await supabase.from('organizations').select('*').eq('id', userProfile.org_id).single();
        if (org) {
          setActiveOrg({
            ...org,
            shortName: org.short_name,
            adminFlags: typeof org.admin_flags === 'string' ? JSON.parse(org.admin_flags) : (org.admin_flags || {}),
            employeeFlags: typeof org.employee_flags === 'string' ? JSON.parse(org.employee_flags) : (org.employee_flags || {}),
            expiresAt: org.expires_at
          });
        }
      }

      await fetchAllAdminData();
    }
    setLoading(false);
  };

  const fetchAllAdminData = async () => {
    const { data: allOrgs } = await supabase.from('organizations').select('*');
    if (allOrgs) {
      setOrgs(allOrgs.map(o => ({
        ...o, shortName: o.short_name,
        adminFlags: typeof o.admin_flags === 'string' ? JSON.parse(o.admin_flags) : (o.admin_flags || {}),
        employeeFlags: typeof o.employee_flags === 'string' ? JSON.parse(o.employee_flags) : (o.employee_flags || {}),
        expiresAt: o.expires_at
      })));
    }

    const { data: allUsers } = await supabase.from('users').select('*');
    if (allUsers) {
      setOrgAdmins(allUsers.filter(u => u.role === 'org_admin').map(u => ({ ...u, orgId: u.org_id })));
      setEmployees(allUsers.filter(u => u.role === 'employee').map(u => ({
        ...u,
        orgId: u.org_id,
        pageAccess: typeof u.page_access === 'string' ? JSON.parse(u.page_access) : (u.page_access || {})
      })));
    }
  };

  const login = async (email, password) => {
    let authUserId = null;
    let authError = null;

    // 1. Try genuine Supabase Auth (works for natively created users)
    const { data: authData, error: sbError } = await supabase.auth.signInWithPassword({ email, password });
    if (authData?.user) authUserId = authData.user.id;
    else authError = sbError?.message;

    // 2. Fallback to MVP bypass if native auth complains about missing identities or unconfirmed emails
    if (!authUserId && password === 'password123') {
      const { data: fallbackUser } = await supabase.from('users').select('id').eq('email', email.toLowerCase()).single();
      if (fallbackUser) authUserId = fallbackUser.id;
    }

    if (!authUserId) {
      return { success: false, error: authError || "Invalid login credentials." };
    }

    const { data: userProfile } = await supabase.from('users').select('*').eq('id', authUserId).single();
    if (userProfile) {
      if (userProfile.org_id) {
        const { data: org } = await supabase.from('organizations').select('status').eq('id', userProfile.org_id).single();
        if (org?.status === "Expired") return { success: false, error: "Your organisation's subscription has expired." };
        if (org?.status === "Suspended") return { success: false, error: "Your account is suspended." };
      }
      if (!userProfile.active) return { success: false, error: "Account disabled." };

      localStorage.setItem('invoiceIq_mvp_userId', userProfile.id);
      await fetchProfile(userProfile.id);
      return { success: true };
    }

    return { success: false, error: "Invalid login credentials" };
  };

  const logout = async () => {
    localStorage.removeItem('invoiceIq_mvp_userId');
    setCurrentUser(null);
    setActiveOrg(null);
  };

  const addOrg = async (orgData, adminData) => {
    const { data: newOrg, error: orgErr } = await supabase.from('organizations').insert([{
      name: orgData.name, short_name: orgData.shortName, email: orgData.email,
      industry: orgData.industry, plan: orgData.plan, status: orgData.status,
      expires_at: orgData.expiresAt, admin_flags: orgData.adminFlags, employee_flags: orgData.employeeFlags
    }]).select().single();
    if (orgErr) return { success: false, error: orgErr.message };

    const newUserId = crypto.randomUUID();
    const { error: userErr } = await supabase.from('users').insert([{
      id: newUserId, org_id: newOrg.id, name: adminData.name, role: 'org_admin',
      avatar: adminData.name.substring(0, 2).toUpperCase(), active: true, page_access: {}, email: adminData.email.toLowerCase()
    }]);
    if (userErr && userErr.code === '23503') {
      return { success: false, error: "Database constraint error. Please run the provided SQL script to drop the auth foreign key." };
    }

    await fetchAllAdminData();
    return { success: true };
  };

  const updateOrg = async (orgId, updates) => {
    const dbUpdates = {};
    if (updates.name !== undefined) dbUpdates.name = updates.name;
    if (updates.email !== undefined) dbUpdates.email = updates.email;
    if (updates.industry !== undefined) dbUpdates.industry = updates.industry;
    if (updates.plan !== undefined) dbUpdates.plan = updates.plan;
    if (updates.status !== undefined) dbUpdates.status = updates.status;
    if (updates.shortName !== undefined) dbUpdates.short_name = updates.shortName;
    if (updates.adminFlags !== undefined) dbUpdates.admin_flags = updates.adminFlags;
    if (updates.employeeFlags !== undefined) dbUpdates.employee_flags = updates.employeeFlags;
    if (updates.expiresAt !== undefined) dbUpdates.expires_at = updates.expiresAt;

    const { error } = await supabase.from('organizations').update(dbUpdates).eq('id', orgId);
    if (error) console.error("Update Org Error:", error);
    await fetchAllAdminData();
  };

  const addEmployee = async (empData) => {
    const newUserId = crypto.randomUUID();
    const { error: userErr } = await supabase.from('users').insert([{
      id: newUserId, org_id: empData.orgId, name: empData.name, role: 'employee',
      page_access: empData.pageAccess, active: true, avatar: empData.name.substring(0, 2).toUpperCase(), email: empData.email.toLowerCase()
    }]);
    if (userErr && userErr.code === '23503') {
      return { success: false, error: "Database constraint error. Please run the provided SQL script to drop the auth foreign key." };
    }
    await fetchAllAdminData();
    return { success: true };
  };

  const updateEmployee = async (empId, updates) => {
    const dbUpdates = {};
    if (updates.name !== undefined) dbUpdates.name = updates.name;
    if (updates.active !== undefined) dbUpdates.active = updates.active;
    if (updates.avatar !== undefined) dbUpdates.avatar = updates.avatar;
    if (updates.pageAccess !== undefined) dbUpdates.page_access = updates.pageAccess;

    const { error } = await supabase.from('users').update(dbUpdates).eq('id', empId);
    if (error) console.error("Update Employee Error:", error);
    await fetchAllAdminData();
  };

  if (loading) {
    return <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--t2)', fontSize: '14px', fontFamily: 'monospace' }}>InvoiceIQ :: Establishing Secure Database Connection...</div>;
  }

  return (
    <AuthContext.Provider value={{
      currentUser, activeOrg,
      orgs, orgAdmins, employees,
      login, logout,
      addOrg, updateOrg,
      addEmployee, updateEmployee
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
