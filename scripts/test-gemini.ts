// Quick test to verify Gemini API key and embedding access
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { GoogleGenerativeAI } from '@google/generative-ai';

async function testGeminiAPI() {
    const apiKey = process.env.GEMINI_API_KEY;

    console.log('🔑 API Key loaded:', apiKey ? `${apiKey.substring(0, 10)}...` : 'NOT FOUND');

    if (!apiKey) {
        console.error('❌ GEMINI_API_KEY not found in environment');
        process.exit(1);
    }

    const genAI = new GoogleGenerativeAI(apiKey);

    try {
        console.log('\n📝 Testing text generation...');
        const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });
        const result = await model.generateContent('Say hello in one word');
        console.log('✅ Text generation works:', result.response.text());

        console.log('\n🔢 Testing embeddings...');
        const embeddingModel = genAI.getGenerativeModel({ model: 'text-embedding-004' });
        const embeddingResult = await embeddingModel.embedContent('test');
        console.log('✅ Embeddings work! Dimension:', embeddingResult.embedding.values.length);
    } catch (error: any) {
        console.error('❌ Error:', error.message);
        console.error('\nDetails:', {
            status: error.status,
            statusText: error.statusText,
        });

        if (error.status === 403) {
            console.log('\n💡 Possible solutions:');
            console.log('1. Check if your API key is valid at https://aistudio.google.com/app/apikey');
            console.log('2. Ensure the API key has access to embeddings');
            console.log('3. Try regenerating the API key');
            console.log('4. Use alternative: embedding-001 model or OpenAI embeddings');
        }

        process.exit(1);
    }

    console.log('\n✅ All tests passed!');
}

testGeminiAPI();
