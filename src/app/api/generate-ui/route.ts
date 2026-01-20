/**
 * API Route: Generate UI with RAG (no LLM needed)
 * POST /api/generate-ui
 */

import { NextRequest, NextResponse } from 'next/server';
import { generateSDUIWithRAG } from '@/lib/gemini/client';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { prompt } = body;

        if (!prompt) {
            return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
        }

        console.log('🤖 Generating UI with RAG:', prompt);

        const result = await generateSDUIWithRAG({
            userPrompt: prompt,
        });

        console.log('✅ RAG generation successful');
        return NextResponse.json({
            success: true,
            ...result,
        });
    } catch (error: any) {
        console.error('❌ Generate UI error:', error);
        console.error('Error stack:', error.stack);

        return NextResponse.json(
            {
                success: false,
                error: error.message || 'Failed to generate UI',
                details: error.stack,
            },
            { status: 500 }
        );
    }
}
