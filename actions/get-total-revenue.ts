import prismadb from "@/lib/prismadb";

// Format revenue to display in K or M only on mobile
const formatRevenue = (revenue: number): string => {
  if (revenue >= 1000000) {
    return `${(revenue / 1000000).toFixed(1)}M`;
  } else if (revenue >= 1000) {
    return `${(revenue / 1000).toFixed(1)}K`;
  } else {
    return revenue.toFixed(2);
  }
};

export const getTotalRevenue = async (storeId: string): Promise<string> => {
  const paidOrders = await prismadb.order.findMany({
    where: {
      storeId,
      isPaid: true
    },
    include: {
      orderItems: {
        include: {
          product: true,
          size: true
        }
      }
    }
  });

  const totalRevenue = paidOrders.reduce((total, order) => {
    const orderTotal = order.orderItems.reduce((orderTotal, orderItem) => {
      const productPrice = orderItem.product.price.toNumber();
      const orderQuantity = orderItem.orderQuantity;
      const orderItemTotal = productPrice * orderQuantity;

      return orderTotal + orderItemTotal;
    }, 0);

    return total + orderTotal;
  }
  , 0);
    
  // Format the totalRevenue using the formatRevenue function
  const formattedRevenue = formatRevenue(totalRevenue);

  return formattedRevenue;
};
