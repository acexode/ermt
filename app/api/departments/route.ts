import { NextResponse } from 'next/server';

import { prisma } from 'src/lib/prisma/client';
import { handleError } from 'src/lib/utils/error';
import { requireAuth, requireSuperAdmin } from 'src/lib/utils/auth';
import { validateId, validateRequired } from 'src/lib/utils/validation';

export async function GET() {
  try {
    await requireAuth();

    const departments = await prisma.department.findMany({
      include: {
        provider: {
          select: {
            id: true,
            name: true,
          },
        },
        sections: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return NextResponse.json(departments);
  } catch (error) {
    return handleError(error);
  }
}

export async function POST(req: Request) {
  try {
    await requireSuperAdmin();

    const body = await req.json();
    validateRequired(body, ['name', 'providerId']);

    const department = await prisma.department.create({
      data: {
        name: body.name,
        providerId: body.providerId,
      },
      include: {
        provider: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return NextResponse.json(department);
  } catch (error) {
    return handleError(error);
  }
}

export async function PATCH(req: Request) {
  try {
    await requireSuperAdmin();

    const body = await req.json();
    validateRequired(body, ['id', 'name', 'providerId']);

    const department = await prisma.department.update({
      where: { id: body.id },
      data: {
        name: body.name,
        providerId: body.providerId,
      },
      include: {
        provider: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return NextResponse.json(department);
  } catch (error) {
    return handleError(error);
  }
}

export async function DELETE(req: Request) {
  try {
    await requireSuperAdmin();

    const { searchParams } = new URL(req.url);
    const id = validateId(searchParams.get('id'), 'Department ID');

    await prisma.department.delete({
      where: { id },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return handleError(error);
  }
} 
