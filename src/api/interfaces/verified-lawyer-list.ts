export interface IVerifiedLawyers {
  fullName: string;
  nba_id: number;
  scn: string;
  vnin: string;
  year_of_call: number;
  g_fname: string;
  g_lname: string;
  g_mname: string;
  g_phone: string;
  g_dob: string;
}

export interface IVerifiedLawyersResponse {
  pagination: {
    page_size?: number;
    total_rows?: number;
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  items: IVerifiedLawyers[];
}
