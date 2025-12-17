/**
 * IA types barrel expots
 * Ease imports from other modules
 */

export type {
    AiMindMapSource,
    AiMindMapMetadata,
    AiMindMapNode,
    AiMindMap
} from "./aiMindmap";

export { AI_MINDMAP_SCHEMA_VERSION } from "./aiMindmap";

export type {
    AiEditOperationType,
    AiAddNodeOperation,
    AiUpdateNodeOperation,
    AiDeleteNodeOperation,
    AiMoveNodeOperation,
    AiMindMapEditOperation
} from "./aiOperations";

export {
    AiEditOperationKind,
    AI_MINDMAP_EDITS_SCHEMA_VERSION
} from "./aiOperations";

export type {
    AiSuggestEditsMode,
    AiGenerateMindMapResponse,
    AiSuggestEditsFullMapResponse,
    AiSuggestEditsEditsResponse,
    AiSuggestEditsResponse
} from "./aiContracts";

export {
    isFullMapResponse,
    isEditsResponse,
    createMindMapResponse,
    createEditsResponse,
    AI_RESPONSE_KEYS
} from "./aiContracts";