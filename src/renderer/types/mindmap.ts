// Core types for MindMapper application

export type NodeStatus = 'pending' | 'in-progress' | 'done';

export interface NodeStyle {
  backgroundColor: string;
  textColor: string;
  borderColor?: string;
  borderWidth?: number;
  borderRadius?: number;
  fontSize?: number;
  fontWeight?: 'normal' | 'bold';
  padding?: number;
  icon?: string; // Emoji or Lucide icon name
  status?: NodeStatus;
}

export interface Position {
  x: number;
  y: number;
}

export interface MindMapNode {
  id: string;
  text: string;
  parentId: string | null;
  children: string[]; // Array of child node IDs
  style: NodeStyle;
  collapsed: boolean;
  position?: Position; // Calculated by layout algorithm
  order: number; // Order among siblings
}

export interface MindMap {
  id: string;
  name: string;
  rootNodeId: string;
  nodes: Record<string, MindMapNode>; // Map of id -> node
  createdAt: number;
  updatedAt: number;
}

// Actions
export type NodeAction =
  | { type: 'CREATE_NODE'; payload: { parentId: string | null; text: string; asSibling?: boolean } }
  | { type: 'DELETE_NODE'; payload: { nodeId: string } }
  | { type: 'UPDATE_NODE_TEXT'; payload: { nodeId: string; text: string } }
  | { type: 'UPDATE_NODE_STYLE'; payload: { nodeId: string; style: Partial<NodeStyle> } }
  | { type: 'MOVE_NODE'; payload: { nodeId: string; newParentId: string | null; order: number } }
  | { type: 'TOGGLE_COLLAPSE'; payload: { nodeId: string } }
  | { type: 'SELECT_NODE'; payload: { nodeId: string | null } };

// UI State
export interface ViewportState {
  zoom: number;
  panX: number;
  panY: number;
}

// Connection between nodes for rendering
export interface Connection {
  fromId: string;
  toId: string;
  fromPos: Position;
  toPos: Position;
}

// Default colors palette
export const DEFAULT_COLORS = [
  '#60A5FA', // blue
  '#34D399', // green
  '#FBBF24', // yellow
  '#F87171', // red
  '#A78BFA', // purple
  '#FB923C', // orange
  '#EC4899', // pink
  '#14B8A6', // teal
];

// Default styles
export const DEFAULT_NODE_STYLE: NodeStyle = {
  backgroundColor: '#60A5FA',
  textColor: '#FFFFFF',
  icon: 'Circle',
  status: 'pending',
};
