import Stripe from "stripe"
import { headers } from "next/headers"
import { NextResponse } from "next/server"

import { stripe } from "@/lib/stripe"
import prismadb from "@/lib/prismadb"

export async function POST(req: Request) {
  const body = await req.text()
  const signature = headers().get("Stripe-Signature") as string

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (error: any) {
    return new NextResponse(`Webhook Error: ${error.message}`, { status: 400 })
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const address = session?.customer_details?.address;

    const addressComponents = [
      address?.line1,
      address?.line2,
      address?.city,
      address?.state,
      address?.postal_code,
      address?.country
    ];

    const addressString = addressComponents.filter(Boolean).join(', ');

    const order = await prismadb.order.update({
      where: {
        id: session?.metadata?.orderId,
      },
      data: {
        isPaid: true,
        address: addressString,
        phone: session?.customer_details?.phone || '',
      },
      include: {
        orderItems: true,
      }
    });

    const productQuantitiesToUpdate = order.orderItems.map((orderItem) => ({
      id: orderItem.productId,
      quantity: orderItem.orderQuantity,
    }));

    const updatePromises = productQuantitiesToUpdate.map(({ id, quantity }) => (
      prismadb.productSize.update({
        where: {
          id,
        },
        data: {
          quantity: {
            decrement: quantity,
          },
        },
      })
    ));
    
    const archivePromise = prismadb.product.updateMany({
      where: {
        id: {
          in: productQuantitiesToUpdate.map(p => p.id),
        },
      },
      data: {
        isArchived: false,
      },
    });
    
    const archivePromises = productQuantitiesToUpdate.map(({ id, quantity }) => (
      prismadb.productSize.findMany({
        where: {
          productId: id,
        },
      })
      .then((productSizes) => {
        const totalQuantity = productSizes.reduce((acc, size) => acc + size.quantity, 0);
        
        if (totalQuantity === 0) {
          // If total quantity of all sizes is 0, archive the product
          return prismadb.product.update({
            where: {
              id,
            },
            data: {
              isArchived: {
                set: true,
              },
            },
          });
        }
    
        return Promise.resolve(null); // No need to archive, as there's still some quantity
      })
    ));
    
    await Promise.all([...updatePromises, archivePromise, ...archivePromises]);
    
  }

  return new NextResponse(null, { status: 200 });
};
