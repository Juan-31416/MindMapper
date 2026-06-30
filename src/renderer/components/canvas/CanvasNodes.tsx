/**
 * Renders all visible mind map nodes as SVG <g> elements.
 * Shared between views.
 *
 * Responsibilities:
 *   - Node background rect
 *   - Icon
 *   - Text (with word-wrap)
 *   - Inline editing (foreignObject textarea)
 *   - Status indicator
 *   - Collapse toggle
 *   - Selection / search-match visual states
 */

import React from 'react';
import * as LucideIcons from 'lucide-react';
import { MindMapNode, LayoutResult } from '../../types/mindmap';
import { getContrastTextColor } from '../../utils/colorUtils';



// ─── Text rendering constants ───

const FONT_SIZE   = 13;
const LINE_HEIGHT = 20;
const FONT_FAMILY = 'Inter, system-ui, sans-serif';

const wrapText = (text: string, maxWidth: number, isBold = false): string[] => {
  let ctx: CanvasRenderingContext2D | null = null;
  try {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    if (context) {
      context.font = `${isBold ? 'bold ' : ''}${FONT_SIZE}px ${FONT_FAMILY}`;
      ctx = context;
    }
  } catch {}

  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = '';

  for (const word of words) {
    const testLine  = currentLine ? `${currentLine} ${word}` : word;
    const testWidth = ctx
      ? ctx.measureText(testLine).width
      : testLine.length * (FONT_SIZE * 0.6);

    if (testWidth > maxWidth && currentLine) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  }
  if (currentLine) lines.push(currentLine);
  return lines;
};



// ─── Props ───

interface CanvasNodesProps {
  nodes:          Record<string, MindMapNode>;
  layoutResult:   LayoutResult;
  rootNodeId:     string;
  selectedNodeId: string | null;
  editingNodeId:  string | null;
  dropTarget:     string | null;
  isAnimating:    boolean;
  prevPositions:  Record<string, { x: number; y: number }>;
  searchMatchIds: Set<string>;
  svgRef:         React.RefObject<SVGSVGElement>;
  viewport:       { zoom: number; panX: number; panY: number };
  onSelectNode:   (id: string) => void;
  onEditNode:     (id: string | null) => void;
  onUpdateText:   (id: string, text: string) => void;
  onToggleCollapse: (id: string) => void;
  onNodeMouseDown:  (e: React.MouseEvent, nodeId: string, x: number, y: number) => void;
}



// ─── Component ───

