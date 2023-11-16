"use client"

import { ColumnDef } from "@tanstack/react-table"

import { CellAction } from "./cell-action"

export type SizeColumn = {
  id: string
  name: string;
  value: string;
  createdAt: string;
}

export const columns: ColumnDef<SizeColumn>[] = [
  {
    accessorKey: "name",
    header: "שם",
  },
  {
    accessorKey: "value",
    header: "ערך",
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
