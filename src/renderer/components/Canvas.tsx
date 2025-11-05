import React, { useRef, useEffect, useState } from 'react';
import * as LucideIcons from 'lucide-react';
import { useMindMapStore } from '../store/mindMapStore.js';
import { calculateLayout, calculateCurvedPath, NODE_WIDTH, NODE_HEIGHT } from '../utils/layout';
import { MindMapNode } from '../types/mindmap';
import '../styles/Canvas.css';

const Canvas: React.FC = () => {
  const {
    currentMap,
    selectedNodeId,
    editingNodeId,
    viewport,
    selectNode,
    setEditingNode,
    updateNodeText,
    toggleCollapse,
    setViewport,
    moveNode,
  } = useMindMapStore();

  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [draggedNode, setDraggedNode] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [dropTarget, setDropTarget] = useState<string | null>(null);

  // Calculate layout
  const layout = currentMap
    ? calculateLayout(currentMap.nodes, currentMap.rootNodeId)
    : null;


  // Handle pan start
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 1 || (e.button === 0 && e.target === svgRef.current)) {
      setIsPanning(true);
      setPanStart({ x: e.clientX - viewport.panX, y: e.clientY - viewport.panY });
    }
  };

  // Handle pan move
  const handleMouseMove = (e: React.MouseEvent) => {
    if (isPanning) {
      setViewport({
        panX: e.clientX - panStart.x,
        panY: e.clientY - panStart.y,
      });
    }

    // Handle node dragging
    if (draggedNode && layout) {
      const rect = svgRef.current?.getBoundingClientRect();
      if (rect) {
        const x = (e.clientX - rect.left - viewport.panX) / viewport.zoom;
        const y = (e.clientY - rect.top - viewport.panY) / viewport.zoom;

        // Check for drop targets
        let newDropTarget: string | null = null;
        Object.entries(layout.nodePositions).forEach(([nodeId, pos]) => {
          if (nodeId === draggedNode) return;
          const dx = x - pos.x;
          const dy = y - pos.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          if (distance < 100) {
            newDropTarget = nodeId;
          }
        });
        setDropTarget(newDropTarget);
      }
    }
  };

  // Handle pan/drag end
  const handleMouseUp = () => {
    setIsPanning(false);

    // Handle node drop
    if (draggedNode && dropTarget && currentMap) {
      const node = currentMap.nodes[draggedNode];
      if (node && node.parentId !== dropTarget) {
        const targetNode = currentMap.nodes[dropTarget];
        moveNode(draggedNode, dropTarget, targetNode.children.length);
      }
    }

    setDraggedNode(null);
    setDropTarget(null);
  };

  // Fit to screen
  const fitToScreen = () => {
    if (!layout || !containerRef.current) return;

    const container = containerRef.current.getBoundingClientRect();
    const { bounds } = layout;

    const contentWidth = bounds.maxX - bounds.minX;
    const contentHeight = bounds.maxY - bounds.minY;

    const scaleX = container.width / (contentWidth + 100);
    const scaleY = container.height / (contentHeight + 100);
    const newZoom = Math.min(scaleX, scaleY, 1);

    const centerX = (bounds.minX + bounds.maxX) / 2;
    const centerY = (bounds.minY + bounds.maxY) / 2;

    setViewport({
      zoom: newZoom,
      panX: container.width / 2 - centerX * newZoom,
      panY: container.height / 2 - centerY * newZoom,
    });
  };

  // Fit to screen on initial load
  useEffect(() => {
    if (layout && currentMap) {
      setTimeout(fitToScreen, 100);
    }
  }, [currentMap?.id]);

  // Add wheel event listener with passive: false to allow preventDefault
  useEffect(() => {
    const svgElement = svgRef.current;
    if (!svgElement) return;

    const handleWheelNative = (e: WheelEvent) => {
      e.preventDefault();
      const delta = e.deltaY * -0.001;
      const newZoom = Math.min(Math.max(0.1, viewport.zoom + delta), 3);
      setViewport({ zoom: newZoom });
    };

    // Add event listener with passive: false
    svgElement.addEventListener('wheel', handleWheelNative, { passive: false });

    return () => {
      svgElement.removeEventListener('wheel', handleWheelNative);
    };
  }, [viewport.zoom, setViewport]);

  if (!currentMap || !layout) {
    return (
      <div className="canvas-empty">
        <p>No mind map loaded</p>
      </div>
    );
  }

  const renderNode = (nodeId: string, node: MindMapNode) => {
    const position = layout.nodePositions[nodeId];
    if (!position) return null;

    const isSelected = selectedNodeId === nodeId;
    const isEditing = editingNodeId === nodeId;
    const isDropTarget = dropTarget === nodeId;
    const hasChildren = node.children.length > 0;

    // Get icon component
    const IconComponent = node.style.icon
      ? (LucideIcons as any)[node.style.icon] || LucideIcons.Circle
      : LucideIcons.Circle;

    return (
      <g
        key={nodeId}
        transform={`translate(${position.x}, ${position.y})`}
        className={`mind-node ${isSelected ? 'selected' : ''} ${isDropTarget ? 'drop-target' : ''}`}
        onClick={(e) => {
          e.stopPropagation();
          selectNode(nodeId);
        }}
        onDoubleClick={(e) => {
          e.stopPropagation();
          setEditingNode(nodeId);
        }}
        onMouseDown={(e) => {
          if (e.button === 0 && !isEditing) {
            e.stopPropagation();
            setDraggedNode(nodeId);
            const rect = svgRef.current?.getBoundingClientRect();
            if (rect) {
              setDragOffset({
                x: (e.clientX - rect.left - viewport.panX) / viewport.zoom - position.x,
                y: (e.clientY - rect.top - viewport.panY) / viewport.zoom - position.y,
              });
            }
          }
        }}
      >
        {/* Node background */}
        <rect
          x={-NODE_WIDTH / 2}
          y={-NODE_HEIGHT / 2}
          width={NODE_WIDTH}
          height={NODE_HEIGHT}
          rx={8}
          fill={node.style.backgroundColor}
          stroke={isSelected ? '#ffffff' : 'none'}
          strokeWidth={isSelected ? 3 : 0}
          className="node-bg"
        />

        {/* Icon */}
        <g transform={`translate(${-NODE_WIDTH / 2 + 15}, 0)`}>
          <IconComponent size={20} color={node.style.textColor} style={{ transform: 'translate(-10px, -10px)' }} />
        </g>

        {/* Text */}
        {isEditing ? (
          <foreignObject
            x={-NODE_WIDTH / 2 + 40}
            y={-NODE_HEIGHT / 2 + 10}
            width={NODE_WIDTH - 80}
            height={NODE_HEIGHT - 20}
          >
            <input
              type="text"
              className="node-text-input"
              defaultValue={node.text}
              autoFocus
              onBlur={(e) => {
                updateNodeText(nodeId, e.target.value);
                setEditingNode(null);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  updateNodeText(nodeId, e.currentTarget.value);
                  setEditingNode(null);
                } else if (e.key === 'Escape') {
                  setEditingNode(null);
                }
              }}
              onClick={(e) => e.stopPropagation()}
            />
          </foreignObject>
        ) : (
          <text
            x={10}
            y={0}
            textAnchor="middle"
            dominantBaseline="middle"
            fill={node.style.textColor}
            className="node-text"
          >
            {node.text.length > 25 ? node.text.substring(0, 22) + '...' : node.text}
          </text>
        )}

        {/* Status indicator */}
        {node.style.status && (
          <circle
            cx={NODE_WIDTH / 2 - 15}
            cy={-NODE_HEIGHT / 2 + 15}
            r={6}
            fill={
              node.style.status === 'done'
                ? '#10B981'
                : node.style.status === 'in-progress'
                ? '#F59E0B'
                : '#6B7280'
            }
            className="status-indicator"
          />
        )}

        {/* Collapse indicator */}
        {hasChildren && (
          <g
            transform={`translate(0, ${NODE_HEIGHT / 2 - 5})`}
            className="collapse-toggle"
            onClick={(e) => {
              e.stopPropagation();
              toggleCollapse(nodeId);
            }}
          >
            <circle cx={0} cy={15} r={10} fill="#4B5563" />
            <text
              x={0}
              y={15}
              textAnchor="middle"
              dominantBaseline="middle"
              fill="#ffffff"
              fontSize={12}
              fontWeight="bold"
            >
              {node.collapsed ? '+' : '-'}
            </text>
          </g>
        )}
      </g>
    );
  };

  return (
    <div 
      ref={containerRef} 
      className="canvas-container"
      onMouseUp={handleMouseUp}
    >
      <svg
        ref={svgRef}
        className="canvas-svg"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        style={{ cursor: isPanning ? 'grabbing' : 'grab' }}
      >
        <g transform={`translate(${viewport.panX}, ${viewport.panY}) scale(${viewport.zoom})`}>
          {/* Connections */}
          <g className="connections">
            {layout.connections.map((conn, i) => {
              const path = calculateCurvedPath(conn.fromPos, conn.toPos);
              return (
                <path
                  key={`${conn.fromId}-${conn.toId}-${i}`}
                  d={path}
                  stroke="#6B7280"
                  strokeWidth={2}
                  fill="none"
                  className="connection-path"
                />
              );
            })}
          </g>

          {/* Nodes */}
          <g className="nodes">
            {Object.entries(layout.nodePositions).map(([nodeId]) => {
              const node = currentMap.nodes[nodeId];
              return node ? renderNode(nodeId, node) : null;
            })}
          </g>
        </g>
      </svg>

      {/* Fit to screen button */}
      <button className="fit-to-screen-btn" onClick={fitToScreen} title="Fit to Screen">
        <LucideIcons.Maximize2 size={20} />
      </button>
    </div>
  );
};

export default Canvas;
