import * as yup from "yup";

export const ResetPasswordSchema = yup.object({
  email: yup
    .string()
    .required("Your email is required")
    .email("This is an invalid email format")
    .trim()
    .lowercase(),
});

export const ResetPasswordCompleteSchema = yup.object({
  password: yup
    .string()
    .required("Enter your new password")
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!#%*?&+=_\\\-"/><()|~\[\]{};:'",.`])[A-Za-z\d@$!#%*?&+=_\\\-"/><()|~\[\]{};:'",.`]{8,}$/,
      "Password must contain at least 8 characters, one uppercase letter, one lowercase letter, one number, and one special character"
    ),
  confirm_password: yup
    .string()
    .required("Enter confirm password")
    .oneOf([yup.ref("password")], "Passwords must match"),
  email: yup
    .string()
    .email("This is an invalid email format")
    .trim()
    .lowercase(),
});
