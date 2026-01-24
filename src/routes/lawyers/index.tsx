import { getAllBranch } from "@/api/auth";
import { changeBranchStatus, getBranches } from "@/api/branch";
import { IBranch, IBranchResponse } from "@/api/interfaces/branch";
import { ILawyer, ILawyerResponse } from "@/api/interfaces/lawyers";
import { changeLawyerStatus, getLawyers } from "@/api/lawyers";
import { useFetcher } from "@/components/hooks/use-fetcher";
import { useRequest } from "@/components/hooks/use-request";
import {
  useLawyersQuery,
  useChangeLawyerStatusMutation,
  usePrefetchLawyers,
} from "@/components/hooks/use-lawyers-query";
import { NotifyError, NotifySuccess } from "@/components/toast/toast";
import { logger } from "@/utils/logger";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import LoadingOverlay from "@/components/ui/loading-overlay";
import { Pagination } from "@/components/ui/pagination";
import { Select } from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeadItem,
  TableRow,
} from "@/components/ui/table";
import { TableItemMenu } from "@/components/ui/table-item-menu";
import { setInitialColor } from "@/utils/functions/string-functions";
import { States } from "@/utils/others/states";
import { MagnifyingGlassIcon, PlusIcon } from "@heroicons/react/24/solid";
import { XCircleIcon, CheckCircleIcon } from "@heroicons/react/24/outline";
import classNames from "classnames";
import { useFormik } from "formik";
import { debounce } from "lodash";
import { useEffect, useState, useCallback, useMemo } from "preact/hooks";
import { useNavigate } from "react-router-dom";
import { useDebounce } from "@/components/hooks/use-debounce";
import { useResponseCache } from "@/components/hooks/use-response-cache";
import LawyerTableRow from "@/components/ui/lawyer-table-row";
import { lazy, Suspense } from "preact/compat";

const AddLawyer = lazy(() => import("./add-lawyer"));
const EditLawyer = lazy(() => import("./edit-lawyer"));
const LawyerInfo = lazy(() => import("./lawyer-info"));
import { ACCESS_ROLES } from "@/utils/constants";
import AuthContext from "@/context/auth-context";
import PageTitle from "@/components/ui/page-title";

