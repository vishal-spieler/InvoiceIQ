ALTER TABLE public.invoices DROP CONSTRAINT IF EXISTS invoices_status_check;
ALTER TABLE public.invoices ADD CONSTRAINT invoices_status_check CHECK (status IN ('Pending', 'Approved', 'Exported', 'Rejected', 'Failed', 'Needs Review'));
