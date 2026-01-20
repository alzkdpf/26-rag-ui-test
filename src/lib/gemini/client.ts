/**
 * Generate SDUI JSON using RAG (without LLM)
 * Simply retrieves the best matching example from Qdrant
 */

import { vectorSearch } from '../qdrant/client';
import { COLLECTIONS } from '../qdrant/schema';
import type { SDUIPage } from '@/types/sdui';

export interface GenerateUIRequest {
    userPrompt: string;
}

export interface GenerateUIResponse {
    sduiSpec: SDUIPage;
    reasoning: string;
    searchResults: any[];
}

/**
 * Generate SDUI using RAG retrieval (no LLM needed)
 * 1. Search for matching example in Qdrant
 * 2. Return the example's a2ui_json directly
 */
export async function generateSDUIWithRAG(request: GenerateUIRequest): Promise<GenerateUIResponse> {
    const { userPrompt } = request;

    console.log('🔍 Searching for matching SDUI example...');
    console.log('Query:', userPrompt);

    // Search for best matching interaction example
    const exampleResults = await vectorSearch(
        COLLECTIONS.EXAMPLES,
        userPrompt,
        1, // Top 1 result
        {
            must: [
                {
                    key: 'type',
                    match: { value: 'interaction_example' },
                },
            ],
        }
    );

    if (exampleResults.length === 0) {
        throw new Error('No matching SDUI examples found in RAG');
    }

    const bestMatch = exampleResults[0];
    console.log('✅ Found match:', bestMatch.payload?.intent, '(score:', bestMatch.score, ')');

    // Return the example's SDUI JSON directly
    const sduiSpec = bestMatch.payload?.a2ui_json as SDUIPage;

    if (!sduiSpec) {
        throw new Error('Example does not contain valid a2ui_json');
    }

    const reasoning = `Found matching pattern: "${bestMatch.payload?.intent}"
Summary: ${bestMatch.payload?.summary}
Similarity score: ${bestMatch.score?.toFixed(4)}

This example demonstrates:
- Components: ${(bestMatch.payload?.required_components as string[] | undefined)?.join(', ') || 'N/A'}
- Capabilities: ${(bestMatch.payload?.required_capabilities as string[] | undefined)?.join(', ') || 'N/A'}

Using the pre-defined SDUI JSON from RAG.`;

    return {
        sduiSpec,
        reasoning,
        searchResults: exampleResults.map(r => ({
            intent: r.payload?.intent,
            score: r.score,
            summary: r.payload?.summary,
        })),
    };
}
