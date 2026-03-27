import express from 'express';
import cors from 'cors';
import multer from 'multer';
import dotenv from 'dotenv';
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

// Start the server
app.listen(port, () => {
  console.log(`InvoiceIQ Backend active at http://localhost:${port}`);
});
