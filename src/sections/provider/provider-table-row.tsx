'use client';

import { useState } from 'react';

import Stack from '@mui/material/Stack';
import Popover from '@mui/material/Popover';
import TableRow from '@mui/material/TableRow';
import Checkbox from '@mui/material/Checkbox';
import MenuItem from '@mui/material/MenuItem';
import TableCell from '@mui/material/TableCell';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

export interface ProviderProps {
  id: string;
  name: string;
  departments: Array<{
    id: string;
    name: string;
  }>;
}

interface Props {
  row: ProviderProps;
  selected: boolean;
  onSelectRow: VoidFunction;
  onEditRow: (provider: ProviderProps) => void;
}

export function ProviderTableRow({ row, selected, onSelectRow, onEditRow }: Props) {
  const { name, departments } = row;

  const [openPopover, setOpenPopover] = useState<HTMLElement | null>(null);

  const handleOpenPopover = (event: React.MouseEvent<HTMLElement>) => {
    setOpenPopover(event.currentTarget);
  };

  const handleClosePopover = () => {
    setOpenPopover(null);
  };

  const handleEdit = () => {
    handleClosePopover();
    onEditRow(row);
  };

  return (
    <>
      <TableRow hover selected={selected}>
        <TableCell padding="checkbox">
          <Checkbox checked={selected} onClick={onSelectRow} />
        </TableCell>

        <TableCell>
          <Typography variant="subtitle2">{name}</Typography>
        </TableCell>

        <TableCell>
          <Typography variant="body2" color="text.secondary">
            {departments.map((dept) => dept.name).join(', ') || 'No departments'}
          </Typography>
        </TableCell>

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
        <MenuItem onClick={handleEdit}>
          <Iconify icon="solar:pen-bold" />
          Edit
        </MenuItem>
      </Popover>
    </>
  );
} 
