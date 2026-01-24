export interface ILawyerResponse {
  pagination: {
    page_size?: number;
    total_rows?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
    page: number;
  };
  items: ILawyer[];
}
export interface ILawyer {
  has_onboarded?: boolean;
  address: string;
  branch: string;
  date_of_call: string;
  email: null;
  enabled: boolean;
  first_name: string;
  id: number;
  is_honorable_bencher: boolean;
  is_san: boolean;
  last_name: string;
  middle_name: string;
  nba_id: string;
  passport: string;
  phone: string;
  scn: string;
  state_code: string;
  state_name: string;
  year_of_call: number;
  gender?: string;
  area_of_practice?: string;
}

export type LawyerProp = Omit<
  ILawyer,
  "email" | "scn" | "nba_id" | "year_of_call" | "date_of_call"
> & {
  manager_id: number;
};

export interface IUploadLawyerPreview {
  address: string;
  date_of_call: string;
  email: string;
  first_name: string;
  gender: string;
  last_name: string;
  middle_name: string;
  phone: string;
  scn: string;
  year_of_call: number;
  category?: string;
  state?: string;
}
