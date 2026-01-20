/**
 * Seed Qdrant with RAG Data
 * This script populates the 3 collections with:
 * - Component Specs (shadcn Card, Dialog)
 * - Capability Manifests (modal.open, modal.close, state.set)
 * - Interaction Examples (card click → modal open)
 */

// Load environment variables from .env.local
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { qdrantClient, initializeCollections, generateEmbedding } from '../src/lib/qdrant/client';
import { COLLECTIONS } from '../src/lib/qdrant/schema';
import type { ComponentSpec, CapabilityManifest, InteractionExample } from '../src/types/sdui';

// Component Specs: shadcn/ui components
const componentSpecs: (ComponentSpec & { embedding_text: string })[] = [
    {
        embedding_text: 'shadcn ui Card component for displaying content in a card layout with header title description',
        type: 'component_spec',
        key: 'Card',
        library: 'shadcn/ui',
        doc: 'https://ui.shadcn.com/docs/components/card',
        props: ['className', 'children'],
        subcomponents: ['CardHeader', 'CardTitle', 'CardDescription', 'CardContent', 'CardFooter'],
        tags: ['card', 'container', 'layout', 'shadcn'],
    },
    {
        embedding_text: 'shadcn ui Dialog modal component for overlay popups with trigger content header footer',
        type: 'component_spec',
        key: 'Dialog',
        library: 'shadcn/ui',
        doc: 'https://ui.shadcn.com/docs/components/dialog',
        props: ['open', 'onOpenChange', 'modal'],
        subcomponents: ['DialogTrigger', 'DialogContent', 'DialogHeader', 'DialogTitle', 'DialogDescription', 'DialogFooter'],
        tags: ['dialog', 'modal', 'overlay', 'popup', 'shadcn'],
    },
    {
        embedding_text: 'Card Header component for card title and description at the top',
        type: 'component_spec',
        key: 'CardHeader',
        library: 'shadcn/ui',
        props: ['className', 'children'],
        subcomponents: [],
        tags: ['card', 'header', 'shadcn'],
    },
    {
        embedding_text: 'Card Content component for main card body content',
        type: 'component_spec',
        key: 'CardContent',
        library: 'shadcn/ui',
        props: ['className', 'children'],
        subcomponents: [],
        tags: ['card', 'content', 'body', 'shadcn'],
    },
];

// Capability Manifests: Actions the renderer can perform
const capabilityManifests: (CapabilityManifest & { embedding_text: string })[] = [
    {
        embedding_text: 'open modal dialog popup by id with title and props bind data',
        type: 'capability_manifest',
        key: 'modal.open',
        version: '1.0.0',
        platform: ['web'],
        renderer: ['react'],
        description: 'Open a modal dialog by id and optionally pass props or bind data',
        payload_schema: {
            type: 'object',
            required: ['modalId'],
            properties: {
                modalId: { type: 'string', description: 'ID of the dialog to open' },
                title: { type: 'string', description: 'Optional title override' },
                bind: { type: 'object', description: 'Optional data to bind to modal context' },
            },
        },
        tags: ['modal', 'dialog', 'open', 'action'],
    },
    {
        embedding_text: 'close modal dialog popup dismiss',
        type: 'capability_manifest',
        key: 'modal.close',
        version: '1.0.0',
        platform: ['web'],
        renderer: ['react'],
        description: 'Close the currently open modal dialog',
        payload_schema: {
            type: 'object',
            properties: {
                modalId: { type: 'string', description: 'Optional specific modal ID to close' },
            },
        },
        tags: ['modal', 'dialog', 'close', 'dismiss', 'action'],
    },
    {
        embedding_text: 'set state value update path setValue context data management',
        type: 'capability_manifest',
        key: 'state.set',
        version: '1.0.0',
        platform: ['web'],
        renderer: ['react'],
        description: 'Set a state value at a specific path',
        payload_schema: {
            type: 'object',
            required: ['path', 'value'],
            properties: {
                path: { type: 'string', description: 'Dot-separated path in state (e.g., "selectedId")' },
                value: { description: 'Value to set, can be primitive or $ref' },
            },
        },
        tags: ['state', 'set', 'update', 'data', 'action'],
    },
];

