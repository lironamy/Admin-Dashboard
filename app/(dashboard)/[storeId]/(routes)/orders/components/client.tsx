"use client";

import { DataTable } from "@/components/ui/data-table";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";

import { columns, OrderColumn } from "./columns";

interface OrderClientProps {
  data: OrderColumn[];
}

export const OrderClient: React.FC<OrderClientProps> = ({
  data
}) => {
  return (
    <>
      <Heading title={`הזמנות (${data.length})`} description="נהל הזמנות עבור החנות שלך" />
      <Separator />
      <DataTable searchKey="products" columns={columns} data={data} />
    </>
  );
};
