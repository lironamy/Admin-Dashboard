import prismadb from "@/lib/prismadb";

// Format revenue to display in K or M
const formatRevenue = (revenue: number): string => {
  if (revenue >= 1000000) {
    return `${(revenue / 1000000).toFixed(1)}M`;
  } else if (revenue >= 1000) {
    return `${(revenue / 1000).toFixed(1)}K`;
  } else {
    return revenue.toFixed(2); // Default format for smaller values
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
          product: true
        }
      }
    }
  });

  const totalRevenue = paidOrders.reduce((total, order) => {
    const orderTotal = order.orderItems.reduce((orderSum, item) => {
      return orderSum + item.product.price.toNumber();
    }, 0);
    return total + orderTotal;
  }, 0);

  // Format the totalRevenue using the formatRevenue function
  const formattedRevenue = formatRevenue(totalRevenue);

  return formattedRevenue;
};
