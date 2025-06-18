import { NextResponse } from 'next/server';

import { prisma } from 'src/lib/prisma/client';
import { handleError } from 'src/lib/utils/error';
import { requireAuth, requireSuperAdmin } from 'src/lib/utils/auth';
import { validateId, validateRequired } from 'src/lib/utils/validation';

export async function GET() {
  try {
    await requireAuth();

    const disciplines = await prisma.discipline.findMany({
      include: {
        section: {
          select: {
            id: true,
            name: true,
            department: {
              select: {
                id: true,
                name: true,
                provider: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    return NextResponse.json(disciplines);
  } catch (error) {
    return handleError(error);
  }
}

export async function POST(req: Request) {
  try {
    await requireSuperAdmin();

    const body = await req.json();
    validateRequired(body, ['name', 'sectionId']);

    const discipline = await prisma.discipline.create({
      data: {
        name: body.name,
        sectionId: body.sectionId,
      },
      include: {
        section: {
          select: {
            id: true,
            name: true,
            department: {
              select: {
                id: true,
                name: true,
                provider: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    return NextResponse.json(discipline);
  } catch (error) {
    return handleError(error);
  }
}

export async function PATCH(req: Request) {
  try {
    await requireSuperAdmin();

    const body = await req.json();
    validateRequired(body, ['id', 'name', 'sectionId']);

    const discipline = await prisma.discipline.update({
      where: { id: body.id },
      data: {
        name: body.name,
        sectionId: body.sectionId,
      },
      include: {
        section: {
          select: {
            id: true,
            name: true,
            department: {
              select: {
                id: true,
                name: true,
                provider: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    return NextResponse.json(discipline);
  } catch (error) {
    return handleError(error);
  }
}

export async function DELETE(req: Request) {
  try {
    await requireSuperAdmin();

    const { searchParams } = new URL(req.url);
    const id = validateId(searchParams.get('id'), 'Discipline ID');

    await prisma.discipline.delete({
      where: { id },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return handleError(error);
  }
} 
