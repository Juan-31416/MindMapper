/**
 * Unified public API for all layout engines.
 * Consumers should import from here, never from individual engine files.
 */

import { MindMapNode, LayoutResult, TreeNode } from '../../types/mindmap';
import {
  NODE_WIDTH,
  NODE_HEIGHT,
  measureNodeDimensions,
  computeAllNodeDimensions,
  buildTreeFromNodes,
} from './shared';
import {
  calculateHierarchicalLayout,
  hierarchicalToLayoutResult,
  HierarchicalLayoutResult,
} from './hierarchical';
import { RadialLayout, RadialConfig } from './radial';

export type { HierarchicalLayoutResult, RadialConfig };
export {
  NODE_WIDTH,
  NODE_HEIGHT,
  measureNodeDimensions,
  computeAllNodeDimensions,
  buildTreeFromNodes,
  calculateHierarchicalLayout,
  hierarchicalToLayoutResult,
  RadialLayout,
};



// ─── Unified layout config ───
export interface UnifiedLayoutConfig {
  type: 'hierarchical' | 'radial';
  nodeWidth?:  number;
  nodeHeight?: number;
  // Radial
  r0?:         number;
  levelGap?:   number;
  angleStart?: number;
  // Hierarchical
  rankSep?: number;
  nodeSep?: number;
}



// ─── createLayout ───
/**
 * Main entry point used by Canvas.tsx.
 * Accepts a pre-built TreeNode and returns a unified LayoutResult.
 * Path generation is NOT performed here — delegated to CanvasEdges.
 */

export const createLayout = (
  tree: TreeNode,
  config: UnifiedLayoutConfig
): LayoutResult => {
  const nodesMap: Record<string, MindMapNode> = {};
  const flatten = (node: TreeNode) => {
    if (node.data) nodesMap[node.id] = node.data;
    node.children.forEach(child => flatten(child));
  };
  flatten(tree);

  const nodeDimensions = computeAllNodeDimensions(nodesMap, tree.id);

  if (config.type === 'radial') {
    const radialLayout = new RadialLayout({
      nodeWidth:      config.nodeWidth  ?? NODE_WIDTH,
      nodeHeight:     config.nodeHeight ?? NODE_HEIGHT,
      r0:             config.r0,
      levelGap:       config.levelGap,
      angleStart:     config.angleStart,
      nodeDimensions,
    });

    return radialLayout.layout(tree);
  } else {
    const raw = calculateHierarchicalLayout(nodesMap, tree.id, nodeDimensions);
    
    return hierarchicalToLayoutResult(raw, nodeDimensions, nodesMap);
  }
};



// ─── Legacy compatibility shim ───
// Kept so that any existing import of calculateLayout still compiles.
// Will be removed in a future cleanup pass.

export const calculateLayout = (
  nodes: Record<string, MindMapNode> | TreeNode,
  rootNodeId: string,
  config?: UnifiedLayoutConfig
): LayoutResult => {
  let tree: TreeNode;

  if ('children' in nodes && 'id' in nodes) {
    tree = nodes as TreeNode;
  } else {
    tree = buildTreeFromNodes(nodes as Record<string, MindMapNode>, rootNodeId);
  }

  return createLayout(tree, config ?? { type: 'hierarchical' });
};