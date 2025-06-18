import { NextResponse } from 'next/server';

import { prisma } from 'src/lib/prisma/client';
import { handleError } from 'src/lib/utils/error';
import { requireAuth, requireSuperAdmin } from 'src/lib/utils/auth';
import { validateId, validateRequired } from 'src/lib/utils/validation';

export async function GET() {
  try {
    await requireAuth();

    const sections = await prisma.section.findMany({
      include: {
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
        disciplines: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return NextResponse.json(sections);
  } catch (error) {
    return handleError(error);
  }
}

export async function POST(req: Request) {
  try {
    await requireSuperAdmin();

    const body = await req.json();
    validateRequired(body, ['name', 'departmentId']);

    const section = await prisma.section.create({
      data: {
        name: body.name,
        departmentId: body.departmentId,
      },
      include: {
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
    });

    return NextResponse.json(section);
  } catch (error) {
    return handleError(error);
  }
}

export async function PATCH(req: Request) {
  try {
    await requireSuperAdmin();

    const body = await req.json();
    validateRequired(body, ['id', 'name', 'departmentId']);

    const section = await prisma.section.update({
      where: { id: body.id },
      data: {
        name: body.name,
        departmentId: body.departmentId,
      },
      include: {
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
    });

    return NextResponse.json(section);
  } catch (error) {
    return handleError(error);
  }
}

export async function DELETE(req: Request) {
  try {
    await requireSuperAdmin();

    const { searchParams } = new URL(req.url);
    const id = validateId(searchParams.get('id'), 'Section ID');

    await prisma.section.delete({
      where: { id },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return handleError(error);
  }
} 
