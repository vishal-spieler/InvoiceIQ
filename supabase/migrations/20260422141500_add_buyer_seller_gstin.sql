-- Add Buyer and Seller GSTIN columns to the invoices table
ALTER TABLE public.invoices
ADD COLUMN buyer_gstin TEXT,
ADD COLUMN seller_gstin TEXT;
