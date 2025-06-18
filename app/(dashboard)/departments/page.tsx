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
  MenuItem,
} from '@mui/material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Iconify } from 'src/components/iconify';

interface Department {
  id: string;
  name: string;
  provider: {
    id: string;
    name: string;
  };
  sections: Array<{
    id: string;
    name: string;
  }>;
}

interface Provider {
  id: string;
  name: string;
}

export default function DepartmentsPage() {
  const [open, setOpen] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(null);
  const queryClient = useQueryClient();

  const { data: departments, isLoading: isLoadingDepartments } = useQuery<Department[]>({
    queryKey: ['departments'],
    queryFn: async () => {
      const response = await fetch('/api/departments');
      if (!response.ok) throw new Error('Failed to fetch departments');
      return response.json();
    },
  });

  const { data: providers } = useQuery<Provider[]>({
    queryKey: ['providers'],
    queryFn: async () => {
      const response = await fetch('/api/providers');
      if (!response.ok) throw new Error('Failed to fetch providers');
      return response.json();
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: { name: string; providerId: string }) => {
      const response = await fetch('/api/departments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to create department');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departments'] });
      setOpen(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: { id: string; name: string; providerId: string }) => {
      const response = await fetch('/api/departments', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to update department');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departments'] });
      setOpen(false);
      setEditingDepartment(null);
    },
  });

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const name = formData.get('name') as string;
    const providerId = formData.get('providerId') as string;

    if (editingDepartment) {
      await updateMutation.mutateAsync({ id: editingDepartment.id, name, providerId });
    } else {
      await createMutation.mutateAsync({ name, providerId });
    }
  };

  const handleEdit = (department: Department) => {
    setEditingDepartment(department);
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
              <Typography variant="h4">Departments</Typography>
            </Stack>
            <Button
              startIcon={<Iconify icon="mingcute:add-line" />}
              variant="contained"
              onClick={() => setOpen(true)}
            >
              Add Department
            </Button>
          </Stack>

          <Card>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Provider</TableCell>
                  <TableCell>Sections</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {departments?.map((department) => (
                  <TableRow key={department.id}>
                    <TableCell>{department.name}</TableCell>
                    <TableCell>{department.provider.name}</TableCell>
                    <TableCell>
                      {department.sections.map((section) => section.name).join(', ')}
                    </TableCell>
                    <TableCell>
                      <Button
                        size="small"
                        onClick={() => handleEdit(department)}
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
        setEditingDepartment(null);
      }}>
        <form onSubmit={handleSubmit}>
          <DialogTitle>
            {editingDepartment ? 'Edit Department' : 'Add Department'}
          </DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              name="name"
              label="Name"
              type="text"
              fullWidth
              defaultValue={editingDepartment?.name}
              required
            />
            <TextField
              select
              margin="dense"
              name="providerId"
              label="Provider"
              fullWidth
              defaultValue={editingDepartment?.provider.id || ''}
              required
            >
              {providers?.map((provider) => (
                <MenuItem key={provider.id} value={provider.id}>
                  {provider.name}
                </MenuItem>
              ))}
            </TextField>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => {
              setOpen(false);
              setEditingDepartment(null);
            }}>
              Cancel
            </Button>
            <Button type="submit" variant="contained">
              {editingDepartment ? 'Update' : 'Create'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
} 
