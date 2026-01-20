/**
 * SDUI Action Dispatcher
 * Executes capabilities like modal.open, state.set, etc.
 */

'use client';

import { useSDUIState, resolveRef } from '@/hooks/useSDUIState';
import type { SDUIAction, SDUIValue } from '@/types/sdui';

export function useActionDispatcher() {
    const { setState, openModal, closeModal, state, context } = useSDUIState();

    const dispatch = (actions: SDUIAction[], itemContext?: any) => {
        for (const action of actions) {
            const { capability, payload } = action;

            // Resolve all $ref in payload
            const resolvedPayload = resolveRef(payload, context, state, itemContext);

            switch (capability) {
                case 'state.set': {
                    const { path, value } = resolvedPayload;
                    setState(path, value);
                    break;
                }

                case 'modal.open': {
                    const { modalId, title, bind } = resolvedPayload;
                    openModal(modalId, { title, ...bind });
                    break;
                }

                case 'modal.close': {
                    const { modalId } = resolvedPayload;
                    closeModal(modalId || '');
                    break;
                }

                case 'data.fetch': {
                    // TODO: Implement data fetching
                    console.warn('data.fetch not implemented yet', resolvedPayload);
                    break;
                }

                default:
                    console.warn('Unknown capability:', capability);
            }
        }
    };

    return { dispatch };
}
