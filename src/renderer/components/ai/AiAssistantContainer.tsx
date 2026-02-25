import { useRef } from "react";
import { useAiUiStore } from "../../store/aiUiStore";
import { AiAssistantHeader } from "./AiAssistantHeader";
import { AiAssistantContent } from "./AiAssistantContent";

export const AiAssistantContainer = () => {
    const { viewMode, position, setPosition, isDragging, setIsDragging } = useAiUiStore();
    const panelRef = useRef<HTMLDivElement>(null);

    if (viewMode === "hidden") return null;

    const startDrag = (e: React.MouseEvent) => {
        setIsDragging(true);

        const startX = e.clientX;
        const startY = e.clientY;
        const initialPos = { ...position };

        const onMove = (ev: MouseEvent) => {
            setPosition({
                x: initialPos.x + (ev.clientX - startX),
                y: initialPos.y + (ev.clientY - startY),
            });
        };

        const onUp = () => {
            setIsDragging(false);
            window.removeEventListener("mousemove", onMove);
            window.removeEventListener("mouseup", onUp);
        };

        window.addEventListener("mousemove", onMove);
        window.addEventListener("mouseup", onUp);
    };

    return (
        <div
            ref={panelRef}
            className={`ai-panel-container ${isDragging ? "dragging" : ""}`}
            style={{
                position: "fixed",
                left: position.x,
                top: position.y,
                width: 360,
                zIndex: 50,
            }}
        >
            <AiAssistantHeader onDragStart={startDrag} />
            {viewMode === "expanded" && <AiAssistantContent />}
        </div>
    );
};