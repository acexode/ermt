import { NextResponse } from 'next/server';

import { prisma } from 'src/lib/prisma/client';
import { handleError } from 'src/lib/utils/error';
import { requireAuth } from 'src/lib/utils/auth';
import { validateId } from 'src/lib/utils/validation';

export async function GET(
  request: Request,
  { params }: { params: { departmentId: string } }
) {
  try {
    const departmentId = validateId(params.departmentId, 'Department ID');

    const sections = await prisma.section.findMany({
      where: {
        departmentId,
      },
      select: {
        id: true,
        name: true,
      },
      orderBy: {
        name: 'asc',
      },
    });

    return NextResponse.json(sections);
  } catch (error) {
    return handleError(error);
  }
} 
