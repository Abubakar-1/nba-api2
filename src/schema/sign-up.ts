import * as yup from "yup";

export const UpdateBioSchema = yup.object({
  id: yup.string(),
  email: yup.string().email().required(),
  phone: yup.string().required(),
  gender: yup.string().required(),
  // state_code: yup.string().required("Please select your state"),
  branch: yup.string().required(),
  // area_of_practice: yup.string().required("Please enter your area of practice"),
  // address: yup.string().required(),
});

export const CreatePasswordSchema = yup.object({
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
});
