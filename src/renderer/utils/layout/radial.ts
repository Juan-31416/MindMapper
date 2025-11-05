import { PositionedNode, PositionedEdge, LayoutResult, TreeNode } from "../../types/layout";

interface RadialConfig {
    r0?: number;
    levelGap?: number;
    angleStart?: number;
    nodeWidth: number;
    nodeHeight: number;
}

interface SubtreeInfo {
    size: number;
    angleStart: number;
    angleEnd: number;
}

export class RadialLayout {
    private r0: number;
    private levelGap: number;
    private angleStart: number;
    private nodeWidth: number;
    private nodeHeight: number;
    private subtreeSizes: Map<string, number>;
    private subtreeAngles: Map<string, SubtreeInfo>;

    constructor(config: RadialConfig) {
        this.r0 = config.r0 ?? 100;
        this.levelGap = config.levelGap ?? 150;
        this.angleStart = config.angleStart ?? -Math.PI / 2;
        this.nodeWidth = config.nodeWidth;
        this.nodeHeight = config.nodeHeight;
        this.subtreeSizes = new Map();
        this.subtreeAngles = new Map();
    }

    layout(root: TreeNode): LayoutResult {
        // Step 1: Calculate subtree dimension
        this.calculateSubtreeSizes(root);

        // Step 2: Assignate modules
        this.assignAngles(root, this.angleStart, this.angleStart + 2 * Math.PI, 0);

        // Step 3: Calculate positions
        const nodes: Record<string, PositionedNode> = {};
        const edges: PositionedEdge[] = [];
        let minX = Infinity, maxX = -Infinity;
        let minY = Infinity, maxY = -Infinity;

        this.positionNodes(root, 0, nodes, edges, (x, y) => {
            minX = Math.min(minX, x);
            maxX = Math.max(maxX, x);
            minY = Math.min(minY, y);
            maxY = Math.max(maxY, y);
        });

        // Calculate canvas dimentsion
        const padding = 100;
        const width = maxX - minX + this.nodeWidth + 2 + padding;
        const height = maxY - minY + this.nodeHeight + 2 + padding;

        // Adjust poditions to center
        const offsetX = -minX + padding;
        const offsetY = -minY + padding;

        Object.values(nodes).forEach(node => {
            node.x += offsetX;
            node.y += offsetY;
        });

        // Recalculate edges with new positions
        const adjustedEdges = this.recalculateEdges(edges, nodes);

        return {
            nodes,
            edges: adjustedEdges,
            size: { width, height }
        };
    }

    private calculateSubtreeSizes(node: TreeNode): number {
        if (node.collapsed || node.children.length === 0) {
            this.subtreeSizes.set(node.id, 1);
            return 1;
        }

        let totalSize = 1;
        for (const child of node.children) {
            totalSize += this.calculateSubtreeSizes(child);
        }

        this.subtreeSizes.set(node.id, totalSize);
        return totalSize;
    }

    private assignAngles(
        node: TreeNode,
        angleStart: number,
        angleEnd: number,
        depth: number
    ): void {
        const midAngle = (angleStart + angleEnd) / 2;

        this.subtreeAngles.set(node.id, {
            size: this.subtreeSizes.get(node.id) ?? 1,
            angleStart,
            angleEnd
        });

        if (node.collapsed || node.children.length === 0){
            return;
        }

        // Distribuate angles proporcionally with children
        const totalSize = this.subtreeSizes.get(node.id) ?? 1;
        const availableAngle = angleEnd - angleStart;

        let currentAngle = angleStart;

        for (const child of node.children) {
            const childSize = this.subtreeSizes.get(child.id) ?? 1;
            const childAngleSpan = (childSize / totalSize) * availableAngle;
            const childAngleEnd = currentAngle + childAngleSpan;

            this.assignAngles(child, currentAngle, childAngleEnd, depth + 1);
            currentAngle = childAngleEnd;
        }
    }
}