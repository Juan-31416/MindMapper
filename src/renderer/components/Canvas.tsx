import React, { useRef, useEffect, useState } from 'react';
import * as LucideIcons from 'lucide-react';
import { useMindMapStore } from '../store/mindMapStore';
import { calculateLayout, calculateCurvedPath, NODE_WIDTH, NODE_HEIGHT } from '../utils/layout';
import { createLayout, buildTreeFromNodes } from '../utils/index';
import { LayoutType, LayoutResults } from '../types/layout';
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
    layout,
  } = useMindMapStore();

  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [draggedNode, setDraggedNode] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [dropTarget, setDropTarget] = useState<string | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [prevPositions, setPrevPositions] = useState<Record<string, { x: number, y:number }>>({});
  const [layoutResult, setLayoutResult] = useState<layoutResult | null>(null);

  // Calculate layout with animation support
  useEffect(() => {
    if (!currentMap || currentMap.rootNodeId) return;

    try {
      // Save previous positons for animation
      const currentLayout = calculateLayout(currentMap.nodes, currentMap.rootNodeId);

      if (currentLayout && layoutResult) {
        const positions: Record<string, { x: number, y: number }> = {};

        Object.entries(layoutResult.nodePositions || currentLayout.nodePositions).forEach(([id, pos]) => {
          positons[id] = { x: pos.x, y: pos.y };
        });
        setPrevPositions(positions);
        setIsAnimating(true);
      }

      // Build tree and create layout
      const tree = buildTreeFromNodes(Object.values(currentMap.nodes), currentMap.rootNodeId);
      const result = createLayout(tree, {
        type: layout || 'hhierarchical',
        nodeWidth: NODE_WIDTH,
        nodeHeight: NODE_HEIGHT,
        
        // Radial config
        r0: 100,
        levelGap: 150,
        angleStart: -Math.PI / 2,
        
        // Hierarchical config
        rankSep: 100,
        nodeSep: 50,
      });

      setLayoutResult(result);

      // Finish animation after 500 ms
      setTimeout(() => setIsAnimating(false), 500);
    } catch (error) {
      console.error('Error calculating layout: ', error);

      //Fallback to basic layout
      const fallbackLayout = calculateLayout(currentMap.nodes, currentMap.rootNodeId);
      setLayoutResult(fallbackLayout as any);
    }
  }, [currentMap?.nodes, currentMap?.rootNodeId, layout]);


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
        const positions = layoutResult.nodePositions || LayoutResult.nodes;
        Object.entries(positions).forEach(([nodeId, pos]) => {
          if (nodeId === draggedNode) return;
          const nodeX = (pos as any).x || pos.x;
          const nodeY = (pos as any).y || pos.y;
          const dx = x - nodeX;
          const dy = y - nodeY;
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
    const bounds = LayoutResult.bounds || {
      minX: 0,
      minY: 0,
      maxX: layoutResult.size?.width || 800,
      maxY: layoutResult.size?.height || 600,
    };

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
      const delta = e.deltaY > 0 ? 0.9 : 1.1;
      const newZoom = Math.min(Math.max(0.1, viewport.zoom + delta), 3);
      setViewport({ zoom: newZoom });
    };

    // Add event listener with passive: false
    svgElement.addEventListener('wheel', handleWheelNative, { passive: false });

    return () => {
      svgElement.removeEventListener('wheel', handleWheelNative);
    };
  }, [viewport.zoom, setViewport]);


  const renderNode = (nodeId: string, node: MindMapNode) => {
    const positions = layoutResult?.nodePositions || layoutResult?.nodes;
    if (!positions) return null;

    const position = positions[nodeId];
    if (!position) return null;

    // Get position with animation support
    let x = (position as any).x || position.x;
    let y = (position as any).y || position.y;

    if (isAnimating && prevPositions[nodeId]) {
      const prev = prevPositions[nodeId];
      x = prev.x + (x - prev.x) * 0.5;
      y = prev.y + (y - prev.y) * 0.5;
    }

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
        transform={`translate(${x}, ${y})`}
        className={`mind-node ${isSelected ? 'selected' : ''} ${isDropTarget ? 'drop-target' : ''} ${isAnimating ? 'animating' : ''}`}
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
          <IconComponent 
            size={20} 
            color={node.style.textColor} 
            style={{ transform: 'translate(-10px, -10px)' }} 
          />
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

  if (!currentMap || !layoutResult) {
    return (
      <div className="canvas-empty">
        <div className="spinner">
          <p>Calculando layout...</p>
        </div>
      </div>
    );
  }

  // Get connections from layout
  const connections = layoutResult.connections || layoutResult.edges || [];

  return (
    <div 
      ref={containerRef} 
      className="canvas-container"
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <svg
        ref={svgRef}
        className={`canvas-svg ${isAnimating ? 'animating' : ''}`}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        style={{ cursor: isPanning ? 'grabbing' : 'grab' }}
      >
        <defs>
          <maker
            id="arrowhead"
            makerWidth="10"
            makerHeight="10"
            refX="9"
            refY="3"
            orient="auto"
          >
            <poligon
              points="0 0, 10 3, 0 6"
              fill="#6B7280"
            />
          </maker>
        </defs>

        <g transform={`translate(${viewport.panX}, ${viewport.panY}) scale(${viewport.zoom})`}>
          {/* Connections */}
          <g className="connections">
            {layout.connections.map((conn: any, i: number) => {
              const path = conn.path || calculateCurvedPath(
                conn.fromPos || { x: conn.from?.x || 0, y: conn.from?.y || 0 },
                conn.toPos || { x: conn.to?.x || 0, y: conn.to?.y || 0 });
              return (
                <path
                  key={`${conn.fromId || conn.from}-${conn.toId || conn.to}-${i}`}
                  d={path}
                  stroke="#6B7280"
                  strokeWidth={2}
                  fill="none"
                  className={'connection-path edge--${layout}'}
                  markerEnd='url(#arrowhead)'
                />
              );
            })}
          </g>

          {/* Nodes */}
          <g className="nodes">
            {Object.entries(currentMap.nodes).map(([nodeId, node]) => {
              return renderNode(nodeId, node);
            })}
          </g>
        </g>
      </svg>

      {/* Controls */}
      <div className="canvas-controls">
        <button
          className="fit-to-screen-btn"
          onClick={fitToScreen}
          title="Fit to Screen"
        >
          <LucideIcons.Maximize2 size={20} />
        </button>

        <button 
          className="reset-view-btn" 
          onClick={resetView} 
          title="Resetear vista"
        >
          <LucideIcons.RotateCcw size={20} />
        </button>
        
        <div className="zoom-indicator">
          {Math.round(viewport.zoom * 100)}%
        </div>
      </div>
    </div>
  );
};

export default Canvas;
