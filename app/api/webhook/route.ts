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
<<<<<<< HEAD
    address?.country,
  ];

  const addressString = addressComponents.filter(Boolean).join(", ");

  if (event.type === "checkout.session.completed") {
=======
    address?.country
  ];

  const addressString = addressComponents.filter(Boolean).join(', ');


  if (event.type === "checkout.session.completed") {
 
>>>>>>> 84638afcd4981d8e4bf16ea67c36e4fd4c7cfd46
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
      id: orderItem.productSizeId,
      quantity: orderItem.orderQuantity,
<<<<<<< HEAD
      productSize: orderItem.orderProductSizeId,
    }));

    console.log("productQuantitiesToUpdate:", productQuantitiesToUpdate);

    const updatePromises = order.orderItems.map((orderItem) =>
=======
    
    }));

    console.log('productQuantitiesToUpdate:', productQuantitiesToUpdate);

    const updatePromises = productQuantitiesToUpdate.map(({ id, quantity }) => (
>>>>>>> 84638afcd4981d8e4bf16ea67c36e4fd4c7cfd46
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
<<<<<<< HEAD
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
=======
    ));
    
    // if quantity is 0 in ProductSize table than remove the sizeId from the productSize table for that product
    const productSizeIds = order.orderItems.map((orderItem) => orderItem.productSizeId);
      
    const productSizesQ = await prismadb.productSize.findMany({
      where: {
        id: {
          in: productSizeIds,
        },
      },
    });
>>>>>>> 84638afcd4981d8e4bf16ea67c36e4fd4c7cfd46

    const productQuantitiesQ = productSizesQ.map((productSize) => productSize.quantity);

    const shouldRemoveSizes = productQuantitiesQ.every((quantity) => quantity === 0 );

    if (shouldRemoveSizes) {
      const removeSizePromises = productSizeIds.map((productSizeId) => (
        prismadb.productSize.update({
          where: {
            id: productSizeId,
          },
          data: {
            quantity: 0,
          },
        })
      ));

      await Promise.all(removeSizePromises);
    }
  

    // if all quantities are 0 in ProductSize table, set isArchived to true in Product table
    const productIds = order.orderItems.map((orderItem) => orderItem.productId);

    const productSizes = await prismadb.productSize.findMany({
      where: {
        productId: {
          in: productIds,
        },
      },
    });

    const productQuantities = productSizes.map((productSize) => productSize.quantity);

    const shouldArchiveProducts = productQuantities.every((quantity) => quantity === 0);

    if (shouldArchiveProducts) {
      const archivePromises = productIds.map((productId) => (
        prismadb.product.update({
          where: {
            id: productId,
          },
          data: {
            isArchived: true,
          },
        })
      ));

      await Promise.all(archivePromises);
    }

    await Promise.all(updatePromises);
  }
  return new NextResponse(null, { status: 200 });
<<<<<<< HEAD
}
=======
};
>>>>>>> 84638afcd4981d8e4bf16ea67c36e4fd4c7cfd46
