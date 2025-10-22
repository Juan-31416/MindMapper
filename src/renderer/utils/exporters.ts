import { MindMap } from '../types/mindmap';

/**
 * Serialize a MindMap to JSON string
 */
export function serializeToJSON(map: MindMap): string {
  return JSON.stringify(map, null, 2);
}

/**
 * Prepare the canvas for PDF export
 * This function ensures the viewport is adjusted to show the entire mind map
 */
export function preparePDFExport(): {
  originalViewport: { zoom: number; panX: number; panY: number };
  restore: () => void;
} {
  // Get the SVG element
  const svg = document.querySelector('svg#mindmap-canvas') as SVGSVGElement;
  
  if (!svg) {
    return {
      originalViewport: { zoom: 1, panX: 0, panY: 0 },
      restore: () => {}
    };
  }

  // Store original transform
  const g = svg.querySelector('g') as SVGGElement;
  const originalTransform = g?.getAttribute('transform') || '';
  
  // Calculate the bounding box of all nodes
  const bbox = svg.getBBox();
  
  // Calculate the viewport size
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  
  // Calculate zoom to fit
  const scaleX = viewportWidth / (bbox.width + 100);
  const scaleY = viewportHeight / (bbox.height + 100);
  const scale = Math.min(scaleX, scaleY, 1); // Don't zoom in, only out
  
  // Center the content
  const offsetX = (viewportWidth - bbox.width * scale) / 2 - bbox.x * scale;
  const offsetY = (viewportHeight - bbox.height * scale) / 2 - bbox.y * scale;
  
  // Apply the transform
  if (g) {
    g.setAttribute('transform', `translate(${offsetX}, ${offsetY}) scale(${scale})`);
  }
  
  return {
    originalViewport: {
      zoom: 1,
      panX: 0,
      panY: 0
    },
    restore: () => {
      if (g) {
        g.setAttribute('transform', originalTransform);
      }
    }
  };
}

/**
 * Convert a MindMap to Markdown outline format
 */
export function exportToMarkdown(map: MindMap): string {
  const lines: string[] = [];
  const rootNode = map.nodes[map.rootNodeId];
  
  if (!rootNode) return '';
  
  // Recursive function to build markdown
  const buildMarkdown = (nodeId: string, level: number) => {
    const node = map.nodes[nodeId];
    if (!node) return;
    
    // Add the node as a markdown header
    const prefix = '#'.repeat(level);
    lines.push(`${prefix} ${node.text}`);
    lines.push('');
    
    // Process children
    const children = node.children
      .map(childId => map.nodes[childId])
      .filter(child => child !== undefined)
      .sort((a, b) => a.order - b.order);
    
    children.forEach(child => {
      buildMarkdown(child.id, level + 1);
    });
  };
  
  // Start with root
  buildMarkdown(rootNode.id, 1);
  
  return lines.join('\n');
}

/**
 * Get the base name for export files
 */
export function getExportBaseName(map: MindMap, currentFilePath: string | null): string {
  if (currentFilePath) {
    // Extract filename without extension
    const filename = currentFilePath.split('/').pop() || 'mindmap';
    return filename.replace(/\.(mindmap\.)?json$/, '');
  }
  
  // Use the map name or fallback to 'mindmap'
  return map.name || 'mindmap';
}
