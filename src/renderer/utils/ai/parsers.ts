/**
 * Pure validators and parsers for JSON returned by the LLM.
 * 
 * Pure functions that:
 * - Verify primitive types
 * - Perform minimal checks (id not empty, etc.)
 * - Throw clear validation errors
 */

import {
    AiMindMap,
    AiMindMapNode,
    AiMindMapMetadata,
    AiMindMapSource
  } from "../../types/ai/aiMindmap";
import {
    AiMindMapEditOperation,
    AiEditOperationType,
    AiAddNodeOperation,
    AiUpdateNodeOperation,
    AiDeleteNodeOperation,
    AiMoveNodeOperation
  } from "../../types/ai/aiOperations";

export class ValidationError extends Error {
    constructor(message: string, public readonly path?: string) {
        super(message);
        this.name = "ValidationError";
    }
}

export function parseAiMindMap(json: unknown): AiMindMap {
    if (!json || typeof json !== "object") {
        throw new ValidationError("AiMindMap must be an object");
    }

    const obj = json as Record<string, unknown>;

    if (typeof obj.schemaVersion !== "string") {
        throw new ValidationError(
            "AiMinsMap.schemaVersion must be a string",
            "schemaVersion"
        );
    }

    if (!Array.isArray(obj.nodes)) {
        throw new ValidationError(
            "AiMindMap.nodes must be an array",
            "nodes"
        );
    }

    const nodes: AiMindMapNode[] = obj.nodes.map((nodeJson, idx) => parseAiMindMapNode(nodeJson, `nodes[${idx}]`));

    let rootNodeId: string | undefined;
    if (obj.rootNodeId !== undefined) {
        if (typeof obj.rootNodeId !== "string") {
            throw new ValidationError(
                "AiMindMap.rootNodeId must be a string",
                "rootNodeId"
            );
        }
        rootNodeId = obj.rootNodeId;
    }

    let metadata: AiMindMapMetadata | undefined;
    if (obj.metadata !== undefined) {
        metadata = parseAiMindMapMetadata(obj.metadata, "metadata");
    }

    return {
        schemaVersion: obj.schemaVersion,
        nodes,
        rootNodeId,
        metadata
    };
}

function parseAiMindMapNode(
    json: unknown,
    path: string
  ): AiMindMapNode {
    if (!json || typeof json !== "object") {
        throw new ValidationError(
            `${path} must be an object`,
            path
        );
    }

    const obj = json as Record<string, unknown>;

    if (typeof obj.id !!== "string" || obj.id.trim().length === 0) {
        throw new ValidationError(
            `${path}.id must be a non-empty string`,
            `${path}.id`
        );
    }

    if (typeof obj.label !== "string") {
        throw new ValidationError(
            `${path}.label must be a string`,
            `${path}.label`
        );
    }

    let parentId: string | null | undefined;
    if(obj.parentId !== undefined && obj.parentId !== null) {
        if(typeof obj.parentId !== "string") {
            throw new ValidationError(
                `${path}.parentId must be a string or null`,
                `${path}.parentId`
            );
        }
        parentId = obj.parentId;
    } else {
        parentId = obj.parentId === null ? null : undefined;
    }

    let notes: string | undefined;
    if (obj.notes !== undefined) {
        if (typeof obj.notes !== "string") {
            throw new ValidationError(
                `${path}.notes must be a string`,
                `${path}.notes`
            );
        }
        notes = obj.notes;
    }

    let tags: string[] | undefined;
    if (obj.tags !== undefined) {
        if (!Array.isArray(obj.tags)) {
            throw new ValidationError(
                `${path}.tags must be an array`,
                `${path}.tags`
            );
        }
        tags = obj.tags.map((tag, idx) => {
            if (typeof tag !== "string") {
                throw new ValidationError(
                    `${path}.tags[${idx}] must be a string`,
                    `${path}.tags[${idx}]`
                );
            }
            return tag;
        });
    }

    let order: number | undefined;
    if (obj.order !== undefined) {
        if (typeof obj.order !== "number") {
            throw new ValidationError(
                `${path}.order must be a number`,
                `${path}.order`
            );
        }
        order = obj.order;
    }

    let childrenIDs: string[] | undefined;
    if (obj.childrenIds !== undefined) {
        if (!Array.isArray(obj.childrenIds)) {
            throw new ValidationError(
                `${path}.childrenIds must be an array`,
                `${path}.childrenIds`
            );
        }
        childrenIDs = obj.childrenIds.map((id, idx) => {
            if (typeof id !== "string") {
                throw new ValidationError(
                    `${path}.childrenIds[${idx}] must be a string`,
                    `${path}.childrenIds[${idx}]`
                );
            }
            return id;
        });
    }

    let metadata: Record<string, unknown> | undefined;
    if (obj.metadata !== undefined) {
        if (typeof obj.metadata !== "object" || obj.metadata === null) {
            throw new ValidationError(
                `${path}.metadata must be an object`,
                `${path}.metadata`
            );
        }
        metadata = obj.metadata as Record<string, unknown>;
    }

    return {
        id: obj.id,
        label: obj.label,
        parentId,
        notes,
        tags,
        order,
        childrenIDs,
        metadata
    };
}

