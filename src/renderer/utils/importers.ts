import { MindMap, MindMapNode, DEFAULT_NODE_STYLE } from '../types/mindmap';

const generateId = () => Math.random().toString(36).substr(2, 9);

/**
 * Parse a JSON string and return a MindMap
 */
export function parseJSON(jsonString: string): MindMap {
  try {
    const parsed = JSON.parse(jsonString);
    
    // Validate the structure
    if (!parsed.id || !parsed.rootNodeId || !parsed.nodes) {
      throw new Error('Invalid MindMap JSON structure');
    }
    
    // Ensure all nodes have required properties
    Object.keys(parsed.nodes).forEach(nodeId => {
      const node = parsed.nodes[nodeId];
      if (!node.style) {
        node.style = { ...DEFAULT_NODE_STYLE };
      }
      if (node.collapsed === undefined) {
        node.collapsed = false;
      }
      if (node.order === undefined) {
        node.order = 0;
      }
      if (!node.children) {
        node.children = [];
      }
    });
    
    return parsed as MindMap;
  } catch (error) {
    throw new Error(`Failed to parse JSON: ${(error as Error).message}`);
  }
}

/**
 * Parse a Markdown outline and convert to a MindMap
 * Detects # ## ### for hierarchy levels
 */
export function parseMarkdown(markdownString: string, mapName?: string): MindMap {
  const lines = markdownString.split('\n').filter(line => line.trim());
  
  if (lines.length === 0) {
    throw new Error('Empty Markdown content');
  }
  
  const nodes: { [key: string]: MindMapNode } = {};
  const stack: { level: number; nodeId: string }[] = [];
  let rootNodeId = '';
  
  lines.forEach((line, index) => {
    const trimmed = line.trim();
    
    // Skip empty lines
    if (!trimmed) return;
    
    // Match markdown headers
    const match = trimmed.match(/^(#{1,6})\s+(.+)$/);
    
    if (match) {
      const level = match[1].length;
      const text = match[2].trim();
      
      // Create a new node
      const nodeId = generateId();
      const node: MindMapNode = {
        id: nodeId,
        text,
        parentId: null,
        children: [],
        style: { ...DEFAULT_NODE_STYLE },
        collapsed: false,
        order: 0,
      };
      
      // Determine parent based on level
      if (level === 1) {
        // This is a root node
        if (!rootNodeId) {
          rootNodeId = nodeId;
        }
        node.parentId = null;
        stack.length = 0;
        stack.push({ level, nodeId });
      } else {
        // Find parent (most recent node with level < current level)
        while (stack.length > 0 && stack[stack.length - 1].level >= level) {
          stack.pop();
        }
        
        if (stack.length > 0) {
          const parent = nodes[stack[stack.length - 1].nodeId];
          node.parentId = parent.id;
          node.order = parent.children.length;
          parent.children.push(nodeId);
        } else {
          // No parent found, attach to root
          if (rootNodeId) {
            const root = nodes[rootNodeId];
            node.parentId = rootNodeId;
            node.order = root.children.length;
            root.children.push(nodeId);
          }
        }
        
        stack.push({ level, nodeId });
      }
      
      nodes[nodeId] = node;
    } else {
      // Non-header line - treat as a child of the last node
      if (stack.length > 0) {
        const lastNodeId = stack[stack.length - 1].nodeId;
        const lastNode = nodes[lastNodeId];
        
        const nodeId = generateId();
        const node: MindMapNode = {
          id: nodeId,
          text: trimmed.replace(/^[-*+]\s*/, ''), // Remove bullet points
          parentId: lastNodeId,
          children: [],
          style: { ...DEFAULT_NODE_STYLE },
          collapsed: false,
          order: lastNode.children.length,
        };
        
        lastNode.children.push(nodeId);
        nodes[nodeId] = node;
      }
    }
  });
  
  // If no root node was found, create one
  if (!rootNodeId) {
    rootNodeId = generateId();
    nodes[rootNodeId] = {
      id: rootNodeId,
      text: 'Main Idea',
      parentId: null,
      children: Object.keys(nodes),
      style: { ...DEFAULT_NODE_STYLE },
      collapsed: false,
      order: 0,
    };
    
    // Update all existing nodes to be children of root
    Object.keys(nodes).forEach(nodeId => {
      if (nodeId !== rootNodeId && !nodes[nodeId].parentId) {
        nodes[nodeId].parentId = rootNodeId;
      }
    });
  }
  
  // Create the MindMap
  const mindMap: MindMap = {
    id: generateId(),
    name: mapName || 'Imported from Markdown',
    rootNodeId,
    nodes,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
  
  return mindMap;
}

/**
 * Detect the format of the content
 */
export function detectFormat(content: string): 'json' | 'markdown' | 'unknown' {
  const trimmed = content.trim();
  
  // Check if it's JSON
  if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
    try {
      JSON.parse(content);
      return 'json';
    } catch {
      return 'unknown';
    }
  }
  
  // Check if it's Markdown (contains headers)
  if (/^#{1,6}\s+.+$/m.test(content)) {
    return 'markdown';
  }
  
  return 'unknown';
}

/**
 * Import from file content
 * Automatically detects the format
 */
export function importFromContent(content: string, fileName?: string): MindMap {
  const format = detectFormat(content);
  
  if (format === 'json') {
    return parseJSON(content);
  } else if (format === 'markdown') {
    const mapName = fileName ? fileName.replace(/\.(md|markdown)$/i, '') : undefined;
    return parseMarkdown(content, mapName);
  } else {
    throw new Error('Unknown file format. Expected JSON or Markdown.');
  }
}
