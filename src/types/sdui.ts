/**
 * SDUI (Server-Driven UI) Type Definitions
 * A2UI-style JSON schema for dynamic UI generation
 */

export type SDUIRef = {
  $ref: string; // e.g., "context.cards", "item.title", "state.selectedId"
};

export type SDUIValue = string | number | boolean | null | SDUIRef | SDUIValue[] | { [key: string]: SDUIValue };

export interface SDUIAction {
  capability: 'modal.open' | 'modal.close' | 'state.set' | 'data.fetch';
  payload: Record<string, SDUIValue>;
}

export interface SDUIComponent {
  type: 'page' | 'card' | 'cardList' | 'dialog' | 'text' | 'button' | 'container';
  id?: string;
  
  // Component-specific props
  title?: SDUIValue;
  description?: SDUIValue;
  content?: SDUIValue;
  value?: SDUIValue;
  open?: SDUIValue;
  
  // List rendering
  items?: SDUIValue; // Array or $ref to array
  itemTemplate?: SDUIComponent;
  
  // Event handlers
  onClick?: SDUIAction[];
  onOpenChange?: SDUIAction[];
  
  // Children
  children?: SDUIComponent[];
  body?: SDUIComponent[];
}

export interface SDUIPage extends SDUIComponent {
  type: 'page';
  state?: Record<string, SDUIValue>;
  context?: Record<string, SDUIValue>;
  body: SDUIComponent[];
}

// RAG Document Types for Qdrant
export interface ComponentSpec {
  type: 'component_spec';
  key: string; // e.g., "Dialog", "Card"
  library: string; // e.g., "shadcn/ui"
  doc?: string; // documentation URL
  props?: string[]; // supported props
  subcomponents?: string[];
  tags: string[];
}

export interface CapabilityManifest {
  type: 'capability_manifest';
  key: string; // e.g., "modal.open"
  version: string;
  platform: string[];
  renderer: string[];
  description: string;
  payload_schema: {
    type: 'object';
    required?: string[];
    properties: Record<string, any>;
  };
  tags: string[];
}

export interface InteractionExample {
  type: 'interaction_example';
  intent: string;
  summary: string;
  required_capabilities: string[];
  required_components?: string[];
  a2ui_json: SDUIPage;
  tags: string[];
}

export type RAGDocument = ComponentSpec | CapabilityManifest | InteractionExample;
