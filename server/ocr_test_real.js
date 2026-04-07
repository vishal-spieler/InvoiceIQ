import { GoogleGenerativeAI } from '@google/generative-ai';
import fs from 'fs';
import dotenv from 'dotenv';
dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const imagePath = 'C:\\Users\\VISHAL\\.gemini\\antigravity\\brain\\69f975e6-4461-416a-a98f-310dd09ee2b7\\media__1775464758220.jpg';

async function testGemini() {
  console.log('Reading image...');
  const buffer = fs.readFileSync(imagePath);
  
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
      mimeType: 'image/jpeg'
    }
  };

  try {
    console.log('Sending to Gemini...');
    const result = await model.generateContent([prompt, imagePart]);
    const rawText = result.response.text();
    console.log("=== RAW GEMINI OUTPUT ===");
    console.log(rawText);
    console.log("=== END RAW GEMINI OUTPUT ===");
  } catch (err) {
    console.error('Gemini Error:', err);
  }
}

testGemini();
