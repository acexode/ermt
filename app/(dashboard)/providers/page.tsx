'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';

import { DataTable } from 'src/components/data-table';
import { ProviderTableRow } from 'src/sections/provider/provider-table-row';
import { ProviderEditModal } from 'src/sections/provider/provider-edit-modal';

import type { ProviderProps } from 'src/sections/provider/provider-table-row';

export default function ProvidersPage() {
  const [openModal, setOpenModal] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<ProviderProps | null>(null);

  const { data: providers = [], isLoading } = useQuery<ProviderProps[]>({
    queryKey: ['providers'],
    queryFn: async () => {
      const response = await fetch('/api/providers');
      if (!response.ok) throw new Error('Failed to fetch providers');
      return response.json();
    },
  });

  const handleOpenModal = (provider?: ProviderProps) => {
    setSelectedProvider(provider || null);
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setSelectedProvider(null);
    setOpenModal(false);
  };

  const columns = [
    { id: 'name', label: 'Name' },
    { id: 'departments', label: 'Departments' },
    { id: '', label: '' },
  ];

  const renderRow = (row: ProviderProps, selected: boolean, onSelectRow: () => void) => (
    <ProviderTableRow
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
        title="Providers"
        data={providers}
        isLoading={isLoading}
        columns={columns}
        renderRow={renderRow}
        onAdd={() => handleOpenModal()}
        addButtonText="Add Provider"
      />

      <ProviderEditModal
        open={openModal}
        onClose={handleCloseModal}
        provider={selectedProvider}
        onSuccess={() => {
          handleCloseModal();
        }}
      />
    </>
  );
} 
