export interface ILogin {
  email?: string;
  scn?: string;
  username?: string;
  password: string;
}

export interface ILoginResponse {
  accessToken: string;
  refreshToken?: string; // Optional - no longer used
  user: {
    id: string;
    email: string;
    username: string;
    fullname: string;
    phone: string;
    password_reset_after_jan_17_2026?: boolean;
  };
}

export interface UserDetails {
  id: number;
  username: string;
  email: string;
  phone: string;
  roles: string[];
  first_name: string;
  last_name: string;
  middle_name: string;
  password_reset_after_jan_17_2026?: boolean;
}

export interface ISignUp {
  id: number;
  email: string;
  password?: string;
  phone: string;
  scn: string;
  first_name: string;
  last_name: string;
  middle_name: string;
  is_honorable_bencher: boolean;
  is_san: boolean;
  has_onboarded: boolean;
  is_profile_public: boolean;
  date_of_call: string;
  year_of_call: number;
  // address?: string;
  gender?: string;
  // state_name?: string;
  // state_code?: string;
  branch?: string;
  // area_of_practice?: string;
  dob?: string;
  roles?: number[];
}

export type IUpdateUserInfo = {
  id: number;
  scn: string;
  first_name: string;
  last_name: string;
  middle_name: string;
  email: string;
  phone: string;
  gender: string;
  // state_name: string;
  // state_code: string;
  // address: string;
  branch: string;
  // area_of_practice: string;
  date_of_call: string;
  is_san: boolean;
  roles: number[];
};

// export interface IBranch {
//   code: string;
//   name: string;
//   active: boolean;
//   address: null | string;
// }

export interface IValidateOTP {
  email: string;
  otp: string;
}

export interface ICreateUserPassword {
  email: string;
  password: string;
  confirm_password: string;
}

// ============================================
// NEW SIGNUP FLOW INTERFACES
// ============================================

export interface IFindSCNRequest {
  scn: string;
}

export interface IRegisterUserRequest {
  scn: string;
  area_of_practice?: string;
  gender: string;
  phone: string;
  email: string;
  branch: string;
  year_of_call?: number;
}

export interface IVerifyRegistrationOTPRequest {
  email: string;
  otp: string;
}

export interface IUpdateRegistrationPasswordRequest {
  email: string;
  password: string;
  retypePassword: string;
}

export interface IRegistrationCompleteResponse {
  user: {
    id: string;
    email: string;
    username: string;
    fullname: string;
    phone: string;
  };
  accessToken: string;
  refreshToken?: string; // Optional - no longer used
}
