/**
 * Pure adapters between AI types (AiMindMap) and internal types (MindMap).
 * 
 * Pure functions that:
 * - Convert AiMindMap → MindMap (assign IDs, positions, styles)
 * - Convert MindMap → AiMindMap (simplify, remove layout/visual)
 */

import { AiMindMap, AiMindMapNode } from "../../types/ai/aiMindmap";
import { MindMap, MindMapNode, Edge, DEFAULT_NODE_STYLE } from "../../types/mindmap";
import { nonoid } from "nanoid";

/**
 * Convert an AiMindMap to an internal MindMap.
 *
 * Assign:
 * - IDs if missing
 * - Initial positions (simple automatic layout)
 * - Default styles
 * - Edges based on parentId
 */

export function aiMindMapToMinMap(ai: AiMindMap): MindMap {
    const nodesRecord: Record<string, MindMapNode> = {};
    let rootNodeId = ai.rootNodeId;

    const idMap = new Map<string, string>();

    // 1st stet: Create nodes
    for (const aiNode of ai.nodes) {
        const internalId = aiNode.id || nanoid();
        idMap.set(aiNode.id, internalId);

        const parentId = aiNode.parentId ?? null;

        const node: MindMapNode = {
            id: internalId,
            text: aiNode.label,
            parentId: parentId ? idMap.get(parentId) ?? parentId : null,
            children: [], // Se llenará después
            style: { ...DEFAULT_NODE_STYLE },
            collapsed: false,
            order: aiNode.order ?? 0,
            position: undefined
        };

        nodesRecord[internalId] = node;
    }

    // 2nd step: create edges based on parentId
    for (const aiNode of ai.nodes) {
        const internalId = idMap.get(aiNode.id);
        if (!internalId) continue;

        const node = nodesRecord[internalId];
        if (!node) continue;

        if (node.parentId) {
            const parent = nodesRecord[node.parentId];
            if (parent) {
                parent.children.push(internalId);
            }
        }
    }

    // Determine rootNodeId if it's not defined
    if (!rootNodeId) {
        for (const nodeId in nodesRecord) {
            if (nodesRecord[nodeId].parentId === null) {
                rootNodeId = nodeId;
                break;
            }
        }
    } else {
        rootNodeId = idMap.get(rootNodeId) ?? rootNodeId;
     }
    
      // If there is no root, use the first one
    if (!rootNodeId && Object.keys(nodesRecord).length > 0) {
        rootNodeId = Object.keys(nodesRecord)[0];
     }
    
    const mindMap: MindMap = {
        id: nanoid(),
        name: ai.metadata?.title ?? "Untitled Mind Map",
        rootNodeId: rootNodeId ?? "",
        nodes: nodesRecord,
        createdAt: Date.now(),
        updatedAt: Date.now()
    };

    return mindMap;
}

/**
 * Convert an intrenal MindMap to AiMindMap
 * 
 * Simplify:
 * - Delete positions & styles
 * - Extract label, notes, tags, parentId
 */

export function mindMapToAiMindMap(mind: MindMap): AiMindMap {
    const aiNodes: AiMindMapNode[] = [];

    // Convert nodes
    for (const nodeId in mind.nodes) {
        const node = mind.nodes[nodeId];

        const aiNode: AiMindMapNode = {
            id: node.id,
            label: node.text,
            parentId: node.parentId,
            order: node.order,
            childrenIDs: node.children
        };

        aiNodes.push(aiNode);
    }

    const aiMindMap: AiMindMap = {
        schemaVersion: "1.0",
        nodes: aiNodes,
        rootNodeId: mind.rootNodeId,
        metadata: {
            title: mind.name,
        }
    };

    return aiMindMap;
}
