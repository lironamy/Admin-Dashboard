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

  const addressString = addressComponents.filter((c) => c !== null).join(', ');


  if (event.type === "checkout.session.completed") {
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

    // TODO: Update product quantities in DB (prisma) and if 0, set isAvailable to false
    for (const { quantity } of productQuantitiesToUpdate) {
      console.log(quantity);
      console.log(productQuantitiesToUpdate);
    await prismadb.$transaction([
      prismadb.product.updateMany({
        where: {
          id: { in: productQuantitiesToUpdate.map(p => p.id) } 
        },
        data: {
          quantity: {
            decrement: quantity -quantity, 
          },
          isArchived: {
            set: false,
          },
        }
      }) 
      
      , 
      
    
      // Archive products that are out of stock
      prismadb.product.updateMany({
        
        where: {
          AND: [
            { id: { in: productQuantitiesToUpdate.map(p => p.id) } },
            { quantity: 0 }, 
          ],
        }, 
        data: {
          quantity: {
            set: 0, 
          },
          isArchived: {
            set: true,
          },
        }

      }),
    ])
  }



  }



  
  

  return new NextResponse(null, { status: 200 });
};
