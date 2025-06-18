'use client';

import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';

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

import { useAuth } from 'src/context/auth-context';
import { handleApiResponse } from 'src/lib/utils/api';

import type { UserProps } from './user-table-row';

interface Provider {
  id: string;
  name: string;
  departments: Department[];
}

interface Department {
  id: string;
  name: string;
  sections: Section[];
}

interface Section {
  id: string;
  name: string;
  disciplines: Discipline[];
}

interface Discipline {
  id: string;
  name: string;
}

interface Props {
  open: boolean;
  onClose: VoidFunction;
  user: UserProps | null;
  onSuccess: VoidFunction;
}

export function UserEditModal({ open, onClose, user, onSuccess }: Props) {
  const queryClient = useQueryClient();
  const { user: currentUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const isEdit = !!user;
  const isSuperAdmin = currentUser?.role === 'SUPERADMIN';

  // Selected values
  const [selectedProvider, setSelectedProvider] = useState<string>(user?.provider?.id || '');
  const [selectedDepartment, setSelectedDepartment] = useState<string>(user?.department?.id || '');
  const [selectedSection, setSelectedSection] = useState<string>(user?.section?.id || '');
  const [selectedDiscipline, setSelectedDiscipline] = useState<string>(user?.discipline?.id || '');
  const [selectedRole, setSelectedRole] = useState<string>(user?.role || 'USER');

  // Fetch providers with their departments
  const { data: providers = [] } = useQuery<Provider[]>({
    queryKey: ['providers'],
    queryFn: async () => {
      const response = await fetch('/api/providers');
      return handleApiResponse<Provider[]>(response);
    },
  });

  // Fetch sections when department is selected
  const { data: sections = [] } = useQuery<Section[]>({
    queryKey: ['sections', selectedDepartment],
    queryFn: async () => {
      if (!selectedDepartment) return [];
      const response = await fetch(`/api/departments/${selectedDepartment}/sections`);
      return handleApiResponse<Section[]>(response);
    },
    enabled: !!selectedDepartment,
  });

  // Fetch disciplines when section is selected
  const { data: disciplines = [] } = useQuery<Discipline[]>({
    queryKey: ['disciplines', selectedSection],
    queryFn: async () => {
      if (!selectedSection) return [];
      const response = await fetch(`/api/sections/${selectedSection}/disciplines`);
      return handleApiResponse<Discipline[]>(response);
    },
    enabled: !!selectedSection,
  });

  // Get selected provider's departments
  const selectedProviderData = providers.find(p => p.id === selectedProvider);
  const departments = selectedProviderData?.departments || [];

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const formData = new FormData(event.currentTarget);
      const data = {
        name: formData.get('name'),
        email: formData.get('email'),
        password: formData.get('password'),
        role: selectedRole,
        providerId: selectedProvider,
        departmentId: selectedDepartment || null,
        sectionId: selectedSection || null,
        disciplineId: selectedDiscipline || null,
      };

      const url = isEdit ? `/api/users/${user.id}` : '/api/users';
      const method = isEdit ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        // Invalidate and refetch users data
        await queryClient.invalidateQueries({ queryKey: ['users'] });
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

  const canEdit = isSuperAdmin || currentUser?.id === user?.id;

  if (!isEdit && !isSuperAdmin) {
    return null;
  }

  if (isEdit && !canEdit) {
    return null;
  }

  return (
    <Dialog
      fullWidth
      maxWidth="sm"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: { maxHeight: 720 },
      }}
    >
      <DialogTitle>{isEdit ? 'Edit User' : 'New User'}</DialogTitle>

      <DialogContent sx={{ mt: 2 }}>
        <Card sx={{ p: 3 }}>
          <Box component="form" onSubmit={handleSubmit}>
            {error && (
              <Typography color="error" sx={{ mb: 3 }}>
                {error}
              </Typography>
            )}

            <Stack spacing={3}>
              <TextField
                fullWidth
                name="name"
                label="Full name"
                defaultValue={user?.name}
                required
              />

              <TextField
                fullWidth
                name="email"
                label="Email address"
                defaultValue={user?.email}
                required
                type="email"
              />

              {!isEdit && (
                <TextField
                  fullWidth
                  name="password"
                  label="Password"
                  type="password"
                  required
                />
              )}

              <TextField
                select
                fullWidth
                label="Role"
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                disabled={!isSuperAdmin}
                required
              >
                <MenuItem value="USER">User</MenuItem>
                <MenuItem value="ADMIN">Admin</MenuItem>
                <MenuItem value="SUPERADMIN">Super Admin</MenuItem>
              </TextField>

              <TextField
                select
                fullWidth
                label="Provider"
                value={selectedProvider}
                onChange={(e) => {
                  setSelectedProvider(e.target.value);
                  setSelectedDepartment('');
                  setSelectedSection('');
                  setSelectedDiscipline('');
                }}
                required
              >
                {providers.map((provider) => (
                  <MenuItem key={provider.id} value={provider.id}>
                    {provider.name}
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                select
                fullWidth
                label="Department (Optional)"
                value={selectedDepartment}
                onChange={(e) => {
                  setSelectedDepartment(e.target.value);
                  setSelectedSection('');
                  setSelectedDiscipline('');
                }}
              >
                <MenuItem value="">
                  <em>None</em>
                </MenuItem>
                {departments.map((department) => (
                  <MenuItem key={department.id} value={department.id}>
                    {department.name}
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                select
                fullWidth
                label="Section (Optional)"
                value={selectedSection}
                onChange={(e) => {
                  setSelectedSection(e.target.value);
                  setSelectedDiscipline('');
                }}
                disabled={!selectedDepartment}
              >
                <MenuItem value="">
                  <em>None</em>
                </MenuItem>
                {sections.map((section) => (
                  <MenuItem key={section.id} value={section.id}>
                    {section.name}
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                select
                fullWidth
                label="Discipline (Optional)"
                value={selectedDiscipline}
                onChange={(e) => setSelectedDiscipline(e.target.value)}
                disabled={!selectedSection}
              >
                <MenuItem value="">
                  <em>None</em>
                </MenuItem>
                {disciplines.map((discipline) => (
                  <MenuItem key={discipline.id} value={discipline.id}>
                    {discipline.name}
                  </MenuItem>
                ))}
              </TextField>
            </Stack>

            <DialogActions sx={{ mt: 3 }}>
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
                {isEdit ? 'Save Changes' : 'Create User'}
              </Button>
            </DialogActions>
          </Box>
        </Card>
      </DialogContent>
    </Dialog>
  );
} 
