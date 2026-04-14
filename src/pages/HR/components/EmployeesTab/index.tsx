import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Trash2, Edit2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { employeeService, Employee } from '../../../../services/hr/employee.service';
import { CreateEmployeeModal } from './CreateEmployeeModal';
import { EditEmployeeModal } from './EditEmployeeModal';

export const EmployeesTab = () => {
  const { t } = useTranslation();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);

  useEffect(() => {
    loadEmployees();
  }, []);

  const loadEmployees = async () => {
    setLoading(true);
    try {
      const data = await employeeService.getAll();
      setEmployees(data);
    } catch (error) {
      console.error('Error loading employees:', error);
      toast.error(t('hr.employees.load_error'));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number, name: string) => {
    if (confirm(t('hr.employees.confirm_delete', { name }))) {
      try {
        await employeeService.delete(id);
        toast.success(t('hr.employees.delete_success'));
        loadEmployees();
      } catch (error) {
        toast.error(t('hr.employees.delete_error'));
      }
    }
  };

  const handleEdit = (employee: Employee) => {
    setSelectedEmployee(employee);
    setShowEditModal(true);
  };

  if (loading) {
    return <div className="flex justify-center p-8">{t('common.loading')}</div>;
  }

  return (
    <div className="bg-white rounded-xl shadow-sm">
      <div className="flex justify-between items-center p-4 border-b">
        <h2 className="text-lg font-semibold text-gray-900">{t('hr.employees.title')}</h2>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" />
          {t('hr.employees.new_employee')}
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-3 text-left text-sm font-medium text-gray-500">{t('hr.employees.name')}</th>
              <th className="p-3 text-left text-sm font-medium text-gray-500">{t('common.email')}</th>
              <th className="p-3 text-left text-sm font-medium text-gray-500">{t('hr.employees.phone')}</th>
              <th className="p-3 text-left text-sm font-medium text-gray-500">{t('hr.employees.cni')}</th>
              <th className="p-3 text-center text-sm font-medium text-gray-500">{t('common.actions')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {employees.map(emp => (
              <tr key={emp.id} className="hover:bg-gray-50">
                <td className="p-3 font-medium text-gray-900">{emp.user?.full_name || t('hr.employees.na')}</td>
                <td className="p-3 text-gray-600">{emp.user?.email || t('hr.employees.na')}</td>
                <td className="p-3 text-gray-600">{emp.phone || t('hr.employees.na')}</td>
                <td className="p-3 text-gray-600">{emp.cni || t('hr.employees.na')}</td>
                <td className="p-3 text-center">
                  <button
                    onClick={() => handleEdit(emp)}
                    className="text-blue-600 hover:text-blue-800 transition mx-1"
                    title={t('common.edit')}
                  >
                    <Edit2 className="w-4 h-4 inline" />
                  </button>
                  <button
                    onClick={() => handleDelete(emp.id, emp.user?.full_name || t('hr.employees.employee'))}
                    className="text-red-600 hover:text-red-800 transition mx-1"
                    title={t('common.delete')}
                  >
                    <Trash2 className="w-4 h-4 inline" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <CreateEmployeeModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={loadEmployees}
      />

      <EditEmployeeModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedEmployee(null);
        }}
        employee={selectedEmployee}
        onSuccess={loadEmployees}
      />
    </div>
  );
};
