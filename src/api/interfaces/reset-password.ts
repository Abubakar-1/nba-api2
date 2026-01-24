export interface ResetPasswordVerifyProps {
  otp: string;
  email: string;
}

export interface ResetPasswordCompleteProps {
  password: string;
  confirm_password: string;
  email: string;
}
