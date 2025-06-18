'use client';

import { useQuery } from '@tanstack/react-query';
import { useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import InputAdornment from '@mui/material/InputAdornment';

import { useRouter } from 'src/routes/hooks';

import { handleApiResponse } from 'src/lib/utils/api';

import { Iconify } from 'src/components/iconify';

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

// ----------------------------------------------------------------------

export function SignUpView() {
  const router = useRouter();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Selected values
  const [selectedProvider, setSelectedProvider] = useState<string>('');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('');
  const [selectedSection, setSelectedSection] = useState<string>('');
  const [selectedDiscipline, setSelectedDiscipline] = useState<string>('');

  // Fetch providers with their departments
  const { data: providers } = useQuery<Provider[]>({
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
  const selectedProviderData = providers?.find(p => p.id === selectedProvider);
  const departments = selectedProviderData?.departments || [];

  // Reset dependent fields when parent selection changes
  useEffect(() => {
    setSelectedDepartment('');
    setSelectedSection('');
    setSelectedDiscipline('');
  }, [selectedProvider]);

  useEffect(() => {
    setSelectedSection('');
    setSelectedDiscipline('');
  }, [selectedDepartment]);

  useEffect(() => {
    setSelectedDiscipline('');
  }, [selectedSection]);

  const handleSignUp = useCallback(async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setIsLoading(true);

    const formData = new FormData(event.currentTarget);
    const data = {
      name: formData.get('name'),
      email: formData.get('email'),
      password: formData.get('password'),
      confirmPassword: formData.get('confirmPassword'),
      providerId: selectedProvider,
      departmentId: selectedDepartment || null,
      sectionId: selectedSection || null,
      disciplineId: selectedDiscipline || null,
    };

    if (data.password !== data.confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    if (!data.providerId) {
      setError('Please select a provider');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/sign-up', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        router.push('/sign-in');
      } else {
        const errorMessage = await response.text();
        setError(errorMessage);
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [router, selectedProvider, selectedDepartment, selectedSection, selectedDiscipline]);

  const renderForm = (
    <Box component="form" onSubmit={handleSignUp}>
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <TextField
        fullWidth
        name="name"
        label="Full name"
        required
        sx={{ mb: 3 }}
        slotProps={{
          inputLabel: { shrink: true },
        }}
      />

      <TextField
        fullWidth
        name="email"
        label="Email address"
        required
        type="email"
        sx={{ mb: 3 }}
        slotProps={{
          inputLabel: { shrink: true },
        }}
      />

      <TextField
        fullWidth
        name="password"
        label="Password"
        required
        type={showPassword ? 'text' : 'password'}
        slotProps={{
          inputLabel: { shrink: true },
          input: {
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                  <Iconify icon={showPassword ? 'solar:eye-bold' : 'solar:eye-closed-bold'} />
                </IconButton>
              </InputAdornment>
            ),
          },
        }}
        sx={{ mb: 3 }}
      />

      <TextField
        fullWidth
        name="confirmPassword"
        label="Confirm password"
        required
        type={showConfirmPassword ? 'text' : 'password'}
        slotProps={{
          inputLabel: { shrink: true },
          input: {
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={() => setShowConfirmPassword(!showConfirmPassword)} edge="end">
                  <Iconify icon={showConfirmPassword ? 'solar:eye-bold' : 'solar:eye-closed-bold'} />
                </IconButton>
              </InputAdornment>
            ),
          },
        }}
        sx={{ mb: 3 }}
      />

      <TextField
        select
        fullWidth
        label="Provider"
        required
        value={selectedProvider}
        onChange={(e) => setSelectedProvider(e.target.value)}
        sx={{ mb: 3 }}
      >
        {providers?.map((provider) => (
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
        onChange={(e) => setSelectedDepartment(e.target.value)}
        sx={{ mb: 3 }}
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
        onChange={(e) => setSelectedSection(e.target.value)}
        sx={{ mb: 3 }}
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
        sx={{ mb: 3 }}
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

      <Button
        fullWidth
        size="large"
        type="submit"
        color="inherit"
        variant="contained"
        disabled={isLoading}
      >
        {isLoading ? 'Signing up...' : 'Sign up'}
      </Button>
    </Box>
  );

  return (
    <>
      <Box
        sx={{
          gap: 1.5,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          mb: 5,
        }}
      >
        <Typography variant="h5">Sign up</Typography>
        <Typography
          variant="body2"
          sx={{
            color: 'text.secondary',
          }}
        >
          Already have an account?
          <Link href="/sign-in" variant="subtitle2" sx={{ ml: 0.5 }}>
            Sign in
          </Link>
        </Typography>
      </Box>
      {renderForm}
      
    </>
  );
} 
