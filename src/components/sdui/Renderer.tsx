/**
 * SDUI Renderer
 * Converts SDUI JSON to React components
 */

'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useSDUIState, resolveRef } from '@/hooks/useSDUIState';
import { useActionDispatcher } from './ActionDispatcher';
import type { SDUIComponent, SDUIPage } from '@/types/sdui';

interface RendererProps {
    spec: SDUIPage;
}

export function SDUIRenderer({ spec }: RendererProps) {
    const { setState, setContext } = useSDUIState();
    const [mounted, setMounted] = React.useState(false);

    // Initialize state and context
    React.useEffect(() => {
        setMounted(true);
        if (spec.state) {
            Object.entries(spec.state).forEach(([key, value]) => {
                setState(key, value);
            });
        }
        if (spec.context) {
            setContext(spec.context);
        }
    }, [spec, setState, setContext]);

    // Prevent hydration mismatch by only rendering after mount
    if (!mounted) {
        return <div className="w-full min-h-[400px]" />;
    }

    return (
        <div className="w-full">
            {spec.body?.map((component, index) => (
                <ComponentRenderer key={index} component={component} />
            ))}
        </div>
    );
}

function ComponentRenderer({ component, itemContext }: { component: SDUIComponent; itemContext?: any }) {
    const { state, context, modals, closeModal } = useSDUIState();
    const { dispatch } = useActionDispatcher();

    // Resolve all values
    const title = resolveRef(component.title ?? null, context, state, itemContext);
    const description = resolveRef(component.description ?? null, context, state, itemContext);
    const value = resolveRef(component.value ?? null, context, state, itemContext);
    const content = resolveRef(component.content ?? null, context, state, itemContext);
    const items = resolveRef(component.items ?? null, context, state, itemContext);

    const handleClick = () => {
        if (component.onClick) {
            dispatch(component.onClick, itemContext);
        }
    };

    switch (component.type) {
        case 'page':
            return (
                <div>
                    {component.body?.map((child, index) => (
                        <ComponentRenderer key={index} component={child} />
                    ))}
                </div>
            );

        case 'cardList':
            if (!Array.isArray(items)) {
                console.warn('cardList items must be an array', items);
                return null;
            }

            return (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
                    {items.map((item: any, index: number) =>
                        component.itemTemplate ? (
                            <ComponentRenderer key={item.id || index} component={component.itemTemplate} itemContext={item} />
                        ) : null
                    )}
                </div>
            );

        case 'card':
            return (
                <Card className="cursor-pointer hover:shadow-lg transition-shadow duration-200" onClick={handleClick}>
                    <CardHeader>
                        {title && <CardTitle>{title}</CardTitle>}
                        {description && <CardDescription>{description}</CardDescription>}
                    </CardHeader>
                    {(content || component.children) && (
                        <CardContent>
                            {content && <div>{content}</div>}
                            {component.children?.map((child, index) => (
                                <ComponentRenderer key={index} component={child} itemContext={itemContext} />
                            ))}
                        </CardContent>
                    )}
                </Card>
            );

        case 'dialog': {
            const modalId = component.id || 'default';
            const modalState = modals[modalId];
            const isOpen = modalState?.open || false;
            const modalData = modalState?.data;

            const dialogTitle = modalData?.title || title || 'Dialog';

            return (
                <Dialog
                    open={isOpen}
                    onOpenChange={(open) => {
                        if (!open) {
                            if (component.onOpenChange) {
                                dispatch(component.onOpenChange, itemContext);
                            }
                            closeModal(modalId);
                        }
                    }}
                >
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>{dialogTitle}</DialogTitle>
                            {description && <DialogDescription>{description}</DialogDescription>}
                        </DialogHeader>
                        <div className="py-4">
                            {content && <div>{content}</div>}
                            {component.children?.map((child, index) => (
                                <ComponentRenderer key={index} component={child} itemContext={modalData || itemContext} />
                            ))}
                        </div>
                    </DialogContent>
                </Dialog>
            );
        }

        case 'text':
            return <p className="text-sm">{value || content || ''}</p>;

        case 'button':
            return (
                <Button onClick={handleClick} className="w-full">
                    {title || value || 'Button'}
                </Button>
            );

        case 'container':
            return (
                <div className="space-y-4">
                    {component.children?.map((child, index) => (
                        <ComponentRenderer key={index} component={child} itemContext={itemContext} />
                    ))}
                </div>
            );

        default:
            console.warn('Unknown component type:', component.type);
            return null;
    }
}
