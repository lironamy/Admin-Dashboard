import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs";

import prismadb from "@/lib/prismadb";

export async function GET(
  req: Request,
  { params }: { params: { billboardId: string } }
) {
  try {
    if (!params.billboardId) {
      return new NextResponse("חובה שם מודעה", { status: 400 });
    }

    const billboard = await prismadb.billboard.findUnique({
      where: {
        id: params.billboardId
      },
      include: {
        heroImages: true
      }
    });
  
    return NextResponse.json(billboard);
  } catch (error) {
    console.log('[BILLBOARD_GET]', error);
    return new NextResponse("שגיאה פנימית", { status: 500 });
  }
};

export async function DELETE(
  req: Request,
  { params }: { params: { billboardId: string, storeId: string } }
) {
  try {
    const { userId } = auth();

    if (!userId) {
      return new NextResponse("לא מאומת", { status: 403 });
    }

    if (!params.billboardId) {
      return new NextResponse("חובה שם מודעה", { status: 400 });
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

    const billboard = await prismadb.billboard.delete({
      where: {
        id: params.billboardId,
      }
    });
  
    return NextResponse.json(billboard);
  } catch (error) {
    console.log('[BILLBOARD_DELETE]', error);
    return new NextResponse("שגיאה פנימית", { status: 500 });
  }
};


export async function PATCH(
  req: Request,
  { params }: { params: { billboardId: string, storeId: string } }
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
      return new NextResponse("חובה תמונות", { status: 400 });
    }

    if (!params.billboardId) {
      return new NextResponse("חובה לבחור מודעה", { status: 400 });
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

    await prismadb.billboard.update({
      where: {
        id: params.billboardId
      },
      data: {
        label,
        heroImages: {
          deleteMany: {},
        },
      },
    });

    const updateBillboard = await prismadb.billboard.update({
      where: {
        id: params.billboardId,
      },
      data: {
        label,
        heroImages: {
          createMany: {
            data: heroImages.map((image: { url: string }) => ({
              url: image.url,
            })),
          },
        }
      }
    });
  
    return NextResponse.json(updateBillboard);
  } catch (error) {
    console.log('[BILLBOARD_PATCH]', error);
    return new NextResponse("שגיאה פנימית", { status: 500 });
  }
};
