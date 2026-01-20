// Debug: Print environment variables
import dotenv from 'dotenv';
const result = dotenv.config({ path: '.env.local' });

console.log('Dotenv result:', result.parsed);
console.log('GEMINI_API_KEY from process.env:', process.env.GEMINI_API_KEY);
console.log('All env keys:', Object.keys(process.env).filter(k => k.includes('GEMINI') || k.includes('QDRANT')));
