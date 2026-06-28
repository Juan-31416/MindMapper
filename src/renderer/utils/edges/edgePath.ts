/**
 * SVG path builders for edges between nodes.
 *
 * Responsibilities:
 *   - Generate SVG path strings given two points (or two node rects)
 *   - Support straight lines and cubic Bezier curves
 *   - Respect the curvedEdges user preference
 *
 * This module is intentionally decoupled from layout engines.
 * Layout engines output positions; this module outputs draw commands.
 */

import { Point, Rect, getBorderPoints } from './edgeIntersection';
export type { Point, Rect };



// ─── Edge style ───

export type EdgeStyle = 'straight' | 'curved';



// ─── Path builders ───
/**
 * Straight line between two points.
 */
export const straightPath = (from: Point, to: Point): string =>
  `M ${from.x} ${from.y} L ${to.x} ${to.y}`;

/**
 * Cubic Bezier curve between two points.
 * Control points are placed along the axis of greatest displacement,
 * producing a smooth S-curve for hierarchical layouts and a
 * smooth arc for radial layouts.
 */

export const cubicBezierPath = (from: Point, to: Point): string => {
  const dx = to.x - from.x;
  const dy = to.y - from.y;

  const isMoreVertical = Math.abs(dy) >= Math.abs(dx);

  let cx1: number, cy1: number, cx2: number, cy2: number;

  if (isMoreVertical) {
    // Hierarchical-style
    const midY = (from.y + to.y) / 2;
    cx1 = from.x; cy1 = midY;
    cx2 = to.x;   cy2 = midY;
  } else {
    // Radial-style
    const distance       = Math.sqrt(dx * dx + dy * dy);
    const controlDist    = distance * 0.4;
    const angle          = Math.atan2(dy, dx);
    cx1 = from.x + controlDist * Math.cos(angle);
    cy1 = from.y + controlDist * Math.sin(angle);
    cx2 = to.x   - controlDist * Math.cos(angle);
    cy2 = to.y   - controlDist * Math.sin(angle);
  }

  return `M ${from.x} ${from.y} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${to.x} ${to.y}`;
};



// ─── Main builder ───
/**
 * Builds an SVG path string for an edge between two nodes.
 *
 * Uses border intersection so the path starts/ends at the node border,
 * not at the center — ensuring arrowheads are visible.
 *
 * @param source     - Source node rect (center + dimensions)
 * @param target     - Target node rect (center + dimensions)
 * @param style      - 'straight' | 'curved'
 */

export const buildEdgePath = (
  source: Rect,
  target: Rect,
  style: EdgeStyle = 'curved'
): string => {
  const { start, end } = getBorderPoints(source, target);

  return style === 'curved'
    ? cubicBezierPath(start, end)
    : straightPath(start, end);
};

/**
 * Legacy compatibility: builds a curved path from two center points
 * without border intersection. Used as fallback during Phase 1.
 * Will be removed after Phase 4.
 *
 * @deprecated Use buildEdgePath with Rect arguments instead.
 */

export const calculateCurvedPath = (
  from: Point,
  to: Point,
  nodeHeight = 60
): string => {
  const startY = from.y + nodeHeight / 2;
  const endY   = to.y   - nodeHeight / 2;
  const midY   = (startY + endY) / 2;

  return `M ${from.x} ${startY} C ${from.x} ${midY}, ${to.x} ${midY}, ${to.x} ${endY}`;
};