import { InformationCircleIcon } from "@heroicons/react/24/solid";
import Button from "../ui/button";
import Input from "../ui/input";
import { Select } from "../ui/select";
import { useFormik } from "formik";
import { ConferenceRegistrationSchema } from "@/schema/conference";
import { FunctionalComponent } from "preact";
import AuthContext from "@/context/auth-context";
import { useRequest } from "../hooks/use-request";
import { useEffect, useState } from "preact/hooks";
import { Fragment } from "preact";
import { useFetcher } from "../hooks/use-fetcher";
import { getCategory } from "@/api/conference";
import { Titles } from "@/utils/others/titles";

interface IProps {
  changeStage: any;
  setFormValue: any;
}
const Register: FunctionalComponent<IProps> = ({
  changeStage,
  setFormValue,
}) => {
  const { user, conferenceStatus } = AuthContext.useContainer();

  const { response } = useFetcher<any>(getCategory);
  console.log("category response", response);

  useEffect(() => {
    form.setFieldValue(
      "title",
      conferenceStatus.entry?.title ? conferenceStatus.entry?.title : ""
    );
    form.setFieldValue(
      "category",
      conferenceStatus.entry?.category ? conferenceStatus.entry?.category : ""
    );

    form.setFieldValue(
      "designation",
      conferenceStatus.entry?.designation
        ? conferenceStatus.entry?.designation
        : ""
    );

    form.setFieldValue(
      "organization",
      conferenceStatus.entry?.organization
        ? conferenceStatus.entry?.organization
        : ""
    );

    form.setFieldValue(
      "participation",
      conferenceStatus.entry?.participation
        ? conferenceStatus.entry?.participation
        : ""
    );

    form.setFieldValue(
      "disability",
      conferenceStatus.entry?.disability
        ? conferenceStatus.entry?.disability
        : ""
    );
    form.setFieldValue(
      "address",
      conferenceStatus.entry?.address ? conferenceStatus.entry?.address : ""
    );
    form.setFieldValue(
      "is_over_70",
      conferenceStatus.entry?.is_over_70 &&
        conferenceStatus.entry?.is_over_70 === true
        ? "true"
        : "false"
    );
    form.setFieldValue(
      "has_toddler",
      conferenceStatus.entry?.has_toddler &&
        conferenceStatus.entry?.has_toddler === true
        ? "true"
        : "false"
    );
  }, [conferenceStatus.entry]);

  const form = useFormik({
    validationSchema: ConferenceRegistrationSchema,
    initialValues: {
      email: user?.email + "",
      phone: user?.phone + "",
      title: conferenceStatus.entry?.title ? conferenceStatus.entry?.title : "",
      first_name: user?.first_name + "",
      last_name: (user?.last_name || "").split(",").join(" ") + "",
      middle_name: (user?.middle_name || "").split("(")?.[0] + "",
      designation: conferenceStatus.entry?.designation
        ? conferenceStatus.entry?.designation
        : "",
      category: conferenceStatus.entry?.category
        ? conferenceStatus.entry?.category
        : "",
      organization: conferenceStatus.entry?.organization
        ? conferenceStatus.entry?.organization
        : "",
      has_toddler:
        conferenceStatus.entry?.has_toddler &&
        conferenceStatus.entry?.has_toddler === true
          ? "true"
          : "false",
      is_over_70:
        conferenceStatus.entry?.category &&
        conferenceStatus.entry?.is_over_70 === true
          ? "true"
          : "false",
      disability: conferenceStatus.entry?.disability
        ? conferenceStatus.entry?.disability
        : "",
      participation: conferenceStatus.entry?.participation
        ? conferenceStatus.entry?.participation
        : "",
      address: conferenceStatus.entry?.address
        ? conferenceStatus.entry?.address
        : "",
      payment_rate: conferenceStatus.entry?.payment_rate
        ? conferenceStatus.entry?.payment_rate
        : "regular",
      quantity: 1,
      payment_gateway: "FLUTTERWAVE",
    },
    onSubmit(values, formikHelpers) {
      setFormValue({
        ...values,
        is_over_70: values.is_over_70 === "false" ? false : true,
        has_toddler: values.has_toddler === "false" ? false : true,
      });
      changeStage(2);
    },
  });

  return (
    <>
      <form
        onSubmit={form.handleSubmit}
        className="w-full min-h-screen lg:border-l lg:px-10 "
      >
        <h1 className="font-bold text-xl lg:text-2xl mt-7 mb-5">
          Registration information
        </h1>
        {/* <div className="h-10 px-4 rounded-lg bg-[#FAC301] bg-opacity-20 border border-[#D37F00] border-opacity-20 mb-5 text-[#D37F00] flex justify-between items-center gap-5">
          <div className="flex justify-center items-center">
            <InformationCircleIcon className="w-5 h-5" />
            <p className="text-tiny font-medium ml-3">
              Be an early Adopter and get discount on your payment
            </p>
          </div>
          <p className="text-tiny font-medium">22nd May - 30th Jun</p>
        </div> */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
          <div className="col-span-1">
            <Input
              {...form.getFieldProps("email")}
              id="email"
              label="Email"
              variant="outline"
              dimension="lg"
              /* removed invalid type prop on select */
              disabled
              readOnly
              error={form.touched.email ? form.errors.email : undefined}
            />
          </div>
          <div className="col-span-1">
            <Input
              {...form.getFieldProps("phone")}
              id="phone"
              label="Phone number"
              variant="outline"
              dimension="lg"
              type="text"
              disabled
              readOnly
              error={form.touched.phone ? form.errors.phone : undefined}
            />
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
          <div className="col-span-1">
            <Select
              {...form.getFieldProps("title")}
              id="title"
              label="Your Title"
              variant="primary"
              dimension="lg"
              type="text"
              error={form.touched.title ? form.errors.title : undefined}
            >
              <option value="" selected disabled>
                select
              </option>
              {Titles.map((el: any, id: number) => {
                return <option value={el.value}>{el.name}</option>;
              })}
            </Select>
          </div>
          <div className="col-span-1">
            <Input
              {...form.getFieldProps("first_name")}
              id="first_name"
              label="First Name"
              variant="primary"
              dimension="lg"
              type="text"
              error={
                form.touched.first_name ? form.errors.first_name : undefined
              }
            />
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
          <div className="col-span-1">
            <Input
              {...form.getFieldProps("middle_name")}
              id="middle_name"
              label="Middle Name"
              variant="primary"
              dimension="lg"
              type="text"
              error={
                form.touched.middle_name ? form.errors.middle_name : undefined
              }
            />
          </div>
          <div className="col-span-1">
            <Input
              {...form.getFieldProps("last_name")}
              id="last_name"
              label="Last Name"
              variant="primary"
              dimension="lg"
              type="text"
              error={form.touched.last_name ? form.errors.last_name : undefined}
            />
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
          <div className="col-span-1 lg:col-span-2">
            <Input
              {...form.getFieldProps("designation")}
              id="designation"
              label="Designation at your work place"
              variant="primary"
              dimension="lg"
              type="text"
              error={
                form.touched.designation ? form.errors.designation : undefined
              }
            />
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
          <div className="col-span-1">
            <Select
              {...form.getFieldProps("category")}
              id="category"
              label="Your Category"
              variant="primary"
              dimension="lg"
              type="text"
              error={form.touched.category ? form.errors.category : undefined}
            >
              <option value="" selected disabled>
                select
              </option>
              {(Array.isArray(response)
                ? response
                : (response as any)?.data ||
                  (response as any)?.categories ||
                  (response as any)?.items ||
                  []
              ).map((el: any, id: number) => {
                return (
                  <option key={el?.code || id} value={el?.code}>
                    {el?.name}
                  </option>
                );
              })}
            </Select>
          </div>
          <div className="col-span-1">
            <Input
              {...form.getFieldProps("organization")}
              id="organization"
              label="Organisation"
              variant="primary"
              dimension="lg"
              type="text"
              error={
                form.touched.organization ? form.errors.organization : undefined
              }
            />
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
          <div className="col-span-1">
            <Select
              {...form.getFieldProps("has_toddler")}
              id="has_toddler"
              label="Travelling with a Toddler?"
              variant="primary"
              dimension="lg"
              type="text"
              error={
                form.touched.has_toddler ? form.errors.has_toddler : undefined
              }
            >
              <option value="" selected disabled>
                select
              </option>
              <option value="true">Yes</option>
              <option value="false">No</option>
            </Select>
          </div>
          <div className="col-span-1">
            <Select
              {...form.getFieldProps("is_over_70")}
              id="is_over_70"
              label="Are you over the age of 70?"
              variant="primary"
              dimension="lg"
              type="text"
              error={
                form.touched.is_over_70 ? form.errors.is_over_70 : undefined
              }
            >
              <option value="" selected disabled>
                select
              </option>
              <option value="true">Yes</option>
              <option value="false">No</option>
            </Select>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
          <div className="col-span-1">
            <Select
              {...form.getFieldProps("participation")}
              id="participation"
              label="How will you be participating?"
              variant="primary"
              dimension="lg"
              type="text"
              error={
                form.touched.participation
                  ? form.errors.participation
                  : undefined
              }
            >
              <option value="" selected disabled>
                select
              </option>
              <option value="PHYSICAL">Physical</option>
              <option value="VIRTUAL">Virtual</option>
            </Select>
          </div>
          <div className="col-span-1">
            <Select
              {...form.getFieldProps("disability")}
              id="disability"
              label="Any Physical Disability?"
              variant="primary"
              dimension="lg"
              type="text"
              error={
                form.touched.disability ? form.errors.disability : undefined
              }
            >
              <option value="" selected disabled>
                select
              </option>
              <option value="None">None</option>
              <option value="Blind">Blind</option>
              <option value="Others">Others</option>
            </Select>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
          <div className="w-full col-span-1 lg:col-span-2">
            <label
              htmlFor="address"
              className="block text-sm text-left font-normal text-gray-700"
            >
              Address
            </label>
            <textarea
              id="address"
              className="h-24 w-full focus:outline-none focus:border-primary-500 border-gray-300 border-[1px] rounded p-1"
              required
              {...form.getFieldProps("address")}
            ></textarea>
            {form.touched.address ? (
              <p className="text-sm text-red-500 text-left">
                {form.errors.address}
              </p>
            ) : undefined}
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
          <div className="col-span-1">
            <Select
              {...form.getFieldProps("payment_rate")}
              id="payment_rate"
              label="Payment Rate"
              variant="primary"
              dimension="lg"
              type="text"
              error={
                form.touched.payment_rate ? form.errors.payment_rate : undefined
              }
            >
              <option value="" selected disabled>
                select
              </option>
              <option value="early_bird">Early Bird</option>
              <option value="regular">Regular</option>
              <option value="late">Late</option>
            </Select>
          </div>
          <div className="col-span-1">
            <Input
              {...form.getFieldProps("quantity")}
              id="quantity"
              label="Number of Attendees"
              variant="primary"
              dimension="lg"
              type="number"
              min="1"
              error={form.touched.quantity ? form.errors.quantity : undefined}
            />
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
          <div className="col-span-1">
            <Select
              {...form.getFieldProps("payment_gateway")}
              id="payment_gateway"
              label="Payment Gateway"
              variant="primary"
              dimension="lg"
              type="text"
              error={
                form.touched.payment_gateway
                  ? form.errors.payment_gateway
                  : undefined
              }
            >
              <option value="" selected disabled>
                select
              </option>
              <option value="FLUTTERWAVE">Flutterwave</option>
              <option value="PAYSTACK">Paystack</option>
            </Select>
          </div>
        </div>
        <div className="flex gap-5 mb-5 justify-end items-center">
          <div className="w-full lg:w-32">
            <Button variant="primary" dimension="lg" type="submit">
              Next
            </Button>
          </div>
        </div>
      </form>
    </>
  );
};
export default Register;
