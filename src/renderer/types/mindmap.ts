// Core types for MindMapper application

/**************************************
 *           NODE APPEARANCE
 ************************************** */

export type NodeStatus = 'pending' | 'in-progress' | 'done';
export type BackgroundType = 'solid' | 'none';
export type BorderStyle = 'none' | 'bottom' | 'full';

export interface NodeStyle {
  backgroundColor: string;
  textColor: string;
  borderColor?: string;
  borderWidth?: number;
  borderRadius?: number;
  fontSize?: number;
  fontWeight?: 'normal' | 'bold';
  padding?: number;
  icon?: string;
  status?: NodeStatus;
  backgroundOpacity: number; // 0-100
  backgroundType: BackgroundType;
  borderStyle: BorderStyle;
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
 *           COLOR PALETTE
 ************************************** */

export const STANDARD_PALETTE: readonly string[][] = [
  // Row 0 — Neutrals
  ['#FFFFFF', '#F3F4F6', '#D1D5DB', '#9CA3AF', '#6B7280', '#374151', '#1F2937', '#111827'],
  // Row 1 — Blues & Teals
  ['#DBEAFE', '#93C5FD', '#60A5FA', '#3B82F6', '#2563EB', '#1D4ED8', '#14B8A6', '#0D9488'],
  // Row 2 — Greens & Limes
  ['#D1FAE5', '#6EE7B7', '#34D399', '#10B981', '#059669', '#047857', '#84CC16', '#65A30D'],
  // Row 3 — Reds, Oranges & Yellows
  ['#FEE2E2', '#FCA5A5', '#F87171', '#EF4444', '#DC2626', '#FBBF24', '#F59E0B', '#FB923C'],
  // Row 4 — Purples & Pinks
  ['#EDE9FE', '#C4B5FD', '#A78BFA', '#8B5CF6', '#7C3AED', '#EC4899', '#DB2777', '#BE185D'],
] as const;

export const ALL_STANDARD_COLORS:readonly string[] = STANDARD_PALETTE.flat();

export const DEFAULT_COLORS= STANDARD_PALETTE[1];   // Blues row



/**************************************
 *       USER COLOR PREFERENCES
 ************************************** */

export interface FavoriteColor {
  color: string;      // Hex string
  addedAt: number;    // Unix timestampt (ms)
  userId?: string;     // Per-user scoping - Future
}

export interface UserColorPreferences{
  favoriteColors: FavoriteColor[];
}

export const MAX_FAVORITE_COLORS = 10;



/**************************************
 *           DEFAULT STYLE
 ************************************** */

export const DEFAULT_NODE_STYLE: NodeStyle = {
  backgroundColor: '#60A5FA',
  textColor: '#FFFFFF',
  icon: undefined,
  status: 'pending',
  backgroundOpacity: 100,
  backgroundType: 'solid',
  borderStyle: 'full',
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