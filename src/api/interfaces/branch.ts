export interface IBranchResponse {
  pagination: {
    page_size?: number;
    total_rows?: number;
    page: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
  items: IBranch[];
}

// New API response structure
export interface IBranchApiResponse {
  data: IBranch[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasPreviousPage: boolean;
    hasNextPage: boolean;
  };
}
export interface IBranch {
  code: string;
  name: string;
  active: boolean;
  address: string;
  manager_id: string;
  manager_scn: string;
  manager_name: string;
}
export interface BranchProp {
  name: string;
  address: string;
  manager_name: string;
  manager_id: number;
  manager_scn: string;
  active: boolean;
}
