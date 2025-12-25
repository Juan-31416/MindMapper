/**
 * Pure applicator of AI editing operations on a MindMap.
 */

import { MindMap, MindMapNode, DEFAULT_NODE_STYLE } from "../../types/mindmap";
import {
  AiMindMapEditOperation,
  AiAddNodeOperation,
  AiUpdateNodeOperation,
  AiDeleteNodeOperation,
  AiMoveNodeOperation
} from "../../types/ai/aiOperations";
import { nanoid } from "nanoid";

/**
 * Applies a list of AI editing operations to a MindMap.
 * Returns a new (immutable) MindMap.
 */

export function applyAiEditsToMindMap(
    mindmap: MindMap,
    edits: AiMindMapEditOperation[]
): MindMap {
    let currentMap = { ...mindmap, nodes: { ...mindmap.nodes }}

    for (const edit of edits) {
        switch (edit.type) {
            case "add-node":
                currentMap = applyAddNode(currentMap, edit);
                break;
            case "update-node":
                currentMap = applyUpdateNode(currentMap, edit);
                break;
            case "delete-node":
                currentMap = applyDeleteNode(currentMap, edit);
                break;
            case "move-node":
                currentMap = applyMoveNode(currentMap, edit);
                break;
        }
    }

    return {
        ...currentMap,
        updatedAt: Date.now()
    };
}

function applyAddNode(
    mindMap: MindMap,
    op: AiAddNodeOperation
): MindMap {
    const newNodeId = op.node.id || nanoid();
    const parentId = op.node.parentId ?? null;

    const newNode: MindMapNode = {
        id: newNodeId,
        text: op.node.label,
        parentId,
        children: [],
        style: { ...DEFAULT_NODE_STYLE },
        collapsed: false,
        order: op.node.order ?? 0
    };

    const nodes: Record<string, MindMapNode> = { ...mindMap.nodes, [newNodeId]: newNode };

    // Add childrens
    if (parentId && nodes[parentId]) {
        nodes[parentId] = {
            ...nodes[parentId],
            children: [...nodes[parentId].children, newNodeId]
        };
    }

    return {
        ...mindMap,
        nodes
    };
}

function applyUpdateNode(
    mindMap: MindMap,
    op: AiUpdateNodeOperation
): MindMap {
    const node = mindMap.nodes[op.nodeId];
    if (!node) return mindMap;
  
    const updatedNode: MindMapNode = {
        ...node,
        text: op.patch.label ?? node.text,
        order: op.patch.order ?? node.order
    };
  
    return {
        ...mindMap,
        nodes: {
            ...mindMap.nodes,
            [op.nodeId]: updatedNode
        }
    };
}

function applyDeleteNode(
    mindMap: MindMap,
    op: AiDeleteNodeOperation
): MindMap {
    const node = mindMap.nodes[op.nodeId];
    if (!node) return mindMap;
  
    const nodes: Record<string, MindMapNode> = { ...mindMap.nodes };
  
    // Eliminar de children del padre
    if (node.parentId && nodes[node.parentId]) {
        nodes[node.parentId] = {
            ...nodes[node.parentId],
            children: nodes[node.parentId].children.filter(id => id !== op.nodeId)
        };
    }
  
    function deleteRecursive(nodeId: string) {
        const n = nodes[nodeId];
        if (!n) return;
    
        for (const childId of n.children) {
            deleteRecursive(childId);
        }
    
        delete nodes[nodeId];
    }
  
    deleteRecursive(op.nodeId);
  
    return {
        ...mindMap,
        nodes
    };
}

function applyMoveNode(
    mindMap: MindMap,
    op: AiMoveNodeOperation
): MindMap {
    const node = mindMap.nodes[op.nodeId];
    if (!node) return mindMap;
  
    const nodes: Record<string, MindMapNode> = { ...mindMap.nodes };
  
    // Eliminar de children del padre antiguo
    if (node.parentId && nodes[node.parentId]) {
        nodes[node.parentId] = {
            ...nodes[node.parentId],
            children: nodes[node.parentId].children.filter(id => id !== op.nodeId)
        };
    }
  
    // Actualizar parentId del nodo
    nodes[op.nodeId] = {
        ...node,
        parentId: op.newParentId,
        order: op.newOrder ?? node.order
    };
  
    // Añadir a children del nuevo padre
    if (op.newParentId && nodes[op.newParentId]) {
        nodes[op.newParentId] = {
            ...nodes[op.newParentId],
            children: [...nodes[op.newParentId].children, op.nodeId]
        };
    }
  
    return {
        ...mindMap,
        nodes
    };
}