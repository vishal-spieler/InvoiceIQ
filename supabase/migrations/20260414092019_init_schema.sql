-- Create Organizations Table
CREATE TABLE public.organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    short_name TEXT,
    email TEXT,
    industry TEXT,
    plan TEXT DEFAULT 'Starter',
    expires_at DATE,
    status TEXT DEFAULT 'Active',
    admin_flags JSONB DEFAULT '{}'::jsonb,
    employee_flags JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Extends Supabase auth.users
CREATE TABLE public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    org_id UUID REFERENCES public.organizations(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    role TEXT DEFAULT 'employee' CHECK (role IN ('owner', 'org_admin', 'employee', 'vendor')),
    avatar TEXT,
    active BOOLEAN DEFAULT true,
    page_access JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create Vendors Table
CREATE TABLE public.vendors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    gstin TEXT,
    category TEXT,
    status TEXT DEFAULT 'Active',
    emails JSONB DEFAULT '[]'::jsonb,
    rules JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create Batch Jobs Table
CREATE TABLE public.batch_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
    filename TEXT NOT NULL,
    status TEXT DEFAULT 'Processing',
    total_files INTEGER DEFAULT 0,
    success_count INTEGER DEFAULT 0,
    fail_count INTEGER DEFAULT 0,
    results JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create Invoices Table
CREATE TABLE public.invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
    vendor_id UUID REFERENCES public.vendors(id) ON DELETE SET NULL,
    invoice_no TEXT,
    date DATE,
    subtotal NUMERIC(15, 2),
    total_tax NUMERIC(15, 2),
    total NUMERIC(15, 2),
    gst JSONB DEFAULT '{}'::jsonb,
    confidence NUMERIC(5, 2),
    status TEXT DEFAULT 'Pending' CHECK (status IN ('Pending', 'Approved', 'Exported', 'Rejected', 'Failed', 'Needs Review')),
    source TEXT DEFAULT 'Upload' CHECK (source IN ('Upload', 'Batch Job', 'Email')),
    batch_id UUID REFERENCES public.batch_jobs(id) ON DELETE SET NULL,
    preview_base64 TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create Invoice Line Items Table
CREATE TABLE public.invoice_line_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_id UUID REFERENCES public.invoices(id) ON DELETE CASCADE,
    description TEXT,
    qty TEXT,
    rate TEXT,
    hsn TEXT,
    discount TEXT,
    total TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Basic Security (Disable RLS for the initial migration to ensure zero friction during local dev testing)
-- Organizations, users, vendors, invoices, items, batches
ALTER TABLE public.organizations DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendors DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.batch_jobs DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoice_line_items DISABLE ROW LEVEL SECURITY;
