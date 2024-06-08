"use client";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";
import { client } from "@/lib/hono";
import { Actions } from "./actions";

export type ResponseType = {
  id: string;
  name: string;
  budget: number | null;
  remainingBudget: number | null;
};

export const columns: ColumnDef<ResponseType>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "name",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Name
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => <span>{row.original.name}</span>,
  },
  {
    accessorKey: "budget",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Budget
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const budget = row.original.budget;
      return budget !== null && budget !== 0 ? (
        <span className={budget > 0 ? "text-green-500" : "text-red-500"}>
          ${budget.toFixed(2)}
        </span>
      ) : (
        null // Return null to render an empty cell
      );
    },
    enableSorting: true,
    sortingFn: 'alphanumeric',
  },
  {
    accessorKey: "remainingBudget",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Remaining Budget
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const remainingBudget = row.original.remainingBudget;
      return remainingBudget !== null && remainingBudget !== 0 ? (
        <span className={remainingBudget > 0 ? "text-green-500" : "text-red-500"}>
          ${remainingBudget.toFixed(2)}
        </span>
      ) : (
        null // Return null to render an empty cell
      );
    },
    enableSorting: true,
    sortingFn: 'alphanumeric',
  },
  {
    id: "actions",
    cell: ({ row }) => <Actions id={row.original.id} />
  }
];
