import * as React from "react";
import {
  type ColumnFiltersState,
  type PaginationState,
  type SortingState,
  useTable,
} from "@tanstack/react-table";
import { Search } from "lucide-react";

import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import { dataTableFeatures } from "@/lib/data-table-features";

import { type RoleRow } from "./data";
import { getRolesColumns } from "./roles-columns";
import { RolesTable } from "./roles-table";
import { roleService } from "@/services/api";

export function Roles() {
  // Roles list state (purely from API, no fallback data)
  const [roles, setRoles] = React.useState<RoleRow[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const hasFetchedRef = React.useRef(false);

  const fetchRoles = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await roleService.getDropdown();
      if (res.status && Array.isArray(res.data) && res.data.length > 0) {
        setRoles(
          res.data.map((r) => ({
            role_id: Number(r.id),
            role_name: String(r.text),
          }))
        );
      } else {
        const allRes = await roleService.getAll();
        if (allRes.status && Array.isArray(allRes.data) && allRes.data.length > 0) {
          setRoles(
            allRes.data.map((r) => ({
              role_id: Number(r.id),
              role_name: String(r.text),
            }))
          );
        }
      }
    } catch (e) {
      console.error("[Roles] Failed to fetch roles:", e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    if (hasFetchedRef.current) return;
    hasFetchedRef.current = true;

    fetchRoles();
  }, [fetchRoles]);

  // TanStack table states
  const [sorting, setSorting] = React.useState<SortingState>([{ id: "role_name", desc: false }]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [pagination, setPagination] = React.useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  const columns = React.useMemo(() => getRolesColumns(), []);

  const table = useTable({
    features: dataTableFeatures,
    data: roles,
    columns,
    state: {
      sorting,
      columnFilters,
      pagination,
    },
    getRowId: (row) => String(row.role_id),
    autoResetPageIndex: false,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onPaginationChange: setPagination,
  });

  const searchQuery = (table.getColumn("role_name")?.getFilterValue() as string | undefined) ?? "";

  return (
    <div className="flex flex-col gap-4 md:gap-6">
      <Card>
        <CardHeader className="border-b has-data-[slot=card-action]:grid-cols-1 md:has-data-[slot=card-action]:grid-cols-[1fr_auto]">
          <CardTitle className="text-xl leading-none">Roles</CardTitle>
          <CardDescription className="max-w-sm leading-snug">
            Manage system access levels, permissions, and midwife roles.
          </CardDescription>
          <CardAction className="col-start-1 row-start-auto flex w-full flex-wrap justify-start gap-2 justify-self-stretch md:col-start-2 md:row-span-2 md:row-start-1 md:w-auto md:flex-nowrap md:justify-end md:justify-self-end">
            <InputGroup className="h-7 w-full md:w-64">
              <InputGroupAddon align="inline-start">
                <Search className="size-3.5" />
              </InputGroupAddon>
              <InputGroupInput
                className="h-7"
                placeholder="Search roles..."
                value={searchQuery}
                onChange={(event) => {
                  table.getColumn("role_name")?.setFilterValue(event.target.value || undefined);
                  table.setPageIndex(0);
                }}
              />
            </InputGroup>
          </CardAction>
        </CardHeader>
        <CardContent className="flex flex-col gap-4 px-0">
          <RolesTable table={table} isLoading={isLoading} />
        </CardContent>
      </Card>
    </div>
  );
}
