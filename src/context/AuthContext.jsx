import React, { createContext, useContext, useState } from 'react';

const initialOwner = {
  id: "owner_1",
  name: "Rahul Desai",
  email: "rahul@invoiceiq.io",
  password: "owner123",
  role: "owner",
  avatar: "RD",
};

const initialOrgs = [
  {
    id: "org_1",
    name: "Tata Consultancy Services",
    shortName: "TCS",
    email: "admin@tcs.com",
    industry: "IT Services",
    plan: "Professional",
    expiresAt: "2025-03-31",
    status: "Active",
    adminFlags: {
      uploadInvoice: true, reviewEdit: true, allInvoices: true,
      batchJobs: true, exportData: true, inboxMonitor: true,
      processingQueue: true, emailReports: true, resendFailures: true,
      flowDiagram: true, vendors: true, emailConfig: true, replyTemplates: true,
    },
    employeeFlags: {
      uploadInvoice: true, reviewEdit: true, allInvoices: true,
      batchJobs: false, exportData: true, inboxMonitor: false,
      processingQueue: false, emailReports: false, resendFailures: false,
      flowDiagram: false, vendors: false, emailConfig: false, replyTemplates: false,
    },
    createdAt: "2024-04-01",
  },
  {
    id: "org_2",
    name: "Infosys Limited",
    shortName: "Infosys",
    email: "admin@infosys.com",
    industry: "IT Services",
    plan: "Starter",
    expiresAt: "2024-12-31",
    status: "Active",
    adminFlags: {
      uploadInvoice: true, reviewEdit: true, allInvoices: true,
      batchJobs: false, exportData: true, inboxMonitor: false,
      processingQueue: false, emailReports: false, resendFailures: false,
      flowDiagram: false, vendors: false, emailConfig: false, replyTemplates: false,
    },
    employeeFlags: {
      uploadInvoice: true, reviewEdit: true, allInvoices: true,
      batchJobs: false, exportData: false, inboxMonitor: false,
      processingQueue: false, emailReports: false, resendFailures: false,
      flowDiagram: false, vendors: false, emailConfig: false, replyTemplates: false,
    },
    createdAt: "2024-07-01",
  },
  {
    id: "org_3",
    name: "Wipro Ltd",
    shortName: "Wipro",
    email: "admin@wipro.com",
    industry: "IT Services",
    plan: "Professional",
    expiresAt: "2024-10-15",
    status: "Expired",
    adminFlags: {
      uploadInvoice: true, reviewEdit: true, allInvoices: true,
      batchJobs: true, exportData: true, inboxMonitor: false,
      processingQueue: false, emailReports: false, resendFailures: false,
      flowDiagram: false, vendors: true, emailConfig: false, replyTemplates: false,
    },
    employeeFlags: {
      uploadInvoice: true, reviewEdit: true, allInvoices: true,
      batchJobs: false, exportData: false, inboxMonitor: false,
      processingQueue: false, emailReports: false, resendFailures: false,
      flowDiagram: false, vendors: false, emailConfig: false, replyTemplates: false,
    },
    createdAt: "2024-01-15",
  },
];

const initialOrgAdmins = [
  { id: "oa_1", orgId: "org_1", name: "Arjun Patel",  email: "admin@tcs.com",     password: "tcs_admin",  avatar: "AP", active: true },
  { id: "oa_2", orgId: "org_2", name: "Neha Singh",   email: "admin@infosys.com", password: "inf_admin",  avatar: "NS", active: true },
  { id: "oa_3", orgId: "org_3", name: "Rohit Mehta",  email: "admin@wipro.com",   password: "wip_admin",  avatar: "RM", active: true },
];

