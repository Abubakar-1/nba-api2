import { verifySignUpSCNApi } from "@/api/auth";
import { editBranch } from "@/api/branch";
import { ISignUp } from "@/api/interfaces/auth";
import { BranchProp, IBranch, IBranchResponse } from "@/api/interfaces/branch";
import { useFetcher } from "@/components/hooks/use-fetcher";
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
import { debounce } from "lodash";
import { FunctionalComponent } from "preact";
import { Fragment } from "preact";
import { ChangeEvent } from "preact/compat";
import { useEffect, useState } from "preact/hooks";

interface EditProps {
  state: boolean;
  refresh?(): void;
  handleModalClose: any;
  data?: IBranch;
}
const EditBranch: FunctionalComponent<EditProps> = ({
  state,
  refresh,
  data,
  handleModalClose,
}) => {
  const [scnValue, setScnValue] = useState<string>(data?.manager_id || "");
  const [scnSearchInfo, setScnSearchInfo] = useState<ISignUp[]>();
  const [selected, setSelected] = useState<boolean>();

  const { isLoading, makeRequest, error } = useRequest<{ scn: string }>(
    verifySignUpSCNApi
  );

  const editBranchRequest = useRequest<BranchProp>(editBranch);

  async function submit(body: BranchProp) {
    const [response, _err] = await editBranchRequest.makeRequest(body);
    if (!_err) {
      NotifySuccess("Branch updated successfully");
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
      name: data?.name ?? "",
      code: data?.code ?? "",
      address: data?.address ?? "",
      active: "",
      manager_id: data?.manager_id,
    },
    onSubmit(values, formikHelpers) {
      submit({
        ...values,
        active: values.active === "true" || false,
        manager_id: scnSearchInfo ? scnSearchInfo[0]?.id : 0,
        code: data?.code + "",
      });
    },
  });
  async function verifyUser(scn: string) {
    const [response, _err] = await makeRequest({
      scn: scn,
    });
    if (!_err) {
      setScnSearchInfo(response);
    } else if (_err && _err?.data) {
      NotifyError(_err?.data?.info);
      return;
    } else {
      NotifyError(_err?.info);
      return;
    }
  }

  const handleSearch = debounce((e: string) => {
    e.length > 2 && verifyUser(e);
  }, 500);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setScnValue((e.target as HTMLInputElement).value.replace(/\s+/g, ""));
    handleSearch((e.target as HTMLInputElement).value.replace(/\s+/g, ""));
    setSelected(false);
  };

  useEffect(() => {
    if (data) {
      form.setValues({
        name: data.name,
        code: data.code,
        address: data.address ?? "",
        active: data.active === true ? "true" : "false",
      });
    }
  }, [data]);

  return (
    <>
      <Modal
        isOpen={state}
        showCloseIcon={state}
        onClose={() => handleModalClose()}
        dimensions="lg"
      >
        <form onSubmit={form.handleSubmit}>
          <h1 className="font-bold text-lg lg:text-2xl">Edit branch</h1>
          <div className="mt-5 w-full">
            <Input
              label="Code"
              id="code"
              dimension="lg"
              variant="outline"
              {...form.getFieldProps("code")}
              type="text"
              autoComplete="Phone"
              required
              disabled={true}
              readOnly
              error={form.touched.code ? form.errors.code : undefined}
            />
          </div>
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
          <div className="mt-5 mb-5 w-full">
            <div className="mt-5 mb-5 w-full">
              <Input
                label="Manager"
                id="manager_id"
                dimension="lg"
                // variant="primary"
                variant={scnValue ? "primary" : "danger"}
                value={scnValue}
                placeholder="Enter Enrollment Number"
                type="text"
                autoComplete="manager_id"
                onChange={handleChange}
                rightSlot={() => {
                  return isLoading ? (
                    <PageLoader isOutlined={isLoading} />
                  ) : (
                    <></>
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
          <div className="mt-5 w-full">
            <Button
              type="submit"
              dimension="lg"
              variant="primary"
              isLoading={editBranchRequest.isLoading}
              disabled={!(form.isValid && form.dirty)}
            >
              Submit
            </Button>
          </div>
          <div className="mt-5 w-full">
            <button
              type="button"
              onClick={() => handleModalClose()}
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
export default EditBranch;
