import * as yup from "yup";

export const AdimEditLawyerSchema = yup.object({
  first_name: yup.string(),
  last_name: yup.string(),
  middle_name: yup.string(),
  gender: yup.string().required("Gender is required"),
  state_name: yup.string(),
  state_code: yup.string(),
  email: yup.string(),
  phone: yup.string().required(),
  address: yup.string(),
  scn: yup.string(),
  date_of_call: yup.string(),
  branch: yup.string(),
  area_of_practice: yup.string(),
});
