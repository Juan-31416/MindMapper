/**
 * Hierarchical (top-down) layout engine using Dagre.
 * Responsible only for computing node positions and connections.
 * Path generation is delegated to utils/edges/.
 */

import dagre from 'dagre';
import { MindMapNode, Position, Connection, PositionedNode, LayoutResult } from '../../types/mindmap';
import {
  NODE_WIDTH,
  NODE_HEIGHT,
  measureNodeDimensions,
  computeAllNodeDimensions,
  buildTreeFromNodes,
} from './shared';



const RANK_SEPARATION = 100;
const NODE_SEPARATION = 50;



// ─── Result type ──
export interface HierarchicalLayoutResult {
  nodePositions: Record<string, Position>;
  connections: Connection[];
  bounds: {
    minX: number;
    maxX: number;
    minY: number;
    maxY: number;
  };
}



// ─── Layout engine ──
/**
 * Computes a top-down hierarchical layout using Dagre.
  */

export const calculateHierarchicalLayout = (
  nodes: Record<string, MindMapNode>,
  rootNodeId: string,
  nodeDimensions?: Record<string, { width: number; height: number }>
): HierarchicalLayoutResult => {
  const g = new dagre.graphlib.Graph();

  g.setGraph({
    rankdir: 'TB',
    nodesep: NODE_SEPARATION,
    ranksep: RANK_SEPARATION,
    marginx: 50,
    marginy: 50,
  });

  g.setDefaultEdgeLabel(() => ({}));

  const visibleNodes = new Set<string>();
  const connections: Connection[] = [];

  const traverse = (nodeId: string) => {
    const node = nodes[nodeId];
    if (!node) return;

    visibleNodes.add(nodeId);

    const dims =
      nodeDimensions?.[nodeId] ??
      measureNodeDimensions(node.text, nodeId === rootNodeId);

    g.setNode(nodeId, { width: dims.width, height: dims.height });

    if (!node.collapsed && node.children.length > 0) {
      node.children
        .sort((a, b) => (nodes[a]?.order || 0) - (nodes[b]?.order || 0))
        .forEach(childId => {
          if (nodes[childId]) {
            g.setEdge(nodeId, childId);
            traverse(childId);
          }
        });
    }
  };

  traverse(rootNodeId);
  dagre.layout(g);



  // ── Extract positions ──
  const nodePositions: Record<string, Position> = {};
  let minX = Infinity, maxX = -Infinity;
  let minY = Infinity, maxY = -Infinity;

  visibleNodes.forEach(nodeId => {
    const node = g.node(nodeId);
    if (node) {
      nodePositions[nodeId] = { x: node.x, y: node.y };
      minX = Math.min(minX, node.x - NODE_WIDTH / 2);
      maxX = Math.max(maxX, node.x + NODE_WIDTH / 2);
      minY = Math.min(minY, node.y - NODE_HEIGHT / 2);
      maxY = Math.max(maxY, node.y + NODE_HEIGHT / 2);
    }
  });


  
  // ── Extract connections ──
  g.edges().forEach(edge => {
    const fromNode = g.node(edge.v);
    const toNode   = g.node(edge.w);

    if (fromNode && toNode) {
      connections.push({
        fromId:  edge.v,
        toId:    edge.w,
        fromPos: { x: fromNode.x, y: fromNode.y },
        toPos:   { x: toNode.x,   y: toNode.y   },
      });
    }
  });

  return {
    nodePositions,
    connections,
    bounds: { minX, maxX, minY, maxY },
  };
};



// ─── Adapter: HierarchicalLayoutResult → LayoutResult ──
/**
 * Converts the raw Dagre output to the unified LayoutResult format.
 * Path generation is intentionally left to the caller (CanvasEdges / edgePath.ts).
 */

export const hierarchicalToLayoutResult = (
  raw: HierarchicalLayoutResult,
  nodeDimensions: Record<string, { width: number; height: number }>,
  nodesMap: Record<string, MindMapNode>
): LayoutResult => {
  const nodes: Record<string, PositionedNode> = {};

  Object.entries(raw.nodePositions).forEach(([id, pos]) => {
    const dims = nodeDimensions[id] ?? { width: NODE_WIDTH, height: NODE_HEIGHT };
    nodes[id] = {
      id,
      x: pos.x,
      y: pos.y,
      width:  dims.width,
      height: dims.height,
      collapsed: nodesMap[id]?.collapsed || false,
    };
  });

  // Edges carry only topology here — paths are computed at render time
  const edges = raw.connections.map(conn => ({
    from: conn.fromId,
    to:   conn.toId,
    path: '', // populated by CanvasEdges using edgePath.ts
  }));

  return {
    nodes,
    edges,
    size: {
      width:  raw.bounds.maxX - raw.bounds.minX,
      height: raw.bounds.maxY - raw.bounds.minY,
    },
  };
};