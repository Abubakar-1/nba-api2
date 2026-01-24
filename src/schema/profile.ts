import * as yup from "yup";

export const ProfileSchema = yup.object({
  phone: yup.string().required("Phone is required"),
  branch: yup.string().required("Branch is required"),
  dob: yup.string().required("Date of birth is required"),
  area_of_practice: yup.string().required("Area of practise is required"),
  gender: yup.string().required("Gender is required"),
  address: yup.string(),
  state_code: yup.string(),
  state_name: yup.string().required("State is required"),
  is_honorable_bencher: yup.boolean(),
  is_san: yup.boolean(),
  is_profile_public: yup.boolean(),
  passport: yup.string(),
});

export const ProfileChangePasswordSchema = yup.object({
  old_password: yup.string().required("Enter your current password"),
  new_password: yup
    .string()
    .required("Enter your new password")
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!#%*?&+=_\\\-"/><()|~\[\]{};:'",.`])[A-Za-z\d@$!#%*?&+=_\\\-"/><()|~\[\]{};:'",.`]{8,}$/,
      "Password must contain at least 8 characters, one uppercase letter, one lowercase letter, one number, and one special character"
    ),
  confirm_password: yup
    .string()
    .required("Enter confirm password")
    .oneOf([yup.ref("new_password")], "Passwords must match"),
});
