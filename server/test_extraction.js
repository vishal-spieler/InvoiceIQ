import fs from 'fs';
import { performExtraction } from './extract.js';

const imagePath = 'C:\\Users\\VISHAL\\.gemini\\antigravity\\brain\\69f975e6-4461-416a-a98f-310dd09ee2b7\\media__1775464758220.jpg';

async function test() {
  if (!fs.existsSync(imagePath)) {
    console.error("Image file not found.");
    process.exit(1);
  }
  const buffer = fs.readFileSync(imagePath);
  try {
    const data = await performExtraction(buffer, "test.jpg", "image/jpeg");
    console.log("=== EXTRACTION RESULT ===");
    console.log(JSON.stringify(data, null, 2));
  } catch (err) {
    console.error("Failed:", err);
  }
}

test();
