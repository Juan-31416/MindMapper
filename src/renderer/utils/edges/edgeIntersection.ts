/**
 * Geometric utilities for computing the intersection of a line segment
 * with the border of a rectangle (node boundary).
 */

// ─── Types ───

export interface Point {
  x: number;
  y: number;
}

export interface Rect extends Point {
  x: number;
  y: number;
  width:  number;
  height: number;
}

// ─── Core intersection ───
/**
 * Computes the point where the ray from (fromX, fromY) toward (toCx, toCy)
 * intersects the border of the rectangle centered at (toCx, toCy).
*/

export const intersectRectBorder = (from: Point, target: Rect): Point => {
  const { x: cx, y: cy, width, height } = target;

  const dx = cx - from.x;
  const dy = cy - from.y;

  if (dx === 0 && dy === 0) return { x: cx, y: cy };

  const halfW = width  / 2;
  const halfH = height / 2;

  const candidates: number[] = [];

  if (dx !== 0) {
    candidates.push((cx - halfW - from.x) / dx);
    candidates.push((cx + halfW - from.x) / dx);
  }

  if (dy !== 0) {
    candidates.push((cy - halfH - from.y) / dy);
    candidates.push((cy + halfH - from.y) / dy);
  }

  let bestT = Infinity;

  for (const t of candidates) {
    if (t <= 0) continue;

    const ix = from.x + t * dx;
    const iy = from.y + t * dy;

    const onBorder =
      ix >= cx - halfW - 1e-6 &&
      ix <= cx + halfW + 1e-6 &&
      iy >= cy - halfH - 1e-6 &&
      iy <= cy + halfH + 1e-6;

    if (onBorder && t < bestT) {
      bestT = t;
    }
  }

  if (!isFinite(bestT)) return { x: cx, y: cy };

  return {
    x: from.x + bestT * dx,
    y: from.y + bestT * dy,
  };
};

/**
 * Convenience wrapper: given two node rects, returns the border-to-border
 * start and end points for an edge between them.
 */
export const getBorderPoints = (
  source: Rect,
  target: Rect
): { start: Point; end: Point } => {
  const sourceCenter: Point = { x: source.x, y: source.y };
  const targetCenter: Point = { x: target.x, y: target.y };

  return {
    start: intersectRectBorder(targetCenter, source), // ray from target toward source
    end:   intersectRectBorder(sourceCenter, target), // ray from source toward target
  };
};