function parseAiMindMapMetadata(
    json: unknown,
    path: string
): AiMindMapMetadata {
    if (!json || typeof json !== "object") {
        throw new ValidationError(
            `${path} must be an object`, 
            path
        );
    }

    const obj = json as Record<string, unknown>;

    let source: AiMindMapSource | undefined;
    if (obj.source !== undefined) {
        if (typeof obj.source !== "string") {
            throw new ValidationError(
                `${path}.source must be a string`,
                `${path}.source`
            );
        }

        const validSources: AiMindMapSource[] = ["prompt", "file", "mindmap"];
        if (!validSources.includes(obj.source as AiMindMapSource)) {
            throw new ValidationError(
                `${path}.source must be one of: ${validSources.join(", ")}`,
                `${path}.source`
            );
        }
        source = obj.source as AiMindMapSource;
    }

    let language: string | undefined;
    if (obj.language !== undefined) {
        if (typeof obj.language !== "string") {
            throw new ValidationError(
                `${path}.language must be a string`,
                `${path}.language`
            );
        }
        language = obj.language;
    }

    let summary: string | undefined;
    if (obj.summary !== undefined) {
        if (typeof obj.summary !== "string") {
            throw new ValidationError(
                `${path}.summary must be a string`,
                `${path}.summary`
            );
        }
        summary = obj.summary;
    }

    let title: string | undefined;
    if (obj.title !== undefined) {
        if (typeof obj.title !== "string") {
            throw new ValidationError(
                `${path}.title must be a string`,
                `${path}.title`
            );
        }
        title = obj.title;
    }

    let tags: string[] | undefined;
    if (obj.tags !== undefined) {
        if (!Array.isArray(obj.tags)) {
            throw new ValidationError(
                `${path}.tags must be an array`,
                `${path}.tags`
            );
        }
        tags = obj.tags.map((tag, idx) => {
            if (typeof tag !== "string") {
                throw new ValidationError(
                    `${path}.tags[${idx}] must be a string`,
                    `${path}.tags[${idx}]`
                );
            }
            return tag;
        });
    }

    let extra: Record<string, unknown> | undefined;
    if (obj.extra !== undefined) {
        if (typeof obj.extra !== "object" || obj.extra === null) {
            throw new ValidationError(
                `${path}.extra must be an object`,
                `${path}.extra`
            );
        }
        extra = obj.extra as Record<string, unknown>;
    }

    return {
        source,
        language,
        summary,
        title,
        tags,
        extra
    };
}

export function parseAiMindMapEdits(json: unknown): AiMindMapEditOperation[] {
    if (!Array.isArray(json)) {
        throw new ValidationError("AiMindMapEdits must be an array");
    }
    
    return json.map((opJson, idx) =>
        parseAiMindMapEditOperation(opJson, `edits[${idx}]`)
    );
}

function parseAiMindMapEditOperation(
    json: unknown,
    path: string
): AiMindMapEditOperation {
    if (!json || typeof json !== "object") {
        throw new ValidationError(
            `${path} must be an object`, 
            path
        );
    }

    const obj = json as Record<string, unknown>;

    if (typeof obj.type !== "string") {
        throw new ValidationError(
          `${path}.type must be a string`,
          `${path}.type`
        );
    }

    const type = obj.type as AiEditOperationType;

    switch (type) {
        case "add-node":
            return parseAiAddNodeOperation(obj, path);
        case "update-node":
            return parseAiUpdateNodeOperation(obj, path);
        case "delete-node":
            return parseAiDeleteNodeOperation(obj, path);
        case "move-node":
            return parseAiMoveNodeOperation(obj, path);
        default:
            throw new ValidationError(
                `${path}.type has unknown value: ${type}`,
                `${path}.type`
            );
    }
}

function parseAiAddNodeOperation(
    obj: Record<string, unknown>,
    path: string
): AiAddNodeOperation {
    if (!obj.node || typeof obj.node !== "object") {
        throw new ValidationError(
            `${path}.node must be an object`,
            `${path}.node`
        );
    }

    const node = parseAiMindMapNode(obj.node, `${path}.node`);

    return {
        type: "add-node",
        node
    }
}

function parseAiUpdateNodeOperation(
    obj: Record<string, unknown>,
    path: string
  ): AiUpdateNodeOperation {
    if (typeof obj.nodeId !== "string" || obj.nodeId.trim().length === 0) {
        throw new ValidationError(
            `${path}.nodeId must be a non-empty string`,
            `${path}.nodeId`
        );
    }
  
    if (!obj.patch || typeof obj.patch !== "object") {
        throw new ValidationError(
            `${path}.patch must be an object`,
            `${path}.patch`
        );
    }
  
    const patch = obj.patch as Partial<AiMindMapNode>;
  
    return {
        type: "update-node",
        nodeId: obj.nodeId,
        patch
    };
}

function parseAiDeleteNodeOperation(
    obj: Record<string, unknown>,
    path: string
  ): AiDeleteNodeOperation {  
    if (typeof obj.nodeId !== "string" || obj.nodeId.trim().length === 0) {
        throw new ValidationError(
            `${path}.nodeId must be a non-empty string`,
            `${path}.nodeId`
        );
    }
  
    return {
        type: "delete-node",
        nodeId: obj.nodeId
    };
}

function parseAiMoveNodeOperation(
    obj: Record<string, unknown>,
    path: string
  ): AiMoveNodeOperation {  
    if (typeof obj.nodeId !== "string" || obj.nodeId.trim().length === 0) {
      throw new ValidationError(
        `${path}.nodeId must be a non-empty string`,
        `${path}.nodeId`
      );
    }
  
    if (
        obj.newParentId !== null &&
        typeof obj.newParentId !== "string"
    ) {
        throw new ValidationError(
            `${path}.newParentId must be a string or null`,
            `${path}.newParentId`
        );
    }
  
    let newOrder: number | undefined;
    if (obj.newOrder !== undefined) {
        if (typeof obj.newOrder !== "number") {
            throw new ValidationError(
                `${path}.newOrder must be a number`,
                `${path}.newOrder`
            );
        }
        newOrder = obj.newOrder;
    }
  
    return {
        type: "move-node",
        nodeId: obj.nodeId,
        newParentId: obj.newParentId as string | null,
        newOrder
    };
}