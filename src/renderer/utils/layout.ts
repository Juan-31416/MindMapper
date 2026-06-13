import dagre from 'dagre';
import { MindMapNode, Position, Connection } from '../types/mindmap';
import { PositionedNode, PositionedEdge, LayoutResult, TreeNode, LayoutType } from '../types/mindmap';
//import { buildTreeFromNodes } from '.';


export const NODE_WIDTH = 200;
export const NODE_HEIGHT = 60;
const RANK_SEPARATION = 100;
const NODE_SEPARATION = 50;
const FONT_SIZE = 13;          // px — must match Canvas CSS
const FONT_FAMILY = 'Inter, system-ui, sans-serif';
const LINE_HEIGHT = 20;        // px per line
const PADDING_H = 44;          // horizontal padding (icon + margins)
const PADDING_V = 20;          // vertical padding (top + bottom)
const NODE_MIN_WIDTH = 160;    // px
const NODE_MAX_WIDTH = 300;    // px — children
const ROOT_MAX_WIDTH = 320;    // px — root node

/** -----------------------------------
 *      NODE DIMENSION MEASUREMENT
 * ------------------------------------ */

export const measureNodeDimensions = (
  text: string,
  isRoot = false
): { width: number; height: number } => {
  const maxWidth = isRoot ? ROOT_MAX_WIDTH : NODE_MAX_WIDTH;

  // Measure text using Canvas 2D API (available in both Electron renderer and browser)
  let ctx: CanvasRenderingContext2D | null = null;
  try {
    const canvas = document.createElement('canvas');
    ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.font = `${isRoot ? 'bold ' : ''}${FONT_SIZE}px ${FONT_FAMILY}`;
    }
  } catch {
    // Fallback: estimate based on character count
  }

  const availableWidth = maxWidth - PADDING_H;

  // Word-wrap simulation: split text into lines respecting availableWidth
  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = '';

  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    const testWidth = ctx
      ? ctx.measureText(testLine).width
      : testLine.length * (FONT_SIZE * 0.6); // fallback: ~0.6px per char

    if (testWidth > availableWidth && currentLine) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  }
  if (currentLine) lines.push(currentLine);

  // Calculate actual content width (widest line)
  let contentWidth = 0;
  for (const line of lines) {
    const lineWidth = ctx
      ? ctx.measureText(line).width
      : line.length * (FONT_SIZE * 0.6);
    contentWidth = Math.max(contentWidth, lineWidth);
  }

  const width = Math.min(
    Math.max(contentWidth + PADDING_H, NODE_MIN_WIDTH),
    maxWidth
  );
  const height = lines.length * LINE_HEIGHT + PADDING_V;

  return { width, height };
};

/**
 * Pre-computes dimensions for all visible nodes in a map.
 * Returns a Record<nodeId, {width, height}> to be passed to the layout engine.
 */
export const computeAllNodeDimensions = (
  nodes: Record<string, MindMapNode>,
  rootNodeId: string
): Record<string, { width: number; height: number }> => {
  const dimensions: Record<string, { width: number; height: number }> = {};

  const traverse = (nodeId: string) => {
    const node = nodes[nodeId];
    if (!node) return;

    dimensions[nodeId] = measureNodeDimensions(node.text, nodeId === rootNodeId);

    if (!node.collapsed) {
      node.children.forEach(childId => traverse(childId));
    }
  };

  traverse(rootNodeId);
  return dimensions;
};


/** -----------------------------------
 *           HIERARCHICAL LAYOUT
 * ------------------------------------ */

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

