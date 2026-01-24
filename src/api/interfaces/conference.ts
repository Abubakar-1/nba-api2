export interface IConferenceStatus {
  status: boolean;
  entry: null | IConferenceEntry;
}

interface IConferenceEntry {
  id: number;
  email: string;
  phone: string;
  scn: string;
  year: string;
  title: string;
  gender: string;
  category: string;
  organization: string;
  designation: string;
  disability: string | null;
  participation: string;
  address: string;
  passport: string | null;
  user_id: number;
  reg_number: string | null;
  first_name: string;
  last_name: string;
  middle_name: string;
  is_guest?: boolean;
  has_toddler: boolean;
  is_over_70: boolean;
  is_disable?: boolean;
  is_paid?: boolean;
}

export interface IConferencePaymentPreview {
  message: string;
  ok: boolean;
  category: string;
  participation: string;
  total_payment: number;
  payment_rate: string;
}

export interface IConferencePayment {
  message: string;
  ok: boolean;
  category: string;
  participation: string;
  paymentRate: string;
  phone_number: string;
  total_payment: number;
  public_key: string;
  reference: string;
  customer_name: string;
  customer_email: string;
}

export interface IMyConferenceResponse {
  metrics: {
    total_attended: number;
    total_payment: number;
    lawyer_attended: number;
    lawyer_payment: number;
    non_lawyer_attended: number;
    non_lawyer_payment: number;
    intl_delegate_attended: number;
    intl_delegate_payment: number;
  };
  data: IMyConference[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasPreviousPage: boolean;
    hasNextPage: boolean;
  };
}
export interface IMyConference {
  id: number;
  status: string;
  amount: number;
  payer_name: string;
  participation: string;
  category: string;
  payment_rate: string;
  reference: string;
}

export interface IConferencePaymentDetails {
  id: number;
  reference: string;
  status: string;
  paid: false;
  amount: number;
  title: string;
  category: string;
  participation: string;
  year: string;
  phone: string;
  organization: string;
  scn?: string;
  branch?: string;
  designation: string;
  barcode: string;
  user_id: number;
  payer_name: string;
  payer_email: string;
  payment_date: string;
  payment_rate: string;
  reg_number: string | null;
}

export interface IBulkPaymentUpload {
  status: string;
  records: IBulkRecords[];
}

export interface IBulkRecords {
  id: number;
  email: string;
  phone: string;
  scn: string;
  year: string;
  title: string;
  gender: string;
  category: string;
  organization: string;
  designation: string;
  disability: string;
  participation: string;
  address: string;
  amount: number;
  status: string;
  reason: string;
  fullName: string;
  user_id: number;
  reg_number: any;
  year_of_call: number;
  first_name: string;
  last_name: string;
  middle_name: string;
  is_guest: boolean;
  has_toddler: boolean;
  is_over_70: boolean;
  is_disable: boolean;
  is_paid: boolean;
}
