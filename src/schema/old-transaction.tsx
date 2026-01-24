import * as yup from "yup";

export const OldTransactionSchema = yup.object({
  name: yup.string().required("Name is required"),
  email: yup.string().required(),
  phone: yup.string().required(),
  scn: yup.string().required(),
  branch: yup.string().required(),
  year_of_call: yup.string().required("Year of call is required"),
  // .test(
  //   "valid-year",
  //   "Year of call must be between 2022 and 2023",
  //   (value) => {
  //     if (!value) {
  //       return true;
  //     }

  //     const year = parseInt(value, 10); // Convert the string to an integer
  //     return year >= 2022 && year <= 2023;
  //   }
  // ),
});
