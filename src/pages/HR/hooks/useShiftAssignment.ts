import { useState } from 'react';
import { toast } from 'react-hot-toast';

export interface DraggableEmployee {
  id: number;
  name: string;
  shiftId?: number;
}

export const useShiftAssignment = () => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragStart = (_employee: DraggableEmployee) => {
    setIsDragging(true);
  };

  const handleDrop = async (
    _targetDate: string,
    targetShiftId: number,
    employeeId: number
  ) => {
    try {
      console.log('Asignando turno:', { employeeId, shiftId: targetShiftId });
      toast.success('Turno actualizado correctamente');
    } catch (error) {
      toast.error('Error al asignar turno');
    } finally {
      setIsDragging(false);
    }
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  return {
    isDragging,
    handleDragStart,
    handleDrop,
    handleDragEnd
  };
};
