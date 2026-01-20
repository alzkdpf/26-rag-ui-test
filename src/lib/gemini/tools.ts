/**
 * Gemini Function Calling Tool Definitions
 */

export const geminiTools = [
    {
        functionDeclarations: [
            {
                name: 'qdrant_search',
                description:
                    'Search SDUI RAG documents from Qdrant collections. Use this to find component specs, capability manifests, or interaction examples.',
                parameters: {
                    type: 'object' as const,
                    properties: {
                        collection: {
                            type: 'string' as const,
                            description:
                                'Collection name: "sdui_components" for UI components, "sdui_capabilities" for actions/capabilities, "sdui_examples" for complete SDUI patterns',
                            enum: ['sdui_components', 'sdui_capabilities', 'sdui_examples'],
                        },
                        query: {
                            type: 'string' as const,
                            description: 'Natural language search query (e.g., "card list modal click")',
                        },
                        topK: {
                            type: 'number' as const,
                            description: 'Number of results to return (default: 5)',
                        },
                        filter: {
                            type: 'object' as const,
                            description: 'Optional payload filters (e.g., platform, renderer, tags)',
                            properties: {
                                platform: { type: 'string' as const },
                                renderer: { type: 'string' as const },
                                type: { type: 'string' as const },
                            },
                        },
                    },
                    required: ['collection', 'query'],
                },
            },
            {
                name: 'generate_sdui_spec',
                description:
                    'Generate SDUI (Server-Driven UI) JSON specification using retrieved RAG documents. This creates the final A2UI-style JSON that the renderer will use.',
                parameters: {
                    type: 'object' as const,
                    properties: {
                        requirements: {
                            type: 'string' as const,
                            description: 'User requirements for the UI',
                        },
                        capabilities: {
                            type: 'array' as const,
                            description: 'Retrieved capability manifests from RAG',
                            items: { type: 'object' as const },
                        },
                        components: {
                            type: 'array' as const,
                            description: 'Retrieved component specs from RAG',
                            items: { type: 'object' as const },
                        },
                        examples: {
                            type: 'array' as const,
                            description: 'Retrieved interaction examples from RAG',
                            items: { type: 'object' as const },
                        },
                    },
                    required: ['requirements'],
                },
            },
        ],
    },
];
