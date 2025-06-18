import Box from '@mui/material/Box';
import Skeleton from '@mui/material/Skeleton';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';

interface TableLoadingProps {
  rowCount?: number;
  columnCount: number;
}

export function TableLoading({ rowCount = 5, columnCount }: TableLoadingProps) {
  return (
    <>
      {Array.from({ length: rowCount }).map((row, rowIndex) => (
        <TableRow key={rowIndex}>
          <TableCell padding="checkbox">
            <Skeleton variant="rectangular" width={20} height={20} />
          </TableCell>
          {Array.from({ length: columnCount }).map((cell, cellIndex) => (
            <TableCell key={cellIndex}>
              <Skeleton variant="text" width="100%" />
            </TableCell>
          ))}
        </TableRow>
      ))}
    </>
  );
} 
