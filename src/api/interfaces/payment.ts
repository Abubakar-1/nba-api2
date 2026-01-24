export interface BPFPaymentBodyProps {
  id: number;
  scn: string;
  category: string;
}

export interface BPFPaymentProp {
  year: number;
  chosen_lawyers: BPFPaymentBodyProps[];
  tag: string;
  payment_gateway: string;
  payment_type: string;
}

export interface BacklogPaymentProp {
  backlog_years: string[];
  chosen_lawyers: BPFPaymentBodyProps[];
  tag: string;
  payment_gateway: string;
  payment_type: string;
}

export interface StampAndSealPaymentProp {
  payment_type: string;
  item_chosen: string;
  tag: string;
  payment_gateway: string;
}

export type StampProp = Omit<
  StampAndSealPaymentProp,
  "payment_type" | "tag" | "payment_gateway"
> & {
  ok: boolean;
  total_payment: number;
};

export interface StampItems {
  amount: number;
  code: string;
  description: string;
  id: number;
  quantity: number;
}

export interface InvoiceProps {
  id: number;
  category: string;
  scn: string;
  email: string;
  name: string;
  year_of_call: number;
  year_in_service: number;
  amount_due: number;
  message: string;
  ok: boolean;
}
export interface BPFPaymentResProps {
  year: number;
  invoice_recipients: InvoiceProps[];
  total_payment: number;
  ok: boolean;
  backlog?: BackItems[];
}

interface BackItems {
  year: string;
  amountDue: number;
  yearInService: string;
}

export interface BPFPaymentInvoiceProps {
  total_payment: number;
  callback_url: string;
  public_key: string;
  reference: string;
  customer_name: string;
  customer_email: string;
}

export interface IUploadStampDocument {
  payment_id: string;
  attachment: string;
  type: string;
  orderId?: string;
}

export interface IStampOrder {
  id: number;
  seal_type: string;
  amount: number;
  request_type: string;
  verified: boolean;
  printed: boolean;
  delivered: boolean;
  created_at: string;
}

export interface IStampOrdersResponse {
  orders: IStampOrder[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
