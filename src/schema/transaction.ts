import * as yup from "yup";

export const TransactionSchema = yup.object({
  from_date: yup.date().required("from date is required"),
  to_date: yup.date().required("to date is required"),
});
