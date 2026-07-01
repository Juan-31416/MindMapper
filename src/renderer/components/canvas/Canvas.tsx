/**
 * Orchestrator component for the mind map canvas.
 *
 * Responsibilities:
 *   - Pan / zoom state and event handling
 *   - Node drag-to-reparent logic
 *   - Layout computation (via createLayout)
 *   - Animation interpolation between layout states
 *   - Fit-to-screen
 *   - Delegating rendering to HierarchicalView or RadialView
 */

import React, { useRef, useEffect, useState, useMemo } from 'react';
import * as LucideIcons from 'lucide-react';
import { useMindMapStore } from '../../store/mindMapStore';
import { LayoutResult } from '../../types/mindmap';
import { createLayout, buildTreeFromNodes, NODE_WIDTH, NODE_HEIGHT } from '../../utils/layout';
import { EdgeStyle } from '../../utils/edges';
import type { SearchResult } from '../../types/search';
import HierarchicalView from './layouts/HierarchicalView';
import RadialView from './layouts/RadialView';
import { ArrowheadMarker } from './CanvasEdges';
import '../../styles/Canvas.css';



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
    resetViewport,
    moveNode,
    layout,
    search,
  } = useMindMapStore();



  // ── Refs ──
  const svgRef       = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);



  // ── Pan state ──
  const [isPanning,  setIsPanning]  = useState(false);
  const [panStart,   setPanStart]   = useState({ x: 0, y: 0 });



  // ── Drag-to-reparent state ──
  const [draggedNode, setDraggedNode] = useState<string | null>(null);
  const [dragOffset,  setDragOffset]  = useState({ x: 0, y: 0 });
  const [dropTarget,  setDropTarget]  = useState<string | null>(null);



  // ── Layout + animation state ──
  const [isAnimating,    setIsAnimating]    = useState(false);
  const [prevPositions,  setPrevPositions]  = useState<Record<string, { x: number; y: number }>>({});
  const [layoutResult,   setLayoutResult]   = useState<LayoutResult | null>(null);



  // ── Edge style ──
  const edgeStyle = useMindMapStore((state) => state.edgeStyle);



  // ── Structure fingerprint ──
  const treeStructure = useMemo(() => {
    if (!currentMap) return '';
    const getStructure = (nodeId: string): string => {
      const node = currentMap.nodes[nodeId];
      if (!node) return '';
      const childrenStructure = node.children.map(id => getStructure(id)).join(',');
      return `${nodeId}:${node.collapsed}:${node.text}[${childrenStructure}]`;
    };
    return getStructure(currentMap.rootNodeId);
  }, [currentMap?.nodes, currentMap?.rootNodeId]);



  // ── Layout computation ──
  useEffect(() => {
    if (!currentMap?.rootNodeId) return;

    try {
      // Save previous positions for animation
      if (layoutResult) {
        const positions: Record<string, { x: number; y: number }> = {};
        Object.entries(layoutResult.nodes).forEach(([id, pos]) => {
          positions[id] = { x: pos.x, y: pos.y };
        });
        setPrevPositions(positions);
        setIsAnimating(true);
      }

      const tree   = buildTreeFromNodes(currentMap.nodes, currentMap.rootNodeId);
      const result = createLayout(tree, {
        type:       layout || 'hierarchical',
        nodeWidth:  NODE_WIDTH,
        nodeHeight: NODE_HEIGHT,
        r0:         100,
        levelGap:   180,
        angleStart: -Math.PI / 2,
        rankSep:    100,
        nodeSep:    50,
      });

      setLayoutResult(result);
      setTimeout(() => setIsAnimating(false), 500);
    } catch (error) {
      console.error('Error calculating layout:', error);
    }
  }, [treeStructure, layout]);



  // ── Fit to screen ──
  const fitToScreen = () => {
    if (!layoutResult || !containerRef.current) return;

    const container = containerRef.current.getBoundingClientRect();
    let minX = Infinity, maxX = -Infinity;
    let minY = Infinity, maxY = -Infinity;

    Object.values(layoutResult.nodes).forEach((pos: any) => {
      const w = pos.width  ?? NODE_WIDTH;
      const h = pos.height ?? NODE_HEIGHT;
      minX = Math.min(minX, pos.x - w / 2);
      maxX = Math.max(maxX, pos.x + w / 2);
      minY = Math.min(minY, pos.y - h / 2);
      maxY = Math.max(maxY, pos.y + h / 2);
    });

    if (!isFinite(minX)) return;

    const contentWidth  = maxX - minX;
    const contentHeight = maxY - minY;
    const scaleX  = container.width  / (contentWidth  + 100);
    const scaleY  = container.height / (contentHeight + 100);
    const newZoom = Math.min(scaleX, scaleY, 1);
    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;

    setViewport({
      zoom: newZoom,
      panX: container.width  / 2 - centerX * newZoom,
      panY: container.height / 2 - centerY * newZoom,
    });
  };

  useEffect(() => {
    if (layout && currentMap) setTimeout(fitToScreen, 100);
  }, [currentMap?.id]);



  // ── Wheel zoom ───
  useEffect(() => {
    const svgElement = svgRef.current;
    if (!svgElement) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const delta  = e.deltaY > 0 ? 0.9 : 1.1;
      const newZoom = Math.min(Math.max(viewport.zoom * delta, 0.1), 3);
      setViewport({ zoom: newZoom });
    };

    svgElement.addEventListener('wheel', handleWheel, { passive: false });
    return () => svgElement.removeEventListener('wheel', handleWheel);
  }, [viewport.zoom, setViewport]);



  // ── Mouse handlers ──
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 1 || (e.button === 0 && e.target === svgRef.current)) {
      setIsPanning(true);
      setPanStart({ x: e.clientX - viewport.panX, y: e.clientY - viewport.panY });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isPanning) {
      setViewport({
        panX: e.clientX - panStart.x,
        panY: e.clientY - panStart.y,
      });
    }

    if (draggedNode && layoutResult) {
      const rect = svgRef.current?.getBoundingClientRect();
      if (rect) {
        const x = (e.clientX - rect.left - viewport.panX) / viewport.zoom;
        const y = (e.clientY - rect.top  - viewport.panY) / viewport.zoom;

        let newDropTarget: string | null = null;
        Object.entries(layoutResult.nodes).forEach(([nodeId, pos]) => {
          if (nodeId === draggedNode) return;
          const dx = x - pos.x;
          const dy = y - pos.y;
          if (Math.sqrt(dx * dx + dy * dy) < 100) newDropTarget = nodeId;
        });
        setDropTarget(newDropTarget);
      }
    }
  };

  const handleMouseUp = () => {
    setIsPanning(false);

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

  const handleNodeMouseDown = (
    e: React.MouseEvent,
    nodeId: string,
    x: number,
    y: number
  ) => {
    setDraggedNode(nodeId);
    const rect = svgRef.current?.getBoundingClientRect();
    if (rect) {
      setDragOffset({
        x: (e.clientX - rect.left - viewport.panX) / viewport.zoom - x,
        y: (e.clientY - rect.top  - viewport.panY) / viewport.zoom - y,
      });
    }
  };



  // ── Search derived data ──
  const { searchResultsMap, activeSearchNodeId } = useMemo(() => {
    const map = new Map<string, SearchResult>();
    search.results.forEach(r => map.set(r.nodeId, r));
    const activeNodeId = search.results[search.activeResultIndex]?.nodeId ?? null;
    return { searchResultsMap: map, activeSearchNodeId: activeNodeId};
  }, [search.results, search.activeResultIndex]);



  // ── Shared view props ──
  if (!currentMap || !layoutResult) {
    return (
      <div className="canvas-empty">
        <div className="spinner"><p>Calculando layout...</p></div>
      </div>
    );
  }

  const activeLayout = layout || 'hierarchical';

  const sharedViewProps = {
    nodes:          currentMap.nodes,
    layoutResult,
    rootNodeId:     currentMap.rootNodeId,
    selectedNodeId,
    editingNodeId,
    dropTarget,
    isAnimating,
    prevPositions,
    searchResultsMap,
    activeSearchNodeId,
    edgeStyle,
    svgRef,
    viewport,
    onSelectNode:     selectNode,
    onEditNode:       setEditingNode,
    onUpdateText:     updateNodeText,
    onToggleCollapse: toggleCollapse,
    onNodeMouseDown:  handleNodeMouseDown,
  };

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
          <ArrowheadMarker />
        </defs>

        <g transform={`translate(${viewport.panX}, ${viewport.panY}) scale(${viewport.zoom})`}>
          {activeLayout === 'radial'
            ? <RadialView        {...sharedViewProps} />
            : <HierarchicalView  {...sharedViewProps} />
          }
        </g>
      </svg>

      {/* Controls */}
      <div className="canvas-controls">
        <button className="fit-to-screen-btn" onClick={fitToScreen} title="Fit to Screen">
          <LucideIcons.Maximize2 size={20} />
        </button>
        <button className="reset-view-btn" onClick={resetViewport} title="Resetear vista">
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