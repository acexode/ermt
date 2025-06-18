'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';

import { DataTable } from 'src/components/data-table';
import { DepartmentTableRow } from 'src/sections/department/department-table-row';
import { DepartmentEditModal } from 'src/sections/department/department-edit-modal';

import type { DepartmentProps } from 'src/sections/department/department-table-row';

export default function DepartmentsPage() {
  const [openModal, setOpenModal] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState<DepartmentProps | null>(null);

  const { data: departments = [], isLoading } = useQuery<DepartmentProps[]>({
    queryKey: ['departments'],
    queryFn: async () => {
      const response = await fetch('/api/departments');
      if (!response.ok) throw new Error('Failed to fetch departments');
      return response.json();
    },
  });

  const handleOpenModal = (department?: DepartmentProps) => {
    setSelectedDepartment(department || null);
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setSelectedDepartment(null);
    setOpenModal(false);
  };

  const columns = [
    { id: 'name', label: 'Name' },
    { id: 'provider', label: 'Provider' },
    { id: 'sections', label: 'Sections' },
    { id: '', label: '' },
  ];

  const renderRow = (row: DepartmentProps, selected: boolean, onSelectRow: () => void) => (
    <DepartmentTableRow
      key={row.id}
      row={row}
      selected={selected}
      onSelectRow={onSelectRow}
      onEditRow={handleOpenModal}
    />
  );

  return (
    <>
      <DataTable
        title="Departments"
        data={departments}
        isLoading={isLoading}
        columns={columns}
        renderRow={renderRow}
        onAdd={() => handleOpenModal()}
        addButtonText="Add Department"
      />

      <DepartmentEditModal
        open={openModal}
        onClose={handleCloseModal}
        department={selectedDepartment}
        onSuccess={() => {
          handleCloseModal();
        }}
      />
    </>
  );
} 
