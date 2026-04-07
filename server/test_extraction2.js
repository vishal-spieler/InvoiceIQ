import fs from 'fs';
import { performExtraction } from './extract.js';

const imagePath = 'C:\\Users\\VISHAL\\.gemini\\antigravity\\brain\\69f975e6-4461-416a-a98f-310dd09ee2b7\\media__1775464758220.jpg';

async function test() {
  const buffer = fs.readFileSync(imagePath);
  try {
    const data = await performExtraction(buffer, "test2.jpg", "image/jpeg");
    console.log("=== EXTRACTION RESULT ===");
    console.log(JSON.stringify(data, null, 2));
  } catch (err) {
    console.error("Failed:", err);
  }
}

test();
