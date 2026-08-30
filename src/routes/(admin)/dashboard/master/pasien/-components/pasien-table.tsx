import type { MouseEvent } from "react";
import type { ReactTable } from "@tanstack/react-table";

import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { DataTableFeatures } from "@/lib/data-table-features";
import type { Pasien } from "./data";

function preventPaginationNavigation(event: MouseEvent<HTMLAnchorElement>) {
  event.preventDefault();
}

function getPageNumbers(currentPage: number, pageCount: number) {
  if (pageCount <= 3) {
    return Array.from({ length: pageCount }, (_, index) => index + 1);
  }

  if (currentPage <= 2) return [1, 2, 3];
  if (currentPage >= pageCount - 1) return [pageCount - 2, pageCount - 1, pageCount];

  return [currentPage - 1, currentPage, currentPage + 1];
}

export function PasienTable({ table }: { table: ReactTable<DataTableFeatures, Pasien> }) {
  const pageCount = Math.max(table.getPageCount(), 1);
  const currentPage = Math.min(table.state.pagination.pageIndex + 1, pageCount);
  const pageNumbers = getPageNumbers(currentPage, pageCount);
  const rowsPerPage = `${table.state.pagination.pageSize}`;

  return (
    <div className="flex flex-1 flex-col gap-4">
      <div className="overflow-x-auto">
        <Table className="**:data-[slot='table-cell']:px-4 **:data-[slot='table-head']:px-4">
          <TableHeader className="[&_tr]:border-t">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} className="py-3 font-normal">
                    {header.isPlaceholder ? null : <table.FlexRender header={header} />}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>

          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  className="border-border/60 hover:bg-muted/30"
                  data-state={table.state.rowSelection[row.id] && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="px-3 py-3 align-middle">
                      <table.FlexRender cell={cell} />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={table.getVisibleLeafColumns().length} className="h-32 text-center text-muted-foreground">
                  Tidak ada data pasien yang ditemukan.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Separator />

      <div className="flex flex-col gap-4 px-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4 text-muted-foreground text-sm">
          <div className="flex items-center gap-2">
            <span className="hidden sm:inline">Baris per halaman</span>
            <Select
              value={rowsPerPage}
              onValueChange={(value) => table.setPageSize(Number(value))}
            >
              <SelectTrigger size="sm" className="w-18">
                <SelectValue placeholder={rowsPerPage} />
              </SelectTrigger>
              <SelectContent side="top">
                <SelectGroup>
                  <SelectItem value="5">5</SelectItem>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="25">25</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          <div>
            {table.getFilteredSelectedRowModel().rows.length} dari {table.getFilteredRowModel().rows.length} data terpilih
          </div>
        </div>

        <div className="flex items-center gap-4">
          <span className="text-muted-foreground text-sm">
            Halaman {currentPage} dari {pageCount}
          </span>
          <Pagination className="w-auto">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  aria-disabled={!table.getCanPreviousPage()}
                  className={!table.getCanPreviousPage() ? "pointer-events-none opacity-50" : undefined}
                  onClick={(e) => {
                    preventPaginationNavigation(e);
                    table.previousPage();
                  }}
                />
              </PaginationItem>

              {pageNumbers.map((pageNumber) => (
                <PaginationItem key={pageNumber}>
                  <PaginationLink
                    href="#"
                    isActive={table.state.pagination.pageIndex === pageNumber - 1}
                    onClick={(e) => {
                      preventPaginationNavigation(e);
                      table.setPageIndex(pageNumber - 1);
                    }}
                  >
                    {pageNumber}
                  </PaginationLink>
                </PaginationItem>
              ))}

              {pageCount > 3 && currentPage < pageCount - 1 && (
                <PaginationItem>
                  <PaginationEllipsis />
                </PaginationItem>
              )}

              <PaginationItem>
                <PaginationNext
                  href="#"
                  aria-disabled={!table.getCanNextPage()}
                  className={!table.getCanNextPage() ? "pointer-events-none opacity-50" : undefined}
                  onClick={(e) => {
                    preventPaginationNavigation(e);
                    table.nextPage();
                  }}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      </div>
    </div>
  );
}
