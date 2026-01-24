import * as yup from "yup";

export const ConferenceRegistrationSchema = yup.object({
  email: yup.string(),
  phone: yup.string(),
  title: yup.string().required(),
  first_name: yup.string().required("First name is required"),
  last_name: yup.string().required("Last name  is required"),
  middle_name: yup.string(),
  designation: yup.string(),
  category: yup.string().required(),
  organization: yup.string().required(),
  has_toddler: yup.string(),
  is_over_70: yup.string(),
  disability: yup.string().required(),
  participation: yup.string().required(),
  address: yup.string().required(),
  payment_rate: yup.string().required("Payment rate is required"),
  quantity: yup
    .number()
    .min(1, "Quantity must be at least 1")
    .required("Quantity is required"),
  payment_gateway: yup.string().required("Payment gateway is required"),
});
