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
  IconButton,
  Menu,
  MenuItem,
} from '@mui/material';
import { useQuery } from '@tanstack/react-query';

import { Iconify } from 'src/components/iconify';
import { handleApiResponse } from 'src/lib/utils/api';
import { RequestEditModal } from 'src/sections/requests/request-edit-modal';
import { RequestApproveModal } from 'src/sections/requests/request-approve-modal';

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
  status: string;
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

export default function RequestsPage() {
  const [open, setOpen] = useState(false);
  const [editingRequest, setEditingRequest] = useState<Request | null>(null);
  const [approveModalOpen, setApproveModalOpen] = useState(false);
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedRequest, setSelectedRequest] = useState<Request | null>(null);

  const { data: requests, isLoading: isLoadingRequests } = useQuery<Request[]>({
    queryKey: ['requests'],
    queryFn: async () => {
      const response = await fetch('/api/requests');
      return handleApiResponse<Request[]>(response);
    },
  });

  const { data: providers } = useQuery<Provider[]>({
    queryKey: ['providers'],
    queryFn: async () => {
      const response = await fetch('/api/providers');
      return handleApiResponse<Provider[]>(response);
    },
  });

  const { data: departments } = useQuery<Department[]>({
    queryKey: ['departments'],
    queryFn: async () => {
      const response = await fetch('/api/departments');
      return handleApiResponse<Department[]>(response);
    },
  });

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, request: Request) => {
    setMenuAnchorEl(event.currentTarget);
    setSelectedRequest(request);
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
    setSelectedRequest(null);
  };

  const handleEdit = () => {
    if (selectedRequest) {
      setEditingRequest(selectedRequest);
      setOpen(true);
    }
    handleMenuClose();
  };

  const handleApprove = () => {
    setApproveModalOpen(true);
    handleMenuClose();
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
              <Typography variant="h4">Requests</Typography>
            </Stack>
            <Button
              startIcon={<Iconify icon="mingcute:add-line" />}
              variant="contained"
              onClick={() => setOpen(true)}
            >
              Add Request
            </Button>
          </Stack>

          <Card>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Title</TableCell>
                  <TableCell>Service</TableCell>
                  <TableCell>Priority</TableCell>
                  <TableCell>Impact</TableCell>
                  <TableCell>Start Date</TableCell>
                  <TableCell>Completion Date</TableCell>
                  <TableCell>Provider</TableCell>
                  <TableCell>Department</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {requests?.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell>{request.title}</TableCell>
                    <TableCell>{request.requestedService}</TableCell>
                    <TableCell>{request.priority}</TableCell>
                    <TableCell>{request.impactCategory}</TableCell>
                    <TableCell>{new Date(request.requiredStartDate).toLocaleDateString()}</TableCell>
                    <TableCell>{new Date(request.requiredCompletionDate).toLocaleDateString()}</TableCell>
                    <TableCell>{request.provider.name}</TableCell>
                    <TableCell>{request.department.name}</TableCell>
                    <TableCell>{request.status}</TableCell>
                    <TableCell>
                      <IconButton
                        size="small"
                        onClick={(e) => handleMenuOpen(e, request)}
                      >
                        <Iconify icon="eva:more-vertical-fill" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </Stack>
      </Container>

      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleEdit}>
          Edit
        </MenuItem>
        <MenuItem onClick={handleApprove}>
          Approve Request
        </MenuItem>
      </Menu>

      <RequestEditModal
        open={open}
        onClose={() => {
          setOpen(false);
          setEditingRequest(null);
        }}
        request={editingRequest}
        providers={providers || []}
        departments={departments || []}
      />

      <RequestApproveModal
        open={approveModalOpen}
        onClose={() => setApproveModalOpen(false)}
        request={selectedRequest}
      />
    </Box>
  );
} 
