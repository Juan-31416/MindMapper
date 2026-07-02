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
import type { SearchResult, SearchMatchSegment } from '../../types/search';
import { getContrastTextColor } from '../../utils/colorUtils';



// ─── Text rendering constants ───

const FONT_SIZE   = 13;
const LINE_HEIGHT = 20;
const FONT_FAMILY = 'Inter, system-ui, sans-serif';



// ─── wrapTextWithOffsets ───

interface WrappedLine {
  text: string;
  startOffset: number;
}

const wrapTextWithOffsets = (text: string, maxWidth: number, isBold = false): WrappedLine[] => {
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
  const lines: WrappedLine[] = [];
  let currentLine = '';
  let currentOffset = 0;

  for (const word of words) {
    const testLine  = currentLine ? `${currentLine} ${word}` : word;
    const testWidth = ctx
      ? ctx.measureText(testLine).width
      : testLine.length * (FONT_SIZE * 0.6);

    if (testWidth > maxWidth && currentLine) {
      lines.push({ text: currentLine, startOffset: currentOffset });
      currentOffset += currentLine.length + 1; 
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  }
  if (currentLine) lines.push({ text: currentLine, startOffset: currentOffset });

  return lines;
};


// ─── splitLineByMatches ───

interface TextSegment {
  text: string;
  isMatch: boolean;
}

const splitLineByMatches = (
  lineText: string,
  lineStart: number,
  matches: SearchMatchSegment[],
): TextSegment[] => {
  const lineEnd = lineStart + lineText.length - 1;
  const segments: TextSegment[] = [];
  let cursor = 0;

  const overlapping = matches.filter(m => m.start <= lineEnd && m.end >= lineStart).map(m => ({
    localStart: Math.max(m.start, lineStart) - lineStart,
    localEnd: Math.min(m.end, lineEnd) - lineStart,
  }))
  .sort((a, b) => a.localStart - b.localStart);

  for (const { localStart, localEnd } of overlapping) {
    if (cursor < localStart) {
      segments.push({ text: lineText.slice(cursor, localStart), isMatch: false });
    }

    segments.push({ text: lineText.slice(localStart, localEnd + 1), isMatch: true });
    cursor = localEnd + 1;
  }

  if (cursor < lineText.length) {
    segments.push({ text: lineText.slice(cursor), isMatch: false });
  }

  // Fallback: no matches
  if (segments.length === 0) {
    segments.push({ text: lineText, isMatch: false });
  }

  return segments;
}



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
  searchResultsMap:    Map<string, SearchResult>;
  activeSearchNodeId:  string | null;
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
  searchResultsMap,
  activeSearchNodeId,
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
    const isRoot       = nodeId === rootNodeId;

    const searchResult    = searchResultsMap.get(nodeId);
    const isSearchMatch = searchResultsMap.has(nodeId);
    const isActiveSearch = activeSearchNodeId === nodeId;

    const PADDING_H = 50;
    const wrappedLines = wrapTextWithOffsets(node.text, nodeW - PADDING_H, isRoot);
    const totalTextHeight = wrappedLines.length * LINE_HEIGHT;

    const hasIcon = Boolean(node.style.icon);
    const IconComponent = node.style.icon
      ? (LucideIcons as any)[node.style.icon!] || null : null;

    const bgColor  = node.style.backgroundColor;
    const opacity  = node.style.backgroundType === 'none'
      ? 0
      : (node.style.backgroundOpacity ?? 100) / 100;
    const textColor = getContrastTextColor(node.style);
    const bStyle    = node.style.borderStyle ?? 'full';
    const bColor    = node.style.borderColor || node.style.backgroundColor;
    const fontSize   = isRoot ? FONT_SIZE + 3 : FONT_SIZE;
    const fontWeight = isRoot ? 'bold' : 'normal';

    const TEXT_X_ICON = -nodeW / 2 + 42;
    const TEXT_X_NO_ICON = -nodeW / 2 + 14;
    const textX = hasIcon ? TEXT_X_ICON : TEXT_X_NO_ICON;

    const nodeClasses = [
      'mind-node',
      isSelected    ? 'selected'      : '',
      isDropTarget  ? 'drop-target'   : '',
      isAnimating   ? 'animating'     : '',
      isSearchMatch && isActiveSearch  ? 'search-match search-match--active'   : '',
      isSearchMatch && !isActiveSearch ? 'search-match search-match--secondary' : '',
      isRoot        ? 'root-node'     : '',
    ].filter(Boolean).join(' ');



    return (
      <g
        key={nodeId}
        transform={`translate(${x}, ${y})`}
        className={nodeClasses}
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
            x={-nodeW / 2 - 8} y={-nodeH / 2 - 8}
            width={nodeW + 16}  height={nodeH + 16}
            rx={14} fill="none"
            stroke="rgba(255, 255, 255, 0.12)" strokeWidth={4}
            className="root-halo-outer"
          />
        )}
        {isRoot && (
          <rect
            x={-nodeW / 2 - 3} y={-nodeH / 2 - 3}
            width={nodeW + 6}   height={nodeH + 6}
            rx={10} fill="none"
            stroke="rgba(255, 255, 255, 0.55)" strokeWidth={1.5}
            className="root-halo-inner"
          />
        )}

        {/* Node background */}
        <rect
          x={-nodeW / 2} y={-nodeH / 2}
          width={nodeW}   height={nodeH}
          rx={8}
          fill={bgColor}
          fillOpacity={opacity}
          stroke={bStyle === 'full' ? bColor : isSelected ? '#ffffff' : 'none'}
          strokeWidth={bStyle === 'full' ? (node.style.borderWidth || 2) : isSelected ? 3 : 0}
          className="node-bg"
        />

        {/* Bottom border */}
        {bStyle === 'bottom' && (
          <line
            x1={-nodeW / 2} y1={nodeH / 2}
            x2={ nodeW / 2} y2={nodeH / 2}
            stroke={bColor} strokeWidth={3} strokeLinecap="round"
          />
        )}

        {/* Icon */}
        {IconComponent && (
          <g transform={`translate(${-nodeW / 2 + 15}, 0)`}>
            <IconComponent size={18} color={textColor} x={-9} y={-9} />
          </g>
        )}

        {/* Text */}
        {isEditing ? (
          <foreignObject
            x={textX}
            y={-totalTextHeight / 2}
            width={nodeW - (hasIcon ? 55 : 28)}
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
            x={textX}
            y={-(totalTextHeight / 2) + (LINE_HEIGHT * 0.75)}
            fill={textColor}
            fontSize={fontSize}
            fontFamily={FONT_FAMILY}
            fontWeight={fontWeight}
            className="node-text"
          >
            {wrappedLines.map((line, lineIdx) => {
              // No search active on this node → plain render
              if (!searchResult) {
                return (
                  <tspan key={lineIdx} x={textX} dy={lineIdx === 0 ? 0 : LINE_HEIGHT}>
                    {line.text}
                  </tspan>
                );
              }

              const segments = splitLineByMatches(
                line.text,
                line.startOffset,
                searchResult.textMatches,
              );

              return (
                <tspan key={lineIdx} x={textX} dy={lineIdx === 0 ? 0 : LINE_HEIGHT}>
                  {segments.map((seg, segIdx) =>
                    seg.isMatch ? (
                      <tspan
                        key={segIdx}
                        textDecoration="underline"
                        style={{ textUnderlineOffset: '2px' }}
                      >
                        {seg.text}
                      </tspan>
                    ) : (
                      <tspan key={segIdx}>{seg.text}</tspan>
                    )
                  )}
                </tspan>
              );
            })}
          </text>
        )}

        {/* Status indicator */}
        {node.style.status && (
          <circle
            cx={nodeW / 2 - 8} cy={-nodeH / 2 + 8} r={5}
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