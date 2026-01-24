export interface IFilter {
  payment_type: string;
  from_date: string;
  to_date: string;
}

export interface IStampExportFilter {
  status: string;
  from_date: string;
  to_date: string;
}

export interface ITransactions {
  id: number;
  reference: string;
  transaction_id: string;
  status: string;
  paid: boolean;
  amount: number;
  quantity: number;
  payer_name: string;
  payer_email: string;
  created_at: string;
  payment_type: string;
  tag: string;
  is_group_payment: boolean;
  year_of_call?: string | number;
  type?: string;
  amount_paid?: number;
  payment_link?: string;
  item_description?: string;
}

export interface ITransactionResponse {
  pagination?: {
    page_size?: number;
    total_rows?: number;
    page: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
  items?: ITransactions[];
  // New structure support
  meta?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasPreviousPage: boolean;
    hasNextPage: boolean;
    page_size?: number;
    total_rows?: number;
  };
  data?: ITransactions[] | { items: ITransactions[] };
}

//transaction details

export interface ITransactionDetails {
  amount: number;
  branch: string;
  created_at: string;
  email: string;
  id: number;
  item: string;
  item_description: string;
  recipient_name: string;
  recipient_scn: string;
  reference: string;
  type: string;
  year: number;
  payer_name?: string;
  payer_email?: string;
  year_of_call: number | string;
  payer_scn?: string;
  payment_gateway: string;
  status: string;
}

//personal transaction
export interface IMyTransaction {
  status: string;
  amount: number;
  branch: string;
  created_at: string;
  email: string;
  id: number;
  item: string;
  item_description: string;
  recipient_name: string;
  recipient_scn: string;
  reference: string;
  type: string;
  year: number;
  year_of_call: number;
  payment_link?: {
    payment_link: string;
  };
}

export interface IOldTransaction {
  id: number;
  name: string;
  scn: string;
  branch: string;
  amount: number;
  reference: string;
  email: string;
  phone: string;
  complete: boolean;
  year_of_call: number;
  created_at: string;
  payment_year: string;
}

export interface IMyOldTransactionResponse {
  pagination: {
    page_size?: number;
    total_rows?: number;
    page: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
  items: IOldTransaction[];
}

export interface IMyTransactionResponse {
  pagination: {
    page_size?: number;
    total_rows?: number;
    page: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
  items: IMyTransaction[];
}

export interface ITransactionProps {
  page: number;
  page_size: number;
  search: string;
  status: string;
  payment_type: string;
  from_date: string;
  to_date: string;
}

export interface OldTransactionProps {
  id: number;
  scn: string;
  email: string;
  phone: string;
  branch: string;
  yearOfCall: string;
}
