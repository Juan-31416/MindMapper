/**
 * Radial layout engine.
 * Computes node positions arranged in concentric rings around a central root.
 * Path generation is delegated to utils/edges/ — this module only outputs positions.
 */

import { 
  PositionedNode, 
  PositionedEdge, 
  LayoutResult, 
  TreeNode,
} from '../../types/mindmap';
import { 
  NODE_WIDTH, 
  NODE_HEIGHT,
  NODE_MARGIN_X,
  MAX_ANGLE_PER_NODE,
  MIN_RADIUS_ABSOLUTE,
} from './shared';



// ─── Types ───

export interface RadialConfig {
  r0?: number;
  levelGap?: number;
  angleStart?: number;
  nodeWidth: number;
  nodeHeight: number;
  nodeDimensions?: Record<string, { width: number; height: number }>;
}

interface NodeSector {
  radius: number;
  angleStart: number;
  angleEnd: number;
}

// ─── Constants ───

const TWO_PI = 2 * Math.PI;
const MIN_ANGLE = 0.01;       // rad



// ─── RadialLayout class ───
/**
 * Computes a radial layout for a mind map tree.
 *
 * Algorithm:
 *   1. Calculate subtree sizes (leaf count) for proportional angle distribution.
 *   2. Assign angular sectors to each node recursively.
 *   3. Position each node at (radius × cos(midAngle), radius × sin(midAngle)).
 *   4. Emit edges as topology only (paths computed at render time).
 */

export class RadialLayout {
  private r0: number;
  private levelGap: number;
  private angleStart: number;
  private nodeWidth: number;
  private nodeHeight: number;
  private nodeDimensions: Record<string, { width: number; height: number }>;
  private sectors: Map<string, NodeSector> = new Map();

  constructor(config: RadialConfig) {
    this.r0          = config.r0         ?? 180;
    this.levelGap    = config.levelGap   ?? 200;
    this.angleStart  = config.angleStart ?? -Math.PI / 2;
    this.nodeWidth   = config.nodeWidth;
    this.nodeHeight  = config.nodeHeight;
    this.nodeDimensions = config.nodeDimensions ?? {};
  }



  // ─── Public entry point ───

  layout(root: TreeNode): LayoutResult {
    this.sectors = new Map();
    this.assignSector(root, this.angleStart, this.angleStart + TWO_PI, 0);

    const nodes: Record<string, PositionedNode> = {};
    const edges: PositionedEdge[] = [];
    let minX = Infinity, maxX = -Infinity;
    let minY = Infinity, maxY = -Infinity;

    this.collectNodes(root, 0, nodes, edges, (x, y, w, h) => {
      minX = Math.min(minX, x - w / 2);
      maxX = Math.max(maxX, x + w / 2);
      minY = Math.min(minY, y - h / 2);
      maxY = Math.max(maxY, y + h / 2);
    });

    const padding = 120;
    const offsetX = -minX + padding;
    const offsetY = -minY + padding;

    Object.values(nodes).forEach(node => {
      node.x += offsetX;
      node.y += offsetY;
    });

    return {
      nodes,
      edges,
      size: {
        width:  maxX - minX + 2 * padding,
        height: maxY - minY + 2 * padding,
      },
    };
  }



  // ─── Sector assignment ───

  private assignSector(
    node: TreeNode,
    angleStart: number,
    angleEnd:   number,
    depth:      number
  ): void {
    const radius = depth === 0 ? 0 : this.computeRadius(node.children.length > 0 ? node : node, angleStart, angleEnd, depth);

    this.sectors.set(node.id, { angleStart, angleEnd, radius });

    if (node.collapsed || node.children.length === 0) return;

    const availableAngle = angleEnd - angleStart;
    const childAngles = this.distributeAngles(node.children, availableAngle, depth + 1, radius);

    let cursor = angleStart;
    for (let i = 0; i < node.children.length; i++) {
      this.assignSector(node.children[i], cursor, cursor + childAngles[i], depth + 1);
      cursor += childAngles[i];
    }
  }

  private computeRadius(
    node: TreeNode,
    angleStart: number,
    angleEnd:   number,
    depth:      number
  ): number {
    const baseRadius = this.r0 + (depth - 1) * this.levelGap;
    const dims       = this.getNodeDims(node.id);

    const nodeSize    = Math.max(dims.width, dims.height) + NODE_MARGIN_X * 2;
    
    const sectorAngle = Math.min(Math.max(angleEnd - angleStart, MIN_ANGLE), MAX_ANGLE_PER_NODE);

    const minRadius   = nodeSize / sectorAngle;

    return Math.max(baseRadius, minRadius, MIN_RADIUS_ABSOLUTE);
  }

  private distributeAngles(
    children: TreeNode[],
    availableAngle: number,
    depth: number,
    parentRadius: number
  ): number[] {
    const estimatedRadius = Math.max(
      parentRadius + this.levelGap,
      this.r0 + (depth - 1) * this.levelGap,
      MIN_RADIUS_ABSOLUTE
    );

    // Compute minimum angle for each child
    const minAngles = children.map(child => {
      const dims    = this.getNodeDims(child.id);
      const arcNeeeded   = Math.max(dims.width, dims.height) + NODE_MARGIN_X * 2;

      return Math.max(arcNeeeded / estimatedRadius, MIN_ANGLE);
    });

    const cappedMin = minAngles.map(a => Math.min(a, MAX_ANGLE_PER_NODE));
    const totalMin = minAngles.reduce((a, b) => a + b, 0);

    // If minimum angles already exceed available space, scale them down uniformly
    if (totalMin >= availableAngle) {
      const scale = availableAngle / totalMin;

      return cappedMin.map(a => a * scale);
    }

    // Distribute remaining angle proportionally to leaf count
    const remaining    = availableAngle - totalMin;
    const leafCounts   = children.map(c => this.countLeaves(c));
    const totalLeaves  = leafCounts.reduce((a, b) => a + b, 0) || 1;

    return children.map((_, i) => {
      const proportional = cappedMin[i] + (leafCounts[i] / totalLeaves) * remaining;

      return Math.min(proportional, MAX_ANGLE_PER_NODE);
    });
  }


  private countLeaves(node: TreeNode): number {
    if (node.collapsed || node.children.length === 0) return 1;
    
    return node.children.reduce((sum, child) => sum + this.countLeaves(child), 0);
  }



  // ─── Node positioning ───

  private collectNodes(
    node: TreeNode,
    depth: number,
    nodes: Record<string, PositionedNode>,
    edges: PositionedEdge[],
    updateBounds: (x: number, y: number, w: number, h: number) => void
  ): void {
    const sector = this.sectors.get(node.id);
    if (!sector) return;

    const midAngle = (sector.angleStart + sector.angleEnd) / 2;
    const x = sector.radius * Math.cos(midAngle);
    const y = sector.radius * Math.sin(midAngle);

    const dims = this.getNodeDims(node.id);

    nodes[node.id] = {
      id: node.id, 
      x, 
      y,
      width:     dims.width,
      height:    dims.height,
      collapsed: node.collapsed,
    };

    updateBounds(x, y, dims.width, dims.height);

    if (node.collapsed || node.children.length === 0) return;

    for (const child of node.children) {
      this.collectNodes(child, depth + 1, nodes, edges, updateBounds);

      if (nodes[child.id]) {
        edges.push({ from: node.id, to: child.id, path: '' });
      }
    }
  }



  // ─── Private helpers ───

  private getNodeDims(nodeId: string): { width: number; height: number } {
    return this.nodeDimensions[nodeId] ?? {
      width:  this.nodeWidth,
      height: this.nodeHeight,
    };
  }
}