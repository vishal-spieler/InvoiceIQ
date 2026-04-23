import JSZip from 'jszip';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Uses the API key configured in .env file
const geminiKey = import.meta.env.VITE_GEMINI_API_KEY;

export async function processLocalExtraction(file, mimeType) {
  if (!geminiKey) throw new Error('VITE_GEMINI_API_KEY missing in .env');

  const genAI = new GoogleGenerativeAI(geminiKey);
  const model = genAI.getGenerativeModel({
    model: 'gemini-2.5-flash-lite',
    generationConfig: {
      temperature: 0.0,
      responseMimeType: "application/json",
    }
  });

  const prompt = `
You are an expert at reading Indian GST Tax Invoices. Analyze this invoice image carefully and return ONLY a valid JSON object with these exact keys:

invoiceNo, date, vendor, subtotal, packagingAmount, sgst, cgst, igst, cgst_rate, sgst_rate, igst_rate, totalTax, total, buyerGstin, sellerGstin, lineItems

STRICT GST EXTRACTION RULES:
- Look for labels like "SGST", "S.G.S.T", "State Tax", "SGST @9%" etc. → capture the AMOUNT next to it as "sgst" and extract the percentage number as "sgst_rate"
- Look for labels like "CGST", "C.G.S.T", "Central Tax", "CGST @9%" etc. → capture the AMOUNT next to it as "cgst" and extract the percentage number as "cgst_rate"
- Look for labels like "IGST", "I.G.S.T", "Integrated Tax", "IGST @18%" etc. → capture the AMOUNT next to it as "igst" and extract the percentage number as "igst_rate"
- "totalTax" = sum of tax components
- "packagingAmount" = any packaging, forwarding, or handling charges shown on the invoice. Use 0 if not present.
- "subtotal" = taxable value BEFORE any taxes
- "total" = final grand total amount payable
- "buyerGstin" = The BUYER's 15-character GSTIN. STRICT RULE: This belongs to the firm being billed. Look specifically inside the "To", "Billed To", or "Party Details" boxes. It is often labeled as "GST NO" or "GST No:". If there is a handwritten GSTIN inside an address block next to "GST NO", it is the buyerGstin. NOTE: GSTINs always start with 2 numbers (e.g. '27') followed by 5 letters, 4 numbers, 1 letter, 1 character, 'Z', 1 character. LOOK VERY CLOSELY AT MESSY HANDWRITING!
- "sellerGstin" = The SELLER's 15-character GSTIN. STRICT RULE: This belongs to the vendor issuing the invoice. It is ALWAYS printed at the very top header near the large company name/logo, or typed at the very bottom near the Bank Details/Footer. It is usually explicitly labeled as "GSTIN :".
- CRITICAL: buyerGstin and sellerGstin MUST BE TWO DIFFERENT STRINGS. NEVER return the same GSTIN twice. If the AI cannot decipher the handwritten buyerGstin, leave it completely EMPTY "". Do NOT copy the sellerGstin into the buyer block.
- "confidence" = your extraction confidence as a number from 0 to 100

STRICT LINE ITEM EXTRACTION RULES:
- Extract EVERY data row from the main products/services table.
- lineItems MUST be an array of objects each with exactly: { "description", "hsn", "qty", "rate", "discount", "total" }

Return ONLY the JSON object. No markdown, no explanation.
  `;

  const arrayBuffer = await file.arrayBuffer();
  // Browser approach for arrayBuffer -> base64
  let binary = '';
  const bytes = new Uint8Array(arrayBuffer);
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  const base64Data = window.btoa(binary);

  const imagePart = {
    inlineData: {
      data: base64Data,
      mimeType: mimeType || 'image/jpeg'
    }
  };

  let rawText = null;
  let lastError;
  const maxRetries = 3;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const result = await model.generateContent([prompt, imagePart]);
      rawText = result.response.text();
      break;
    } catch (err) {
      lastError = err;
      if (err.status === 503 && attempt < maxRetries) {
        console.warn(`[503 Capacity Override] Retrying attempt ${attempt}...`);
        await new Promise(res => setTimeout(res, attempt * 2000));
      } else {
        throw err;
      }
    }
  }

  try {
    const jsonStr = rawText.replace(/```json/gi, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(jsonStr);

    // Quick normalization (converting undefined/null)
    const normalized = {};
    let foundCoreFields = 0;
    const coreFields = ['invoiceNo', 'date', 'total', 'vendor'];

    for (const key of ['invoiceNo', 'date', 'vendor', 'subtotal', 'packagingAmount', 'sgst', 'cgst', 'igst', 'totalTax', 'total', 'buyerGstin', 'sellerGstin']) {
      const val = String(parsed[key] || '').trim();
      normalized[key] = val;
      if (coreFields.includes(key) && val.length > 0 && val.toLowerCase() !== 'null') {
        foundCoreFields++;
      }
    }

    if (foundCoreFields === 0) {
      normalized.confidence = 0;
    } else {
      const parsedConf = Number(parsed.confidence);
      normalized.confidence = !isNaN(parsedConf) && parsedConf > 0 ? parsedConf : Math.round((foundCoreFields / coreFields.length) * 100);
    }
    
    // Safety clamp
    normalized.confidence = Math.min(100, Math.max(0, normalized.confidence));

    // --- DYNAMIC CONFIDENCE PENALTY SYSTEM ---
    let penalty = 0;
    
    // 1. GSTIN Penalties
    if (!normalized.buyerGstin || normalized.buyerGstin.trim() === '') penalty += 15;
    if (!normalized.sellerGstin || normalized.sellerGstin.trim() === '') penalty += 10;
    if (normalized.buyerGstin && normalized.sellerGstin && normalized.buyerGstin === normalized.sellerGstin) penalty += 20;

    // 2. Global Math Mismatch Penalty
    const parsedSub = parseFloat(String(normalized.subtotal || '').replace(/,/g, '')) || 0;
    const parsedPkg = parseFloat(String(normalized.packagingAmount || '').replace(/,/g, '')) || 0;
    const parsedTax = parseFloat(normalized.totalTax || 0);
    const parsedTotal = parseFloat(String(normalized.total || '').replace(/,/g, '')) || 0;
    const targetTotal = Math.round(parsedTotal);
    
    if (Math.round(parsedSub + parsedPkg + parsedTax) !== targetTotal && Math.round(parsedSub + parsedTax) !== targetTotal) {
      penalty += 15; // Neither explicit nor implicit packaging math resolves correctly
    }

    // 3. Line Item Mismatch Penalty
    if (parsed.lineItems && parsed.lineItems.length > 0) {
      parsed.lineItems.forEach(li => {
        const qty = parseFloat(String(li.qty || '').replace(/,/g, '')) || 0;
        const rate = parseFloat(String(li.rate || '').replace(/,/g, '')) || 0;
        const disc = parseFloat(String(li.discount || '').replace(/,/g, '')) || 0;
        const actual = parseFloat(String(li.total || '').replace(/,/g, '')) || 0;
        const expected = (qty * rate) - disc;
        
        if (qty > 0 && Math.abs(expected - actual) > 1.5) {
          penalty += 5; // Subtract 5% confidence for every individual line item error
        }
      });
    }

    // Apply strict penalty clamp
    normalized.confidence = Math.max(0, normalized.confidence - penalty);
    normalized.lineItems = parsed.lineItems || [];
    normalized.gst = {
      cgst_rate: parsed.cgst_rate || 0,
      cgst_amount: normalized.cgst,
      sgst_rate: parsed.sgst_rate || 0,
      sgst_amount: normalized.sgst,
      igst_rate: parsed.igst_rate || 0,
      igst_amount: normalized.igst,
      total_gst: normalized.totalTax
    };

    return {
      ...normalized,
      previewUrl: `data:${mimeType};base64,${base64Data}`,
      fileType: mimeType
    };
  } catch (err) {
    console.error('Gemini Extraction Error:', err);
    throw err;
  }
}

export async function processBatchZip(zipFile) {
  const jszip = new JSZip();
  const zip = await jszip.loadAsync(zipFile);
  const results = [];

  const delay = (ms) => new Promise(res => setTimeout(res, ms));

  for (const [filename, zipEntry] of Object.entries(zip.files)) {
    if (zipEntry.dir || filename.includes('__MACOSX/') || filename.startsWith('.')) continue;

    const ext = filename.split('.').pop().toLowerCase();
    if (!['pdf', 'png', 'jpg', 'jpeg', 'webp'].includes(ext)) continue;

    const mimeType = ext === 'pdf' ? 'application/pdf' : `image/${ext === 'jpg' ? 'jpeg' : ext}`;

    try {
      const blob = await zipEntry.async('blob');
      const data = await processLocalExtraction(blob, mimeType);
      results.push({
        filename,
        extractedData: data,
        previewUrl: data.previewUrl,
        fileType: mimeType,
        status: 'success'
      });
    } catch (err) {
      results.push({
        filename,
        error: err.message,
        status: 'error'
      });
    }

    // Throttle to respect Gemini's 15 Requests Per Minute limit (Wait 4 seconds between requests)
    await delay(4000);
  }

  return results;
}
