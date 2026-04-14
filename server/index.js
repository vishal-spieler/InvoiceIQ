import express from 'express';
import cors from 'cors';
import multer from 'multer';
import dotenv from 'dotenv';
import AdmZip from 'adm-zip';
import { performExtraction } from './extract.js';

dotenv.config();

const app = express();
const port = 3001;

console.log(`[STARTUP] Gemini API Key present: ${!!process.env.GEMINI_API_KEY}`);

// Use memory storage for small invoice images
const upload = multer({ storage: multer.memoryStorage() });

app.use(cors());
app.use(express.json());

// Log requests
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

/**
 * Endpoint for invoice extraction
 */
app.post('/api/extract', upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  try {
    const data = await performExtraction(req.file.buffer, req.file.originalname, req.file.mimetype);
    res.json(data);
  } catch (err) {
    console.error('Extraction Error:', err);
    res.status(500).json({ error: 'Failed to extract data: ' + err.message });
  }
});

/**
 * Endpoint for batch invoice extraction from ZIP
 */
app.post('/api/batch-extract', upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  try {
    const zip = new AdmZip(req.file.buffer);
    const zipEntries = zip.getEntries();
    
    // Filter valid files (images/pdfs) and ignore macosx metadata
    const validEntries = zipEntries.filter(entry => {
      if (entry.isDirectory) return false;
      if (entry.entryName.includes('__MACOSX/')) return false;
      if (entry.entryName.startsWith('.')) return false;
      const ext = entry.name.split('.').pop().toLowerCase();
      return ['pdf', 'png', 'jpg', 'jpeg', 'webp'].includes(ext);
    });

    if (validEntries.length === 0) {
      return res.status(400).json({ error: 'No valid invoice files found in ZIP' });
    }

    const results = [];
    
    // Process sequentially to avoid API rate limits
    for (const entry of validEntries) {
      const buffer = entry.getData();
      const filename = entry.name;
      const ext = filename.split('.').pop().toLowerCase();
      const mimetype = ext === 'pdf' ? 'application/pdf' : `image/${ext === 'jpg' ? 'jpeg' : ext}`;
      
      try {
        console.log(`[BATCH] Extracting ${filename}...`);
        const extractedData = await performExtraction(buffer, filename, mimetype);
        results.push({
          filename,
          extractedData,
          fileType: mimetype,
          previewUrl: `data:${mimetype};base64,${buffer.toString('base64')}`,
          status: 'success'
        });
      } catch (err) {
        console.error(`[BATCH] Error extracting ${filename}:`, err);
        results.push({
          filename,
          error: err.message,
          status: 'error'
        });
      }
    }
    
    res.json({ results });
  } catch (err) {
    console.error('Batch Extraction Error:', err);
    res.status(500).json({ error: 'Failed to process batch: ' + err.message });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`InvoiceIQ Backend active at http://localhost:${port}`);
});
