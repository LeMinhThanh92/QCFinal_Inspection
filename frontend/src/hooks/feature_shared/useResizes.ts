import React, { useEffect, useState } from 'react';

const useResizes = (
  sizes: Record<string, number>,
  setSizes: React.Dispatch<React.SetStateAction<Record<string, number>>>
) => {
  const [dragging, setDragging] = useState(false);
  const [draggingColumn, setDraggingColumn] = useState<string | null>(null);
  const [startX, setStartX] = useState<number>(0);

  const handleMouseDown = (event: React.MouseEvent, columnName: string) => {
    setDragging(true);
    setDraggingColumn(columnName);
    setStartX(event.clientX);
  };

  const handleMouseMove = (event: MouseEvent) => {
    if (dragging && draggingColumn !== null) {
      const deltaX = event.clientX - startX;
      const columnFlexValue = sizes[draggingColumn];

      const newFlexValue = Math.max(0.5, columnFlexValue + deltaX / 100);

      const flexDifference = newFlexValue - columnFlexValue;

      const updatedSizes = { ...sizes };
      updatedSizes[draggingColumn] = newFlexValue;
      
      const columnNames = Object.keys(sizes);
      const columnIndex = columnNames.indexOf(draggingColumn);

      const columnsAfterDragging = columnNames.slice(columnIndex + 1);

      const totalFlexAfter = columnsAfterDragging.reduce((total, column) => total + sizes[column], 0);

      if (flexDifference !== 0 && totalFlexAfter !== 0) {
        const adjustment = flexDifference / totalFlexAfter;

        columnsAfterDragging.forEach((column) => {
          const currentFlexValue = sizes[column];
          updatedSizes[column] = currentFlexValue - currentFlexValue * adjustment;
          updatedSizes[column] = Math.max(0.5, updatedSizes[column]);
        });
      }

      setSizes(updatedSizes);
      setStartX(event.clientX);
    }
  };

  const handleMouseUp = () => {
    setDragging(false);
    setDraggingColumn(null);
  };

  useEffect(() => {
    if (dragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [dragging]);

  return { handleMouseDown };
};

export default useResizes;