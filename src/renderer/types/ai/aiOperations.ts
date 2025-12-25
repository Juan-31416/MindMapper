/**
 * Types for incremental editing operations on AI mind maps
 */

import { AiMindMapNode } from "./aiMindmap";

export type AiEditOperationKind = "add-node" | "update-noode" | "delete-node" | "move-node";

export enum AiEditOperationType {
    AddNode = "add-node",
    UpdateNode = "update-node",
    DeleteNode = "delete-node",
    MoveNode = "move-node"
}

export interface AiAddNodeOperation {
    type: "add-node";
    node: AiMindMapNode;
}

export interface AiUpdateNodeOperation {
    type: "update-node";
    nodeId: string;
    patch: Partial<AiMindMapNode>;
}

export interface AiDeleteNodeOperation {
    type: "delete-node";
    nodeId: string;
}

export interface AiMoveNodeOperation {
    type: "move-node";
    nodeId: string;
    newParentId: string | null;
    newOrder?: number;
}

export type AiMindMapEditOperation =
    | AiAddNodeOperation
    | AiUpdateNodeOperation
    | AiDeleteNodeOperation
    | AiMoveNodeOperation;

export const AI_MINDMAP_EDITS_SCHEMA_VERSION = "1.0"