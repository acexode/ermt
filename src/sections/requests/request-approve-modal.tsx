'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';

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
  status: string;
}

interface Props {
  open: boolean;
  onClose: VoidFunction;
  request: Request | null;
}

const STATUS_OPTIONS = [
  { value: 'PENDING_ADMIN_REVIEW', label: 'Pending Admin Review' },
  { value: 'ASSIGNED_TO_ENGINEER', label: 'Assign to Engineer' },
  { value: 'IN_PROGRESS', label: 'Mark as In Progress' },
  { value: 'COMPLETED_BY_ENGINEER', label: 'Mark as Completed' },
  { value: 'PENDING_MATRIX_APPROVAL', label: 'Pending Matrix Approval' },
  { value: 'APPROVED', label: 'Approve Request' },
  { value: 'REJECTED', label: 'Reject Request' },
];

export function RequestApproveModal({ open, onClose, request }: Props) {
  const [status, setStatus] = useState('');
  const [comment, setComment] = useState('');
  const queryClient = useQueryClient();

  const updateMutation = useMutation({
    mutationFn: async (data: {
      id: string;
      status: string;
      comment: string;
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
    if (!request) return;

    await updateMutation.mutateAsync({
      id: request.id,
      status,
      comment,
    });
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <form onSubmit={handleSubmit}>
        <DialogTitle>
          Update Request Status
        </DialogTitle>
        <DialogContent>
          <TextField
            select
            margin="dense"
            label="New Status"
            fullWidth
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            required
          >
            {STATUS_OPTIONS.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            margin="dense"
            label="Comment"
            multiline
            rows={4}
            fullWidth
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            required
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="contained">
            Update Status
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
} 
