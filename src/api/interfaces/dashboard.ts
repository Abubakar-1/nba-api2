export interface IDashboardProps {
  year: string;
}

export interface IRecentTransaction {
  id: number;
  reference: string;
  status: string;
  paid: true;
  amount: number;
  quantity: number;
  payerName: string;
  payerEmail: string;
  createdAt: string;
  paymentType: string;
  tag: string;
  groupPayment: boolean;
}

export interface IDashboardResponse {
  totalPaymentCount: number;
  totalSealCount: number;
  totalBpfCount: number;
  amountTotal: number;
  amountBpf: number;
  amountSeal: number;
  recentTransactions: IRecentTransaction[];
  totalPayment?: {
    totalAmount: number;
    paymentCount: number;
  };
  bpf?: {
    amount: number;
    paymentCount: number;
  };
  stampAndSeal?: {
    amount: number;
    paymentCount: number;
  };
}

export interface IAdminDashboard {
  totalPayment: {
    totalAmount: number;
    totalCount: number;
  };
  bpf: {
    totalAmount: number;
    totalCount: number;
  };
  stampAndSeal: {
    totalAmount: number;
    totalCount: number;
  };
  genderDistribution: Array<{
    gender: string;
    count: number;
  }>;
  transactionsSummary: Array<{
    month: string;
    amount: number;
  }>;
  users: {
    totalUsers: number;
    sanCount: number;
    benchersCount: number;
    legalPractitionersCount: number;
  };
}

type MonthData = {
  [month: string]: number;
};
