"use client"

import { ColumnDef } from "@tanstack/react-table"

import { CellAction } from "./cell-action"

export type CategoryColumn = {
  id: string
  name: string;
  billboardLabel: string;
  createdAt: string;
}

export const columns: ColumnDef<CategoryColumn>[] = [
  {
    accessorKey: "name",
    header: "שם",
  },
  {
    accessorKey: "billboard",
    header: "מודעה",
    cell: ({ row }) => row.original.billboardLabel,
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
