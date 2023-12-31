import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs';

import prismadb from '@/lib/prismadb';
 
export async function POST(
  req: Request,
  { params }: { params: { storeId: string } }
) {
  try {
    const { userId } = auth();

    const body = await req.json();

    const { label, heroImages } = body;

    if (!userId) {
      return new NextResponse("לא מאומת", { status: 403 });
    }

    if (!label) {
      return new NextResponse("חובה שם", { status: 400 });
    }

    if (!heroImages) {
      return new NextResponse("חובה תמונה", { status: 400 });
    }

    if (!params.storeId) {
      return new NextResponse("חובה לבחור חנות", { status: 400 });
    }

    const storeByUserId = await prismadb.store.findFirst({
      where: {
        id: params.storeId,
        userId,
      }
    });

    if (!storeByUserId) {
      return new NextResponse("לא מאומת", { status: 405 });
    }

    const billboard = await prismadb.billboard.create({
      data: {
        label,
        heroImages: {
          createMany: {
            data: heroImages.map((image: { url: string }) => ({
              url: image.url,
            })),
          },
        },
        storeId: params.storeId,
      }
    });
  
    return NextResponse.json(billboard);
  } catch (error) {
    console.log('[BILLBOARDS_POST]', error);
    return new NextResponse("שגיאה פנימית", { status: 500 });
  }
};

export async function GET(
  req: Request,
  { params }: { params: { storeId: string } }
) {
  try {
    if (!params.storeId) {
      return new NextResponse("חובה לבחור חנות", { status: 400 });
    }

    const billboards = await prismadb.billboard.findMany({
      where: {
        storeId: params.storeId
      },
      include: {
        heroImages: true
      }
    });
  
    return NextResponse.json(billboards);
  } catch (error) {
    console.log('[BILLBOARDS_GET]', error);
    return new NextResponse("שגיאה פנימית", { status: 500 });
  }
};
