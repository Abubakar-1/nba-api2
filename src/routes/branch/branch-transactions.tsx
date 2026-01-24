import { FunctionalComponent } from "preact";
import { useEffect, useState, useCallback } from "preact/hooks";
import { useQuery } from "@tanstack/react-query";
import { useFormik } from "formik";
import { useLocation, useNavigate } from "react-router-dom";
import * as yup from "yup";
import classNames from "classnames";
import { format } from "date-fns";

import { getBranchTransactions } from "@/api/branch";
import { NotifyError } from "@/components/toast/toast";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import PageLoader from "@/components/ui/page-loader";
import PageTitle from "@/components/ui/page-title";
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
import { PlusIcon } from "@heroicons/react/24/solid";
import { Modal } from "@/components/ui/modal";
import SearchHistory from "@/components/ui/search-history";

const BranchTransactions: FunctionalComponent = () => {
  const [isFilterModal, setIsFilterModal] = useState(false);

  const [pagination, setPagination] = useState({
    page: 1,
    page_size: 50,
    total_rows: 0,
    count: 0,
  });

  const [filterValues, setFilterValues] = useState({
    status: "",
    start_date: "",
    end_date: "",
  });

  const filterFormik = useFormik({
    initialValues: {
      status: "",
      start_date: "",
      end_date: "",
    },
    onSubmit: (values) => {
      setFilterValues(values);
      setPagination((prev) => ({ ...prev, page: 1 })); // Reset to page 1 on filter
      setIsFilterModal(false);
    },
  });

  const {
    data: response,
    isLoading,
    error,
  } = useQuery({
    queryKey: [
      "branchTransactions",
      pagination.page,
      pagination.page_size,
      filterValues,
    ],
    queryFn: async () => {
      const { status, start_date, end_date } = filterValues;
      const params = {
        page: pagination.page,
        limit: pagination.page_size,
        ...(status && { status }),
        ...(start_date && { start_date }),
        ...(end_date && { end_date }),
      };

      const [res, err] = await getBranchTransactions(params);
      if (err) throw err;
      return res;
    },
    // placeholderData: (previousData) => previousData,
  });

  useEffect(() => {
    if (error) {
      NotifyError((error as any)?.message || "Failed to fetch transactions");
    }
  }, [error]);

  useEffect(() => {
    if ((response as any)?.pagination) {
      setPagination((prev) => ({
        ...prev,
        total_rows:
          (response as any).pagination.total ??
          (response as any).pagination.total_rows ??
          0,
        page: (response as any).pagination.page ?? 1,
        page_size:
          (response as any).pagination.limit ??
          (response as any).pagination.page_size ??
          20,
        count: (response as any).transactions?.length ?? 0,
      }));
    }
  }, [response]);

  const changePage = useCallback((p: number) => {
    setPagination((prev) => ({ ...prev, page: p }));
  }, []);

  const changeSize = useCallback((s: number) => {
    setPagination((prev) => ({ ...prev, page_size: s, page: 1 }));
  }, []);

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    try {
      return format(new Date(dateString), "dd MMM, yyyy");
    } catch {
      return dateString;
    }
  };

  const clearFilters = () => {
    filterFormik.resetForm();
    setFilterValues({ status: "", start_date: "", end_date: "" });
  };

  return (
    <div className="px-4 mb-5 min-h-[calc(100vh-100px)]">
      <PageTitle title="Branch Transactions" />

      {/* Filter Modal */}
      <Modal
        isOpen={isFilterModal}
        showCloseIcon={true}
        onClose={() => setIsFilterModal(false)}
      >
        <div>
          <h1 className="pl-1 font-bold text-lg mb-4">Filter Transactions</h1>

          <div className="mb-4">
            <Select
              label="Status"
              id="status"
              dimension="lg"
              variant="primary"
              {...filterFormik.getFieldProps("status")}
            >
              <option value="">All Statuses</option>
              <option value="PENDING">Pending</option>
              <option value="PROCESSING">Processing</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
              <option value="FAILED">Failed</option>
            </Select>
          </div>

          <div className="flex justify-between items-center gap-4 w-full mb-6">
            <Input
              label="From Date"
              id="start_date"
              dimension="lg"
              variant="primary"
              type="date"
              {...filterFormik.getFieldProps("start_date")}
              className="w-full"
            />
            <Input
              label="To Date"
              id="end_date"
              dimension="lg"
              variant="primary"
              type="date"
              {...filterFormik.getFieldProps("end_date")}
              className="w-full"
            />
          </div>

          <div className="w-full flex flex-col gap-3">
            <Button
              type="button"
              dimension="lg"
              variant="primary"
              onClick={() => filterFormik.handleSubmit()}
              className="w-full"
            >
              Apply Filter
            </Button>
            <Button
              type="button"
              dimension="md"
              variant="outline"
              onClick={() => {
                clearFilters();
                setIsFilterModal(false);
              }}
              className="w-full text-black border-gray-300"
            >
              Clear Filters
            </Button>
          </div>
        </div>
      </Modal>

      <div className="flex flex-col md:flex-row justify-between items-center mt-7 mb-6 gap-4">
        {/* <h1 className="font-bold text-xl lg:text-2xl">History</h1> */}

        {/* Filter Trigger */}
        <div className="w-full md:w-auto flex justify-end">
          <div
            role="button"
            onClick={() => setIsFilterModal(true)}
            className="flex hover:cursor-pointer justify-center items-center gap-2 rounded-3xl py-3 px-6 bg-gray-100 text-primary-500 font-medium text-sm transition-colors hover:bg-gray-200"
          >
            <PlusIcon className="w-5 h-5" />
            <span>Filter Transactions</span>
          </div>
        </div>
      </div>

      {/* Active Filters Display (Reusing SearchHistory style) */}
      {(filterValues.status ||
        filterValues.start_date ||
        filterValues.end_date) && (
        <div className="mb-4 flex flex-wrap gap-2 items-center">
          <span className="text-sm text-gray-500 mr-2">Fileters:</span>
          {filterValues.status && (
            <span className="bg-primary-50 text-primary-700 text-xs px-3 py-1 rounded-full flex items-center gap-1">
              Status: {filterValues.status}
              <button
                onClick={() => {
                  filterFormik.setFieldValue("status", "");
                  setFilterValues((v) => ({ ...v, status: "" }));
                }}
                className="hover:text-red-500 font-bold ml-1"
              >
                ×
              </button>
            </span>
          )}
          {filterValues.start_date && (
            <span className="bg-primary-50 text-primary-700 text-xs px-3 py-1 rounded-full flex items-center gap-1">
              From: {filterValues.start_date}
              <button
                onClick={() => {
                  filterFormik.setFieldValue("start_date", "");
                  setFilterValues((v) => ({ ...v, start_date: "" }));
                }}
                className="hover:text-red-500 font-bold ml-1"
              >
                ×
              </button>
            </span>
          )}
          {filterValues.end_date && (
            <span className="bg-primary-50 text-primary-700 text-xs px-3 py-1 rounded-full flex items-center gap-1">
              To: {filterValues.end_date}
              <button
                onClick={() => {
                  filterFormik.setFieldValue("end_date", "");
                  setFilterValues((v) => ({ ...v, end_date: "" }));
                }}
                className="hover:text-red-500 font-bold ml-1"
              >
                ×
              </button>
            </span>
          )}
          <button
            onClick={clearFilters}
            className="text-xs text-red-500 hover:underline ml-2"
          >
            Clear All
          </button>
        </div>
      )}

      {/* Table Content */}
      <div className="w-full">
        {isLoading ? (
          <div className="w-full h-64 flex justify-center items-center">
            <PageLoader isOutlined={isLoading} />
          </div>
        ) : response ? (
          <Table>
            <TableHead textSize="xs">
              <TableHeadItem>PAYER</TableHeadItem>
              <TableHeadItem>REFERENCE</TableHeadItem>
              <TableHeadItem>DATE</TableHeadItem>
              <TableHeadItem>AMOUNT</TableHeadItem>
              <TableHeadItem>STATUS</TableHeadItem>
            </TableHead>
            <TableBody>
              {(response as any)?.transactions?.length > 0 ? (
                (response as any).transactions.map((row: any, idx: number) => (
                  <TableRow key={idx}>
                    <TableCell alignment="left">
                      <div className="flex flex-col">
                        <span className="font-semibold">
                          {row.payer_name || "N/A"}
                        </span>
                        <span className="text-xs text-gray-500">
                          {row.payer_email}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell alignment="left">
                      {row.reference || "N/A"}
                    </TableCell>
                    <TableCell alignment="left">
                      {formatDate(row.created_at)}
                    </TableCell>
                    <TableCell alignment="left">
                      <p className="font-bold text-black">
                        &#8358;{(row.amount || 0).toLocaleString()}
                      </p>
                    </TableCell>
                    <TableCell alignment="left">
                      <p
                        className={`py-2 px-3 w-fit text-xs font-semibold ${classNames(
                          {
                            "bg-yellow-100 text-yellow-600":
                              row.status?.toUpperCase() === "PENDING" ||
                              row.status?.toUpperCase() === "PROCESSING",
                            "bg-green-100 text-green-600":
                              row.status?.toUpperCase() === "APPROVED" ||
                              row.status?.toUpperCase() === "SUCCESS",
                            "bg-red-100 text-red-600":
                              row.status?.toUpperCase() === "FAILED" ||
                              row.status?.toUpperCase() === "REJECTED",
                          },
                        )} rounded-full uppercase`}
                      >
                        {row.status || "UNKNOWN"}
                      </p>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell alignment="center" colSpan={5}>
                    <div className="py-10 text-gray-500">
                      No transactions found
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
            <TableFooter key="footer">
              <Pagination
                state={{ ...pagination, status: "", exam_year: "" }}
                onChange={changePage}
                onChangeSize={changeSize}
              />
            </TableFooter>
          </Table>
        ) : (
          <div className="w-full h-32 flex justify-center items-center text-gray-500">
            No data available
          </div>
        )}
      </div>
    </div>
  );
};

export default BranchTransactions;
