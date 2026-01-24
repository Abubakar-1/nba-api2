import { string } from "yup";

// export interface IStampSealRequest {
//   id: number;
//   reference: string;
//   status: string;
//   paid: boolean;
//   amount: number;
//   quantity: number;
//   payer_name: string;
//   payer_email: string;
//   created_at: string;
//   payment_type: string;
//   tag: string;
//    is_group_payment: boolean;
// }
export interface IStampSealRequest {
  id: number;
  free: boolean;
  verified: boolean;
  attachment: string;
  type: string;
  remark: any;
  delivered: boolean;
  recipient: string;
  approved: boolean;
  created_at: string;
  item: string;
  payment_id: string;
  amount: number;
  remark_status: string;
  recipient_scn: string;
  request_type: string;
  seal_type?: string;
  branch?: string;
  payer_name?: string;
  user_email?: string;
  hasPaidBPF?: boolean;
  branch_payment_payload?: any;
}
export interface IMyStampRequest {
  id: number;
  free: boolean;
  verified: boolean;
  type: string;
  remark: any;
  delivered: boolean;
  recipient: string;
  approved: boolean;
  created_at: string;
  item: string;
  payment_id: string;
  amount: number;
  remark_status: string;
  recipient_scn: string;
  request_type: string;
  seal_type?: string;

  is_government?: boolean;
}

export interface IStampSealRequestResponse {
  pagination: {
    page_size: number;
    total_rows: number;
    page: number;
  };
  items: IStampSealRequest[];
}
export interface IMyStampSealRequestResponse {
  pagination: {
    limit: number;
    total: number;
    page: number;
    totalPages: number;
  };
  orders: IMyStampRequest[];
  items?: IMyStampRequest[];
}

export interface IApprovalProps {
  request_id: number;
  remark: string;
  remark_status: "APPROVED" | "REJECTED";
}

export interface IStampMetrics {
  stat_free: number;
  stat_not_free: number;
  stat_verified: number;
  stat_not_verified: number;
  stat_approved: number;
  stat_rejected: number;
  stat_pending: number;
  stat_total_request: number;
}

export interface IUserStampRequestDetail {
  id: number;
  free: boolean;
  verified: boolean;
  type: string;
  remark: any;
  delivered: boolean;
  recipient: string;
  approved: boolean;
  branch: string;
  hasPaidBPF: boolean;
  created_at: string;
  item: string;
  payment_id: string;
  amount: number;
  remark_status: string;
  recipient_scn: string;
  request_type: string;
  attachment_date: string;
  branch_payment_payload?: any;
}
