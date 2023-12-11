import Stripe from "stripe";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

import { stripe } from "@/lib/stripe";
import prismadb from "@/lib/prismadb";

export async function POST(req: Request) {
  const body = await req.text();
  const signature = headers().get("Stripe-Signature") as string;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (error: any) {
    return new NextResponse(`Webhook Error: ${error.message}`, { status: 400 });
  }

  const session = event.data.object as Stripe.Checkout.Session;
  const address = session?.customer_details?.address;

  const addressComponents = [
    address?.line1,
    address?.line2,
    address?.city,
    address?.state,
    address?.postal_code,
    address?.country,
  ];

  const addressString = addressComponents.filter(Boolean).join(", ");

  if (event.type === "checkout.session.completed") {
    const order = await prismadb.order.update({
      where: {
        id: session?.metadata?.orderId,
      },
      data: {
        isPaid: true,
        address: addressString,
        phone: session?.customer_details?.phone || "",
      },
      include: {
        orderItems: true,
      },
    });

    console.log("order recives:", order);

    const productQuantitiesToUpdate = order.orderItems.map((orderItem) => ({
      id: orderItem.productId,
      quantity: orderItem.orderQuantity,
      productSize: orderItem.orderProductSizeId,
    }));

    console.log("productQuantitiesToUpdate:", productQuantitiesToUpdate);

    const updatePromises = order.orderItems.map((orderItem) =>
      prismadb.productSize.update({
        where: {
          id: orderItem.orderProductSizeId,
        },
        data: {
          quantity: {
            decrement: orderItem.orderQuantity,
          },
        },
      })
    );

    // Check if all quantities are 0 in ProductSize table and set isArchived to true in Product table
    const archivePromises = prismadb.product.updateMany({
      where: {
        id: {
          in: productQuantitiesToUpdate.map((pq) => pq.id),
        },
        productSizes: {
          every: {
            quantity: 0,
          },
        },
      },
      data: {
        isArchived: true,
      },
    });

    await Promise.all([...updatePromises, archivePromises]);
  }

  return new NextResponse(null, { status: 200 });
}
