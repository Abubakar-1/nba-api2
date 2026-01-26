import { IRoles, IUsers } from "@/api/interfaces/users";
import { updateAdmin, getRoles } from "@/api/users";
import { useFetcher } from "@/components/hooks/use-fetcher";
import { useRequest } from "@/components/hooks/use-request";
import { NotifyError, NotifySuccess } from "@/components/toast/toast";
import Button from "@/components/ui/button";
import Checkbox from "@/components/ui/checkbox";
import Input from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { Select } from "@/components/ui/select";
import { UserSchema } from "@/schema/user";
import { useFormik } from "formik";
import { FunctionalComponent } from "preact";
import { Fragment } from "preact";
import { useEffect } from "preact/hooks";

interface EditProps {
  state: boolean;
  handleModalClose: any;
  data?: IUsers;

  refresh?(): void;
}
const EditAdmin: FunctionalComponent<EditProps> = ({
  state,
  handleModalClose,
  data,
  refresh,
}) => {
  const updateAdminRequest = useRequest<any>(updateAdmin);
  const getRolesRequest = useFetcher<IRoles[]>(getRoles);

  const hardcoded_roles = [
    "SUPER ADMIN",
    // "PRACTICING LAWYER",
    "ADMIN",
    // "STUDENT LAWYER",
    "BAR SERVICES",
    // "GUEST",
    "CONFERENCE ADMIN",
  ];

  async function submit(values: any) {
    const { id, roles, ...body } = values;
    const payload = { id, body };
    const [response, _err] = await updateAdminRequest.makeRequest(payload);
    if (!_err) {
      NotifySuccess("Admin updated successfully");
      if (refresh) refresh();
    } else if (_err && _err?.data) {
      NotifyError(_err?.data?.info);
      return;
    } else {
      NotifyError(_err?.info);
      return;
    }
  }

  const form = useFormik({
    validationSchema: UserSchema,
    initialValues: {
      id: 0,
      first_name: "",
      last_name: "",
      middle_name: "",
      email: "",
      phone: "",
      gender: "",
      roles: "",
    },
    onSubmit(values, formikHelpers) {
      submit({
        ...values,
        roles: [values.roles],
      });
    },
  });

  useEffect(() => {
    if (data) {
      // console.log("data", data.gender);
      form.setValues({
        id: data.id,
        first_name: data.first_name ?? "",
        last_name: data.last_name ?? "",
        email: data.email ?? "",
        phone: data.phone ?? "",
        gender: data.gender ?? "",
        roles: data.roles[0] ? data.roles[0].name : "",
      });
    }
  }, [data]);
  return (
    <>
      <Modal
        isOpen={state}
        showCloseIcon={state}
        onClose={() => handleModalClose()}
        dimensions="xl"
      >
        <form onSubmit={form.handleSubmit}>
          <h1 className="font-bold text-lg lg:text-2xl">Edit Admin</h1>

          <div className="flex gap-3 ">
            <div className="mt-5 w-full">
              <Input
                label="First name"
                id="first_name"
                dimension="lg"
                variant="primary"
                {...form.getFieldProps("first_name")}
                type="text"
                autoComplete="first_name"
                required
                error={
                  form.touched.first_name ? form.errors.first_name : undefined
                }
              />
            </div>

            <div className="mt-5 w-full">
              <Input
                label="Middle name"
                id="middle_name"
                dimension="lg"
                variant="primary"
                {...form.getFieldProps("middle_name")}
                type="text"
                autoComplete="middle_name"
                error={
                  form.touched.middle_name ? form.errors.middle_name : undefined
                }
              />
            </div>
          </div>

          <div className="flex gap-3 ">
            <div className="mt-5 w-full">
              <Input
                label="Last name"
                id="last_name"
                dimension="lg"
                variant="primary"
                {...form.getFieldProps("last_name")}
                type="text"
                autoComplete="last_name"
                required
                error={
                  form.touched.last_name ? form.errors.last_name : undefined
                }
              />
            </div>
            <div className="mt-5 w-full">
              <Input
                label="Phone"
                id="phone"
                dimension="lg"
                variant="primary"
                {...form.getFieldProps("phone")}
                type="text"
                autoComplete="phone"
                error={form.touched.phone ? form.errors.phone : undefined}
              />
            </div>
          </div>

          <div className="mt-5 w-full">
            <Input
              label="Enter your email"
              id="email"
              dimension="lg"
              variant="primary"
              {...form.getFieldProps("email")}
              type="text"
              autoComplete="email"
              error={form.touched.email ? form.errors.email : undefined}
            />
          </div>

          <div className="mt-5 w-full">
            <Select
              label="Gender"
              id="gender"
              dimension="lg"
              variant="primary"
              {...form.getFieldProps("gender")}
              type="text"
              autoComplete="gender"
              required
              error={form.touched.gender ? form.errors.gender : undefined}
            >
              <option value={""}>Select gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </Select>
          </div>

          <div className="mt-5 w-full">
            <Select
              label="Role"
              id="roles"
              dimension="lg"
              variant="primary"
              {...form.getFieldProps("roles")}
              type="text"
              autoComplete="role"
              required
              error={form.touched.roles ? form.errors.roles : undefined}
            >
              <option value={""}>Select role</option>
              {/* {getRolesRequest.response && */}
              {hardcoded_roles.map((el: string, idx: number) => (
                <option value={el}>{el}</option>
              ))}
            </Select>
          </div>

          <div className="mt-7 w-full">
            <div className="flex flex-col gap-4 lg:gap-6">
              <div>
                <Button
                  type="submit"
                  dimension="lg"
                  variant="primary"
                  disabled={!(form.isValid && form.dirty)}
                  isLoading={updateAdminRequest.isLoading}
                >
                  Save
                </Button>
              </div>
              <div className=" flex text-sm font-medium items-center w-full justify-center">
                <button
                  type="button"
                  onClick={() => handleModalClose()}
                  className=""
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </form>
      </Modal>
    </>
  );
};
export default EditAdmin;
