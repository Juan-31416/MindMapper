// Core types for MindMapper application

/**************************************
 *           NODE APPEARANCE
 ************************************** */

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

/**************************************
 *       GEOMETRY & POSITION
 ************************************** */

export interface Position {
  x: number;
  y: number;
}

// Connection between nodes for rendering
export interface Connection {
  fromId: string;
  toId: string;
  fromPos: Position;
  toPos: Position;
}

/**************************************
 *        MIND MAP CORE MODEL
 ************************************** */

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

/**************************************
 *              ACTIONS
 ************************************** */

export type NodeAction =
  | { type: 'CREATE_NODE'; payload: { parentId: string | null; text: string; asSibling?: boolean } }
  | { type: 'DELETE_NODE'; payload: { nodeId: string } }
  | { type: 'UPDATE_NODE_TEXT'; payload: { nodeId: string; text: string } }
  | { type: 'UPDATE_NODE_STYLE'; payload: { nodeId: string; style: Partial<NodeStyle> } }
  | { type: 'MOVE_NODE'; payload: { nodeId: string; newParentId: string | null; order: number } }
  | { type: 'TOGGLE_COLLAPSE'; payload: { nodeId: string } }
  | { type: 'SELECT_NODE'; payload: { nodeId: string | null } };

/**************************************
 *          VIEWPORT STATE
 ************************************** */

export interface ViewportState {
  zoom: number;
  panX: number;
  panY: number;
}

/**************************************
 *           DEFAULT STYLE
 ************************************** */

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

export const DEFAULT_NODE_STYLE: NodeStyle = {
  backgroundColor: '#60A5FA',
  textColor: '#FFFFFF',
  icon: 'Circle',
  status: 'pending',
};

/**************************************
 *           LAYOUT TYPES
 ************************************** */

export type LayoutType = 'hierarchical' | 'radial';

export interface PositionedNode {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  collapsed?: boolean;
}

export interface PositionedEdge {
  from: string;
  to: string;
  path: string;
}

export interface LayoutResult {
  nodes: Record<string, PositionedNode>;
  edges: PositionedEdge[];
  size: { width: number; height: number };
}

export interface LayoutConfig {
  type: LayoutType;
  nodeWidth?: number;
  nodeHeight?: number;

  // Hierarchical specific
  rankSep?: number;
  nodeSep?: number;

  // Radial specific
  r0?: number;
  levelGap?: number;
  angleStart?: number;
}

// Generic hierarchical tree structure, used for both layouts
export interface TreeNode {
  id: string;
  children: TreeNode[];
  width?: number;
  height?: number;
  collapsed?: boolean;
  data?: MindMapNode;
}