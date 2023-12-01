import prismadb from "@/lib/prismadb";

interface GraphData {
  name: string;
  total: number;
}

export const getGraphRevenue = async (storeId: string): Promise<GraphData[]> => {
  const paidOrders = await prismadb.order.findMany({
    where: {
      storeId,
      isPaid: true,
    },
    include: {
      orderItems: {
        include: {
          product: true,
          size: true,
        },
      },
    },
  });

  const monthlyRevenue: { [key: number]: number } = {};

  // Grouping the orders by month and summing the revenue
  paidOrders.forEach((order) => {
    const orderMonth = order.createdAt.getMonth();
    const orderTotal = order.orderItems.reduce((orderTotal, orderItem) => {
      const productPrice = orderItem.product.price.toNumber();
      const orderQuantity = orderItem.orderQuantity;
      const orderItemTotal = productPrice * orderQuantity;

      return orderTotal + orderItemTotal;
    }, 0);

    if (orderMonth in monthlyRevenue) {
      monthlyRevenue[orderMonth] += orderTotal;
    } else {
      monthlyRevenue[orderMonth] = orderTotal;
    }
  });

  // Converting the grouped data into the format expected by the graph
  const graphData: GraphData[] = [
    { name: "ינואר", total: 0 },
    { name: "פברואר", total: 0 },
    { name: "מרץ", total: 0 },
    { name: "אפריל", total: 0 },
    { name: "מאי", total: 0 },
    { name: "יוני", total: 0 },
    { name: "יולי", total: 0 },
    { name: "אוגוסט", total: 0 },
    { name: "ספטמבר", total: 0 },
    { name: "אוקטובר", total: 0 },
    { name: "נובמבר", total: 0 },
    { name: "דצמבר", total: 0 },
  ];

  // Filling in the revenue data
  for (const month in monthlyRevenue) {
    graphData[parseInt(month)].total = monthlyRevenue[parseInt(month)];
  }

  return graphData;
};
