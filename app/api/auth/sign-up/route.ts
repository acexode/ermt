import { hash } from 'bcryptjs';
import { NextResponse } from 'next/server';

import { prisma } from 'src/lib/prisma/client';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { 
      name, 
      email, 
      password, 
      confirmPassword,
      providerId,
      departmentId,
      sectionId,
      disciplineId,
    } = body;

    if (!name || !email || !password || !confirmPassword || !providerId) {
      return new NextResponse('Missing required fields', { status: 400 });
    }

    if (password !== confirmPassword) {
      return new NextResponse('Passwords do not match', { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return new NextResponse('Email already exists', { status: 400 });
    }

    // Verify that the selected IDs are valid
    if (departmentId) {
      const department = await prisma.department.findFirst({
        where: {
          id: departmentId,
          providerId,
        },
      });
      if (!department) {
        return new NextResponse('Invalid department', { status: 400 });
      }
    }

    if (sectionId) {
      const section = await prisma.section.findFirst({
        where: {
          id: sectionId,
          departmentId,
        },
      });
      if (!section) {
        return new NextResponse('Invalid section', { status: 400 });
      }
    }

    if (disciplineId) {
      const discipline = await prisma.discipline.findFirst({
        where: {
          id: disciplineId,
          sectionId,
        },
      });
      if (!discipline) {
        return new NextResponse('Invalid discipline', { status: 400 });
      }
    }

    const hashedPassword = await hash(password, 12);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: 'USER',
        providerId,
        departmentId,
        sectionId,
        disciplineId,
      },
    });

    return NextResponse.json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    });
  } catch (error) {
    console.error('[SIGN_UP]', error);
    return new NextResponse('Internal error', { status: 500 });
  }
} 
