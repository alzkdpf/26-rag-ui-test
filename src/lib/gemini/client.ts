/**
 * Gemini Client for SDUI Generation with Function Calling
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import { geminiTools } from './tools';
import { vectorSearch } from '../qdrant/client';
import { COLLECTIONS } from '../qdrant/schema';
import type { SDUIPage } from '@/types/sdui';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export interface GenerateUIRequest {
    userPrompt: string;
    platform?: string;
    renderer?: string;
}

export interface GenerateUIResponse {
    sduiSpec: SDUIPage;
    reasoning: string;
    toolCalls: any[];
}

/**
 * Generate SDUI JSON using Gemini with Function Calling
 */
export async function generateSDUIWithGemini(request: GenerateUIRequest): Promise<GenerateUIResponse> {
    const { userPrompt, platform = 'web', renderer = 'react' } = request;

    const model = genAI.getGenerativeModel({
        model: 'gemini-2.0-flash-exp',
        tools: geminiTools,
    });

    const systemPrompt = `You are an expert SDUI (Server-Driven UI) architect. Your task is to generate A2UI-style JSON specifications based on user requirements.

Available capabilities and components are stored in Qdrant RAG collections:
- sdui_components: UI component specifications (Card, Dialog, etc.)
- sdui_capabilities: Action definitions (modal.open, state.set, etc.)
- sdui_examples: Complete SDUI patterns

Process:
1. Search for relevant components, capabilities, and examples using qdrant_search
2. Use generate_sdui_spec to create the final SDUI JSON based on retrieved data
3. Ensure all capabilities follow their payload_schema exactly
4. Use $ref notation for data binding (e.g., {"$ref": "context.cards"})

Platform: ${platform}
Renderer: ${renderer}

User request: ${userPrompt}`;

    const chat = model.startChat({
        history: [],
    });

    const toolCalls: any[] = [];
    let result = await chat.sendMessage(systemPrompt);

    // Handle function calls
    let maxIterations = 10;
    while (maxIterations > 0 && result.response.functionCalls()) {
        maxIterations--;
        const functionCalls = result.response.functionCalls();
        if (!functionCalls) break;

        const functionResponses = await Promise.all(
            functionCalls.map(async (call) => {
                toolCalls.push(call);
                console.log(`🔧 Tool call: ${call.name}`, call.args);

                if (call.name === 'qdrant_search') {
                    const { collection, query, topK = 5, filter } = call.args;
                    const searchResults = await vectorSearch(collection, query, topK, filter);

                    return {
                        functionResponse: {
                            name: call.name,
                            response: {
                                results: searchResults.map((r) => ({
                                    score: r.score,
                                    payload: r.payload,
                                })),
                            },
                        },
                    };
                }

                if (call.name === 'generate_sdui_spec') {
                    // This is the final step - Gemini provides the JSON
                    // We'll extract it from the next message
                    return {
                        functionResponse: {
                            name: call.name,
                            response: {
                                success: true,
                                message: 'Ready to generate SDUI JSON',
                            },
                        },
                    };
                }

                return {
                    functionResponse: {
                        name: call.name,
                        response: { error: 'Unknown function' },
                    },
                };
            })
        );

        result = await chat.sendMessage(functionResponses);
    }

    // Extract SDUI JSON from final response
    const responseText = result.response.text();
    console.log('📝 Gemini response:', responseText);

    // Try to extract JSON from code blocks or parse directly
    let sduiSpec: SDUIPage;
    const jsonMatch = responseText.match(/```json\s*([\s\S]*?)\s*```/) || responseText.match(/```\s*([\s\S]*?)\s*```/);

    if (jsonMatch) {
        sduiSpec = JSON.parse(jsonMatch[1]);
    } else {
        // Try to parse entire response as JSON
        try {
            sduiSpec = JSON.parse(responseText);
        } catch {
            // Fallback: create a basic spec
            sduiSpec = {
                type: 'page',
                state: {},
                body: [
                    {
                        type: 'text',
                        value: 'Failed to parse SDUI spec. Response: ' + responseText,
                    },
                ],
            };
        }
    }

    return {
        sduiSpec,
        reasoning: responseText,
        toolCalls,
    };
}
