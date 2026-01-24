import * as yup from "yup";

export const LawyerSchema = yup.object({
  first_name: yup.string().required("First name is required"),
  last_name: yup.string().required("Last name  is required"),
  middle_name: yup.string(),
  gender: yup.string().required(),
  state_name: yup.string(),
  state_code: yup.string().required("State is required"),
  email: yup.string().required(),
  phone: yup.string().required(),
  address: yup.string(),
  scn: yup.string().required(),
  date_of_call: yup.string().required("Date of call is required"),
  branch: yup.string().required(),
  area_of_practice: yup.string().required("Area of practice is required"),
});
