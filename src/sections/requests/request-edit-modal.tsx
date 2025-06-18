'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import {
  Button,
  Dialog,
  MenuItem,
  TextField,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';

import { handleApiResponse } from 'src/lib/utils/api';

interface Request {
  id: string;
  title: string;
  requestedService: string;
  serviceDescription: string;
  businessJustification: string;
  requiredStartDate: string;
  requiredCompletionDate: string;
  fileUrl?: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  requestGroup: string;
  impactCategory: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  user: {
    id: string;
    name: string;
  };
  provider: {
    id: string;
    name: string;
  };
  department: {
    id: string;
    name: string;
  };
}

interface Provider {
  id: string;
  name: string;
}

interface Department {
  id: string;
  name: string;
  providerId: string;
}

interface Props {
  open: boolean;
  onClose: VoidFunction;
  request: Request | null;
  providers: Provider[];
  departments: Department[];
}

export function RequestEditModal({ open, onClose, request, providers, departments }: Props) {
  const [startDate, setStartDate] = useState<Date | null>(request ? new Date(request.requiredStartDate) : null);
  const [completionDate, setCompletionDate] = useState<Date | null>(request ? new Date(request.requiredCompletionDate) : null);
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: async (data: {
      title: string;
      requestedService: string;
      serviceDescription: string;
      businessJustification: string;
      requiredStartDate: string;
      requiredCompletionDate: string;
      fileUrl?: string;
      priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
      requestGroup: string;
      impactCategory: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
      providerId: string;
      departmentId: string;
    }) => {
      const response = await fetch('/api/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      return handleApiResponse(response);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['requests'] });
      onClose();
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: {
      id: string;
      title: string;
      requestedService: string;
      serviceDescription: string;
      businessJustification: string;
      requiredStartDate: string;
      requiredCompletionDate: string;
      fileUrl?: string;
      priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
      requestGroup: string;
      impactCategory: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
      providerId: string;
      departmentId: string;
    }) => {
      const response = await fetch('/api/requests', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      return handleApiResponse(response);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['requests'] });
      onClose();
    },
  });

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const data = {
      title: formData.get('title') as string,
      requestedService: formData.get('requestedService') as string,
      serviceDescription: formData.get('serviceDescription') as string,
      businessJustification: formData.get('businessJustification') as string,
      requiredStartDate: startDate?.toISOString() as string,
      requiredCompletionDate: completionDate?.toISOString() as string,
      fileUrl: formData.get('fileUrl') as string,
      priority: formData.get('priority') as 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL',
      requestGroup: formData.get('requestGroup') as string,
      impactCategory: formData.get('impactCategory') as 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL',
      providerId: formData.get('providerId') as string,
      departmentId: formData.get('departmentId') as string,
    };

    if (request) {
      await updateMutation.mutateAsync({ id: request.id, ...data });
    } else {
      await createMutation.mutateAsync(data);
    }
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <form onSubmit={handleSubmit}>
        <DialogTitle>
          {request ? 'Edit Request' : 'Add Request'}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            name="title"
            label="Title"
            type="text"
            fullWidth
            defaultValue={request?.title}
            required
          />
          <TextField
            select
            margin="dense"
            name="requestedService"
            label="Requested Service"
            fullWidth
            defaultValue={request?.requestedService}
            required
          >
            <MenuItem value="Engineering Request">Engineering Request</MenuItem>
            <MenuItem value="Assurance">Assurance</MenuItem>
            <MenuItem value="Technical Audit">Technical Audit</MenuItem>
            <MenuItem value="Technical evaluation">Technical evaluation</MenuItem>
          </TextField>
          <TextField
            margin="dense"
            name="serviceDescription"
            label="Service Description"
            multiline
            rows={4}
            fullWidth
            defaultValue={request?.serviceDescription}
            required
          />
          <TextField
            margin="dense"
            name="businessJustification"
            label="Business Justification"
            multiline
            rows={4}
            fullWidth
            defaultValue={request?.businessJustification}
            required
          />
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DatePicker
              label="Required Start Date"
              value={startDate}
              onChange={(newValue) => setStartDate(newValue)}
              sx={{ mt: 2, width: '100%' }}
            />
            <DatePicker
              label="Required Completion Date"
              value={completionDate}
              onChange={(newValue) => setCompletionDate(newValue)}
              sx={{ mt: 2, width: '100%' }}
            />
          </LocalizationProvider>
          <TextField
            margin="dense"
            name="fileUrl"
            label="File URL"
            type="text"
            fullWidth
            defaultValue={request?.fileUrl}
          />
          <TextField
            select
            margin="dense"
            name="priority"
            label="Priority"
            fullWidth
            defaultValue={request?.priority || 'MEDIUM'}
            required
          >
            <MenuItem value="LOW">Low</MenuItem>
            <MenuItem value="MEDIUM">Medium</MenuItem>
            <MenuItem value="HIGH">High</MenuItem>
            <MenuItem value="CRITICAL">Critical</MenuItem>
          </TextField>
          <TextField
            margin="dense"
            name="requestGroup"
            label="Request Group"
            type="text"
            fullWidth
            defaultValue={request?.requestGroup}
            required
          />
          <TextField
            select
            margin="dense"
            name="impactCategory"
            label="Impact Category"
            fullWidth
            defaultValue={request?.impactCategory || 'MEDIUM'}
            required
          >
            <MenuItem value="LOW">Low</MenuItem>
            <MenuItem value="MEDIUM">Medium</MenuItem>
            <MenuItem value="HIGH">High</MenuItem>
            <MenuItem value="CRITICAL">Critical</MenuItem>
          </TextField>
          <TextField
            select
            margin="dense"
            name="providerId"
            label="Provider"
            fullWidth
            defaultValue={request?.provider.id || ''}
            required
          >
            {providers?.map((provider) => (
              <MenuItem key={provider.id} value={provider.id}>
                {provider.name}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            select
            margin="dense"
            name="departmentId"
            label="Department"
            fullWidth
            defaultValue={request?.department.id || ''}
            required
          >
            {departments?.map((department) => (
              <MenuItem key={department.id} value={department.id}>
                {department.name}
              </MenuItem>
            ))}
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>
            Cancel
          </Button>
          <Button 
            type="submit" 
            variant="contained"
            disabled={createMutation.isPending || updateMutation.isPending}
          >
            {createMutation.isPending || updateMutation.isPending ? 'Loading...' : request ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
} 
 