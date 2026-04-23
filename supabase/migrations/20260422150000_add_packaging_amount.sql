-- Add packaging_amount to invoices table
ALTER TABLE public.invoices
ADD COLUMN packaging_amount TEXT;
