import { IAddUsers, IRoles } from "@/api/interfaces/users";
import { addAdmin, getRoles } from "@/api/users";
import ConfirmIcon from "@/assets/icons/confirm-icon";
import { useFetcher } from "@/components/hooks/use-fetcher";
import { useRequest } from "@/components/hooks/use-request";
import { NotifyError, NotifySuccess } from "@/components/toast/toast";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import PageLoader from "@/components/ui/page-loader";
import { Select } from "@/components/ui/select";
import { LawyerSchema } from "@/schema/lawyer";
import { UserSchema } from "@/schema/user";
import { useFormik } from "formik";
import { FunctionalComponent } from "preact";
import { Fragment } from "preact";
import { ChangeEvent } from "preact/compat";
import { useLayoutEffect, useState } from "preact/hooks";

interface AddProps {
  state: boolean;
  handleModalClose: any;
  refresh(): void;
}
const AddUser: FunctionalComponent<AddProps> = ({
  state,
  handleModalClose,
  refresh,
}) => {
  const [isConfirm, setIsConfirm] = useState(false);
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const getRolesRequest = useFetcher<IRoles[]>(getRoles);
  const hardcoded_roles = [
    "SUPER_ADMIN",
    "PRACTICING_LAWYER",
    "ADMIN",
    "STUDENT_LAWYER",
    "BAR_SERVICES",
    "GUEST",
    "CONFERENCE_ADMIN",
  ];
  const addAdminRequest = useRequest<IAddUsers>(addAdmin);

  async function submit(body: IAddUsers) {
    const [response, _err] = await addAdminRequest.makeRequest(body);
    if (!_err) {
      handleAddAdminSuccess();
      form.resetForm();
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
      first_name: "",
      last_name: "",
      middle_name: "",
      email: "",
      phone: "",
      gender: "",
      roles: "",
    },
    onSubmit(values, formikHelpers) {
      const payload: any = { ...values, role: values.roles };
      delete payload.roles;
      submit(payload);
    },
  });

  const handleAddAdminSuccess = () => {
    handleModalClose();
    setIsOpen(true);
    if (refresh) refresh();
  };

  useLayoutEffect(() => {
    if (!state) {
      setIsConfirm(false);
      form.resetForm();
    }
  }, [state]);

  return (
    <>
      <div>
        <Modal isOpen={isOpen} onClose={() => setIsOpen(false)}>
          <div className="lg:px-5 py-5 flex flex-col justify-center items-center gap-3">
            <ConfirmIcon />
            <h1 className="text-sm md:text-base lg:text-lg xl:text-2xl font-bold">
              Access Granted!
            </h1>
            <p className="px-2 text-sm text-gray-500 text-center">
              You have successfully onboarded a new user as an Admin into the
              application.
            </p>
            <div className="w-full mt-3">
              <Button
                variant="primary"
                dimension="lg"
                onClick={(e) => {
                  setIsOpen(false);
                  handleModalClose();
                  e.preventDefault();
                }}
              >
                Add another admin
              </Button>
            </div>
            <div className="flex text-sm font-medium items-center w-full justify-center">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className=""
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      </div>

      <Modal
        isOpen={state}
        showCloseIcon={state}
        onClose={() => {
          handleModalClose();
        }}
        dimensions="lg"
      >
        <form onSubmit={form.handleSubmit}>
          {!isConfirm ? (
            <>
              <h1 className="font-bold text-lg lg:text-2xl">Add Admin</h1>

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
                      form.errors.first_name
                        ? form.errors.first_name
                        : undefined
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
                      form.errors.middle_name
                        ? form.errors.middle_name
                        : undefined
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
                      form.errors.last_name ? form.errors.last_name : undefined
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
                    error={form.errors.phone ? form.errors.phone : undefined}
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
                  error={form.errors.email ? form.errors.email : undefined}
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
                  error={form.errors.gender ? form.errors.gender : undefined}
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
                  error={form.errors.roles ? form.errors.roles : undefined}
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
                      type="button"
                      dimension="lg"
                      variant="primary"
                      disabled={!(form.isValid && form.dirty)}
                      onClick={() => setIsConfirm(true)}
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
            </>
          ) : (
            <div className="mt-7 w-full">
              <h1 className="font-bold text-lg lg:text-xl mb-3">
                Confirm Action
              </h1>
              <p className="my-2 text-sm text-gray-500">
                By completing this action, you are making the user{" "}
                <span className="text-gray-800 font-bold">
                  {form.values.email}{" "}
                </span>
                an ADMIN
              </p>
              <p className="mb-7 text-sm text-gray-500">
                The user will be able to access the system with the email
                provided. User{" "}
                <span className="text-gray-800 font-bold">password</span> will
                be auto generated in the email that will be sent.
              </p>
              <div className="flex flex-col gap-4 lg:gap-6">
                <div>
                  <Button
                    type="submit"
                    dimension="lg"
                    variant="primary"
                    isLoading={addAdminRequest.isLoading}
                    disabled={!(form.isValid && form.dirty)}
                  >
                    Yes, continue
                  </Button>
                </div>

                <div className="flex text-sm font-medium items-center w-full justify-center">
                  <button
                    type="button"
                    onClick={() => setIsConfirm(false)}
                    className=""
                  >
                    Back
                  </button>
                </div>
              </div>
            </div>
          )}
        </form>
      </Modal>
    </>
  );
};
export default AddUser;
