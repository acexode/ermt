import { NextResponse } from 'next/server';

import { prisma } from 'src/lib/prisma/client';
import { handleError } from 'src/lib/utils/error';
import { requireAuth } from 'src/lib/utils/auth';
import { validateId } from 'src/lib/utils/validation';

export async function GET(
  request: Request,
  { params }: { params: { sectionId: string } }
) {
  try {
    const sectionId = validateId(params.sectionId, 'Section ID');

    const disciplines = await prisma.discipline.findMany({
      where: {
        sectionId,
      },
      select: {
        id: true,
        name: true,
      },
      orderBy: {
        name: 'asc',
      },
    });

    return NextResponse.json(disciplines);
  } catch (error) {
    return handleError(error);
  }
} 
