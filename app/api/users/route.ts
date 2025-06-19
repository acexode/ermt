import { hash } from 'bcryptjs';
import { NextResponse } from 'next/server';

import { prisma } from 'src/lib/prisma/client';
import { handleError } from 'src/lib/utils/error';
import { requireAuth, requireSuperAdmin } from 'src/lib/utils/auth';

interface SessionUser {
  id: string;
  role: string;
}

export async function GET() {
  try {
    await requireAuth();

    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        provider: {
          select: {
            id: true,
            name: true,
          },
        },
        department: {
          select: {
            id: true,
            name: true,
          },
        },
        section: {
          select: {
            id: true,
            name: true,
          },
        },
        discipline: {
          select: {
            id: true,
            name: true,
          },
        },
        createdAt: true,
        updatedAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(users);
  } catch (error) {
    return handleError(error);
  }
}

export async function POST(req: Request) {
  try {
    const user = await requireSuperAdmin();

    const body = await req.json();
    const { email, name, password, role, providerId, departmentId, sectionId, disciplineId } = body;

    if (!email || !name || !password) {
      return new NextResponse('Missing required fields', { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return new NextResponse('Email already exists', { status: 400 });
    }

    const hashedPassword = await hash(password, 12);

    const newUser = await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
        role: role || 'USER',
        providerId,
        departmentId,
        sectionId,
        disciplineId,
      },
    });

    return NextResponse.json({
      id: newUser.id,
      email: newUser.email,
      name: newUser.name,
      role: newUser.role,
    });
  } catch (error) {
    console.error('[USERS_POST]', error);
    return new NextResponse('Internal error', { status: 500 });
  }
} 
