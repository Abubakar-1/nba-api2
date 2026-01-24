import { IBranch } from "@/api/interfaces/branch";
import { ILawyer, LawyerProp } from "@/api/interfaces/lawyers";
import { editLawyer } from "@/api/lawyers";
import { useRequest } from "@/components/hooks/use-request";
import { NotifyError, NotifySuccess } from "@/components/toast/toast";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { Select } from "@/components/ui/select";
import { useFormik } from "formik";
import { FunctionalComponent } from "preact";
import { useEffect } from "preact/hooks";
import AuthContext from "@/context/auth-context";
import { Fragment } from "preact";
import { IOldTransaction } from "@/api/interfaces/transaction";
import { OldTransactionSchema } from "@/schema/old-transaction";
import { editOldTransaction } from "@/api/transaction";

interface EditProps {
  state: boolean;
  handleModalClose: any;
  branch: IBranch[] | undefined;
  data?: IOldTransaction;
  refresh?(): void;
}
const EditOldTransaction: FunctionalComponent<EditProps> = ({
  state,
  handleModalClose,
  data,
  branch,
  refresh,
}) => {
  const editOldTransactionRequest = useRequest<LawyerProp>(editOldTransaction);
  const { user } = AuthContext.useContainer();

  async function submit(body: any) {
    const [response, _err] = await editOldTransactionRequest.makeRequest(body);
    if (!_err) {
      NotifySuccess("Transaction updated successfully");
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
    validationSchema: OldTransactionSchema,
    initialValues: {
      id: 0,
      name: "",
      scn: "",
      email: "",
      phone: "",
      branch: "",
      year_of_call: "",
    },
    onSubmit(values, formikHelpers) {
      submit({
        ...values,
        id: data?.id,
      });
    },
  });

  // console.log("ddat ", data?.branch);
  useEffect(() => {
    if (data) {
      form.setValues({
        id: data.id,
        name: data.name ?? "",
        email: data.email ?? "",
        phone: data.phone ?? "",
        scn: data.scn && data.scn !== "-" ? data.scn : "",
        branch: data.branch.trim() ?? "",
        year_of_call:
          data.year_of_call && data.year_of_call !== 0 ? data.year_of_call : "",
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
          <h1 className="font-bold text-lg lg:text-2xl">Update Transaction</h1>

          <div className="flex gap-3">
            <div className="mt-5 w-full">
              <Input
                label="Name"
                id="name"
                dimension="lg"
                variant="primary"
                {...form.getFieldProps("name")}
                type="text"
                autoComplete="name"
                readOnly
                disabled={true}
                error={form.touched.name ? form.errors.name : undefined}
              />
            </div>
          </div>
          <div className="flex gap-3">
            <div className="mt-5 w-full">
              <Input
                label="Enrollment Number"
                id="scn"
                dimension="lg"
                variant="primary"
                {...form.getFieldProps("scn")}
                type="text"
                autoComplete="scn"
                error={form.touched.scn ? form.errors.scn : undefined}
              />
            </div>
          </div>
          <div className="mt-5 w-full">
            <Input
              label="Email"
              id="email"
              dimension="lg"
              variant="primary"
              {...form.getFieldProps("email")}
              type="text"
              autoComplete="email"
              readOnly
              disabled
              error={form.touched.email ? form.errors.email : undefined}
            />
          </div>

          <div className="flex gap-3">
            <div className="mt-5 w-full">
              <Input
                label="Phone number"
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

          <div className="flex gap-3">
            <div className="mt-5 w-full">
              <Select
                label="Select branch"
                id="branch"
                dimension="lg"
                variant="primary"
                {...form.getFieldProps("branch")}
                type="text"
                autoComplete="branch"
                required
                error={form.touched.branch ? form.errors.branch : undefined}
              >
                <option value={""}>Select here</option>

                {branch &&
                  branch.map((el, idx) => (
                    <option value={el.name}>
                      {el.name.toLocaleUpperCase()}
                    </option>
                  ))}
              </Select>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row  lg:gap-3">
            <div className="mt-5 w-full">
              <Input
                label="Year of call"
                id="year_of_call"
                dimension="lg"
                variant="primary"
                {...form.getFieldProps("year_of_call")}
                type="text"
                // min="1800-01-01"
                // max={new Date().toISOString().split("T")[0]}
                autoComplete="year_of_call"
                error={
                  form.touched.year_of_call
                    ? form.errors.year_of_call
                    : undefined
                }
              />
            </div>
          </div>

          <div className="mt-7 w-full">
            <Button
              type="submit"
              dimension="lg"
              variant="primary"
              isLoading={editOldTransactionRequest.isLoading}
              //   disabled={!(form.isValid && form.dirty)}
            >
              Submit
            </Button>
          </div>

          <div className="flex mt-5 text-sm font-medium items-center w-full justify-center">
            <button
              type="button"
              onClick={() => handleModalClose()}
              className=""
            >
              Close
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
};
export default EditOldTransaction;
