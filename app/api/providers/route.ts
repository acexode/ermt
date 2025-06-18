import { NextResponse } from 'next/server';

import { prisma } from 'src/lib/prisma/client';
import { requireAuth, requireSuperAdmin } from 'src/lib/utils/auth';
import { handleError } from 'src/lib/utils/error';
import { validateRequired, validateId } from 'src/lib/utils/validation';

/**
 * @api {get} /api/providers Get all providers
 * @apiName GetProviders
 * @apiGroup Providers
 * @apiVersion 1.0.0
 * 
 * @apiHeader {String} Authorization Bearer token for authentication
 * 
 * @apiSuccess {Object[]} providers List of providers
 * @apiSuccess {String} providers.id Provider ID
 * @apiSuccess {String} providers.name Provider name
 * @apiSuccess {Object[]} providers.departments List of departments
 * @apiSuccess {String} providers.departments.id Department ID
 * @apiSuccess {String} providers.departments.name Department name
 * 
 * @apiError (401) Unauthorized User is not authenticated
 * @apiError (500) InternalServerError Server error occurred
 */
export async function GET() {
  try {
    // await requireAuth();

    const providers = await prisma.provider.findMany({
      include: {
        departments: true,
      },
    });

    return NextResponse.json(providers);
  } catch (error) {
    return handleError(error);
  }
}

/**
 * @api {post} /api/providers Create a new provider
 * @apiName CreateProvider
 * @apiGroup Providers
 * @apiVersion 1.0.0
 * 
 * @apiHeader {String} Authorization Bearer token for authentication
 * 
 * @apiBody {String} name Provider name
 * 
 * @apiSuccess {Object} provider Created provider
 * @apiSuccess {String} provider.id Provider ID
 * @apiSuccess {String} provider.name Provider name
 * 
 * @apiError (400) BadRequest Missing required fields
 * @apiError (401) Unauthorized User is not authenticated or not a superadmin
 * @apiError (500) InternalServerError Server error occurred
 */
export async function POST(request: Request) {
  try {
    await requireSuperAdmin();

    const body = await request.json();
    const { name } = body;

    if (!name) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      );
    }

    const provider = await prisma.provider.create({
      data: {
        name,
      },
    });

    return NextResponse.json(provider);
  } catch (error) {
    return handleError(error);
  }
}

/**
 * @api {patch} /api/providers Update a provider
 * @apiName UpdateProvider
 * @apiGroup Providers
 * @apiVersion 1.0.0
 * 
 * @apiHeader {String} Authorization Bearer token for authentication
 * 
 * @apiBody {String} id Provider ID
 * @apiBody {String} name New provider name
 * 
 * @apiSuccess {Object} provider Updated provider
 * @apiSuccess {String} provider.id Provider ID
 * @apiSuccess {String} provider.name Provider name
 * 
 * @apiError (400) BadRequest Missing required fields
 * @apiError (401) Unauthorized User is not authenticated or not a superadmin
 * @apiError (500) InternalServerError Server error occurred
 */
export async function PATCH(request: Request) {
  try {
    await requireSuperAdmin();

    const body = await request.json();
    const { id, name } = body;

    if (!id || !name) {
      return NextResponse.json(
        { error: 'ID and name are required' },
        { status: 400 }
      );
    }

    const provider = await prisma.provider.update({
      where: { id },
      data: { name },
    });

    return NextResponse.json(provider);
  } catch (error) {
    return handleError(error);
  }
}

/**
 * @api {delete} /api/providers Delete a provider
 * @apiName DeleteProvider
 * @apiGroup Providers
 * @apiVersion 1.0.0
 * 
 * @apiHeader {String} Authorization Bearer token for authentication
 * 
 * @apiParam {String} id Provider ID
 * 
 * @apiSuccess (204) NoContent Provider successfully deleted
 * 
 * @apiError (400) BadRequest Missing provider ID
 * @apiError (401) Unauthorized User is not authenticated or not a superadmin
 * @apiError (500) InternalServerError Server error occurred
 */
export async function DELETE(req: Request) {
  try {
    await requireSuperAdmin();

    const { searchParams } = new URL(req.url);
    const id = validateId(searchParams.get('id'), 'Provider ID');

    await prisma.provider.delete({
      where: { id },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return handleError(error);
  }
} 
