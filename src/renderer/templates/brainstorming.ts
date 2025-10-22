import { MindMap, MindMapNode } from '../types/mindmap';

const generateId = () => Math.random().toString(36).substr(2, 9);

/**
 * Create a Brainstorming template
 * Contains a central idea with 4 concept branches
 */
export function createBrainstormingTemplate(): MindMap {
  // Root node
  const rootId = generateId();
  const rootNode: MindMapNode = {
    id: rootId,
    text: '💡 Main Idea',
    parentId: null,
    children: [],
    style: {
      backgroundColor: '#8b5cf6',
      textColor: '#ffffff',
      borderColor: '#7c3aed',
      borderWidth: 3,
      borderRadius: 20,
      fontSize: 18,
      fontWeight: 'bold',
      padding: 20,
      icon: '💡',
    },
    collapsed: false,
    order: 0,
  };

  // Concept 1 - Planning
  const concept1Id = generateId();
  const concept1Node: MindMapNode = {
    id: concept1Id,
    text: '📋 Planning',
    parentId: rootId,
    children: [],
    style: {
      backgroundColor: '#3b82f6',
      textColor: '#ffffff',
      borderColor: '#2563eb',
      borderWidth: 2,
      borderRadius: 15,
      fontSize: 16,
      fontWeight: 'normal',
      padding: 15,
      icon: '📋',
    },
    collapsed: false,
    order: 0,
  };

  const concept1Child1Id = generateId();
  const concept1Child1: MindMapNode = {
    id: concept1Child1Id,
    text: 'Goals & Objectives',
    parentId: concept1Id,
    children: [],
    style: {
      backgroundColor: '#dbeafe',
      textColor: '#1e40af',
      borderColor: '#60a5fa',
      borderWidth: 1,
      borderRadius: 10,
      fontSize: 14,
      fontWeight: 'normal',
      padding: 12,
    },
    collapsed: false,
    order: 0,
  };

  const concept1Child2Id = generateId();
  const concept1Child2: MindMapNode = {
    id: concept1Child2Id,
    text: 'Timeline',
    parentId: concept1Id,
    children: [],
    style: {
      backgroundColor: '#dbeafe',
      textColor: '#1e40af',
      borderColor: '#60a5fa',
      borderWidth: 1,
      borderRadius: 10,
      fontSize: 14,
      fontWeight: 'normal',
      padding: 12,
    },
    collapsed: false,
    order: 1,
  };

  concept1Node.children = [concept1Child1Id, concept1Child2Id];

  // Concept 2 - Research
  const concept2Id = generateId();
  const concept2Node: MindMapNode = {
    id: concept2Id,
    text: '🔍 Research',
    parentId: rootId,
    children: [],
    style: {
      backgroundColor: '#10b981',
      textColor: '#ffffff',
      borderColor: '#059669',
      borderWidth: 2,
      borderRadius: 15,
      fontSize: 16,
      fontWeight: 'normal',
      padding: 15,
      icon: '🔍',
    },
    collapsed: false,
    order: 1,
  };

  const concept2Child1Id = generateId();
  const concept2Child1: MindMapNode = {
    id: concept2Child1Id,
    text: 'Data Collection',
    parentId: concept2Id,
    children: [],
    style: {
      backgroundColor: '#d1fae5',
      textColor: '#065f46',
      borderColor: '#34d399',
      borderWidth: 1,
      borderRadius: 10,
      fontSize: 14,
      fontWeight: 'normal',
      padding: 12,
    },
    collapsed: false,
    order: 0,
  };

  const concept2Child2Id = generateId();
  const concept2Child2: MindMapNode = {
    id: concept2Child2Id,
    text: 'Analysis',
    parentId: concept2Id,
    children: [],
    style: {
      backgroundColor: '#d1fae5',
      textColor: '#065f46',
      borderColor: '#34d399',
      borderWidth: 1,
      borderRadius: 10,
      fontSize: 14,
      fontWeight: 'normal',
      padding: 12,
    },
    collapsed: false,
    order: 1,
  };

  concept2Node.children = [concept2Child1Id, concept2Child2Id];

  // Concept 3 - Implementation
  const concept3Id = generateId();
  const concept3Node: MindMapNode = {
    id: concept3Id,
    text: '⚙️ Implementation',
    parentId: rootId,
    children: [],
    style: {
      backgroundColor: '#f59e0b',
      textColor: '#ffffff',
      borderColor: '#d97706',
      borderWidth: 2,
      borderRadius: 15,
      fontSize: 16,
      fontWeight: 'normal',
      padding: 15,
      icon: '⚙️',
    },
    collapsed: false,
    order: 2,
  };

  const concept3Child1Id = generateId();
  const concept3Child1: MindMapNode = {
    id: concept3Child1Id,
    text: 'Development',
    parentId: concept3Id,
    children: [],
    style: {
      backgroundColor: '#fef3c7',
      textColor: '#92400e',
      borderColor: '#fbbf24',
      borderWidth: 1,
      borderRadius: 10,
      fontSize: 14,
      fontWeight: 'normal',
      padding: 12,
    },
    collapsed: false,
    order: 0,
  };

  const concept3Child2Id = generateId();
  const concept3Child2: MindMapNode = {
    id: concept3Child2Id,
    text: 'Testing',
    parentId: concept3Id,
    children: [],
    style: {
      backgroundColor: '#fef3c7',
      textColor: '#92400e',
      borderColor: '#fbbf24',
      borderWidth: 1,
      borderRadius: 10,
      fontSize: 14,
      fontWeight: 'normal',
      padding: 12,
    },
    collapsed: false,
    order: 1,
  };

  concept3Node.children = [concept3Child1Id, concept3Child2Id];

  // Concept 4 - Review
  const concept4Id = generateId();
  const concept4Node: MindMapNode = {
    id: concept4Id,
    text: '✅ Review',
    parentId: rootId,
    children: [],
    style: {
      backgroundColor: '#ef4444',
      textColor: '#ffffff',
      borderColor: '#dc2626',
      borderWidth: 2,
      borderRadius: 15,
      fontSize: 16,
      fontWeight: 'normal',
      padding: 15,
      icon: '✅',
    },
    collapsed: false,
    order: 3,
  };

  const concept4Child1Id = generateId();
  const concept4Child1: MindMapNode = {
    id: concept4Child1Id,
    text: 'Feedback',
    parentId: concept4Id,
    children: [],
    style: {
      backgroundColor: '#fee2e2',
      textColor: '#991b1b',
      borderColor: '#f87171',
      borderWidth: 1,
      borderRadius: 10,
      fontSize: 14,
      fontWeight: 'normal',
      padding: 12,
    },
    collapsed: false,
    order: 0,
  };

  const concept4Child2Id = generateId();
  const concept4Child2: MindMapNode = {
    id: concept4Child2Id,
    text: 'Iteration',
    parentId: concept4Id,
    children: [],
    style: {
      backgroundColor: '#fee2e2',
      textColor: '#991b1b',
      borderColor: '#f87171',
      borderWidth: 1,
      borderRadius: 10,
      fontSize: 14,
      fontWeight: 'normal',
      padding: 12,
    },
    collapsed: false,
    order: 1,
  };

  concept4Node.children = [concept4Child1Id, concept4Child2Id];

  // Set root children
  rootNode.children = [concept1Id, concept2Id, concept3Id, concept4Id];

  // Create the MindMap
  const mindMap: MindMap = {
    id: generateId(),
    name: 'Brainstorming Template',
    rootNodeId: rootId,
    nodes: {
      [rootId]: rootNode,
      [concept1Id]: concept1Node,
      [concept1Child1Id]: concept1Child1,
      [concept1Child2Id]: concept1Child2,
      [concept2Id]: concept2Node,
      [concept2Child1Id]: concept2Child1,
      [concept2Child2Id]: concept2Child2,
      [concept3Id]: concept3Node,
      [concept3Child1Id]: concept3Child1,
      [concept3Child2Id]: concept3Child2,
      [concept4Id]: concept4Node,
      [concept4Child1Id]: concept4Child1,
      [concept4Child2Id]: concept4Child2,
    },
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  return mindMap;
}

/**
 * Create a simple blank template
 */
export function createBlankTemplate(): MindMap {
  const rootId = generateId();
  const rootNode: MindMapNode = {
    id: rootId,
    text: 'Main Idea',
    parentId: null,
    children: [],
    style: {
      backgroundColor: '#8b5cf6',
      textColor: '#ffffff',
      borderColor: '#7c3aed',
      borderWidth: 2,
      borderRadius: 15,
      fontSize: 16,
      fontWeight: 'bold',
      padding: 15,
    },
    collapsed: false,
    order: 0,
  };

  return {
    id: generateId(),
    name: 'New Mind Map',
    rootNodeId: rootId,
    nodes: {
      [rootId]: rootNode,
    },
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
}

/**
 * Get all available templates
 */
export function getAvailableTemplates(): Array<{
  id: string;
  name: string;
  description: string;
  create: () => MindMap;
}> {
  return [
    {
      id: 'blank',
      name: 'Blank',
      description: 'Start with a blank mind map',
      create: createBlankTemplate,
    },
    {
      id: 'brainstorming',
      name: 'Brainstorming',
      description: 'Brainstorming template with Planning, Research, Implementation, and Review',
      create: createBrainstormingTemplate,
    },
  ];
}
