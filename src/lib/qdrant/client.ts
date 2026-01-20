/**
 * Qdrant Client and Utilities
 */

import { QdrantClient } from '@qdrant/js-client-rest';
import { GoogleGenerativeAI } from '@google/generative-ai';
import {
    COLLECTIONS,
    componentCollectionConfig,
    capabilityCollectionConfig,
    exampleCollectionConfig,
    PAYLOAD_INDEXES,
} from './schema';

// Initialize Qdrant client
const qdrantUrl = process.env.QDRANT_URL || 'http://localhost:6333';
const qdrantApiKey = process.env.QDRANT_API_KEY;

export const qdrantClient = new QdrantClient({
    url: qdrantUrl,
    apiKey: qdrantApiKey,
});

// Initialize Gemini for embeddings (Comment kept, but Gemini is no longer used for embeddings)
// const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || ''); // Removed as Gemini is no longer used

/**
 * Generate embedding vector using Ollama (local, no API key needed)
 * Using nomic-embed-text model (768 dimensions)
 */
export async function generateEmbedding(text: string): Promise<number[]> {
    const ollamaUrl = process.env.OLLAMA_URL || 'http://localhost:11434';

    try {
        const response = await fetch(`${ollamaUrl}/api/embeddings`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: 'nomic-embed-text',
                prompt: text,
            }),
        });

        if (!response.ok) {
            throw new Error(`Ollama API error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        return data.embedding;
    } catch (error: any) {
        console.error(`Failed to generate embedding: ${error.message}`);
        throw error;
    }
}

/**
 * Initialize all collections
 */
export async function initializeCollections() {
    try {
        // Check and create components collection
        const collections = await qdrantClient.getCollections();
        const existingNames = collections.collections.map((c) => c.name);

        if (!existingNames.includes(COLLECTIONS.COMPONENTS)) {
            await qdrantClient.createCollection(COLLECTIONS.COMPONENTS, componentCollectionConfig);
            console.log(`✓ Created collection: ${COLLECTIONS.COMPONENTS}`);

            // Create indexes
            for (const index of PAYLOAD_INDEXES.components) {
                await qdrantClient.createPayloadIndex(COLLECTIONS.COMPONENTS, {
                    field_name: index.field_name,
                    field_schema: index.field_schema,
                });
            }
        }

        if (!existingNames.includes(COLLECTIONS.CAPABILITIES)) {
            await qdrantClient.createCollection(COLLECTIONS.CAPABILITIES, capabilityCollectionConfig);
            console.log(`✓ Created collection: ${COLLECTIONS.CAPABILITIES}`);

            for (const index of PAYLOAD_INDEXES.capabilities) {
                await qdrantClient.createPayloadIndex(COLLECTIONS.CAPABILITIES, {
                    field_name: index.field_name,
                    field_schema: index.field_schema,
                });
            }
        }

        if (!existingNames.includes(COLLECTIONS.EXAMPLES)) {
            await qdrantClient.createCollection(COLLECTIONS.EXAMPLES, exampleCollectionConfig);
            console.log(`✓ Created collection: ${COLLECTIONS.EXAMPLES}`);

            for (const index of PAYLOAD_INDEXES.examples) {
                await qdrantClient.createPayloadIndex(COLLECTIONS.EXAMPLES, {
                    field_name: index.field_name,
                    field_schema: index.field_schema,
                });
            }
        }

        console.log('✓ All collections initialized');
    } catch (error) {
        console.error('Failed to initialize collections:', error);
        throw error;
    }
}

/**
 * Vector search with optional payload filtering
 */
export async function vectorSearch(
    collectionName: string,
    queryText: string,
    topK: number = 5,
    filter?: Record<string, any>
) {
    const queryVector = await generateEmbedding(queryText);

    const searchParams: any = {
        vector: queryVector,
        limit: topK,
    };

    if (filter) {
        searchParams.filter = filter;
    }

    const results = await qdrantClient.search(collectionName, searchParams);
    return results;
}
