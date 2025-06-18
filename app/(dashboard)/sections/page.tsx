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

interface Section {
  id: string;
  name: string;
  department: {
    id: string;
    name: string;
    provider: {
      id: string;
      name: string;
    };
  };
  disciplines: Array<{
    id: string;
    name: string;
  }>;
}

interface Department {
  id: string;
  name: string;
  provider: {
    id: string;
    name: string;
  };
}

export default function SectionsPage() {
  const [open, setOpen] = useState(false);
  const [editingSection, setEditingSection] = useState<Section | null>(null);
  const queryClient = useQueryClient();

  const { data: sections, isLoading: isLoadingSections } = useQuery<Section[]>({
    queryKey: ['sections'],
    queryFn: async () => {
      const response = await fetch('/api/sections');
      if (!response.ok) throw new Error('Failed to fetch sections');
      return response.json();
    },
  });

  const { data: departments } = useQuery<Department[]>({
    queryKey: ['departments'],
    queryFn: async () => {
      const response = await fetch('/api/departments');
      if (!response.ok) throw new Error('Failed to fetch departments');
      return response.json();
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: { name: string; departmentId: string }) => {
      const response = await fetch('/api/sections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to create section');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sections'] });
      setOpen(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: { id: string; name: string; departmentId: string }) => {
      const response = await fetch('/api/sections', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to update section');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sections'] });
      setOpen(false);
      setEditingSection(null);
    },
  });

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const name = formData.get('name') as string;
    const departmentId = formData.get('departmentId') as string;

    if (editingSection) {
      await updateMutation.mutateAsync({ id: editingSection.id, name, departmentId });
    } else {
      await createMutation.mutateAsync({ name, departmentId });
    }
  };

  const handleEdit = (section: Section) => {
    setEditingSection(section);
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
              <Typography variant="h4">Sections</Typography>
            </Stack>
            <Button
              startIcon={<Iconify icon="mingcute:add-line" />}
              variant="contained"
              onClick={() => setOpen(true)}
            >
              Add Section
            </Button>
          </Stack>

          <Card>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Department</TableCell>
                  <TableCell>Provider</TableCell>
                  <TableCell>Disciplines</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {sections?.map((section) => (
                  <TableRow key={section.id}>
                    <TableCell>{section.name}</TableCell>
                    <TableCell>{section.department.name}</TableCell>
                    <TableCell>{section.department.provider.name}</TableCell>
                    <TableCell>
                      {section.disciplines.map((discipline) => discipline.name).join(', ')}
                    </TableCell>
                    <TableCell>
                      <Button
                        size="small"
                        onClick={() => handleEdit(section)}
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
        setEditingSection(null);
      }}>
        <form onSubmit={handleSubmit}>
          <DialogTitle>
            {editingSection ? 'Edit Section' : 'Add Section'}
          </DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              name="name"
              label="Name"
              type="text"
              fullWidth
              defaultValue={editingSection?.name}
              required
            />
            <TextField
              select
              margin="dense"
              name="departmentId"
              label="Department"
              fullWidth
              defaultValue={editingSection?.department.id || ''}
              required
            >
              {departments?.map((department) => (
                <MenuItem key={department.id} value={department.id}>
                  {department.name} ({department.provider.name})
                </MenuItem>
              ))}
            </TextField>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => {
              setOpen(false);
              setEditingSection(null);
            }}>
              Cancel
            </Button>
            <Button type="submit" variant="contained">
              {editingSection ? 'Update' : 'Create'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
} 
