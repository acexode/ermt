import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';

import { prisma } from 'src/lib/prisma/client';
import { handleError } from 'src/lib/utils/error';
import { authOptions } from 'app/api/auth/[...nextauth]/route';

// Extend the session type to include user ID and role
declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      role: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    }
  }
}

const updateUserSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  role: z.enum(['USER', 'ADMIN', 'SUPERADMIN']),
  providerId: z.string().min(1, 'Provider is required'),
  departmentId: z.string().nullable(),
  sectionId: z.string().nullable(),
  disciplineId: z.string().nullable(),
});

export async function PATCH(
  request: Request,
  { params }: { params: { userId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Only allow users to edit their own profile or superadmins to edit any profile
    if (session.user.role !== 'SUPERADMIN' && session.user.id !== params.userId) {
      return new NextResponse('Forbidden', { status: 403 });
    }

    const body = await request.json();
    const validatedData = updateUserSchema.parse(body);

    // Validate department belongs to provider
    if (validatedData.departmentId) {
      const department = await prisma.department.findFirst({
        where: {
          id: validatedData.departmentId,
          providerId: validatedData.providerId,
        },
      });

      if (!department) {
        return new NextResponse('Department does not belong to the selected provider', { status: 400 });
      }
    }

    // Validate section belongs to department
    if (validatedData.sectionId && validatedData.departmentId) {
      const section = await prisma.section.findFirst({
        where: {
          id: validatedData.sectionId,
          departmentId: validatedData.departmentId,
        },
      });

      if (!section) {
        return new NextResponse('Section does not belong to the selected department', { status: 400 });
      }
    }

    // Validate discipline belongs to section
    if (validatedData.disciplineId && validatedData.sectionId) {
      const discipline = await prisma.discipline.findFirst({
        where: {
          id: validatedData.disciplineId,
          sectionId: validatedData.sectionId,
        },
      });

      if (!discipline) {
        return new NextResponse('Discipline does not belong to the selected section', { status: 400 });
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id: params.userId },
      data: {
        name: validatedData.name,
        email: validatedData.email,
        role: validatedData.role,
        providerId: validatedData.providerId,
        departmentId: validatedData.departmentId,
        sectionId: validatedData.sectionId,
        disciplineId: validatedData.disciplineId,
      },
      include: {
        provider: true,
        department: true,
        section: true,
        discipline: true,
      },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    return handleError(error);
  }
} 
