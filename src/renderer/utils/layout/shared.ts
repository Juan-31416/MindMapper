/**
 * Shared constants, types, and utilities used by all layout engines.
 * No layout algorithm logic lives here — only primitives.
 */

import { MindMapNode, LayoutType, LayoutResult, LayoutConfig, TreeNode } from '../../types/mindmap';
export type { LayoutType, LayoutResult, LayoutConfig, TreeNode };



// ─── Node dimension constants ──
export const NODE_WIDTH     = 200;
export const NODE_HEIGHT    = 60;
export const FONT_SIZE      = 13;       // px — must match Canvas CSS
export const FONT_FAMILY    = 'Inter, system-ui, sans-serif';
export const LINE_HEIGHT    = 20;       // px per line
export const PADDING_H      = 44;       // horizontal padding (icon + margins)
export const PADDING_V      = 20;       // vertical padding (top + bottom)
export const NODE_MIN_WIDTH = 160;      // px
export const NODE_MAX_WIDTH = 300;      // px — regular nodes
export const ROOT_MAX_WIDTH = 320;      // px — root node
export const NODE_MARGIN_X = 20;        // px — horizontal gap between nodes
export const NODE_MARGIN_Y = 16;        // px — vertical gap between nodes


// ─── Node dimension measurement ──
/**
 * Measures the rendered dimensions of a node based on its text content.
 * Uses Canvas 2D API for accurate text measurement.
 */

export const measureNodeDimensions = (
  text: string,
  isRoot = false
): { width: number; height: number } => {
  const maxWidth = isRoot ? ROOT_MAX_WIDTH : NODE_MAX_WIDTH;

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

  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = '';

  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    const testWidth = ctx
      ? ctx.measureText(testLine).width
      : testLine.length * (FONT_SIZE * 0.6);

    if (testWidth > availableWidth && currentLine) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  }
  if (currentLine) lines.push(currentLine);

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
 * Traverses only non-collapsed subtrees.
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



// ─── Tree builder ──
/**
 * Builds a TreeNode structure from a flat MindMapNode dictionary.
 * Respects collapsed state — collapsed nodes have no children in the tree.
 */

export const buildTreeFromNodes = (
  nodes: Record<string, MindMapNode>,
  rootId: string
): TreeNode => {
  const buildNode = (nodeId: string): TreeNode => {
    const node = nodes[nodeId];
    if (!node) {
      throw new Error(`Node ${nodeId} not found`);
    }

    const children: TreeNode[] = [];
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
      data: node,
    };
  };

  return buildNode(rootId);
};