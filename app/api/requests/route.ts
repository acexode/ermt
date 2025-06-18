import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { Prisma } from '@prisma/client';

import { prisma } from 'src/lib/prisma/client';

import { authOptions } from 'src/lib/auth';

interface SessionUser {
  id: string;
  role: string;
}

type RequestStatus = 'PENDING_SUPERADMIN_REVIEW' | 'PENDING_ADMIN_REVIEW' | 'ASSIGNED_TO_ENGINEER' | 
  'IN_PROGRESS' | 'COMPLETED_BY_ENGINEER' | 'PENDING_MATRIX_APPROVAL' | 'APPROVED' | 'REJECTED';

interface RequestWithUser {
  id: string;
  status: RequestStatus;
  userId: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const user = session.user as SessionUser;
    let requests;
    
    if (user.role === 'SUPERADMIN') {
      requests = await prisma.request.findMany({
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
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
        },
      });
    } else {
      requests = await prisma.request.findMany({
        where: {
          userId: user.id,
        },
        include: {
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
        },
      });
    }

    return NextResponse.json(requests);
  } catch (error) {
    console.error('[REQUESTS_GET]', error);
    return new NextResponse('Internal error', { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const user = session.user as SessionUser;
    const body = await req.json();
    const {
      title,
      requestedService,
      serviceDescription,
      businessJustification,
      requiredStartDate,
      requiredCompletionDate,
      fileUrl,
      priority,
      requestGroup,
      impactCategory,
      providerId,
      departmentId,
    } = body;

    if (!title || !requestedService || !serviceDescription || !businessJustification ||
        !requiredStartDate || !requiredCompletionDate || !priority || !requestGroup ||
        !impactCategory || !providerId || !departmentId) {
      return new NextResponse('Missing required fields', { status: 400 });
    }

    const request = await prisma.request.create({
      data: {
        title,
        requestedService,
        serviceDescription,
        businessJustification,
        requiredStartDate: new Date(requiredStartDate),
        requiredCompletionDate: new Date(requiredCompletionDate),
        fileUrl,
        priority,
        requestGroup,
        impactCategory,
        status: 'PENDING_SUPERADMIN_REVIEW',
        approvalTrail: [{
          status: 'PENDING_SUPERADMIN_REVIEW',
          timestamp: new Date(),
          userId: user.id,
          comment: 'Request created'
        }],
        userId: user.id,
        providerId,
        departmentId
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
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
      },
    });

    return NextResponse.json(request);
  } catch (error) {
    console.error('[REQUESTS_POST]', error);
    return new NextResponse('Internal error', { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const user = session.user as SessionUser;
    const body = await req.json();
    const {
      id,
      status,
      comment,
      ...updateData
    } = body;

    if (!id) {
      return new NextResponse('Request ID is required', { status: 400 });
    }

    // Get the current request to check its status
    const currentRequest = await prisma.request.findUnique({
      where: { id },
      include: {
        user: true,
      },
    }) as RequestWithUser | null;

    if (!currentRequest) {
      return new NextResponse('Request not found', { status: 404 });
    }

    // Check permissions based on user role and request status
    if (user.role !== 'SUPERADMIN' && user.role !== 'ADMIN' && currentRequest.userId !== user.id) {
      return new NextResponse('Forbidden', { status: 403 });
    }

    // Validate status transitions
    const validTransitions: Record<RequestStatus, RequestStatus[]> = {
      PENDING_SUPERADMIN_REVIEW: ['PENDING_ADMIN_REVIEW', 'REJECTED'],
      PENDING_ADMIN_REVIEW: ['ASSIGNED_TO_ENGINEER', 'REJECTED'],
      ASSIGNED_TO_ENGINEER: ['IN_PROGRESS'],
      IN_PROGRESS: ['COMPLETED_BY_ENGINEER'],
      COMPLETED_BY_ENGINEER: ['PENDING_MATRIX_APPROVAL'],
      PENDING_MATRIX_APPROVAL: ['APPROVED', 'REJECTED'],
      APPROVED: [],
      REJECTED: [],
    };

    if (status && !validTransitions[currentRequest.status]?.includes(status as RequestStatus)) {
      return new NextResponse('Invalid status transition', { status: 400 });
    }

    // Update the request
    const updatedRequest = await prisma.request.update({
      where: { id },
      data: {
        ...updateData,
        ...(status && {
          status,
          approvalTrail: {
            push: {
              status,
              timestamp: new Date(),
              userId: user.id,
              comment: comment || `Status changed to ${status}`,
            },
          },
        }),
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
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
      },
    });

    return NextResponse.json(updatedRequest);
  } catch (error) {
    console.error('[REQUESTS_PATCH]', error);
    return new NextResponse('Internal error', { status: 500 });
  }
} 