const initialEmployees = [
  {
    id: "emp_1", orgId: "org_1", name: "Sneha Kulkarni", email: "sneha@tcs.com", password: "sneha123", avatar: "SK", active: true,
    pageAccess: { uploadInvoice: true, reviewEdit: true, allInvoices: true, batchJobs: false, exportData: false, inboxMonitor: true, processingQueue: true, emailReports: false, resendFailures: false, flowDiagram: false, vendors: false, emailConfig: false, replyTemplates: false },
  },
  {
    id: "emp_2", orgId: "org_1", name: "Dev Sharma", email: "dev@tcs.com", password: "dev123", avatar: "DS", active: true,
    pageAccess: { uploadInvoice: true, reviewEdit: false, allInvoices: true, batchJobs: true, exportData: true, inboxMonitor: false, processingQueue: false, emailReports: false, resendFailures: false, flowDiagram: false, vendors: false, emailConfig: false, replyTemplates: false },
  },
  {
    id: "emp_3", orgId: "org_2", name: "Priya Nair", email: "priya@infosys.com", password: "priya123", avatar: "PN", active: true,
    pageAccess: { uploadInvoice: true, reviewEdit: true, allInvoices: true, batchJobs: false, exportData: true, inboxMonitor: false, processingQueue: false, emailReports: false, resendFailures: false, flowDiagram: false, vendors: false, emailConfig: false, replyTemplates: false },
  },
];

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  
  const [orgs, setOrgs] = useState(initialOrgs);
  const [orgAdmins, setOrgAdmins] = useState(initialOrgAdmins);
  const [employees, setEmployees] = useState(initialEmployees);

  const getOrgStatus = (orgId) => {
    const org = orgs.find(o => o.id === orgId);
    return org?.status;
  };

  const login = (email, password) => {
    const em = email.toLowerCase();
    
    // 1. Check Owner
    if (em === initialOwner.email.toLowerCase() && password === initialOwner.password) {
      setCurrentUser(initialOwner);
      return { success: true };
    }
    
    // 2. Check Org Admin
    const adminMatch = orgAdmins.find(a => a.email.toLowerCase() === em && a.password === password);
    if (adminMatch) {
      const status = getOrgStatus(adminMatch.orgId);
      if (status === "Expired") return { success: false, error: "Your organisation's subscription has expired. Please contact InvoiceIQ support." };
      if (status === "Suspended") return { success: false, error: "Your account has been suspended. Please contact InvoiceIQ support." };
      if (!adminMatch.active) return { success: false, error: "Account disabled." };
      
      setCurrentUser({ ...adminMatch, role: 'org_admin' });
      return { success: true };
    }
    
    // 3. Check Employee
    const empMatch = employees.find(e => e.email.toLowerCase() === em && e.password === password);
    if (empMatch) {
      const status = getOrgStatus(empMatch.orgId);
      if (status === "Expired") return { success: false, error: "Your organisation's subscription has expired. Please contact InvoiceIQ support." };
      if (status === "Suspended") return { success: false, error: "Your account has been suspended. Please contact InvoiceIQ support." };
      if (!empMatch.active) return { success: false, error: "Account disabled." };
      
      setCurrentUser({ ...empMatch, role: 'employee' });
      return { success: true };
    }
    
    return { success: false, error: "Invalid email or password" };
  };

  const logout = () => setCurrentUser(null);

  // --- Actions ---

  const addOrg = (orgData, adminData) => {
    // Basic dup check
    if (orgAdmins.some(a => a.email.toLowerCase() === adminData.email.toLowerCase()) || 
        employees.some(e => e.email.toLowerCase() === adminData.email.toLowerCase())) {
      return { success: false, error: "Email already in use" };
    }
    const newOrgId = `org_${Date.now()}`;
    const newOrg = { ...orgData, id: newOrgId, createdAt: new Date().toISOString().split('T')[0] };
    const newAdmin = { ...adminData, id: `oa_${Date.now()}`, orgId: newOrgId, active: true };
    
    setOrgs([...orgs, newOrg]);
    setOrgAdmins([...orgAdmins, newAdmin]);
    return { success: true };
  };

  const updateOrg = (orgId, updates) => {
    setOrgs(orgs.map(o => o.id === orgId ? { ...o, ...updates } : o));
  };

  const addEmployee = (empData) => {
    if (orgAdmins.some(a => a.email.toLowerCase() === empData.email.toLowerCase()) || 
        employees.some(e => e.email.toLowerCase() === empData.email.toLowerCase())) {
      return { success: false, error: "Email already in use" };
    }
    setEmployees([...employees, { ...empData, id: `emp_${Date.now()}` }]);
    return { success: true };
  };

  const updateEmployee = (empId, updates) => {
    setEmployees(employees.map(e => e.id === empId ? { ...e, ...updates } : e));
  };

  // Helper to extract the active Org config for the logged-in user
  const activeOrg = currentUser && currentUser.role !== 'owner' 
    ? orgs.find(o => o.id === currentUser.orgId) 
    : null;

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