export const calculateHierarchicalLayout = (
  nodes: Record<string, MindMapNode>,
  rootNodeId: string,
  nodeDimensions?: Record<string, { width: number, height: number }>
): HierarchicalLayoutResult => {
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
    
    // Use pre-computed dimensions if available, else, measure on the fly
    const dims = nodeDimensions?.[nodeId] ?? measureNodeDimensions(node.text, nodeId === rootNodeId);

    // Add node to graph
    g.setNode(nodeId, { width: dims.width, height: dims.height });
    
    // If not collapsed, process children
    const isCollapsed = node.collapsed === true;
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




/** -----------------------------------
 *           RADIAL LAYOUT
 * ------------------------------------ */

interface RadialConfig {
  r0?: number;
  levelGap?: number;
  angleStart?: number;
  nodeWidth: number;
  nodeHeight: number;
}

interface SubtreeInfo {
  size: number;
  angleStart: number;
  angleEnd: number;
}

export class RadialLayout {
  private r0: number;
  private levelGap: number;
  private angleStart: number;
  private nodeWidth: number;
  private nodeHeight: number;
  private subtreeSizes: Map<string, number>;
  private subtreeAngles: Map<string, SubtreeInfo>;
  private nodeDimensions: Record<string, { width: number; height: number }>;

  constructor(config: RadialConfig & {
    nodeDimensions?:Record<string, { width: number; height: number }>;
  }){
    this.r0 = config.r0 ?? 100;
    this.levelGap = config.levelGap ?? 150;
    this.angleStart = config.angleStart ?? -Math.PI / 2;
    this.nodeWidth = config.nodeWidth;
    this.nodeHeight = config.nodeHeight;
    this.subtreeSizes = new Map();
    this.subtreeAngles = new Map();
    this.nodeDimensions = config.nodeDimensions ?? {};
  }

  private getNodeDims(nodeId: string):{ width: number; height: number }{
    return this.nodeDimensions[nodeId] ??{
      width: this.nodeWidth,
      height: this.nodeHeight,
    };
  }

  layout(root: TreeNode): LayoutResult {
    // Step1: Calculate subtree dimensions
    this.calculateSubtreeSizes(root);
  
    // Step 2: Assign angles
    this.assignAngles(root, this.angleStart, this.angleStart + 2 * Math.PI, 0);

    // Step 3: Calculate positions
    const nodes: Record<string, PositionedNode> = {};
    const edges: PositionedEdge[] = [];
    let minX = Infinity, maxX = -Infinity;
    let minY = Infinity, maxY = -Infinity;

    this.positionNodes(root, 0, nodes, edges, (x, y) => {
      minX = Math.min(minX, x);
      maxX = Math.max(maxX, x);
      minY = Math.min(minY, y);
      maxY = Math.max(maxY, y);
    });

    // Calculate canvas dimensions
    const padding = 100;
    const width = maxX - minX + this.nodeWidth + 2 * padding;
    const height = maxY - minY + this.nodeHeight + 2 * padding;

    // Adjust positions to center
    const offsetX = -minX + padding;
    const offsetY = -minY + padding;

    Object.values(nodes).forEach(node => {
      node.x += offsetX;
      node.y += offsetY;
    });

    // Recalculate edges with new positions
    const adjustedEdges = this.recalculateEdges(edges, nodes);

    return {
      nodes,
      edges: adjustedEdges,
      size: { width, height }
    };
  }

  private calculateSubtreeSizes(node: TreeNode): number {
    if (node.collapsed || node.children.length === 0) {
      this.subtreeSizes.set(node.id, 1);
      return 1;
    }

    let totalSize = 1;
    for (const child of node.children) {
      totalSize += this.calculateSubtreeSizes(child);
    }

    this.subtreeSizes.set(node.id, totalSize);
    return totalSize;
  }

  private assignAngles(
    node: TreeNode,
    angleStart: number,
    angleEnd: number,
    depth: number,
  ): void {
    this.subtreeAngles.set(node.id, {
      size: this.subtreeSizes.get(node.id) ?? 1,
      angleStart,
      angleEnd
    });

    if (node.collapsed || node.children.length === 0) {
      return;
    }

    // Distribute angles proportionally with children
    const totalSize = this.subtreeSizes.get(node.id) ?? 1;
    const availableAngle = angleEnd - angleStart;

    let currentAngle = angleStart;

    for (const child of node.children) {
      const childSize = this.subtreeSizes.get(child.id) ?? 1;
      const childAngleSpan = (childSize / totalSize) * availableAngle;
      const childAngleEnd = currentAngle + childAngleSpan;

      this.assignAngles(child, currentAngle, childAngleEnd, depth + 1);
      currentAngle = childAngleEnd;
    }
  }

  private positionNodes(
    node: TreeNode,
    depth: number,
    nodes: Record<string, PositionedNode>,
    edges: PositionedEdge[],
    updateBounds: (x: number, y: number) => void
  ): void {
    const info = this.subtreeAngles.get(node.id);
    if (!info) return;

    const midAngle = (info.angleStart + info.angleEnd) / 2;
    const radius = depth === 0 ? 0 : this.r0 + depth * this.levelGap;

    const x = radius * Math.cos(midAngle);
    const y = radius * Math.sin(midAngle);

    const dims =this.getNodeDims(node.id);

    nodes[node.id] = {
      id: node.id,
      x,
      y,
      width: dims.width,
      height: dims.height,
      collapsed: node.collapsed
    };

    updateBounds(x - dims.width / 2, y - dims.height / 2);
    updateBounds(x + dims.width / 2, y + dims.height / 2);

    if (node.collapsed || node.children.length === 0) {
      return;
    }

    for (const child of node.children) {
      this.positionNodes(child, depth + 1, nodes, edges, updateBounds);

      const childNode = nodes[child.id];
      if (childNode) {
        edges.push({
          from: node.id,
          to: child.id,
          path: this.calculateRadialPath(x, y, childNode.x, childNode.y)
        });
      }
    }
  }

  private calculateRadialPath(x1: number, y1: number, x2: number, y2: number): string {
    // Smooth curved path for radial layout
    const dx = x2 - x1;
    const dy = y2 - y1;
    const distance = Math.sqrt(dx * dx + dy * dy);

    const controlDistance = distance * 0.4;
    const angle = Math.atan2(dy, dx);

    const cx1 = x1 + controlDistance * Math.cos(angle);
    const cy1 = y1 + controlDistance * Math.sin(angle);
    const cx2 = x2 - controlDistance * Math.cos(angle);
    const cy2 = y2 - controlDistance * Math.sin(angle);

    return `M ${x1} ${y1} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${x2} ${y2}`;
  }

  private recalculateEdges(
    edges: PositionedEdge[],
    nodes: Record<string, PositionedNode>
  ): PositionedEdge[] {
    return edges.map(edge => {
      const fromNode = nodes[edge.from];
      const toNode = nodes[edge.to];

      if (!fromNode || !toNode) return edge;

      return {
        ...edge,
        path: this.calculateRadialPath(
          fromNode.x,
          fromNode.y,
          toNode.x,
          toNode.y
        )
      };
    });
  }
}

/****************************************
 *      UNIFIED LAYOUT INTERFACE
 **************************************** */

export interface UnifiedLayoutConfig {
  type: LayoutType;
  nodeWidth?: number;
  nodeHeight?: number;

  // Radial sècific
  r0?: number;
  levelGap?: number;
  angleStart?: number;

  // Hierarchical specific
  rankSep?: number;
  nodeSep?: number;
}

// main layout function that handles both hierrarchical and radial layouts
export const calculateLayout = (
  nodes: Record<string, MindMapNode> | TreeNode,
  rootNodeId: string,
  config?: UnifiedLayoutConfig
): HierarchicalLayoutResult | LayoutResult => {
  const LayoutType = config?.type || 'hierarchical';

  if (LayoutType === 'radial') {
    // Conver to TreeNode if needed
    let tree: TreeNode;
    if ('children' in nodes && 'id' in nodes) {
      tree = nodes as TreeNode;
    } else {
      tree = buildTreeFromNodes(nodes as Record<string, MindMapNode>, rootNodeId);
    }

    const radialLayout = new RadialLayout({
      nodeWidth: config?.nodeWidth || NODE_WIDTH,
      nodeHeight: config?.nodeHeight || NODE_HEIGHT,
      r0: config?.r0,
      levelGap: config?.levelGap,
      angleStart: config?.angleStart,
    });

    return radialLayout.layout(tree)
  } else {
    //Hierarchical layout
    return calculateHierarchicalLayout(
      nodes as Record<string, MindMapNode>, rootNodeId
    );
  }
};

/*****************************************
 *          UTILITY FUNCTIONS
 ***************************************** */

// Build a TreeNode structuerfrom MindMapNode dictionary
export const buildTreeFromNodes = (
  nodes: Record<string, MindMapNode>,
  rootId: string
): TreeNode => {
  const buildNode = (nodeId: string): TreeNode => {
    const node = nodes[nodeId];
    if(!node) {
      throw new Error('Node ${nodeId} not found');
    }

    const children: TreeNode [] = [];
    if (!node.collapsed && node.children.length > 0) {
      for (const childId of node.children) {
        if (nodes[childId]) {
          children.push(buildNode(childId));
        }
      }
    }

    return {
      id: nodeId,
      children,
      collapsed: node.collapsed || false,
      data: node
    };
  };

  return buildNode(rootId);
};

// Calculate a smooth curved path between two points (hierarchical layout)
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


// Create layout with undefined interface (for compatibility)
export const createLayout = (
  tree: TreeNode,
  config: UnifiedLayoutConfig
): LayoutResult => {
  // -- Step 0: flatten tree back to nodes map for dimension computation --
  const nodesMap: Record<string, MindMapNode> = {};
  const flatten = (node: TreeNode) => {
    if (node.data) nodesMap[node.id] =node.data;
    node.children.forEach(child => flatten(child));
  };
  flatten(tree);

  // --Step 1: compute all dimensions in a single pass --
  const nodeDimensions = computeAllNodeDimensions(nodesMap, tree.id);

  if (config.type === 'radial') {
    const radialLayout = new RadialLayout({
      nodeWidth: config.nodeWidth || NODE_WIDTH,
      nodeHeight: config.nodeHeight || NODE_HEIGHT,
      r0: config.r0,
      levelGap: config.levelGap,
      angleStart: config.angleStart,
      nodeDimensions,
    });

    return radialLayout.layout(tree);
  } else {
    // -- Hierarchical --
    const result = calculateHierarchicalLayout(nodesMap, tree.id, nodeDimensions);

    // Convert to LayoutResult format
    return {
      nodes: Object.entries(result.nodePositions).reduce((acc, [id, pos]) => {
        const dims = nodeDimensions[id] ?? { width: NODE_WIDTH,height: NODE_HEIGHT };
        acc[id] = {
          id,
          x: pos.x,
          y: pos.y,
          width: dims.width,
          height: dims.height,
          collapsed: nodesMap[id]?.collapsed || false
        };
        return acc;
      }, {} as Record<string, PositionedNode>),
      edges: result.connections.map(conn => ({
        from: conn.fromId,
        to: conn.toId,
        path: calculateCurvedPath(conn.fromPos, conn.toPos)
      })),
      size: {
        width: result.bounds.maxX - result.bounds.minX,
        height: result.bounds.maxY - result.bounds.minY
      }
    };
  }
};
