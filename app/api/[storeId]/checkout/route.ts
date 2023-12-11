import Stripe from "stripe";
import { NextResponse } from "next/server";

import { stripe } from "@/lib/stripe";
import prismadb from "@/lib/prismadb";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function POST(
  req: Request,
  { params }: { params: { storeId: string } }
) {
  const { cartItems } = await req.json();

  const products = await prismadb.product.findMany({
    include: {
      productSizes: {
        include: {
          size: true,
        },
      },
    },
    where: {
      id: {
        in: cartItems.map((product: any) => product.id),
      },
    },
  });

  const line_items: Stripe.Checkout.SessionCreateParams.LineItem[] = [];

  const orderItemsToCreate = products.flatMap((product) => {
    return cartItems.map((cartItem: any) => {
      if (cartItem.id === product.id) {
        const productSize = product.productSizes.find((size) => size.id === cartItem.ProductSize.id);
        const sizeId = productSize?.size.id;

        if (productSize) {
          line_items.push({
            price_data: {
              currency: 'ILS',
              product_data: {
                name: product.name + ' - ' + productSize.size.name,
              },
              unit_amount: product.price.toNumber() * 100,
            },
            quantity: cartItem.orderQuantity,
          });

          return {
            product: { connect: { id: product.id } },
            size: { connect: { id: sizeId } },
            orderQuantity: cartItem.orderQuantity,
            orderProductSizeId: productSize?.id,
          };
        }
      }

      return null;
    });
  });

  const filteredOrderItems = orderItemsToCreate.filter(Boolean);

  const order = await prismadb.order.create({
    data: {
      storeId: params.storeId,
      isPaid: false,
      orderItems: {
        create: filteredOrderItems,
      },
    },
  });

  console.log('order sent:', order);

  const session = await stripe.checkout.sessions.create({
    line_items,
    mode: 'payment',
    billing_address_collection: 'required',
    phone_number_collection: {
      enabled: true,
    },
    success_url: `${process.env.FRONTEND_STORE_URL}/cart?success=1`,
    cancel_url: `${process.env.FRONTEND_STORE_URL}/cart?canceled=1`,
    metadata: {
      orderId: order.id,
    },
  });

  return NextResponse.json({ url: session.url }, {
    headers: corsHeaders,
  });
};
