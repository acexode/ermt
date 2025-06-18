'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import CircularProgress from '@mui/material/CircularProgress';

import type { ProviderProps } from './provider-table-row';

interface Props {
  open: boolean;
  onClose: VoidFunction;
  provider: ProviderProps | null;
  onSuccess: VoidFunction;
}

export function ProviderEditModal({ open, onClose, provider, onSuccess }: Props) {
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const isEdit = !!provider;

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const formData = new FormData(event.currentTarget);
      const data = {
        name: formData.get('name') as string,
      };

      const url = isEdit ? `/api/providers` : '/api/providers';
      const method = isEdit ? 'PATCH' : 'POST';
      const body = isEdit ? { id: provider.id, ...data } : data;

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        await queryClient.invalidateQueries({ queryKey: ['providers'] });
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
          {isEdit ? 'Edit Provider' : 'Add Provider'}
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
              defaultValue={provider?.name}
              required
            />
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
            {isEdit ? 'Save Changes' : 'Create Provider'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
} 