// Interaction Examples: Complete SDUI patterns
const interactionExamples: (InteractionExample & { embedding_text: string })[] = [
    {
        embedding_text: 'card list click open modal dialog show details selected item product user profile',
        type: 'interaction_example',
        intent: 'openCardDetailModal',
        summary: 'Render a card list. When a card is clicked, set selectedId in state and open a dialog modal with details',
        required_capabilities: ['state.set', 'modal.open'],
        required_components: ['Card', 'Dialog'],
        a2ui_json: {
            type: 'page',
            state: {
                selectedId: null,
                isModalOpen: false,
            },
            context: {
                cards: [
                    { id: '1', title: 'Product A', description: 'High quality product', price: '$99' },
                    { id: '2', title: 'Product B', description: 'Premium item', price: '$149' },
                    { id: '3', title: 'Product C', description: 'Best seller', price: '$79' },
                    { id: '4', title: 'Product D', description: 'Limited edition', price: '$199' },
                    { id: '5', title: 'Product E', description: 'Customer favorite', price: '$129' },
                    { id: '6', title: 'Product F', description: 'New arrival', price: '$89' },
                ],
            },
            body: [
                {
                    type: 'cardList',
                    items: { $ref: 'context.cards' },
                    itemTemplate: {
                        type: 'card',
                        title: { $ref: 'item.title' },
                        description: { $ref: 'item.description' },
                        onClick: [
                            {
                                capability: 'state.set',
                                payload: {
                                    path: 'selectedId',
                                    value: { $ref: 'item.id' },
                                },
                            },
                            {
                                capability: 'state.set',
                                payload: {
                                    path: 'isModalOpen',
                                    value: true,
                                },
                            },
                            {
                                capability: 'modal.open',
                                payload: {
                                    modalId: 'cardDetail',
                                    title: { $ref: 'item.title' },
                                    bind: { $ref: 'item' },
                                },
                            },
                        ],
                    },
                },
                {
                    type: 'dialog',
                    id: 'cardDetail',
                    open: { $ref: 'state.isModalOpen' },
                    title: 'Product Details',
                    onOpenChange: [
                        {
                            capability: 'state.set',
                            payload: {
                                path: 'isModalOpen',
                                value: false,
                            },
                        },
                    ],
                    children: [
                        {
                            type: 'text',
                            value: { $ref: 'state.selectedId' },
                        },
                    ],
                },
            ],
        },
        tags: ['card', 'list', 'click', 'modal', 'dialog', 'detail', 'shadcn'],
    },
];

async function seedData() {
    console.log('🌱 Starting Qdrant seeding...\n');

    try {
        // Initialize collections
        await initializeCollections();
        console.log('');

        // Seed Component Specs
        console.log('📦 Seeding component specs...');
        for (let i = 0; i < componentSpecs.length; i++) {
            const spec = componentSpecs[i];
            const { embedding_text, ...payload } = spec;
            const vector = await generateEmbedding(embedding_text);

            await qdrantClient.upsert(COLLECTIONS.COMPONENTS, {
                wait: true,
                points: [
                    {
                        id: i + 1, // Use integer ID
                        vector,
                        payload,
                    },
                ],
            });
            console.log(`  ✓ ${spec.key}`);
        }

        // Seed Capability Manifests
        console.log('\n🎯 Seeding capability manifests...');
        for (let i = 0; i < capabilityManifests.length; i++) {
            const cap = capabilityManifests[i];
            const { embedding_text, ...payload } = cap;
            const vector = await generateEmbedding(embedding_text);

            await qdrantClient.upsert(COLLECTIONS.CAPABILITIES, {
                wait: true,
                points: [
                    {
                        id: i + 1, // Use integer ID
                        vector,
                        payload,
                    },
                ],
            });
            console.log(`  ✓ ${cap.key}`);
        }

        // Seed Interaction Examples
        console.log('\n💡 Seeding interaction examples...');
        for (let i = 0; i < interactionExamples.length; i++) {
            const example = interactionExamples[i];
            const { embedding_text, ...payload } = example;
            const vector = await generateEmbedding(embedding_text);

            await qdrantClient.upsert(COLLECTIONS.EXAMPLES, {
                wait: true,
                points: [
                    {
                        id: i + 1, // Use integer ID
                        vector,
                        payload,
                    },
                ],
            });
            console.log(`  ✓ ${example.intent}`);
        }

        console.log('\n✅ Seeding complete!\n');
        console.log('Collections:');
        console.log(`  - ${COLLECTIONS.COMPONENTS}: ${componentSpecs.length} items`);
        console.log(`  - ${COLLECTIONS.CAPABILITIES}: ${capabilityManifests.length} items`);
        console.log(`  - ${COLLECTIONS.EXAMPLES}: ${interactionExamples.length} items`);
    } catch (error) {
        console.error('❌ Seeding failed:', error);
        throw error;
    }
}

// Run seeding
seedData()
    .then(() => {
        console.log('\n🎉 Done!');
        process.exit(0);
    })
    .catch((error) => {
        console.error('\n💥 Error:', error);
        process.exit(1);
    });
