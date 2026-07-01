/**
 * Renders the radial layout view.
 *
 * Responsibilities:
 *   - Compose CanvasEdges + CanvasNodes for the radial layout
 *   - Apply radial-specific CSS class for targeted styling
 *   - Future: radial-specific controls (ring guides, angle indicators, etc.)
*/

import React from 'react';
import { MindMapNode, LayoutResult } from '../../../types/mindmap';
import { EdgeStyle } from '../../../utils/edges';
import type { SearchResult } from '../../../types/search';
import CanvasEdges from '../CanvasEdges';
import CanvasNodes from '../CanvasNodes';



interface RadialViewProps {
  nodes:          Record<string, MindMapNode>;
  layoutResult:   LayoutResult;
  rootNodeId:     string;
  selectedNodeId: string | null;
  editingNodeId:  string | null;
  dropTarget:     string | null;
  isAnimating:    boolean;
  prevPositions:  Record<string, { x: number; y: number }>;
  searchResultsMap:    Map<string, SearchResult>;
  activeSearchNodeId:  string | null;
  edgeStyle:      EdgeStyle;
  svgRef:         React.RefObject<SVGSVGElement>;
  viewport:       { zoom: number; panX: number; panY: number };
  onSelectNode:     (id: string) => void;
  onEditNode:       (id: string | null) => void;
  onUpdateText:     (id: string, text: string) => void;
  onToggleCollapse: (id: string) => void;
  onNodeMouseDown:  (e: React.MouseEvent, nodeId: string, x: number, y: number) => void;
}

const RadialView: React.FC<RadialViewProps> = (props) => {
  const {
    nodes, layoutResult, rootNodeId,
    selectedNodeId, editingNodeId, dropTarget,
    isAnimating, prevPositions, searchResultsMap,
    activeSearchNodeId, edgeStyle, svgRef, viewport,
    onSelectNode, onEditNode, onUpdateText,
    onToggleCollapse, onNodeMouseDown,
  } = props;

  return (
    <g className="layout-view layout-view--radial">
      <CanvasEdges
        layoutResult={layoutResult}
        edgeStyle={edgeStyle}
      />
      <CanvasNodes
        nodes={nodes}
        layoutResult={layoutResult}
        rootNodeId={rootNodeId}
        selectedNodeId={selectedNodeId}
        editingNodeId={editingNodeId}
        dropTarget={dropTarget}
        isAnimating={isAnimating}
        prevPositions={prevPositions}
        searchResultsMap={searchResultsMap}
        activeSearchNodeId={activeSearchNodeId}
        svgRef={svgRef}
        viewport={viewport}
        onSelectNode={onSelectNode}
        onEditNode={onEditNode}
        onUpdateText={onUpdateText}
        onToggleCollapse={onToggleCollapse}
        onNodeMouseDown={onNodeMouseDown}
      />
    </g>
  );
};

export default RadialView;