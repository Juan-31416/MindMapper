// src/renderer/utils/layout/index.ts

import { LayoutType, LayoutResult, LayoutConfig, TreeNode } from '../../types/layout';
import { createRadialLayout } from './radial'
import { createHierarchicalLayout } from './hierarchical';

export function createLayout(
    root: TreeNode,
    config: LayoutConfig
): LayoutResult {
    const nodeWidth = config.nodeWidth ?? 200;
    const nodeHeight = config.nodeHeight ?? 80;

    switch (config.type) {
        case 'radial':
            return createRadialLayout(root, {
                r0: config.r0 ?? 100,
                levelGap:  config.levelGap ?? 150,
                angleStart: config.angleStart ?? - Math.PI / 2,
                nodeWidth,
                nodeHeight
            });

        case 'hierarchical':
            return createHierarchicalLayout(root, {
                rankSep: config.rankSep ?? 150,
                nodeSep: config.nodeSep ?? 50,
                nodeWidth,
                nodeHeight
            });

        default:
            throw new Error('Unknown layout type: ${config.type}');
    }
}

// Helfer to convert data structure to TreeNode
export function buildTreeFromNodes(
    nodes: any[], // Your actual node structure
    rootId: string,
    nodeWidth: number = 200,
    nodeHeight: number = 80
): TreeNode {
    const nodeMap = new Map<string, any>();
    nodes.forEach(node => nodeMap.set(node.id, node));

    function buildNode(id: string): TreeNode {
        const node = nodeMap.get(id);
        if (!node) {
            throw new Error('Node ${id} not found');
        }

        const children: TreeNode[] = [];
        if (!node.collapsed && node.children) {
            children.push(buildNode(childId));
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