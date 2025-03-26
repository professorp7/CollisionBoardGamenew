import React, { useRef, useState } from 'react';

export interface DraggableItemProps<T = any> {
  id: string;
  index: number;
  data: T;
  children: React.ReactNode;
  onDragEnd: (result: { source: number; destination: number; data: T }) => void;
}

export function DraggableItem<T>({
  id,
  index,
  data,
  children,
  onDragEnd
}: DraggableItemProps<T>) {
  const [isDragging, setIsDragging] = useState(false);
  const elementRef = useRef<HTMLDivElement>(null);
  const dragStartPosRef = useRef<{ x: number; y: number } | null>(null);
  const originalIndexRef = useRef<number>(index);
  const [isTouchDragging, setIsTouchDragging] = useState(false);
  const touchStartPos = useRef<{ x: number; y: number } | null>(null);


  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    if (!elementRef.current) return;

    originalIndexRef.current = index;

    // Set drag image
    const rect = elementRef.current.getBoundingClientRect();
    e.dataTransfer.setDragImage(elementRef.current, rect.width / 2, rect.height / 2);

    // Set data
    e.dataTransfer.setData('text/plain', JSON.stringify({
      id,
      index,
      data
    }));

    // Set effect
    e.dataTransfer.effectAllowed = 'move';

    setIsDragging(true);
  };

  const handleDragEnd = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    // Handle empty drop case
    if (!e.dataTransfer.dropEffect || e.dataTransfer.dropEffect === 'none') {
      return;
    }
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    const touch = e.touches[0];
    touchStartPos.current = { x: touch.clientX, y: touch.clientY };
    setIsTouchDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!touchStartPos.current) return;
    e.preventDefault();
    const touch = e.touches[0];
    // Add your touch move logic here if needed  (Further development needed here to mirror dragStart/End logic)

  };

  const handleTouchEnd = () => {
    touchStartPos.current = null;
    setIsTouchDragging(false);
    // Add your touch end logic here (Further development needed here to mirror dragStart/End logic)
  };

  return (
    <div
      ref={elementRef}
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className={`${isDragging || isTouchDragging ? 'opacity-50' : ''} transition-opacity`}
      data-draggable-id={id}
      data-draggable-index={index}
      style={{ touchAction: 'manipulation' }}
    >
      {children}
    </div>
  );
}

export interface DroppableProps {
  id: string;
  children: React.ReactNode;
  className?: string;
  onDrop: (result: { sourceId: string; sourceIndex: number; destinationIndex: number; data: any }) => void;
}

export function Droppable({ id, children, className = '', onDrop }: DroppableProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const droppableRef = useRef<HTMLDivElement>(null);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';

    if (!isDragOver) {
      setIsDragOver(true);
    }
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);

    try {
      const data = JSON.parse(e.dataTransfer.getData('text/plain'));
      const sourceId = data.id;
      const sourceIndex = data.index;

      // Get target index (where we're dropping)
      let destinationIndex = React.Children.count(children); // Default to end

      // If we have a target element, find its index
      const target = e.target as HTMLElement;
      const closestDraggable = target.closest('[data-draggable-index]');

      if (closestDraggable) {
        const targetIndex = parseInt(closestDraggable.getAttribute('data-draggable-index') || '-1', 10);
        if (targetIndex >= 0) {
          destinationIndex = targetIndex;
        }
      }

      // Call the callback with the result
      onDrop({
        sourceId,
        sourceIndex,
        destinationIndex,
        data: data.data
      });
    } catch (error) {
      console.error('Error parsing drag data:', error);
    }
  };

  return (
    <div
      ref={droppableRef}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`${className} ${isDragOver ? 'bg-gray-800/30' : ''} transition-colors`}
      data-droppable-id={id}
    >
      {children}
    </div>
  );
}