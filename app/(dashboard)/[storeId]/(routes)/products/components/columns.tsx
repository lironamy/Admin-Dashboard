"use client"

import { ColumnDef } from "@tanstack/react-table"

import { CellAction } from "./cell-action"

export type ProductColumn = {
  id: string
  name: string;
  descriptionHeader: string;
  description: string;
  price: string;
  salePrice: string;
  category: string;
  color: string;
  sizes: string;
  quantity: number;
  createdAt: string;
  isFeatured: any;
  isArchived: any;
}

export const columns: ColumnDef<ProductColumn>[] = [
  {
    accessorKey: "name",
    header: "שם",
  },
  {
    accessorKey: "isArchived",
    header: "ארכיון",
  },
  {
    accessorKey: "isFeatured",
    header: "נבחרים",
  },
  {
    accessorKey: "price",
    header: "מחיר",
  },
  {
    accessorKey: "salePrice",
    header: "מחיר מבצע",
  },
  {
    accessorKey: "sizes",
    header: "מידה : כמות",
  },
  {
    accessorKey: "category",
    header: "קטגוריה",
  },
  {
    accessorKey: "color",
    header: "צבע",
    cell: ({ row }) => (
      <div className="flex items-center gap-x-2">
        {row.original.color}
        <div className="h-6 w-6 rounded-full border" style={{ backgroundColor: row.original.color }} />
      </div>
    )
  },
  {
    accessorKey: "createdAt",
    header: "תאריך",
  },
  {
    id: "actions",
    header: "פעולות",
    cell: ({ row }) => <CellAction data={row.original} />
  },
];
