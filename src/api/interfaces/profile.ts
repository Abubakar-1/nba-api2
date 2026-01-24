export interface IProfile {
  id: number;
  scn: string;
  email: string;
  phone: string;
  gender: string;
  address: string;
  branch: string;
  passport?: string;
  nba_id?: string;
  first_name: string;
  last_name: string;
  middle_name: string;
  dob?: string;
  state_name: string;
  state_code: string;
  is_honorable_bencher: boolean;
  is_san: boolean;
  is_profile_public: boolean;
  date_of_call: string;
  year_of_call: number;
  area_of_practice: string;
}

export interface IEditProfile {
  phone: string;
  branch: string;
  dob: string;
  area_of_practice: string;
  gender: string;
  address: string;
  state_code: string;
  state_name: string;
  is_profile_public: boolean;
  passport: string;
}

export interface IChangePassword {
  old_password: string;
  new_password: string;
  confirm_password: string;
}

export interface IVNINStatusResponse {
  verified: boolean;
  nba_id: string;
  scn?: string;
}
