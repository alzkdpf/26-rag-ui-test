/**
 * Static SDUI Demo Page
 * Tests the renderer with hardcoded SDUI JSON (no Gemini needed)
 */

'use client';

import { SDUIRenderer } from '@/components/sdui/Renderer';
import type { SDUIPage } from '@/types/sdui';

// Example SDUI spec from RAG (card list → modal)
const exampleSpec: SDUIPage = {
    type: 'page',
    state: {
        selectedId: null,
        isModalOpen: false,
    },
    context: {
        cards: [
            {
                id: '1',
                title: 'MacBook Pro 16"',
                description: 'M3 Max chip, 64GB RAM, stunning performance',
                price: '$3,499',
                details: 'The most powerful MacBook Pro ever. Perfect for developers and creators.',
            },
            {
                id: '2',
                title: 'iPhone 15 Pro',
                description: 'Titanium design with A17 Pro chip',
                price: '$999',
                details: 'Pro camera system with 5x telephoto zoom. Action button for quick shortcuts.',
            },
            {
                id: '3',
                title: 'AirPods Max',
                description: 'Premium over-ear headphones',
                price: '$549',
                details: 'Computational audio. Immersive sound. Luxury comfort.',
            },
            {
                id: '4',
                title: 'iPad Pro 12.9"',
                description: 'M2 chip with Liquid Retina XDR display',
                price: '$1,099',
                details: 'Your next computer is not a computer. ProMotion technology and all-day battery.',
            },
            {
                id: '5',
                title: 'Apple Watch Ultra',
                description: 'Rugged titanium case, 49mm',
                price: '$799',
                details: 'Built for endurance. Adventure ready. Precision GPS tracking.',
            },
            {
                id: '6',
                title: 'Mac Studio',
                description: 'M2 Ultra workstation powerhouse',
                price: '$1,999',
                details: 'Unprecedented performance. Compact desktop with pro-level connectivity.',
            },
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
                content: { $ref: 'item.price' },
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
                            modalId: 'productDetail',
                            title: { $ref: 'item.title' },
                            bind: { $ref: 'item' },
                        },
                    },
                ],
            },
        },
        {
            type: 'dialog',
            id: 'productDetail',
            open: { $ref: 'state.isModalOpen' },
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
                    type: 'container',
                    children: [
                        {
                            type: 'text',
                            value: 'Product Details',
                        },
                        {
                            type: 'text',
                            value: { $ref: 'item.details' },
                        },
                    ],
                },
            ],
        },
    ],
};

export default function StaticDemoPage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-zinc-50 to-zinc-100 dark:from-zinc-900 dark:to-zinc-950">
            <div className="container mx-auto py-12">
                <div className="mb-8 text-center">
                    <h1 className="text-4xl font-bold mb-2">SDUI Static Demo</h1>
                    <p className="text-muted-foreground">
                        Card list with modal details - rendered from SDUI JSON spec
                    </p>
                    <div className="mt-4 inline-block bg-zinc-200 dark:bg-zinc-800 px-4 py-2 rounded-lg">
                        <code className="text-xs">src/app/demo/static/page.tsx</code>
                    </div>
                </div>

                <SDUIRenderer spec={exampleSpec} />
            </div>
        </div>
    );
}
