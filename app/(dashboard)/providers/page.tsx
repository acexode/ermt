'use client';

import { useState } from 'react';
import {
  Box,
  Button,
  Card,
  Container,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from '@mui/material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { Iconify } from 'src/components/iconify';

interface Provider {
  id: string;
  name: string;
  departments: Array<{
    id: string;
    name: string;
  }>;
}

export default function ProvidersPage() {
  const [open, setOpen] = useState(false);
  const [editingProvider, setEditingProvider] = useState<Provider | null>(null);
  const queryClient = useQueryClient();

  const { data: providers, isLoading } = useQuery<Provider[]>({
    queryKey: ['providers'],
    queryFn: async () => {
      const response = await fetch('/api/providers');
      if (!response.ok) throw new Error('Failed to fetch providers');
      return response.json();
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: { name: string }) => {
      const response = await fetch('/api/providers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to create provider');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['providers'] });
      setOpen(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: { id: string; name: string }) => {
      const response = await fetch('/api/providers', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to update provider');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['providers'] });
      setOpen(false);
      setEditingProvider(null);
    },
  });

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const name = formData.get('name') as string;

    if (editingProvider) {
      await updateMutation.mutateAsync({ id: editingProvider.id, name });
    } else {
      await createMutation.mutateAsync({ name });
    }
  };

  const handleEdit = (provider: Provider) => {
    setEditingProvider(provider);
    setOpen(true);
  };

  return (
    <Box
      component="main"
      sx={{
        flexGrow: 1,
        py: 8,
      }}
    >
      <Container maxWidth="xl">
        <Stack spacing={3}>
          <Stack
            direction="row"
            justifyContent="space-between"
            spacing={4}
          >
            <Stack spacing={1}>
              <Typography variant="h4">Providers</Typography>
            </Stack>
            <Button
              startIcon={<Iconify icon="mingcute:add-line" />}
              variant="contained"
              onClick={() => setOpen(true)}
            >
              Add Provider
            </Button>
          </Stack>

          <Card>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Departments</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {providers?.map((provider) => (
                  <TableRow key={provider.id}>
                    <TableCell>{provider.name}</TableCell>
                    <TableCell>
                      {provider.departments.map((dept) => dept.name).join(', ')}
                    </TableCell>
                    <TableCell>
                      <Button
                        size="small"
                        onClick={() => handleEdit(provider)}
                      >
                        Edit
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </Stack>
      </Container>

      <Dialog open={open} onClose={() => {
        setOpen(false);
        setEditingProvider(null);
      }}>
        <form onSubmit={handleSubmit}>
          <DialogTitle>
            {editingProvider ? 'Edit Provider' : 'Add Provider'}
          </DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              name="name"
              label="Name"
              type="text"
              fullWidth
              defaultValue={editingProvider?.name}
              required
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => {
              setOpen(false);
              setEditingProvider(null);
            }}>
              Cancel
            </Button>
            <Button type="submit" variant="contained">
              {editingProvider ? 'Update' : 'Create'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
} 
