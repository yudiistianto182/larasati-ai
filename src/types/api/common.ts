/**
 * Common API Response & Pagination Types
 */

export interface ApiResponse<T = unknown> {
  status: boolean;
  message: string;
  data: T;
}

export interface PaginationMeta {
  total: number;
  per_page: number;
  current_page: number;
  last_page: number;
  first_page: number;
  first_page_url: string;
  last_page_url: string;
  next_page_url: string | null;
  previous_page_url: string | null;
}

export interface PaginatedData<T> {
  meta: PaginationMeta;
  data: T[];
}

export interface DropdownOption<T = string | number> {
  id: T;
  text: string;
}

export interface PaginationQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  order?: "asc" | "desc";
  order_by?: string;
  [key: string]: string | number | boolean | null | undefined;
}
