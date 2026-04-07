import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
dotenv.config();

const modelsToTest = [
  'gemini-2.0-flash',
  'gemini-2.0-flash-lite-preview-02-05',
  'gemini-2.0-flash-lite',
  'gemini-2.5-flash-lite',
  'gemini-3.1-flash-lite-preview',
  'gemini-3-flash-preview',
  'gemini-pro-latest'
];

async function testAll() {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  for (const m of modelsToTest) {
    try {
      const model = genAI.getGenerativeModel({ model: m });
      const result = await model.generateContent("Say hello");
      console.log(`[SUCCESS] ${m} -> ${result.response.text()}`);
    } catch (e) {
      console.log(`[FAILED] ${m} -> ${e.message.split('\n')[0]}`);
    }
  }
}
testAll();
