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

interface Discipline {
  id: string;
  name: string;
  section: {
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
  };
}

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
}

export default function DisciplinesPage() {
  const [open, setOpen] = useState(false);
  const [editingDiscipline, setEditingDiscipline] = useState<Discipline | null>(null);
  const queryClient = useQueryClient();

  const { data: disciplines, isLoading: isLoadingDisciplines } = useQuery<Discipline[]>({
    queryKey: ['disciplines'],
    queryFn: async () => {
      const response = await fetch('/api/disciplines');
      if (!response.ok) throw new Error('Failed to fetch disciplines');
      return response.json();
    },
  });

  const { data: sections } = useQuery<Section[]>({
    queryKey: ['sections'],
    queryFn: async () => {
      const response = await fetch('/api/sections');
      if (!response.ok) throw new Error('Failed to fetch sections');
      return response.json();
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: { name: string; sectionId: string }) => {
      const response = await fetch('/api/disciplines', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to create discipline');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['disciplines'] });
      setOpen(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: { id: string; name: string; sectionId: string }) => {
      const response = await fetch('/api/disciplines', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to update discipline');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['disciplines'] });
      setOpen(false);
      setEditingDiscipline(null);
    },
  });

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const name = formData.get('name') as string;
    const sectionId = formData.get('sectionId') as string;

    if (editingDiscipline) {
      await updateMutation.mutateAsync({ id: editingDiscipline.id, name, sectionId });
    } else {
      await createMutation.mutateAsync({ name, sectionId });
    }
  };

  const handleEdit = (discipline: Discipline) => {
    setEditingDiscipline(discipline);
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
              <Typography variant="h4">Disciplines</Typography>
            </Stack>
            <Button
              startIcon={<Iconify icon="mingcute:add-line" />}
              variant="contained"
              onClick={() => setOpen(true)}
            >
              Add Discipline
            </Button>
          </Stack>

          <Card>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Section</TableCell>
                  <TableCell>Department</TableCell>
                  <TableCell>Provider</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {disciplines?.map((discipline) => (
                  <TableRow key={discipline.id}>
                    <TableCell>{discipline.name}</TableCell>
                    <TableCell>{discipline.section.name}</TableCell>
                    <TableCell>{discipline.section.department.name}</TableCell>
                    <TableCell>{discipline.section.department.provider.name}</TableCell>
                    <TableCell>
                      <Button
                        size="small"
                        onClick={() => handleEdit(discipline)}
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
        setEditingDiscipline(null);
      }}>
        <form onSubmit={handleSubmit}>
          <DialogTitle>
            {editingDiscipline ? 'Edit Discipline' : 'Add Discipline'}
          </DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              name="name"
              label="Name"
              type="text"
              fullWidth
              defaultValue={editingDiscipline?.name}
              required
            />
            <TextField
              select
              margin="dense"
              name="sectionId"
              label="Section"
              fullWidth
              defaultValue={editingDiscipline?.section.id || ''}
              required
            >
              {sections?.map((section) => (
                <MenuItem key={section.id} value={section.id}>
                  {section.name} ({section.department.name} - {section.department.provider.name})
                </MenuItem>
              ))}
            </TextField>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => {
              setOpen(false);
              setEditingDiscipline(null);
            }}>
              Cancel
            </Button>
            <Button type="submit" variant="contained">
              {editingDiscipline ? 'Update' : 'Create'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
} 
