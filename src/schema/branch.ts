import * as yup from "yup";

export const BranchSchema = yup.object({
  name: yup.string().required("Name is required"),
  manager_id: yup.number().required("Manager is required"),
  manager_name: yup.string().required("Manager Name is required"),
  manager_scn: yup.string().required("Manager SCN is required"),
  address: yup.string().required("Address is required"),
  active: yup.boolean(),
});
