/**
 * SDUI State Management Hook
 */

'use client';

import { create } from 'zustand';
import type { SDUIValue } from '@/types/sdui';

interface SDUIState {
    // Page state
    state: Record<string, any>;
    // Context data (e.g., data from API)
    context: Record<string, any>;
    // Modal states
    modals: Record<string, { open: boolean; data?: any }>;

    // Actions
    setState: (path: string, value: any) => void;
    setContext: (data: Record<string, any>) => void;
    openModal: (modalId: string, data?: any) => void;
    closeModal: (modalId: string) => void;
    reset: () => void;
}

export const useSDUIState = create<SDUIState>((set) => ({
    state: {},
    context: {},
    modals: {},

    setState: (path, value) =>
        set((prev) => {
            const newState = { ...prev.state };
            const keys = path.split('.');
            let current: any = newState;

            for (let i = 0; i < keys.length - 1; i++) {
                if (!current[keys[i]]) {
                    current[keys[i]] = {};
                }
                current = current[keys[i]];
            }

            current[keys[keys.length - 1]] = value;

            return { state: newState };
        }),

    setContext: (data) =>
        set((prev) => ({
            context: { ...prev.context, ...data },
        })),

    openModal: (modalId, data) =>
        set((prev) => ({
            modals: {
                ...prev.modals,
                [modalId]: { open: true, data },
            },
        })),

    closeModal: (modalId) =>
        set((prev) => ({
            modals: {
                ...prev.modals,
                [modalId]: { open: false, data: undefined },
            },
        })),

    reset: () =>
        set({
            state: {},
            context: {},
            modals: {},
        }),
}));

/**
 * Resolve $ref references
 * e.g., "$ref": "context.cards" → actual cards array
 */
export function resolveRef(
    value: SDUIValue,
    context: Record<string, any>,
    state: Record<string, any>,
    itemContext?: any
): any {
    if (typeof value !== 'object' || value === null) {
        return value;
    }

    if (Array.isArray(value)) {
        return value.map((v) => resolveRef(v, context, state, itemContext));
    }

    if ('$ref' in value && typeof value.$ref === 'string') {
        const ref = value.$ref;
        const [scope, ...pathParts] = ref.split('.');
        const path = pathParts.join('.');

        let source: any;
        if (scope === 'context') source = context;
        else if (scope === 'state') source = state;
        else if (scope === 'item') source = itemContext;
        else return null;

        // Navigate the path
        return path.split('.').reduce((obj, key) => obj?.[key], source);
    }

    // Recursively resolve nested objects
    const resolved: any = {};
    for (const [k, v] of Object.entries(value)) {
        resolved[k] = resolveRef(v, context, state, itemContext);
    }
    return resolved;
}
