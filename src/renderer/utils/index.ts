import { 
    LayoutType,
    LayoutResult,
    LayoutConfig,
    TreeNode,
    MindMapNode 
} from '../types/mindmap';

import { 
    calculateLayout,
    createLayout,
    buildTreeFromNodes,
    NODE_WIDTH,
    NODE_HEIGHT,
    RadialLayout
} from './layout/index';

import { calculateCurvedPath } from './edges/index';



// Re-export main functions
export {
  calculateLayout,
  createLayout,
  buildTreeFromNodes,
  calculateCurvedPath,
  NODE_WIDTH,
  NODE_HEIGHT,
  RadialLayout
};

// Re-export types
export type {
  LayoutType,
  LayoutResult,
  LayoutConfig,
  TreeNode
};



/***************************************
 *    ENHANCED UTILITY FUNCTIONS
 *************************************** */

// Build a TreeNode structure from an array of nodes

export function buildTreeFromNodeArray(
    nodes: any[],
    rootId: string,
    nodeWidth: number = NODE_WIDTH,
    nodeHeight: number = NODE_HEIGHT
): TreeNode {
    const nodeMap = new Map<string, any>();
    nodes.forEach(node => nodeMap.set(node.id, node));

    function buildNode(id: string): TreeNode {
        const node = nodeMap.get(id);
        if (!node) {
            throw new Error(`Node ${id} not found`);
        }

        const children: TreeNode[] = [];

        if (!node.collapsed && node.children && Array.isArray(node.children)) {
            for (const childId of node.children) {
                if (nodeMap.has(childId)) {
                    children.push(buildNode(childId));
                }
            }
        }
        return {
            id: node.id,
            children,
            width: nodeWidth,
            height: nodeHeight,
            collapsed: node.collapsed
        };
    }

    return buildNode(rootId);
}

// Quick layout creation with sensible defaults

export function quickLayout(
    nodes: Record<string, MindMapNode> | TreeNode,
    rootId: string,
    layoutType: LayoutType = 'hierarchical'
): LayoutResult {
    const config: LayoutConfig = {
        type: layoutType,
        nodeWidth: NODE_WIDTH,
        nodeHeight: NODE_HEIGHT,
        rankSep: 100,
        nodeSep: 50,
        r0: 100,
        levelGap: 150,
        angleStart: -Math.PI / 2,
    };

    if ('children' in nodes && 'id' in nodes) {
        return createLayout(nodes as TreeNode, config);
    }

    return calculateLayout(nodes as Record<string, MindMapNode>, rootId, config) as LayoutResult;
}

// Convert LayoutResult back to a simple position map

export function LayoutResultToPosition(
    result: LayoutResult
): Record<string, { x: number; y: number }> {
    const positions: Record<string, { x: number; y: number }> = {};
    Object.entries(result.nodes).forEach(([id, node]) => {
        positions[id] = { x: node.x, y: node.y };
    });
    return positions;
}

// Get layout bounds from LayoutResult
export function getLayoutBounds(result: LayoutResult): {
    minX: number;
    maxX: number;
    minY: number;
    maxY: number;
    width: number;
    height: number;
} {
    let minX = Infinity, maxX = -Infinity;
    let minY = Infinity, maxY = -Infinity;

    Object.values(result.nodes).forEach(node => {
        const halfWidth = node.width / 2;
        const halfHeight = node.height / 2;
        minX = Math.min(minX, node.x - halfWidth);
        maxX = Math.max(maxX, node.x + halfWidth);
        minY = Math.min(minY, node.y - halfHeight);
        maxY = Math.max(maxY, node.y + halfHeight);
    });

    return { minX, maxX, minY, maxY, width: maxX - minX, height: maxY - minY };
}

// Center layout result at origin (0, 0)
export function centerLayout(result: LayoutResult): LayoutResult {
    const bounds = getLayoutBounds(result);
    const centerX = (bounds.minX + bounds.maxX) / 2;
    const centerY = (bounds.minY + bounds.maxY) / 2;

    const centeredNodes: Record<string, typeof result.nodes[string]> = {};
    Object.entries(result.nodes).forEach(([id, node]) => {
        centeredNodes[id] = { ...node, x: node.x - centerX, y: node.y - centerY };
    });

    const centeredEdges = result.edges.map(edge => {
        const fromNode = centeredNodes[edge.from];
        const toNode = centeredNodes[edge.to];
        if (!fromNode || !toNode) return edge;
        return {
            ...edge,
            path: calculateCurvedPath(
                { x: fromNode.x, y: fromNode.y },
                { x: toNode.x, y: toNode.y }
            )
        };
    });

    return { nodes: centeredNodes, edges: centeredEdges, size: result.size };
}

// Apply layout with animation-ready data
export function applyLayoutWithTransition(
    nodes: Record<string, MindMapNode>,
    rootId: string,
    layoutType: LayoutType,
    previousLayout?: LayoutResult
): {
    current: LayoutResult;
    previous: Record<string, { x: number; y: number }> | null;
} {
    const current = quickLayout(nodes, rootId, layoutType);
    const previous = previousLayout ? LayoutResultToPosition(previousLayout) : null;
    return { current, previous };
}