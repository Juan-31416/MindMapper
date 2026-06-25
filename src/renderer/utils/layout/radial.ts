/**
 * Radial layout engine.
 * Computes node positions arranged in concentric rings around a central root.
 * Path generation is delegated to utils/edges/ — this module only outputs positions.
 */

import { PositionedNode, PositionedEdge, LayoutResult, TreeNode } from '../../types/mindmap';
import { NODE_WIDTH, NODE_HEIGHT } from './shared';



// ─── Types ───
export interface RadialConfig {
  r0?: number;
  levelGap?: number;
  angleStart?: number;
  nodeWidth: number;
  nodeHeight: number;
  nodeDimensions?: Record<string, { width: number; height: number }>;
}

interface SubtreeInfo {
  size: number;
  angleStart: number;
  angleEnd: number;
}



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
  private subtreeSizes: Map<string, number>;
  private subtreeAngles: Map<string, SubtreeInfo>;
  private nodeDimensions: Record<string, { width: number; height: number }>;

  constructor(config: RadialConfig) {
    this.r0          = config.r0         ?? 100;
    this.levelGap    = config.levelGap   ?? 150;
    this.angleStart  = config.angleStart ?? -Math.PI / 2;
    this.nodeWidth   = config.nodeWidth;
    this.nodeHeight  = config.nodeHeight;
    this.subtreeSizes  = new Map();
    this.subtreeAngles = new Map();
    this.nodeDimensions = config.nodeDimensions ?? {};
  }



  // ─── Public entry point ───
  layout(root: TreeNode): LayoutResult {
    this.calculateSubtreeSizes(root);
    this.assignAngles(root, this.angleStart, this.angleStart + 2 * Math.PI, 0);

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

    const padding = 100;
    const offsetX = -minX + padding;
    const offsetY = -minY + padding;

    Object.values(nodes).forEach(node => {
      node.x += offsetX;
      node.y += offsetY;
    });

    // Edges carry topology only — paths are computed at render time by CanvasEdges
    const adjustedEdges: PositionedEdge[] = edges.map(edge => ({
      ...edge,
      path: '',
    }));

    const width  = maxX - minX + this.nodeWidth  + 2 * padding;
    const height = maxY - minY + this.nodeHeight + 2 * padding;

    return {
      nodes,
      edges: adjustedEdges,
      size: { width, height },
    };
  }

  // ─── Private helpers ───

  private getNodeDims(nodeId: string): { width: number; height: number } {
    return this.nodeDimensions[nodeId] ?? {
      width:  this.nodeWidth,
      height: this.nodeHeight,
    };
  }

  /**
   * Counts the number of leaf nodes in each subtree.
   * Used to distribute angular sectors proportionally.
   */
  private calculateSubtreeSizes(node: TreeNode): number {
    if (node.collapsed || node.children.length === 0) {
      this.subtreeSizes.set(node.id, 1);
      return 1;
    }

    let totalSize = 0;
    for (const child of node.children) {
      totalSize += this.calculateSubtreeSizes(child);
    }

    this.subtreeSizes.set(node.id, totalSize);
    return totalSize;
  }

  /**
   * Recursively assigns angular sectors [angleStart, angleEnd] to each node.
   * Each child receives a sector proportional to its subtree size.
   */
  private assignAngles(
    node: TreeNode,
    angleStart: number,
    angleEnd: number,
    depth: number
  ): void {
    this.subtreeAngles.set(node.id, {
      size: this.subtreeSizes.get(node.id) ?? 1,
      angleStart,
      angleEnd,
    });

    if (node.collapsed || node.children.length === 0) return;

    const totalSize      = this.subtreeSizes.get(node.id) ?? 1;
    const availableAngle = angleEnd - angleStart;
    let currentAngle     = angleStart;

    for (const child of node.children) {
      const childSize      = this.subtreeSizes.get(child.id) ?? 1;
      const childAngleSpan = (childSize / totalSize) * availableAngle;
      const childAngleEnd  = currentAngle + childAngleSpan;

      this.assignAngles(child, currentAngle, childAngleEnd, depth + 1);
      currentAngle = childAngleEnd;
    }
  }

  /**
   * Computes (x, y) for each node and emits topology-only edges.
   */
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
    const radius   = depth === 0 ? 0 : this.r0 + depth * this.levelGap;

    const x = radius * Math.cos(midAngle);
    const y = radius * Math.sin(midAngle);

    const dims = this.getNodeDims(node.id);

    nodes[node.id] = {
      id: node.id,
      x,
      y,
      width:     dims.width,
      height:    dims.height,
      collapsed: node.collapsed,
    };

    updateBounds(x - dims.width  / 2, y - dims.height / 2);
    updateBounds(x + dims.width  / 2, y + dims.height / 2);

    if (node.collapsed || node.children.length === 0) return;

    for (const child of node.children) {
      this.positionNodes(child, depth + 1, nodes, edges, updateBounds);

      if (nodes[child.id]) {
        edges.push({
          from: node.id,
          to:   child.id,
          path: '',
        });
      }
    }
  }
}