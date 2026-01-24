import * as yup from "yup";

export const UserSchema = yup.object({
  first_name: yup.string().required("First name is required"),
  last_name: yup.string().required("Last name  is required"),
  middle_name: yup.string(),
  gender: yup.string().required(),
  email: yup.string().required(),
  phone: yup.string().required(),
  roles: yup.string().required("Role is required"),
});
