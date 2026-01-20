/**
 * Qdrant Collection Schemas
 * Defines the structure for 3 RAG collections
 */

import { Schemas } from '@qdrant/js-client-rest';

export const COLLECTIONS = {
    COMPONENTS: 'sdui_components',
    CAPABILITIES: 'sdui_capabilities',
    EXAMPLES: 'sdui_examples',
} as const;

export const VECTOR_SIZE = 768; // Gemini embedding-001 dimension
// Alternative: 1536 for OpenAI text-embedding-3-small

/**
 * Component Catalog Collection
 * Stores UI component specifications (Card, Dialog, etc.)
 */
export const componentCollectionConfig: Schemas['CreateCollection'] = {
    vectors: {
        size: VECTOR_SIZE,
        distance: 'Cosine',
    },
    optimizers_config: {
        default_segment_number: 2,
    },
    replication_factor: 1,
};

/**
 * Capability Manifest Collection
 * Stores action/capability definitions (modal.open, state.set, etc.)
 */
export const capabilityCollectionConfig: Schemas['CreateCollection'] = {
    vectors: {
        size: VECTOR_SIZE,
        distance: 'Cosine',
    },
    optimizers_config: {
        default_segment_number: 2,
    },
    replication_factor: 1,
};

/**
 * Interaction Example Collection
 * Stores complete SDUI JSON examples
 */
export const exampleCollectionConfig: Schemas['CreateCollection'] = {
    vectors: {
        size: VECTOR_SIZE,
        distance: 'Cosine',
    },
    optimizers_config: {
        default_segment_number: 2,
    },
    replication_factor: 1,
};

/**
 * Payload indexes for efficient filtering
 */
export const PAYLOAD_INDEXES = {
    // Component collection indexes
    components: [
        { field_name: 'type', field_schema: 'keyword' as const },
        { field_name: 'library', field_schema: 'keyword' as const },
        { field_name: 'tags', field_schema: 'keyword' as const },
    ],
    // Capability collection indexes
    capabilities: [
        { field_name: 'type', field_schema: 'keyword' as const },
        { field_name: 'platform', field_schema: 'keyword' as const },
        { field_name: 'renderer', field_schema: 'keyword' as const },
        { field_name: 'tags', field_schema: 'keyword' as const },
    ],
    // Example collection indexes
    examples: [
        { field_name: 'type', field_schema: 'keyword' as const },
        { field_name: 'required_capabilities', field_schema: 'keyword' as const },
        { field_name: 'tags', field_schema: 'keyword' as const },
    ],
};
