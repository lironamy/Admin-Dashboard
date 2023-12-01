import { format } from "date-fns";

import prismadb from "@/lib/prismadb";
import { formatter } from "@/lib/utils";

import { ProductsClient } from "./components/client";
import { ProductColumn } from "./components/columns";

const ProductsPage = async ({
  params
}: {
  params: { storeId: string }
}) => {
  const products = await prismadb.product.findMany({
    where: {
      storeId: params.storeId
    },
    include: {
      category: true,
      productSizes: {
        include: {
          size: true,
        }
      },
      color: true,
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  const formattedProducts: ProductColumn[] = products.map((item) => ({
    id: item.id,
    name: item.name,
    descriptionHeader: item.descriptionHeader,
    description: item.description,
    isFeatured: item.isFeatured ? 'כן' : 'לא' ,
    isArchived: item.isArchived ? 'כן' : 'לא',
    price: formatter.format(item.price.toNumber()),
    productSizes: item.productSizes.map((data) => ({
      id: data.id,
      size: data.size.name,
      quantity: data.quantity,
    })),
    category: item.category.name,
    
    color: item.color.value,
    createdAt: format(item.createdAt, 'dd/MM/yyyy'),
  }));

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <ProductsClient data={formattedProducts} />
      </div>
    </div>
  );
};

export default ProductsPage;
