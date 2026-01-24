import { findSUserCNApi } from "@/api/auth";
import { addBranch } from "@/api/branch";
import { ISignUp } from "@/api/interfaces/auth";
import { BranchProp, IBranch } from "@/api/interfaces/branch";
import { useRequest } from "@/components/hooks/use-request";
import { NotifyError, NotifySuccess } from "@/components/toast/toast";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import PageLoader from "@/components/ui/page-loader";
import { Select } from "@/components/ui/select";
import { BranchSchema } from "@/schema/branch";
import { ArrowSmallLeftIcon, CheckCircleIcon } from "@heroicons/react/24/solid";
import { useFormik } from "formik";
import { FunctionalComponent, Fragment } from "preact";
import { ChangeEvent } from "preact/compat";
import { useState } from "preact/hooks";

interface AddProps {
  state: boolean;
  handleModalClose: any;
  refresh?(): void;
}
const AddBranch: FunctionalComponent<AddProps> = ({
  state,
  refresh,
  handleModalClose,
}) => {
  const [scnValue, setScnValue] = useState<string>();
  const [scnSearchInfo, setScnSearchInfo] = useState<ISignUp[]>();
  const [selected, setSelected] = useState<boolean>();

  const { isLoading, makeRequest, error } = useRequest<{ scn: string }>(
    findSUserCNApi,
  );

  const addBranchRequest = useRequest<BranchProp>(addBranch);
  async function submit(body: BranchProp) {
    const [response, _err] = await addBranchRequest.makeRequest(body);
    if (!_err) {
      NotifySuccess("Branch added successfully");
      form.resetForm();
      setScnValue("");
      setScnSearchInfo(undefined);
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
    validationSchema: BranchSchema,
    initialValues: {
      name: "",
      address: "",
      active: "",
      manager_id: 0,
      manager_name: "",
      manager_scn: "",
    },
    onSubmit(values, formikHelpers) {
      const selectedManager = scnSearchInfo ? scnSearchInfo[0] : null;
      submit({
        // @ts-ignore
        name: values.name,
        address: values.address,
        manager_id: selectedManager?.id || 0,
        manager_scn: selectedManager?.scn || "",
        manager_name: selectedManager
          ? `${selectedManager.first_name} ${selectedManager.last_name}`
          : "",
        active: values.active === "true",
      });
    },
  });

  async function verifyUser(scn: string) {
    const [response, _err] = await makeRequest({
      scn: scn,
    });
    if (!_err) {
      // Response has a 'user' object according to payload.
      // We wrap it in an array to match ISignUp[] state.
      const user = response?.user;
      const data = user ? [user] : [];
      setScnSearchInfo(data);
    } else if (_err && _err?.data) {
      NotifyError(_err?.data?.info);
      return;
    } else {
      NotifyError(_err?.info);
      return;
    }
  }

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setScnValue((e.target as HTMLInputElement).value.replace(/\s+/g, ""));
    setSelected(false);
  };
  return (
    <>
      <Modal
        isOpen={state}
        showCloseIcon={state}
        onClose={() => handleModalClose()}
        dimensions="lg"
      >
        <form onSubmit={form.handleSubmit}>
          <h1 className="font-bold text-lg lg:text-2xl">Add branch</h1>

          <div className="mt-5 w-full">
            <Input
              label="Name"
              id="name"
              dimension="lg"
              variant="primary"
              {...form.getFieldProps("name")}
              type="text"
              autoComplete="Phone"
              required
              error={form.touched.name ? form.errors.name : undefined}
            />
          </div>
          <div className="mt-5 w-full">
            <Input
              label="Address"
              id="address"
              dimension="lg"
              variant="primary"
              {...form.getFieldProps("address")}
              type="text"
              autoComplete="address"
              error={form.touched.address ? form.errors.address : undefined}
            />
          </div>
          <div className="w-full mt-5">
            <Select
              label="Status"
              // className={`w-full focus:outline-none disabled:bg-gray-50 text-black font-bold bg-white focus:ring-0 focus:border-0 border-0 rounded-none shadow-transparent`}
              id="active"
              dimension="lg"
              variant="primary"
              {...form.getFieldProps("active")}
              type="text"
              autoComplete="active"
              onChange={(e) => {
                form.setFieldValue("active", e.currentTarget.value);
              }}
              required
              error={form.touched.active ? form.errors.active : undefined}
            >
              <option value={""} selected disabled>
                Select here
              </option>
              <option value={"true"}>Active</option>
              <option value={"false"}>Inactive</option>
            </Select>
          </div>
          <div className="mt-5 mb-5 w-full">
            <div className="mt-5 mb-5 w-full">
              <Input
                label="Manager"
                id="manager_id"
                dimension="lg"
                // variant="primary"
                variant="primary"
                value={scnValue}
                placeholder="Enter Enrollment Number"
                type="text"
                autoComplete="manager_id"
                onChange={handleChange}
                rightSlot={() => {
                  return isLoading ? (
                    <PageLoader isOutlined={isLoading} />
                  ) : (
                    <button
                      type="button"
                      className="text-primary-500 font-bold text-sm"
                      onClick={() => scnValue && verifyUser(scnValue)}
                    >
                      Search
                    </button>
                  );
                }}
              />
            </div>
            {scnSearchInfo &&
              scnSearchInfo?.length > 0 &&
              scnSearchInfo.map((el: ISignUp, idx: number) => (
                <div className="flex gap-5 mb-3 w-full border-b-[1px]">
                  <button
                    type="button"
                    className=" border-gray-300 pb-3 text-xs text-left lg:text-sm text-gray-500 hover:text-primary-500 w-full"
                    onClick={(e) => {
                      const name = `${el.first_name} ${el.last_name}`;
                      form.setFieldValue("manager_id", el.id);
                      form.setFieldValue("manager_name", name);
                      form.setFieldValue("manager_scn", el.scn);
                      setScnSearchInfo([el]);
                      setScnValue(el.scn);
                      setSelected(true);
                      e.preventDefault();
                    }}
                  >
                    {el.last_name + " " + el.first_name + " - " + el.scn}
                  </button>
                  {selected ? (
                    <CheckCircleIcon className="w-5 h-5 text-primary-500 " />
                  ) : (
                    <ArrowSmallLeftIcon className="w-5 h-5 text-gray-400 " />
                  )}
                </div>
              ))}
          </div>

          <div className="mt-5 w-full">
            <Button
              type="submit"
              dimension="lg"
              variant="primary"
              isLoading={addBranchRequest.isLoading}
              disabled={!(form.isValid && form.dirty)}
            >
              Submit
            </Button>
          </div>
          <div className="mt-5 w-full">
            <button
              type="button"
              onClick={() => {
                handleModalClose();
                setScnValue("");
                setScnSearchInfo(undefined);
                form.resetForm();
              }}
              className="text-black text-center w-full"
            >
              Cancel
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
};
export default AddBranch;
