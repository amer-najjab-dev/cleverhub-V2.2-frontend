import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { employeeService } from '../../../services/hr/employee.service';

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
    targetDate: string,
    targetShiftId: number,
    employeeId: number
  ) => {
    try {
      // Llamada real al servicio para asignar turno
      await employeeService.assignShift({
        employeeId,
        shiftId: targetShiftId,
        date: targetDate
      });
      toast.success('Turno asignado correctamente');
    } catch (error) {
      console.error('Error assigning shift:', error);
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