const Lawyers = () => {
  const [pagination, setPagination] = useState({
    page: 1,
    page_size: 50,
    total_rows: 10,
    count: 10,
  });
  const [editModal, setEditModal] = useState(false);
  const [editData, setEditData] = useState<ILawyer>();
  const [addModal, setAddModal] = useState(false);
  const [suspendLawyer, setSuspendLawyer] = useState<{
    isOpen: boolean;
    name: string;
    scn: string;
    status: boolean;
    id: number;
  }>();

  const [isViewUserInfo, setIsViewUserInfo] = useState<boolean>(false);
  const [userId, setUserId] = useState<number>(0);

  const { user } = AuthContext.useContainer();

  const [paginationState, setPaginationState] = useState<any>();

  // Updated to use React Query mutation
  async function submitIsActiveRequest(isActive: boolean, id: number) {
    try {
      logger.debug("Submitting lawyer status change", { isActive, id });
      await statusMutation.mutateAsync({ isActive, id });
      NotifySuccess("Status successfully updated");
      setSuspendLawyer(undefined);
    } catch (error: any) {
      logger.error("Failed to update lawyer status", error);
      if (error?.data) {
        NotifyError(error?.data?.info);
      } else {
        NotifyError(error?.info || "Failed to update status");
      }
    }
  }

  const filterParams = useFormik({
    initialValues: {
      branch: "",
      state_code: "",
      search: "",
    },
    onSubmit(values, formikHelpers) {},
  });

  const { response: branchData } = useFetcher<any, IBranch[]>(getAllBranch);

  // React Query hooks for lawyers
  const lawyersFilters = {
    page: pagination.page,
    // page_size: pagination.page_size,
    // state_code: filterParams.values.state_code,
    search: filterParams.values.search,
    branch: filterParams.values.branch,
  };

  const {
    data: lawyersData,
    isLoading,
    error,
    refetch,
  } = useLawyersQuery(lawyersFilters);
  const statusMutation = useChangeLawyerStatusMutation();
  const prefetchLawyers = usePrefetchLawyers();

  // Map response data to match old structure
  const response = lawyersData;

  const handleEditModalClose = () => {
    setEditModal(!editModal);
  };

  const handleEdit = (id: number) => {
    const data = response?.items.filter((el) => Number(el.id) === id)[0];
    setEditData(data);
    setEditModal(!editModal);
  };
  const handleAddModalClose = () => {
    setAddModal(!addModal);
  };

  const navigate = useNavigate();

  // Handle response updates and prefetch next page
  useEffect(() => {
    if (error) {
      logger.error("Lawyers fetch error", error);
      NotifyError(error?.message || "Failed to fetch lawyers");
    }

    if (lawyersData?.pagination) {
      const total =
        lawyersData.pagination.total ?? lawyersData.pagination.total_rows ?? 0;
      const pageSize =
        lawyersData.pagination.limit ?? lawyersData.pagination.page_size ?? 50;

      if (
        total !== pagination.total_rows ||
        lawyersData.pagination.page !== pagination.page
      ) {
        setPagination((prev) => {
          if (
            prev.total_rows === total &&
            prev.page === lawyersData.pagination.page
          )
            return prev;

          return {
            page: lawyersData.pagination.page ?? 1,
            page_size: pageSize,
            total_rows: total,
            count: lawyersData.items?.length ?? 0,
          };
        });
      }
    }
  }, [lawyersData, error]);

  useEffect(() => {
    setPaginationState({
      ...pagination,
      status: filterParams.values.search,
    });
  }, [pagination]);

  function changePage(p: number, s: string) {
    setPagination((v) => ({ ...v, page: p }));
    filterParams.setFieldValue("search", s);
  }

  function changeSize(s: number) {
    setPagination((v) => ({ ...v, page_size: s, page: 1 }));
  }

  function searchTransaction(searchValue: string) {
    filterParams.setFieldValue("state_code", "");
    filterParams.setFieldValue("branch", "");
    filterParams.setFieldValue("search", searchValue);
  }

  const handleSearch = useCallback(
    (searchValue: string) => {
      filterParams.setFieldValue("state_code", "");
      filterParams.setFieldValue("branch", "");
      filterParams.setFieldValue("search", searchValue);
    },
    [filterParams],
  );

  const handleKeypress = useDebounce(handleSearch, 300);

  const handleViewLawyerModal = () => {
    setIsViewUserInfo(!isViewUserInfo);
  };

  const [isFetching, setIsFetching] = useState(true);

  // Track loading states
  useEffect(() => {
    setIsFetching(isLoading || statusMutation.isPending);
  }, [isLoading, statusMutation.isPending]);

  // Initial data fetch is handled by React Query automatically
  useEffect(() => {
    setIsFetching(true);
    const timer = setTimeout(() => setIsFetching(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="relative w-full h-full min-h-screen">
      <LoadingOverlay
        isLoading={isLoading || statusMutation.isPending}
        message={
          statusMutation.isPending ? "Updating status..." : "Loading lawyers..."
        }
      />
      <div className="px-4 mb-5 min-h-screen">
        <PageTitle title="Lawyers" />
        <LawyerInfo
          state={isViewUserInfo}
          handleModalClose={() => handleViewLawyerModal()}
          id={userId}
        />
        {suspendLawyer && (
          <Modal
            isOpen={suspendLawyer.isOpen}
            showCloseIcon={suspendLawyer?.isOpen}
            onClose={() =>
              setSuspendLawyer((prev: any) => ({ ...prev, isOpen: false }))
            }
          >
            <h1 className="font-bold text-lg lg:text-2xl">
              {suspendLawyer.status ? (
                <span className="inline-flex items-center">
                  <CheckCircleIcon className="p-2 w-10 h-10 mr-4 rounded-full  bg-green-50 text-primary-500" />
                  Activate lawyer
                </span>
              ) : (
                <span className="inline-flex items-center">
                  <XCircleIcon
                    className="p-2 w-10 h-10 mr-4 rounded-full bg-[#FFF8EC] text-[#FFB545]
"
                  />
                  Suspend lawyer
                </span>
              )}
            </h1>
            <p className="mt-5 text-sm">
              Are you sure you want to{" "}
              {suspendLawyer.status ? "Activate" : "Suspend"} lawyer with the
              following details?
            </p>
            <div className="mt-3 text-sm grid grid-cols-2 gap-1">
              <p>Name:</p>
              <span className="font-semibold text-black">
                {suspendLawyer.name}{" "}
              </span>
              <p>Enrollment Number:</p>
              <span className="font-semibold text-black">
                {suspendLawyer.scn}
              </span>
            </div>
            {!suspendLawyer.status && (
              <div className="text-sm mt-7 mb-4">
                <span className="text-red-500 font-medium">Note:</span> This
                action is reversible and lawyer can be reinstated
              </div>
            )}
            <div className="mt-7 w-full">
              <Button
                type="button"
                dimension="lg"
                variant={suspendLawyer.status ? "primary" : "secondary"}
                onClick={() =>
                  submitIsActiveRequest(suspendLawyer.status, suspendLawyer.id)
                }
                isLoading={statusMutation.isPending}
              >
                Yes, {suspendLawyer.status ? "Activate" : "Suspend"}
              </Button>
            </div>
            <div className="mt-5 w-full">
              <button
                type="button"
                onClick={() =>
                  setSuspendLawyer((prev: any) => ({ ...prev, isOpen: false }))
                }
                className="text-black text-center w-full"
              >
                Cancel
              </button>
            </div>
          </Modal>
        )}
        <h1 className="font-bold text-xl lg:text-2xl mt-7 mb-4">Lawyer</h1>
        <EditLawyer
          state={editModal}
          handleModalClose={handleEditModalClose}
          data={editData}
          branch={branchData}
          refresh={refetch}
        />
        <AddLawyer
          state={addModal}
          handleModalClose={handleAddModalClose}
          branch={branchData}
          refresh={refetch}
        />
        <div className="grid grid-cols-1 lg:grid-cols-5 w-full lg:mt-14 mb-5">
          <div className="col-span-2 w-full mb-3 lg:mb-0">
            <Input
              id="search"
              dimension="lg"
              variant="primary"
              onChange={(e) => {
                handleKeypress(e.currentTarget.value);
              }}
              rightSlot={() => (
                <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 cursor-pointer" />
              )}
              type="text"
              placeholder={"Search by name or enrollment number"}
              className=" w-full"
            />
          </div>
          {/* filter component starts from here */}
          <div className="col-span-2 w-full mb-3 lg:mb-0">
            <div className="flex justify-center items-center w-full h-full">
              <div className="flex justify-between items-center text-gray-500 w-full lg:w-2/3 h-12 mt-4 lg:mt-0">
                <div className="w-1/2 mb-6 lg:ml-4">
                  <Select
                    label="State"
                    dimension="lg"
                    {...filterParams.getFieldProps("state_code")}
                  >
                    <option value="" selected>
                      ALL
                    </option>
                    {States.map((el, idx) => (
                      <option value={el.code} id={el.code}>
                        {el.name}
                      </option>
                    ))}
                  </Select>
                </div>
                <div className="w-1/2 mb-6 ml-4">
                  <Select
                    label="Branch"
                    dimension="lg"
                    {...filterParams.getFieldProps("branch")}
                  >
                    <option value="" selected>
                      ALL
                    </option>
                    {branchData &&
                      branchData.map((el, idx) => (
                        <option value={el.name} id={el.code}>
                          {el.name.toLocaleUpperCase()}
                        </option>
                      ))}
                  </Select>
                </div>
              </div>
              <div className="hidden lg:block bg-yelow-300 w-1/3 h-10 mb-2"></div>
            </div>
          </div>

          <div className="inline-flex justify-end w-full lg:mt-0 relative text-sm ">
            {ACCESS_ROLES.admin_access.some((v) => user.roles.includes(v)) && (
              <Button
                variant="primary"
                dimension="lg"
                id="payment"
                className="w-full md:w-full inline-flex justify-center lg:w-full lg:max-w-[10rem] text-center px-4 sm:text-sm font-semibold focus:outline-none appearance-none text-white py-3.5 rounded-3xl border hover:cursor-pointer bg-primary-500"
                onClick={handleAddModalClose}
              >
                Add Lawyer <PlusIcon className="ml-2 w-5 h-5" />
              </Button>
            )}
          </div>
        </div>
        <div>
          {!isLoading && !response && (
            <div className="w-full h-[400px] flex justify-center items-center">
              <p className="text-gray-500">No data available</p>
            </div>
          )}
          {!isLoading && response && (
            <Table>
              <TableHead textSize="xs">
                <TableHeadItem>FULL NAME</TableHeadItem>
                <TableHeadItem>EMAIL ADDRESS</TableHeadItem>
                <TableHeadItem>MOBILE</TableHeadItem>
                <TableHeadItem>YEAR OF CALL</TableHeadItem>
                {/* <TableHeadItem>CATEGORY</TableHeadItem> */}
                <TableHeadItem>BRANCH</TableHeadItem>
                <TableHeadItem>STATE</TableHeadItem>
                <TableHeadItem>STATUS</TableHeadItem>
                <TableHeadItem>ACTION</TableHeadItem>
              </TableHead>
              <TableBody>
                {response?.items.map((row: ILawyer, idx: number) => (
                  <TableRow>
                    <TableCell alignment="left">
                      <div
                        title={
                          row.last_name +
                          " " +
                          row.first_name +
                          " " +
                          row.middle_name
                        }
                        className="font-medium inline-flex items-center"
                      >
                        <p
                          className={`w-12 h-12 text-xl ${setInitialColor(
                            idx % 10,
                          )} text-white font-semibod rounded-full inline-flex justify-center items-center`}
                        >
                          {row.last_name[0] + " " + row.first_name[0]}
                        </p>
                        <p className="ml-2 max-w-[12rem] truncate inline-flex flex-col font-semibold">
                          {row.last_name +
                            " " +
                            row.first_name +
                            " " +
                            row.middle_name}
                          <span className="text-gray-600 font-normal">
                            {row.scn}
                          </span>
                        </p>
                      </div>
                    </TableCell>
                    <TableCell alignment="left">
                      <p
                        title={row.email ?? ""}
                        className="max-w-[12rem] truncate font-medium"
                      >
                        {row.email}
                      </p>
                    </TableCell>
                    <TableCell alignment="left">{row.phone}</TableCell>
                    <TableCell alignment="left">
                      {row.year_of_call
                        ? row.year_of_call
                        : row.date_of_call
                          ? row.date_of_call.split("-")[2]
                          : ""}
                    </TableCell>
                    {/* <TableCell alignment="left">{row.category}</TableCell> */}
                    <TableCell alignment="left">
                      {row.branch?.toLocaleUpperCase() ?? ""}
                    </TableCell>
                    <TableCell alignment="left">{row.state_name}</TableCell>

                    <TableCell alignment="left">
                      <p
                        className={`py-2 px-3 w-fit rounded-3xl ${classNames({
                          "bg-green-100 text-primary-500": row.enabled,
                          "bg-red-50 text-red-500": !row.enabled,
                        })}`}
                      >
                        {row.enabled ? "Active" : "Inactive"}
                      </p>
                    </TableCell>
                    <TableCell alignment="left">
                      <TableItemMenu>
                        <div className="px-1 py-1 ">
                          <div className="flex flex-col gap-1 items-start font-medium">
                            <button
                              type="button"
                              className="hover:bg-gray-100 text-black w-full text-left p-3"
                              onClick={() => {
                                setUserId(row.id);
                                handleViewLawyerModal();
                              }}
                            >
                              View info
                            </button>
                            <button
                              type="button"
                              className="hover:bg-gray-100 text-black w-full text-left p-3"
                              onClick={
                                () =>
                                  // row.has_onboarded
                                  handleEdit(row.id)
                                // NotifyError(
                                //     "Lawyer cannot be edited as they have not completed the sign-up process"
                                //   )
                              }
                            >
                              Edit
                            </button>
                            {ACCESS_ROLES.admin_access.some((v) =>
                              user.roles.includes(v),
                            ) && (
                              <button
                                type="button"
                                className={`w-full text-left p-3 ${classNames({
                                  "hover:bg-gray-100 text-primary-500":
                                    !row.enabled,
                                  "hover:bg-gray-100 text-red-500": row.enabled,
                                })}`}
                                onClick={() => {
                                  setSuspendLawyer({
                                    isOpen: true,
                                    status: !row.enabled,
                                    id: row.id,
                                    name:
                                      row.first_name +
                                      " " +
                                      row.last_name +
                                      " " +
                                      row.middle_name,
                                    scn: row.scn,
                                  });
                                }}
                              >
                                {row.enabled
                                  ? "Suspend lawyer"
                                  : "Activate lawyer"}
                              </button>
                            )}
                          </div>
                        </div>
                      </TableItemMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
              <TableFooter key="footer">
                <Pagination
                  state={paginationState}
                  onChange={changePage}
                  onChangeSize={changeSize}
                />
              </TableFooter>
            </Table>
          )}
        </div>
      </div>
    </div>
  );
};

export default Lawyers;
