import dagre from 'dagre';
import { MindMapNode, Position, Connection } from '../types/mindmap';

const NODE_WIDTH = 200;
const NODE_HEIGHT = 60;
const RANK_SEPARATION = 100;
const NODE_SEPARATION = 50;

export interface LayoutResult {
  nodePositions: Record<string, Position>;
  connections: Connection[];
  bounds: {
    minX: number;
    maxX: number;
    minY: number;
    maxY: number;
  };
}

export const calculateLayout = (
  nodes: Record<string, MindMapNode>,
  rootNodeId: string
): LayoutResult => {
  const g = new dagre.graphlib.Graph();
  
  // Configure graph
  g.setGraph({
    rankdir: 'TB', // Top to Bottom
    nodesep: NODE_SEPARATION,
    ranksep: RANK_SEPARATION,
    marginx: 50,
    marginy: 50,
  });
  
  g.setDefaultEdgeLabel(() => ({}));
  
  // Helper to get visible nodes (not children of collapsed nodes)
  const visibleNodes = new Set<string>();
  const connections: Connection[] = [];
  
  const traverse = (nodeId: string) => {
    const node = nodes[nodeId];
    if (!node) return;
    
    visibleNodes.add(nodeId);
    
    // Add node to graph
    g.setNode(nodeId, { width: NODE_WIDTH, height: NODE_HEIGHT });
    
    // If not collapsed, process children
    const isCollapsed = node.collapsed === true; // Handle undefined as false
    if (!isCollapsed && node.children.length > 0) {
      node.children
        .sort((a, b) => (nodes[a]?.order || 0) - (nodes[b]?.order || 0))
        .forEach(childId => {
          if (nodes[childId]) {
            // Add edge
            g.setEdge(nodeId, childId);
            traverse(childId);
          }
        });
    }
  };
  
  traverse(rootNodeId);
  
  // Run layout algorithm
  dagre.layout(g);
  
  // Extract positions
  const nodePositions: Record<string, Position> = {};
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  
  visibleNodes.forEach(nodeId => {
    const node = g.node(nodeId);
    if (node) {
      const position = {
        x: node.x,
        y: node.y,
      };
      nodePositions[nodeId] = position;
      
      // Update bounds
      minX = Math.min(minX, position.x - NODE_WIDTH / 2);
      maxX = Math.max(maxX, position.x + NODE_WIDTH / 2);
      minY = Math.min(minY, position.y - NODE_HEIGHT / 2);
      maxY = Math.max(maxY, position.y + NODE_HEIGHT / 2);
    }
  });
  
  // Extract connections
  g.edges().forEach(edge => {
    const fromNode = g.node(edge.v);
    const toNode = g.node(edge.w);
    
    if (fromNode && toNode) {
      connections.push({
        fromId: edge.v,
        toId: edge.w,
        fromPos: { x: fromNode.x, y: fromNode.y },
        toPos: { x: toNode.x, y: toNode.y },
      });
    }
  });
  
  return {
    nodePositions,
    connections,
    bounds: { minX, maxX, minY, maxY },
  };
};

// Helper to calculate a smooth curved path between two points
export const calculateCurvedPath = (
  from: Position,
  to: Position,
  nodeHeight: number = NODE_HEIGHT
): string => {
  const startY = from.y + nodeHeight / 2;
  const endY = to.y - nodeHeight / 2;
  const midY = (startY + endY) / 2;
  
  return `M ${from.x} ${startY} 
          C ${from.x} ${midY}, 
            ${to.x} ${midY}, 
            ${to.x} ${endY}`;
};

export { NODE_WIDTH, NODE_HEIGHT };
