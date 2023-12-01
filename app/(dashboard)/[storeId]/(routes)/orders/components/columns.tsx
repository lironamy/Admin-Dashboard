"use client"

import { ColumnDef } from "@tanstack/react-table"

export type OrderColumn = {
  id: string;
  phone: string;
  address: string;
  isPaid: any;
  totalPrice: string;
  products: string;
  createdAt: string;
  size: string;
  quantity: number;
}

export const columns: ColumnDef<OrderColumn>[] = [
  {
    accessorKey: "products",
    header: "מוצרים",
  },
  {
    accessorKey: "size",
    header: "מידה",
  },
  {
    accessorKey: "quantity",
    header: "כמות",
  },
  {
    accessorKey: "createdAt",
    header: "תאריך",
  },
  {
    accessorKey: "phone",
    header: "מספר טלפון",
  },
  {
    accessorKey: "address",
    header: "כתובת",
  },
  {
    accessorKey: "totalPrice",
    header: "סה״כ",
  },
  {
    accessorKey: "isPaid",
    header: "שולם",
  },
];
