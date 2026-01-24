export interface IUsers {
  id: number;
  email: string;
  username: string;
  gender: string;
  phone: string;
  enabled: boolean;
  first_name: string;
  last_name: string;
  middle_name: string;
  state_name: string;
  is_honorable_bencher: boolean;
  is_san: boolean;
  has_onboarded: boolean;
  is_profile_public: boolean;
  year_of_call: number;
  is_verified: boolean;
  roles: IRoles[];
}

export interface IAddUsers {
  first_name: string;
  last_name: string;
  middle_name: string;
  email: string;
  phone: string;
  gender: string;
  roles?: number[] | string;
  role?: string;
}

export interface IUsersResponse {
  pagination: {
    page_size?: number;
    total_rows?: number;
    page: number;
    total?: number;
    limit?: number;
    totalPages?: number;
  };
  users: IUsers[];
}

export interface IRoles {
  id: number;
  name: string;
  rank?: number;
}
