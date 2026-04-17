-- Disable triggers briefly to allow force-inserting auth.users
SET session_replication_role = 'replica';

-- Insert Organizations
INSERT INTO public.organizations (id, name, short_name, email, industry, plan, expires_at, status, admin_flags, employee_flags)
VALUES 
('d5d90616-1f63-4414-9351-82782e44dabc', 'Tata Consultancy Services', 'TCS', 'admin@tcs.com', 'IT Services', 'Professional', '2025-03-31', 'Active', 
    '{"uploadInvoice": true, "reviewEdit": true, "allInvoices": true, "batchJobs": true, "exportData": true, "inboxMonitor": true, "processingQueue": true, "emailReports": true, "resendFailures": true, "flowDiagram": true, "vendors": true, "emailConfig": true, "replyTemplates": true}', 
    '{"uploadInvoice": true, "reviewEdit": true, "allInvoices": true, "batchJobs": false, "exportData": true, "inboxMonitor": false, "processingQueue": false, "emailReports": false, "resendFailures": false, "flowDiagram": false, "vendors": false, "emailConfig": false, "replyTemplates": false}'),
('e3b20755-9a8c-4235-905f-3cc1baae81de', 'Infosys Limited', 'Infosys', 'admin@infosys.com', 'IT Services', 'Starter', '2024-12-31', 'Active', 
    '{"uploadInvoice": true, "reviewEdit": true, "allInvoices": true, "batchJobs": false, "exportData": true, "inboxMonitor": false, "processingQueue": false, "emailReports": false, "resendFailures": false, "flowDiagram": false, "vendors": false, "emailConfig": false, "replyTemplates": false}', 
    '{"uploadInvoice": true, "reviewEdit": true, "allInvoices": true, "batchJobs": false, "exportData": false, "inboxMonitor": false, "processingQueue": false, "emailReports": false, "resendFailures": false, "flowDiagram": false, "vendors": false, "emailConfig": false, "replyTemplates": false}');

-- Insert Auth Users (Dummy password 'password123' bcrypt hash generated locally or we bypass auth using simple RLS).
-- For this prototype, to keep auth simple and skip email verification flows during local dev, 
-- we will insert into auth.users directly. The bcrypt hash below is for 'password123'.

INSERT INTO auth.users (id, role, aud, email, encrypted_password, email_confirmed_at)
VALUES 
('10000000-0000-0000-0000-000000000001', 'authenticated', 'authenticated', 'rahul@invoiceiq.io', '$2a$10$wN9P3XJ/L4fV2uE2RMgF0u6/VfOOH.O911Z0l1hZOH1gA8b0e8m9S', now()),
('20000000-0000-0000-0000-000000000001', 'authenticated', 'authenticated', 'admin@tcs.com', '$2a$10$wN9P3XJ/L4fV2uE2RMgF0u6/VfOOH.O911Z0l1hZOH1gA8b0e8m9S', now()),
('30000000-0000-0000-0000-000000000001', 'authenticated', 'authenticated', 'sneha@tcs.com', '$2a$10$wN9P3XJ/L4fV2uE2RMgF0u6/VfOOH.O911Z0l1hZOH1gA8b0e8m9S', now());

-- Insert Public Users
INSERT INTO public.users (id, org_id, name, role, avatar, active, page_access)
VALUES 
('10000000-0000-0000-0000-000000000001', NULL, 'Rahul Desai', 'owner', 'RD', true, '{}'),
('20000000-0000-0000-0000-000000000001', 'd5d90616-1f63-4414-9351-82782e44dabc', 'Arjun Patel', 'org_admin', 'AP', true, '{}'),
('30000000-0000-0000-0000-000000000001', 'd5d90616-1f63-4414-9351-82782e44dabc', 'Sneha Kulkarni', 'employee', 'SK', true, '{"uploadInvoice": true, "reviewEdit": true, "allInvoices": true, "inboxMonitor": true, "processingQueue": true}');

SET session_replication_role = 'origin';
