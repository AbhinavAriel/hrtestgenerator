import { useRef, useState } from "react";

interface DragState {
  startX: number;
  scrollLeft: number;
  moved: boolean;
}

export const useTableDrag = () => {
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const dragStateRef = useRef<DragState>({
    startX: 0,
    scrollLeft: 0,
    moved: false,
  });

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = scrollRef.current;
    if (!el) return;

    setIsDragging(true);

    dragStateRef.current = {
      startX: e.pageX - el.offsetLeft,
      scrollLeft: el.scrollLeft,
      moved: false,
    };
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = scrollRef.current;
    if (!el || !isDragging) return;

    const x = e.pageX - el.offsetLeft;
    const walk = x - dragStateRef.current.startX;

    if (Math.abs(walk) > 6) dragStateRef.current.moved = true;

    el.scrollLeft = dragStateRef.current.scrollLeft - walk;
  };

  const stopDrag = () => setIsDragging(false);

  return {
    scrollRef,
    isDragging,
    dragStateRef,
    handleMouseDown,
    handleMouseMove,
    stopDrag,
  };
};