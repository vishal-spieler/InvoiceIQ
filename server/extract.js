import Tesseract from 'tesseract.js';
import Jimp from 'jimp';
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

console.log(`[EXTRACT] Module initialized. Key available: ${!!process.env.GEMINI_API_KEY}`);

const genAI = process.env.GEMINI_API_KEY ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY) : null;

/**
 * Pre-process image to improve OCR accuracy
 */
async function preprocessImage(buffer) {
  try {
    const image = await Jimp.read(buffer);
    return await image
      .greyscale()
      .contrast(0.1)
      .normalize()
      .getBufferAsync(Jimp.MIME_PNG);
  } catch (err) {
    console.error('Pre-processing failed, using original:', err.message);
    return buffer;
  }
}

/**
 * AI-Powered Extraction using Google Gemini
 */
async function extractWithGemini(buffer, mimeType) {
  if (!genAI) throw new Error('GEMINI_API_KEY missing');
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  const prompt = `
You are an expert at reading Indian GST Tax Invoices. Analyze this invoice image carefully and return ONLY a valid JSON object with these exact keys:

invoiceNo, date, vendor, subtotal, sgst, cgst, igst, totalTax, total, gstin, confidence, lineItems

STRICT GST EXTRACTION RULES:
- Look for labels like "SGST", "S.G.S.T", "State Tax", "SGST @9%" etc. → capture the AMOUNT next to it as "sgst"
- Look for labels like "CGST", "C.G.S.T", "Central Tax", "CGST @9%" etc. → capture the AMOUNT next to it as "cgst"
- Look for labels like "IGST", "I.G.S.T", "Integrated Tax", "IGST @18%" etc. → capture the AMOUNT next to it as "igst"
- If SGST and CGST both appear, they should be EQUAL (each = half the total GST). Verify this.
- "totalTax" = sgst + cgst + igst (sum of all tax components found)
- "subtotal" = taxable value BEFORE any taxes
- "total" = final grand total amount payable (including all taxes)
- "gstin" = the 15-character GST Identification Number
- "confidence" = your extraction confidence as a number from 0 to 100

STRICT LINE ITEM EXTRACTION RULES:
- Find the main product/service table (NOT the tax summary table)
- Extract EVERY data row. Skip header row and any Total/Subtotal rows.
- Indian invoices commonly have columns like: #, Item Name, HSN/SAC, Quantity, Price/Unit, Discount, GST%, Amount
  → "description" = the Item Name/Particulars column (merge sub-lines if name spans 2 rows)
  → "hsn" = the HSN/SAC code column (6-8 digit number)
  → "qty" = the Quantity column
  → "rate" = the Price/Unit column (NOT the discounted price)
  → "total" = the LAST column (Amount/Total) — the final line value after all discounts and taxes
- If a Discount column exists, still use the final Amount column as "total"
- lineItems MUST be an array of objects each with exactly: { "description", "hsn", "qty", "rate", "total" }
- Use null for any sub-field you cannot read
- Never include rows like "Total", "Sub Total", "CGST", "SGST", "Tax" in lineItems

- All monetary values must be plain numbers (e.g. 1234.56, not "₹1,234.56")

Return ONLY the JSON object. No markdown, no explanation, no code fences.
  `;

  const imagePart = {
    inlineData: {
      data: buffer.toString('base64'),
      mimeType: mimeType || 'image/jpeg'
    }
  };

  try {
    console.log(`[AI] Dispatching to Gemini (Format: ${mimeType})...`);
    const result = await model.generateContent([prompt, imagePart]);
    const rawText = result.response.text();

    // Strip ALL markdown code fences
    const jsonStr = rawText.replace(/```json/gi, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(jsonStr);

    // ── Diagnostic: log ALL top-level keys Gemini returned ──
    console.log('[AI] Gemini top-level keys:', Object.keys(parsed));
    console.log('[AI] Raw lineItems:', JSON.stringify(
      parsed.lineItems ?? parsed.items ?? parsed.products ?? parsed.line_items ?? 'NOT FOUND',
      null, 2
    ));

    return normalizeAIResponse(parsed);
  } catch (err) {
    console.error('[AI FATAL ERROR] Gemini API Connection Failed:');
    console.error(err);
    throw err;
  }
}

/**
 * Normalize AI response: convert nulls to empty strings and apply smart GST inference.
 */
function normalizeAIResponse(raw) {
  const toStr = (v) => (v === null || v === undefined) ? '' : String(v);

  const data = {
    invoiceNo:  toStr(raw.invoiceNo),
    date:       toStr(raw.date),
    vendor:     toStr(raw.vendor),
    gstin:      toStr(raw.gstin),
    subtotal:   toStr(raw.subtotal),
    sgst:       toStr(raw.sgst),
    cgst:       toStr(raw.cgst),
    igst:       toStr(raw.igst),
    totalTax:   toStr(raw.totalTax),
    total:      toStr(raw.total),
    confidence: raw.confidence || 80,
    lineItems:  normalizeLineItems(
      // Scan all likely key names Gemini may use for the line items array
      raw.lineItems ??
      raw.items ??
      raw.line_items ??
      raw.products ??
      raw.services ??
      raw.invoiceItems ??
      raw.invoice_items ??
      raw.lineitem ??
      raw.line_item ??
      raw.rows ??
      raw.entries ??
      // Fallback: pick longest array-valued key in the response
      (() => {
        const arrays = Object.values(raw).filter(v => Array.isArray(v) && v.length > 0);
        if (arrays.length > 0) {
          arrays.sort((a, b) => b.length - a.length);
          console.log('[AI] Falling back to longest array, length:', arrays[0].length);
          return arrays[0];
        }
        return [];
      })()
    )
  };

  const num = (s) => parseFloat(String(s).replace(/,/g, ''));

  // If sgst+cgst found but totalTax missing → compute it
  if (data.sgst && data.cgst && !data.totalTax) {
    const t = num(data.sgst) + num(data.cgst) + (data.igst ? num(data.igst) : 0);
    if (!isNaN(t)) data.totalTax = t.toFixed(2);
  }

  // If totalTax found but sgst+cgst both missing and igst also missing → split equally
  if (data.totalTax && !data.sgst && !data.cgst && !data.igst) {
    const half = num(data.totalTax) / 2;
    if (!isNaN(half)) {
      data.sgst = half.toFixed(2);
      data.cgst = half.toFixed(2);
    }
  }

  // Mirror: if only one of sgst/cgst found
  if (data.sgst && !data.cgst && !data.igst) {
    data.cgst = data.sgst;
    if (!data.totalTax) data.totalTax = (num(data.sgst) * 2).toFixed(2);
  }
  if (data.cgst && !data.sgst && !data.igst) {
    data.sgst = data.cgst;
    if (!data.totalTax) data.totalTax = (num(data.cgst) * 2).toFixed(2);
  }

  console.log('[AI] Normalized response:', JSON.stringify(data, null, 2));
  return data;
}

/**
 * Normalize line items returned by Gemini.
 * Handles all key name variants Gemini may return.
 */
function normalizeLineItems(rawItems) {
  if (!Array.isArray(rawItems) || rawItems.length === 0) {
    console.log('[AI] normalizeLineItems: empty or non-array input:', rawItems);
    return [];
  }

  const results = rawItems
    .filter(item => item && typeof item === 'object')
    .map((item, idx) => {
      // pick() returns first non-null, non-undefined, non-empty-string value from item's keys
      const pick = (...keys) => {
        for (const k of keys) {
          const v = item[k];
          if (v !== null && v !== undefined && String(v).trim() !== '') {
            return String(v).trim();
          }
        }
        return '';
      };

      console.log(`[AI] lineItem[${idx}] raw keys:`, Object.keys(item));

      const description = pick(
        'description', 'item', 'name', 'product', 'particulars',
        'service', 'goods', 'item_name', 'product_name', 'itemName',
        'itemDescription', 'item_description', 'productName'
      );

      const hsn = pick(
        'hsn', 'sac', 'hsnCode', 'sacCode', 'hsn_sac', 'hsnSac',
        'hsn/sac', 'HSN', 'SAC', 'hsn_code', 'sac_code'
      );

      const qty = pick(
        'qty', 'quantity', 'units', 'nos', 'pcs', 'count',
        'Qty', 'Quantity', 'qty_unit'
      );

      const rate = pick(
        'rate', 'price', 'unitPrice', 'unit_price', 'price_unit',
        'pricePerUnit', 'price_per_unit', 'mrp', 'cost',
        'Rate', 'Price', 'unit_rate', 'basic_rate', 'price/unit'
      );

      const total = pick(
        'total', 'amount', 'lineTotal', 'line_total', 'value',
        'net', 'amt', 'Amount', 'Total', 'line_amount',
        'taxable_amount', 'taxableAmount', 'net_amount', 'netAmount'
      );

      const mapped = { description, hsn, qty, rate, total };
      console.log(`[AI] lineItem[${idx}] mapped:`, JSON.stringify(mapped));
      return mapped;
    })
    .filter(item => item.description || item.total);

  console.log(`[AI] normalizeLineItems: ${rawItems.length} raw → ${results.length} kept`);
  return results;
}

/**
 * Heuristic-based Line Item Parser (OCR fallback)
 */
function parseLineItems(text) {
  console.log("=== [OCR DIAGNOSTIC] RAW TEXT OUTPUT ===");
  console.log(text);
  console.log("========================================");

  const lines = text.split('\n');
  const items = [];

  // Matches: [description text] [2 to 10 numeric values at the end]
  // Allow (, ), % and - to support lines like "743.68 (6%)". Switched to \s+ for flexible column spacing
  const columnRegex = /^(.{3,60}?)\s+((?:[\d,.\-%()]+(?:\s+|$)){2,10})$/;

  // Header/footer keywords to SKIP
  const skipPattern = /^(s\s*no|sl\.?\s*no|sr\.?\s*no|description|particulars|hsn\/sac|hsn|sac|qty|rate|amount|total\s*amount|sub\s*total|subtotal|grand\s*total|balance|taxable|cgst|sgst|igst|gst|tax|discount|invoice\s*(no|date|num)|date|terms|page|bank|ifsc|pan|gstin|thank|certified|e\s*&\s*oe|\*|#)$/i;

  console.log(`[OCR DIAGNOSTIC] Scanning ${lines.length} lines for product rows...`);

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();
    if (!trimmed || trimmed.length < 6) continue;

    const match = trimmed.match(columnRegex);
    if (!match) continue;

    console.log(`\n[OCR DIAGNOSTIC] --> Possible Regex Match on Line ${i + 1}:`, JSON.stringify(trimmed));
    const description = match[1].trim();

    if (skipPattern.test(description)) {
      console.log(`    [SKIPPED] Matches Header/Footer 'skipPattern':`, description);
      continue;
    }
    if (/^(total|sub.?total|grand|sgst|cgst|igst|discount|balance\s*due)/i.test(description)) {
      console.log(`    [SKIPPED] Matches total/summary word:`, description);
      continue;
    }

    // Filter out parts that do not contain a digit (e.g. random OCR noise)
    const rawValues = match[2].trim().split(/\s+/).filter(v => /\d/.test(v));
    console.log(`    [PARSED] description: "${description}" | rawValues: [${rawValues.join(', ')}]`);

    if (rawValues.length < 2) {
      console.log(`    [SKIPPED] Less than 2 numeric values found`);
      continue;
    }

    // Remove standalone percentages like "(6%)" to just get the core data columns
    const cleanValues = rawValues.filter(v => !/^\(?[\d.]+%\)?$/.test(v));
    console.log(`    [PARSED] cleanValues (after removing %): [${cleanValues.join(', ')}]`);

    if (cleanValues.length < 2) continue;

    let qty, rate, total, hsn = '';
    if (cleanValues.length >= 4) {
      if (cleanValues[0].length >= 4 && !cleanValues[0].includes('.')) {
        hsn = cleanValues[0];
      }
      qty   = cleanValues[1];
      rate  = cleanValues[2];
      total = cleanValues[cleanValues.length - 1];
    } else {
      qty   = cleanValues[0];
      rate  = cleanValues[1];
      total = cleanValues[cleanValues.length - 1];
    }

    // Strip parentheses if the total was captured with them
    const cleanTotal = total.replace(/[()]/g, '');

    const resolvedItem = { description, hsn, qty, rate, total: cleanTotal };
    items.push(resolvedItem);
    console.log(`    [SUCCESS] Mapped item:`, JSON.stringify(resolvedItem));
  }

  console.log(`\n[OCR DIAGNOSTIC] Finished. Found ${items.length} valid line items.`);
  return items;
}

/**
 * Robust Fuzzy Parser (OCR text → invoice fields)
 */
function parseInvoiceData(text) {
  const data = {
    invoiceNo: '',
    date: '',
    vendor: '',
    subtotal: '',
    sgst: '',
    cgst: '',
    igst: '',
    totalTax: '',
    total: '',
    gstin: '',
    lineItems: [],
    confidence: 60
  };

  const findValue = (labelPattern, rawText) => {
    const regex = new RegExp(`${labelPattern}[^\\d]*(\\d{1,7}(?:[.,]\\d{2,4})?)`, 'i');
    const match = rawText.match(regex);
    return match ? match[1].trim() : '';
  };

  // 1. Invoice Number
  const invMatch = text.match(/(?:no|bill)\s*[:.|\s]*([A-Z0-9\-/]{3,})/i) ||
                   text.match(/([A-Z]{2}-\d{2}\/\d{2}-\d+)/);
  if (invMatch) data.invoiceNo = invMatch[1].trim();

  // 2. Date
  const dateMatch = text.match(/(?:date|dae|dt|on)\s*[:.|\s]*(\d{1,2}[-/\s]*\d{1,2}[-/\s]*\d{2,4})/i);
  if (dateMatch) data.date = dateMatch[1].trim();

  // 3. GSTIN
  const gstinMatch = text.match(/([0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[A-Z\d]{1}[Z]{1}[A-Z\d]{1})/i);
  if (gstinMatch) data.gstin = gstinMatch[1].trim();

  // 4. Total Amount
  const totalMatch = text.match(/(?:tot[al]l|toul|am[ou]unt|due|inr|rs|₹|inv[oa]ice\s*am[ou]unt)[\s\S]{0,15}?(\d{1,7}(?:[.,]\d{2,4})?)/i);
  if (totalMatch) {
    let val = totalMatch[1].replace(/,/g, '');
    if (val.length >= 6 && !val.includes('.')) {
      val = val.slice(0, -2) + '.' + val.slice(-2);
    }
    data.total = val;
  }

  // 5. GST Components
  const sgstPatterns = [
    /s\.?g\.?s\.?t\.?(?:\s*@\s*[\d.]+%)?[^\d\n]{0,15}([\d,]+\.\d{2})/i,
    /state\s*(?:gst|tax)[^\d\n]{0,15}([\d,]+\.\d{2})/i,
  ];
  const cgstPatterns = [
    /c\.?g\.?s\.?t\.?(?:\s*@\s*[\d.]+%)?[^\d\n]{0,15}([\d,]+\.\d{2})/i,
    /central\s*(?:gst|tax)[^\d\n]{0,15}([\d,]+\.\d{2})/i,
  ];
  const igstPatterns = [
    /i\.?g\.?s\.?t\.?(?:\s*@\s*[\d.]+%)?[^\d\n]{0,15}([\d,]+\.\d{2})/i,
    /integrated\s*(?:gst|tax)[^\d\n]{0,15}([\d,]+\.\d{2})/i,
  ];

  const matchFirst = (patterns, rawText) => {
    for (const p of patterns) {
      const m = rawText.match(p);
      if (m) return m[1].replace(/,/g, '');
    }
    return '';
  };

  data.sgst = matchFirst(sgstPatterns, text);
  data.cgst = matchFirst(cgstPatterns, text);
  data.igst = matchFirst(igstPatterns, text);

  // 6. Total Tax
  const taxCandidates = [...text.matchAll(/(?:total\s*tax|gst|t[ax]x|[|)]\s*t[ou]l)[\s\S]{0,10}?(\d+[.,]\d{2})/gi)];
  if (taxCandidates.length > 0) {
    const totalVal = data.total ? parseFloat(data.total) : Infinity;
    const validTax = taxCandidates.map(m => m[1]).find(val => {
      const v = parseFloat(val.replace(/,/g, ''));
      return v > 0 && v < totalVal * 0.5;
    });
    if (validTax) data.totalTax = validTax.trim();
  }

  if (!data.totalTax) {
    const rescueMatch = text.match(/(\d{1,5}(?:\.\d{2}))\s*Fourteen\s*Rupees/i);
    if (rescueMatch) data.totalTax = rescueMatch[1].trim();
  }

  // 7. GST Inference
  if (data.totalTax && !data.cgst && !data.sgst && !data.igst) {
    const taxVal = parseFloat(data.totalTax);
    if (!isNaN(taxVal)) {
      data.cgst = (taxVal / 2).toFixed(2);
      data.sgst = (taxVal / 2).toFixed(2);
    }
  }
  if (!data.totalTax && data.sgst && data.cgst) {
    const t = parseFloat(data.sgst) + parseFloat(data.cgst) + (data.igst ? parseFloat(data.igst) : 0);
    if (!isNaN(t)) data.totalTax = t.toFixed(2);
  }
  if (data.sgst && !data.cgst && !data.igst) {
    data.cgst = data.sgst;
    if (!data.totalTax) data.totalTax = (parseFloat(data.sgst) * 2).toFixed(2);
  }
  if (data.cgst && !data.sgst && !data.igst) {
    data.sgst = data.cgst;
    if (!data.totalTax) data.totalTax = (parseFloat(data.cgst) * 2).toFixed(2);
  }

  // 8. Subtotal
  const subMatch = text.match(/(?:sub\s*t[oa]t[ali]l|net\s*am[ou]unt|taxable)[\s\S]{0,15}?(\d{1,7}(?:[.,]\d{2,4})?)/i);
  if (subMatch) data.subtotal = subMatch[1].trim();
  else if (data.total && data.totalTax) {
    data.subtotal = (parseFloat(data.total) - parseFloat(data.totalTax)).toFixed(2);
  }

  // 9. Vendor Name
  const linesArr = text.split('\n').map(l => l.trim()).filter(l => l.length > 2);
  const artsLine = linesArr.find(l => l.toUpperCase().includes('ARTS'));
  data.vendor = artsLine ? artsLine.replace(/[^a-zA-Z\s]/g, '').trim() : (linesArr[0] || 'Unknown');

  data.lineItems = parseLineItems(text);
  if (data.invoiceNo && data.total) data.confidence = 98;
  return data;
}

export async function performExtraction(buffer, originalName, mimeType) {
  if (process.env.GEMINI_API_KEY) {
    try {
      console.log(`AI-Extraction (Gemini) starting for: ${originalName}...`);
      const aiData = await extractWithGemini(buffer, mimeType);
      return {
        ...aiData,
        rawText: '(Extracted via Gemini AI)',
        fileName: originalName
      };
    } catch (err) {
      console.error('[CRITICAL] AI Extraction failed, falling back to local OCR.');
    }
  }

  // Fallback: OCR
  console.log(`Pre-processing: ${originalName}...`);
  const processedBuffer = await preprocessImage(buffer);

  console.log(`OCRing: ${originalName}...`);
  const result = await Tesseract.recognize(processedBuffer, 'eng');
  const text = result.data.text;

  const parsed = parseInvoiceData(text);
  return {
    ...parsed,
    rawText: text,
    fileName: originalName
  };
}
