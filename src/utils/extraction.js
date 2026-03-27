import Tesseract from 'tesseract.js';
import * as pdfjs from 'pdfjs-dist';

// Set up PDF.js worker from CDN for Vite
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

/**
 * Perform OCR on an image file.
 */
export async function extractTextFromImage(file) {
  const result = await Tesseract.recognize(file, 'eng', {
    logger: m => console.log(m)
  });
  return result.data.text;
}

/**
 * Extract text from a PDF file using PDF.js.
 */
export async function extractTextFromPDF(file) {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
  let fullText = '';
  
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const pageText = textContent.items.map(item => item.str).join(' ');
    fullText += pageText + '\n';
  }
  
  return fullText;
}

/**
 * Simple regex-based parser for invoice fields.
 */
export function parseInvoiceData(text) {
  const data = {
    invoiceNo: '',
    date: '',
    vendor: '',
    subtotal: '',
    taxAmount: '',
    total: '',
    gstin: '',
    lineItems: [],
    confidence: 60 // Base confidence
  };

  // 1. Invoice Number (Fuzzy patterns: INV, NO, Bill, Doc, Invoice, #)
  const invMatch = text.match(/(?:inv[o|a|i]ce|inv|bill|doc|no|#)\s*[:.\s]*([A-Z0-9\-/]+)/i);
  if (invMatch) data.invoiceNo = invMatch[1].trim();

  // 2. Date (Fuzzy patterns: Date, Dt, On)
  const dateMatch = text.match(/(?:date|dt|on)\s*[:.\s]*(\d{1,2}[-/\s]*(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec|\d{1,2})[-/\s]*\d{2,4})/i);
  if (dateMatch) data.date = dateMatch[1].trim();

  // 3. GSTIN (Indian Standard)
  const gstinMatch = text.match(/([0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[A-Z\d]{1}[Z]{1}[A-Z\d]{1})/i);
  if (gstinMatch) data.gstin = gstinMatch[1].trim();

  // 4. Total Amount (Fuzzy patterns: Total, Amount, Due, Net, Invoice Amount)
  const totalMatch = text.match(/(?:tot[a|l]l|am[o|u]unt|due|inr|rs|₹|inv[o|a]ice\s*am[o|u]nt)\s*[:.\s]*(\d{1,3}(?:[.,]\d{3})*(?:[.,]\d{2})?)/i);
  if (totalMatch) data.total = totalMatch[1].trim();

  // 5. Subtotal (Fuzzy patterns: Sub Total, Net Amount, Taxable)
  const subtotalMatch = text.match(/(?:sub\s*t[o|a]t[a|l]l|net\s*am[o|u]unt|taxable\s*v[a|u]lue)\s*[:.\s]*(\d{1,3}(?:[.,]\d{3})*(?:[.,]\d{2})?)/i);
  if (subtotalMatch) data.subtotal = subtotalMatch[1].trim();

  // 6. Tax Amount (Fuzzy patterns: Total Tax, GST, SGST/CGST/IGST, Tax Amt)
  const taxMatch = text.match(/(?:tot[a|l]l\s*t[a|x]x|gst|sgst|cgst|igst|t[a|x]x\s*am[o|u]nt)\s*[:.\s]*(\d{1,3}(?:[.,]\d{3})*(?:[.,]\d{2})?)/i);
  if (taxMatch) data.taxAmount = taxMatch[1].trim();

  // 7. Vendor Name (Trying to grab the first non-empty line with letters)
  const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 5);
  if (lines.length > 0) data.vendor = lines[0];

  // LOG FOR DEBUGGING
  console.log('--- OCR RAW TEXT ---');
  console.log(text);
  console.log('--- PARSED DATA ---');
  console.log(data);

  // 8. Line Items (Basic Parser)
  data.lineItems = parseLineItems(text);

  // Increase confidence if matches are found
  if (data.invoiceNo && data.total) data.confidence = 85;
  if (data.date) data.confidence += 5;

  return data;
}

/**
 * Main Extraction Entry Point
 */
export async function processInvoice(file) {
  let text = '';
  if (file.type.includes('pdf')) {
    text = await extractTextFromPDF(file);
  } else {
    text = await extractTextFromImage(file);
  }
  
  const parsed = parseInvoiceData(text);
  return {
    ...parsed,
    rawText: text,
    originalFile: file.name
  };
}

/**
 * Heuristic-based Line Item Parser
 * Improved to handle multi-column tables common in Tax Invoices.
 * Looks for lines starting with text and ending with 2 to 6 numeric values.
 */
function parseLineItems(text) {
  const lines = text.split('\n');
  const items = [];
  
  // Greedy regex to find 2-6 trailing numeric values (allows for Qty, Price, Discount, GST, Total)
  // Logic: [Description] [Val1] [Val2] [Val3]...
  const columnRegex = /^(.+?)\s+((?:[\d,.]+\s*){2,6})$/;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.length < 10) continue;

    const match = trimmed.match(columnRegex);
    if (match) {
      const description = match[1].trim();
      // Skip headers or totals
      if (/invoice|date|total|subtotal|gst|tax|vendor|bill|description|name|hsn/i.test(description)) continue;

      const values = match[2].trim().split(/\s+/).filter(v => /[\d,.]+/.test(v));
      if (values.length < 2) continue;

      items.push({
        description,
        qty: values[0],
        rate: values[1],
        total: values[values.length - 1] // The last number is usually the final line amount
      });
    }
  }

  return items;
}
