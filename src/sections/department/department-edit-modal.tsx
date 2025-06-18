'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import CircularProgress from '@mui/material/CircularProgress';

import type { DepartmentProps } from './department-table-row';

interface Props {
  open: boolean;
  onClose: VoidFunction;
  department: DepartmentProps | null;
  onSuccess: VoidFunction;
}

export function DepartmentEditModal({ open, onClose, department, onSuccess }: Props) {
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const isEdit = !!department;

  const { data: providers = [] } = useQuery({
    queryKey: ['providers'],
    queryFn: async () => {
      const response = await fetch('/api/providers');
      if (!response.ok) throw new Error('Failed to fetch providers');
      return response.json();
    },
  });

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const formData = new FormData(event.currentTarget);
      const data = {
        name: formData.get('name') as string,
        providerId: formData.get('providerId') as string,
      };

      const url = isEdit ? `/api/departments` : '/api/departments';
      const method = isEdit ? 'PATCH' : 'POST';
      const body = isEdit ? { id: department.id, ...data } : data;

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        await queryClient.invalidateQueries({ queryKey: ['departments'] });
        onSuccess();
        onClose();
      } else {
        const errorMessage = await response.text();
        setError(errorMessage);
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>
          {isEdit ? 'Edit Department' : 'Add Department'}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            {error && (
              <Typography color="error" variant="body2">
                {error}
              </Typography>
            )}

            <TextField
              fullWidth
              label="Name"
              name="name"
              defaultValue={department?.name}
              required
            />

            <TextField
              select
              fullWidth
              label="Provider"
              name="providerId"
              defaultValue={department?.provider.id || ''}
              required
            >
              {providers.map((provider: any) => (
                <MenuItem key={provider.id} value={provider.id}>
                  {provider.name}
                </MenuItem>
              ))}
            </TextField>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button variant="outlined" color="inherit" onClick={onClose}>
            Cancel
          </Button>

          <Button
            type="submit"
            variant="contained"
            color="inherit"
            disabled={isLoading}
            startIcon={isLoading && <CircularProgress size={20} />}
          >
            {isEdit ? 'Save Changes' : 'Create Department'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
} 