const CanvasNodes: React.FC<CanvasNodesProps> = ({
  nodes,
  layoutResult,
  rootNodeId,
  selectedNodeId,
  editingNodeId,
  dropTarget,
  isAnimating,
  prevPositions,
  searchMatchIds,
  svgRef,
  viewport,
  onSelectNode,
  onEditNode,
  onUpdateText,
  onToggleCollapse,
  onNodeMouseDown,
}) => {
  const renderNode = (nodeId: string, node: MindMapNode) => {
    const position = layoutResult.nodes[nodeId];
    if (!position) return null;

    const nodeW: number = position.width;
    const nodeH: number = position.height;

    let x = position.x;
    let y = position.y;

    // Interpolate for animation
    if (isAnimating && prevPositions[nodeId]) {
      const prev = prevPositions[nodeId];
      x = prev.x + (x - prev.x) * 0.5;
      y = prev.y + (y - prev.y) * 0.5;
    }

    const isSelected  = selectedNodeId === nodeId;
    const isEditing   = editingNodeId  === nodeId;
    const isDropTarget = dropTarget    === nodeId;
    const hasChildren  = node.children.length > 0;
    const isSearchMatch = searchMatchIds.has(nodeId);
    const isRoot       = nodeId === rootNodeId;

    const PADDING_H = 50;
    const lines = wrapText(node.text, nodeW - PADDING_H, isRoot);
    const totalTextHeight = lines.length * LINE_HEIGHT;

    const IconComponent = node.style.icon
      ? (LucideIcons as any)[node.style.icon] || LucideIcons.Circle
      : LucideIcons.Circle;

    const bgColor  = node.style.backgroundColor;
    const opacity  = node.style.backgroundType === 'none'
      ? 0
      : (node.style.backgroundOpacity ?? 100) / 100;
    const textColor = getContrastTextColor(node.style);
    const bStyle    = node.style.borderStyle ?? 'full';
    const bColor    = node.style.borderColor || node.style.backgroundColor;

    // Root node: slightly larger font
    const fontSize   = isRoot ? FONT_SIZE + 3 : FONT_SIZE;
    const fontWeight = isRoot ? 'bold' : 'normal';

    return (
      <g
        key={nodeId}
        transform={`translate(${x}, ${y})`}
        className={[
          'mind-node',
          isSelected   ? 'selected'     : '',
          isDropTarget ? 'drop-target'  : '',
          isAnimating  ? 'animating'    : '',
          isSearchMatch ? 'search-match' : '',
          isRoot       ? 'root-node'    : '',
        ].filter(Boolean).join(' ')}
        onClick={(e) => { e.stopPropagation(); onSelectNode(nodeId); }}
        onDoubleClick={(e) => { e.stopPropagation(); onEditNode(nodeId); }}
        onMouseDown={(e) => {
          if (e.button === 0 && !isEditing) {
            e.stopPropagation();
            onNodeMouseDown(e, nodeId, x, y);
          }
        }}
      >
        {/* Root node halo */}
        {isRoot && (
          <rect
            x={-nodeW / 2 - 8}
            y={-nodeH / 2 - 8}
            width={nodeW + 16}
            height={nodeH + 16}
            rx={14}
            fill="none"
            stroke="rgba(255, 255, 255, 0.12)"
            strokeWidth={4}
            className="root-halo-outer"
          />
        )}

        {isRoot && (
          <rect
            x={-nodeW / 2 - 3}
            y={-nodeH / 2 - 3}
            width={nodeW + 6}
            height={nodeH + 6}
            rx={10}
            fill="none"
            stroke="rgba(255, 255, 255, 0.55)"
            strokeWidth={1.5}
            className="root-halo-inner"
          />
        )}

        {/* Node background */}
        <rect
          x={-nodeW / 2}
          y={-nodeH / 2}
          width={nodeW}
          height={nodeH}
          rx={8}
          fill={bgColor}
          fillOpacity={opacity}
          stroke={
            bStyle === 'full'
              ? bColor
              : isSelected ? '#ffffff' : 'none'
          }
          strokeWidth={
            bStyle === 'full'
              ? (node.style.borderWidth || 2)
              : isSelected ? 3 : 0
          }
          className="node-bg"
        />

        {/* Bottom border */}
        {bStyle === 'bottom' && (
          <line
            x1={-nodeW / 2} y1={nodeH / 2}
            x2={ nodeW / 2} y2={nodeH / 2}
            stroke={bColor}
            strokeWidth={3}
            strokeLinecap="round"
          />
        )}

        {/* Icon */}
        <g transform={`translate(${-nodeW / 2 + 15}, 0)`}>
          <IconComponent size={18} color={textColor} x={-9} y={-9} />
        </g>

        {/* Text */}
        {isEditing ? (
          <foreignObject
            x={-nodeW / 2 + 42}
            y={-totalTextHeight / 2}
            width={nodeW - 55}
            height={totalTextHeight + 10}
          >
            <textarea
              // @ts-ignore
              xmlns="http://www.w3.org/1999/xhtml"
              className="node-text-input"
              defaultValue={node.text}
              autoFocus
              style={{
                width: '100%', height: '100%',
                resize: 'none', background: 'transparent',
                border: 'none', outline: 'none',
                color: textColor,
                fontSize: `${fontSize}px`,
                fontFamily: FONT_FAMILY,
                fontWeight,
                lineHeight: `${LINE_HEIGHT}px`,
                padding: 0,
              }}
              onBlur={(e) => { onUpdateText(nodeId, e.target.value); onEditNode(null); }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  onUpdateText(nodeId, e.currentTarget.value);
                  onEditNode(null);
                } else if (e.key === 'Escape') {
                  onEditNode(null);
                }
              }}
              onClick={(e) => e.stopPropagation()}
            />
          </foreignObject>
        ) : (
          <text
            x={-nodeW / 2 + 45}
            y={-(totalTextHeight / 2) + (LINE_HEIGHT * 0.75)}
            fill={textColor}
            fontSize={fontSize}
            fontFamily={FONT_FAMILY}
            fontWeight={fontWeight}
            className={`node-text ${isSearchMatch ? 'node-text--search' : ''}`}
          >
            {lines.map((line, i) => (
              <tspan key={i} x={-nodeW / 2 + 42} dy={i === 0 ? 0 : LINE_HEIGHT}>
                {line}
              </tspan>
            ))}
          </text>
        )}

        {/* Status indicator */}
        {node.style.status && (
          <circle
            cx={nodeW / 2 - 8}
            cy={-nodeH / 2 + 8}
            r={5}
            fill={
              node.style.status === 'done'        ? '#10B981' :
              node.style.status === 'in-progress' ? '#F59E0B' : '#6B7280'
            }
            className="status-indicator"
          />
        )}

        {/* Collapse toggle */}
        {hasChildren && (
          <g
            transform={`translate(0, ${nodeH / 2})`}
            className="collapse-toggle"
            onClick={(e) => { e.stopPropagation(); onToggleCollapse(nodeId); }}
          >
            <rect x={-20} y={2} width={40} height={50} fill="transparent" pointerEvents="all" />
            <circle cx={0} cy={20} r={10} fill="#4B5563" />
            <text
              x={0} y={20}
              textAnchor="middle" dominantBaseline="middle"
              fill="#ffffff" fontSize={12} fontWeight="bold"
            >
              {node.collapsed ? '+' : '-'}
            </text>
          </g>
        )}
      </g>
    );
  };

  return (
    <g className="nodes">
      {Object.entries(nodes).map(([nodeId, node]) => renderNode(nodeId, node))}
    </g>
  );
};

export default CanvasNodes;