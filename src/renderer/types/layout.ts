import { LogType } from "vite";

// src/renderer/types/layout.ts
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
    size: {width: number; height: number };
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

export interface TreeNode {
    id: string;
    children: TreeNode[];
    width: number;
    height: number;
    collapsed?: boolean;
}