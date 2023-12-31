import { format } from "date-fns";

import prismadb from "@/lib/prismadb";
import { formatter } from "@/lib/utils";

import { OrderColumn } from "./components/columns"
import { OrderClient } from "./components/client";


const OrdersPage = async ({
  params
}: {
  params: { storeId: string }
}) => {
  const orders = await prismadb.order.findMany({
    where: {
      storeId: params.storeId
    },
    include: {
      orderItems: {
        include: {
          product: true,
          size: true
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  const formattedOrders: OrderColumn[] = orders.map((item) => ({
    id: item.id,
    phone: item.phone,
    address: item.address,
    products: item.orderItems.map((orderItem) => orderItem.product.name).join(', '),
    sizes: item.orderItems.map((item) => `${item.size.name}: ${item.orderQuantity}`).join(', '),
    quantity: item.orderItems.reduce((acc, curr) => acc + curr.orderQuantity, 0),
    totalPrice : formatter.format(
      item.orderItems.reduce((total, orderItem) => {
        const itemPrice = orderItem.product.salePrice ? orderItem.product.salePrice : orderItem.product.price;
        return total + Number(orderItem.orderQuantity) * Number(itemPrice);
      }, 0)
    ),
    isPaid: item.isPaid ? 'כן' : 'לא',
    createdAt: format(item.createdAt, 'dd/MM/yyyy'),
  }));

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <OrderClient data={formattedOrders} />
      </div>
    </div>
  );
};

export default OrdersPage;
