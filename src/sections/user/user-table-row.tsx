'use client';

import { useState } from 'react';

import Stack from '@mui/material/Stack';
import Avatar from '@mui/material/Avatar';
import Popover from '@mui/material/Popover';
import TableRow from '@mui/material/TableRow';
import Checkbox from '@mui/material/Checkbox';
import MenuItem from '@mui/material/MenuItem';
import TableCell from '@mui/material/TableCell';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';

import { formatDate } from 'src/lib/utils/format';
import { useAuth } from 'src/context/auth-context';

import { Iconify } from 'src/components/iconify';

import { UserEditModal } from './user-edit-modal';

// ----------------------------------------------------------------------

export interface UserProps {
  id: string;
  name: string;
  email: string;
  role: string;
  provider: {
    id: string;
    name: string;
  } | null;
  department: {
    id: string;
    name: string;
  } | null;
  section: {
    id: string;
    name: string;
  } | null;
  discipline: {
    id: string;
    name: string;
  } | null;
  createdAt: string;
  updatedAt: string;
}

interface Props {
  row: UserProps;
  selected: boolean;
  onSelectRow: VoidFunction;
}

export function UserTableRow({ row, selected, onSelectRow }: Props) {
  const { user: currentUser } = useAuth();
  const { name, email, role, provider, department, section, discipline, createdAt } = row;

  const [openPopover, setOpenPopover] = useState<HTMLElement | null>(null);
  const [openEditModal, setOpenEditModal] = useState(false);

  const handleOpenPopover = (event: React.MouseEvent<HTMLElement>) => {
    setOpenPopover(event.currentTarget);
  };

  const handleClosePopover = () => {
    setOpenPopover(null);
  };

  const handleOpenEditModal = () => {
    handleClosePopover();
    setOpenEditModal(true);
  };

  const handleCloseEditModal = () => {
    setOpenEditModal(false);
  };

  const isSuperAdmin = currentUser?.role === 'SUPERADMIN';
  const canEdit = isSuperAdmin || currentUser?.id === row.id;

  return (
    <>
      <TableRow hover selected={selected}>
        <TableCell padding="checkbox">
          <Checkbox checked={selected} onClick={onSelectRow} />
        </TableCell>

        <TableCell>
          <Stack direction="row" alignItems="center" spacing={2}>
            <Avatar alt={name}>{name.charAt(0)}</Avatar>
            <Typography variant="subtitle2">{name}</Typography>
          </Stack>
        </TableCell>

        <TableCell>{email}</TableCell>

        <TableCell>{role}</TableCell>

        <TableCell>{provider?.name || '-'}</TableCell>

        <TableCell>{department?.name || '-'}</TableCell>

        <TableCell>{section?.name || '-'}</TableCell>

        <TableCell>{discipline?.name || '-'}</TableCell>

        <TableCell>{formatDate(createdAt)}</TableCell>

        <TableCell align="right">
          <IconButton color={openPopover ? 'primary' : 'default'} onClick={handleOpenPopover}>
            <Iconify icon="eva:more-vertical-fill" />
          </IconButton>
        </TableCell>
      </TableRow>

      <Popover
        open={!!openPopover}
        anchorEl={openPopover}
        onClose={handleClosePopover}
        anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        PaperProps={{
          sx: { width: 140 },
        }}
      >
        {canEdit && (
          <MenuItem onClick={handleOpenEditModal}>
            <Iconify icon="solar:pen-bold" />
            Edit
          </MenuItem>
        )}

        {isSuperAdmin && (
          <MenuItem
            onClick={() => {
              handleClosePopover();
            }}
            sx={{ color: 'error.main' }}
          >
            <Iconify icon="solar:trash-bin-trash-bold" />
            Delete
          </MenuItem>
        )}
      </Popover>

      <UserEditModal
        open={openEditModal}
        onClose={handleCloseEditModal}
        user={row}
        onSuccess={() => {
          // Trigger a refetch of the users list
          window.location.reload();
        }}
      />
    </>
  );
}
