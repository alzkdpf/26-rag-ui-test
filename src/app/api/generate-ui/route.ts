/**
 * API Route: Generate UI with Gemini
 * POST /api/generate-ui
 */

import { NextRequest, NextResponse } from 'next/server';
import { generateSDUIWithGemini } from '@/lib/gemini/client';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { prompt, platform = 'web', renderer = 'react' } = body;

        if (!prompt) {
            return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
        }

        if (!process.env.GEMINI_API_KEY) {
            return NextResponse.json(
                { error: 'GEMINI_API_KEY not configured' },
                { status: 500 }
            );
        }

        console.log('🤖 Generating UI with Gemini:', prompt);

        const result = await generateSDUIWithGemini({
            userPrompt: prompt,
            platform,
            renderer,
        });

        return NextResponse.json({
            success: true,
            ...result,
        });
    } catch (error: any) {
        console.error('❌ Generate UI error:', error);
        return NextResponse.json(
            {
                error: error.message || 'Failed to generate UI',
                details: error.stack,
            },
            { status: 500 }
        );
    }
}
