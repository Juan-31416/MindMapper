/**
 * Renders all edges (connections) between nodes as SVG <path> elements.
 * Shared between HierarchicalView and RadialView.
 *
 * Responsibilities:
 *   - Compute SVG path strings from LayoutResult topology + node positions
 *   - Respect the curvedEdges user preference
 *   - Render arrowhead markers
 */

import React from 'react';
import { LayoutResult } from '../../types/mindmap';
import { buildEdgePath, calculateCurvedPath, EdgeStyle } from '../../utils/edges';



// ─── Props ───

interface CanvasEdgesProps {
  layoutResult: LayoutResult;
  edgeStyle: EdgeStyle;
}



// ─── SVG marker definition ───

export const ArrowheadMarker: React.FC = () => (
  <marker
    id="arrowhead"
    markerWidth="10"
    markerHeight="10"
    refX="9"
    refY="3"
    orient="auto"
  >
    <polygon points="0 0, 10 3, 0 6" fill="#6B7280" />
  </marker>
);



// ─── Component ───

const CanvasEdges: React.FC<CanvasEdgesProps> = ({ layoutResult, edgeStyle }) => {
  return (
    <g className="connections">
      <defs>
        <ArrowheadMarker />
      </defs>
      {layoutResult.edges.map((edge, i) => {
        const fromNode = layoutResult.nodes[edge.from];
        const toNode   = layoutResult.nodes[edge.to];

        if (!fromNode || !toNode) return null;

        const path = buildEdgePath(fromNode, toNode, edgeStyle);

        return (
          <path
            key={`${edge.from}-${edge.to}-${i}`}
            d={path}
            stroke="#6B7280"
            strokeWidth={2}
            fill="none"
            className="connection-path"
            markerEnd="url(#arrowhead)"
            style={{ transition: 'd 0.3s ease' }}
          />
        );
      })}
    </g>
  );
};

export default CanvasEdges;