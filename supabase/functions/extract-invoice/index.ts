import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { GoogleGenerativeAI } from "https://esm.sh/@google/generative-ai"

console.log("Invoice Extract Edge Function Booted");

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const formData = await req.formData()
    const file = formData.get('file') as File;

    if (!file) {
      return new Response(JSON.stringify({ error: "No file uploaded" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } })
    }

    const geminiKey = Deno.env.get('GEMINI_API_KEY');
    if (!geminiKey) {
      console.error("GEMINI_API_KEY missing from environment secrets");
      return new Response(JSON.stringify({ error: "API key configuration missing" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } })
    }

    const genAI = new GoogleGenerativeAI(geminiKey);
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash-lite',
      generationConfig: { temperature: 0.0, responseMimeType: "application/json" }
    });

    const prompt = `
You are an expert at reading Indian GST Tax Invoices. Analyze this invoice image carefully and return ONLY a valid JSON object with these exact keys:

invoiceNo, date, vendor, subtotal, sgst, cgst, igst, cgst_rate, sgst_rate, igst_rate, totalTax, total, gstin, confidence, lineItems

STRICT GST EXTRACTION RULES:
- Look for labels like "SGST", "S.G.S.T", "State Tax", etc. → capture the AMOUNT next to it as "sgst"
- Look for labels like "CGST", "C.G.S.T", "Central Tax", etc. → capture the AMOUNT next to it as "cgst"
- Look for labels like "IGST", "I.G.S.T", "Integrated Tax", etc. → capture the AMOUNT next to it as "igst"
- "totalTax" = sgst + cgst + igst
- "subtotal" = taxable value BEFORE any taxes
- "total" = final grand total amount payable
- "gstin" = the 15-character GST Identification Number
- "confidence" = your extraction confidence as a number from 0 to 100

STRICT LINE ITEM EXTRACTION RULES:
- Extract EVERY data row from the main items table.
- lineItems MUST be an array of objects each with exactly: { "description", "hsn", "qty", "rate", "discount", "total" }

Return ONLY the JSON object. No markdown, no explanation, no code fences.
    `;

    const arrayBuffer = await file.arrayBuffer();
    const base64Data = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));

    console.log(`[EDGE] Dispatching ${file.type} to Gemini API`);

    const imagePart = {
      inlineData: {
        data: base64Data,
        mimeType: file.type || 'application/pdf'
      }
    };

    const result = await model.generateContent([prompt, imagePart]);
    const rawText = result.response.text();

    // Strip code fences if API ignores responseMimeType hint
    const jsonStr = rawText.replace(/```json/gi, '').replace(/```/g, '').trim();
    let data;
    try {
      data = JSON.parse(jsonStr);
    } catch (e) {
      console.error("Failed to parse Gemini output:", jsonStr);
      throw new Error("Invalid format returned from Gemini");
    }

    // Add back the base64 string so frontend can render preview from API return
    data.previewUrl = `data:${file.type};base64,${base64Data}`;
    data.fileType = file.type;

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    })

  } catch (error) {
    console.error("Function Error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    })
  }
})
