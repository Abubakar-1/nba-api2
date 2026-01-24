import { deleteBranch, getBranches } from "@/api/branch";
import { IBranch, IBranchResponse } from "@/api/interfaces/branch";
import { useFetcher } from "@/components/hooks/use-fetcher";
import { useRequest } from "@/components/hooks/use-request";
import {
  useBranchesQuery,
  useAdminBranchesQuery,
  useDeleteBranchMutation,
  usePrefetchBranches,
} from "@/components/hooks/use-branches-query";
import { NotifyError, NotifySuccess } from "@/components/toast/toast";
import { logger } from "@/utils/logger";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import { BtnLoader } from "@/components/ui/loader";
import { Modal } from "@/components/ui/modal";
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
import { TableItemMenu } from "@/components/ui/table-item-menu";
import AuthContext from "@/context/auth-context";
import { ACCESS_ROLES } from "@/utils/constants";
import { CheckCircleIcon, XCircleIcon } from "@heroicons/react/24/outline";
import { MagnifyingGlassIcon, PlusIcon } from "@heroicons/react/24/solid";
import classNames from "classnames";
import { debounce } from "lodash";
import { useEffect, useState } from "preact/hooks";
import { string } from "yup";
import AddBranch from "./add-branch";
import EditBranch from "./edit-branch";

const BranchList = () => {
  const [editModal, setEditModal] = useState(false);
  const [addModal, setAddModal] = useState(false);

  const [deleteBranch, setDeleteBranch] = useState<{
    isOpen: boolean;
    name: string;
    code: string;
  }>();

  const { user } = AuthContext.useContainer();
  const [editData, setEditData] = useState<IBranch>();

  const [pagination, setPagination] = useState({
    page: 1,
    page_size: 50,
    total_rows: 10,
    count: 10,
  });
  const [paginationState, setPaginationState] = useState<any>();

  const [filter, setFilter] = useState({
    status: "",
    isActive: false,
    search: "",
  });

  // React Query hooks for branches
  const branchFilters = {
    page: pagination?.page || 1,
    // page_size: pagination.page_size,
    search: filter.search,
  };

  const isAdmin = ACCESS_ROLES.admin_access.some((v) => user.roles.includes(v));

  const {
    data: branchesData,
    isLoading,
    error,
    refetch,
  } = isAdmin
    ? useAdminBranchesQuery(branchFilters)
    : useBranchesQuery(branchFilters);
  const deleteMutation = useDeleteBranchMutation();
  const prefetchBranches = usePrefetchBranches();

  // Map response data to match old structure
  const response = branchesData;

  useEffect(() => {
    if (error) {
      logger.error("Branches fetch error", error);
      NotifyError(error?.message || "Failed to fetch branches");
    }

    if (branchesData) {
      logger.debug("Branches data updated", {
        page: branchesData?.pagination?.page,
        total: branchesData?.pagination?.total_rows,
      });

      setPagination({
        page: branchesData?.pagination?.page ?? 1,
        page_size: branchesData?.pagination?.page_size ?? 50,
        total_rows: branchesData?.pagination?.total_rows ?? 0,
        count: branchesData?.items?.length ?? 0,
      });

      // Prefetch next page for smoother pagination
      const nextPage = (branchesData?.pagination?.page ?? 1) + 1;
      const totalPages = Math.ceil(
        (branchesData?.pagination?.total_rows ?? 0) /
          (branchesData?.pagination?.page_size ?? 50),
      );

      if (nextPage <= totalPages) {
        const nextFilters = {
          ...branchFilters,
          page: nextPage,
        };
        logger.debug("Prefetching next page", { nextPage });
        prefetchBranches(nextFilters);
      }
    }
  }, [branchesData, error]);

  useEffect(() => {
    setPaginationState({
      ...pagination,
      status: filter.search,
    });
  }, [pagination]);

  function changePage(p: number, s: string) {
    setPagination((v) => ({ ...v, page: p }));
    setFilter((f) => ({ ...f, status: s }));
  }

  function changeSize(s: number) {
    setPagination((v) => ({ ...v, page_size: s, page: 1 }));
  }

  function searchTransaction(searchValue: string) {
    setFilter((f) => ({ ...f, search: searchValue }));
  }
  const handleKeypress = debounce((searchValue: string) => {
    searchTransaction(searchValue);
  }, 1000);

  async function submitDeleteRequest(code: string) {
    try {
      logger.debug("Submitting branch delete request", { code });
      await deleteMutation.mutateAsync(code);
      NotifySuccess("Branch successfully deleted");
      setDeleteBranch(undefined);
    } catch (error: any) {
      logger.error("Failed to delete branch", error);
      if (error?.data) {
        NotifyError(error?.data?.info);
      } else {
        NotifyError(error?.info || "Failed to delete branch");
      }
    }
  }

  const handleEdit = (id: number) => {
    const data = response?.items?.filter((el) => Number(el.code) === id)[0];
    setEditData(data);
    setEditModal(!editModal);
  };
  const handleEditModal = () => {
    setEditModal(!editModal);
  };
  const handleAddModalClose = () => {
    setAddModal(!addModal);
  };

  return (
    <div className="px-4 mb-5">
      <PageTitle title="Branches" />
      {deleteBranch && (
        <Modal
          isOpen={deleteBranch.isOpen}
          showCloseIcon={deleteBranch?.isOpen}
          onClose={() =>
            setDeleteBranch((prev: any) => ({ ...prev, isOpen: false }))
          }
        >
          <h1 className="font-bold text-lg lg:text-2xl">
            <span className="inline-flex items-center">
              <XCircleIcon className="p-2 w-10 h-10 mr-4 rounded-full bg-red-50 text-red-500" />
              Delete branch
            </span>
          </h1>
          <p className="mt-5 text-sm">
            Are you sure you want to delete this branch? This action cannot be
            undone.
          </p>
          <div className="mt-3 text-sm grid grid-cols-2 gap-1">
            <p>Name:</p>
            <span className="font-semibold text-black">
              {deleteBranch.name}{" "}
            </span>
            <p>Code:</p>
            <span className="font-semibold text-black">
              {deleteBranch.code}
            </span>
          </div>
          <div className="text-sm mt-7 mb-4">
            <span className="text-red-500 font-medium">Warning:</span> This
            action is irreversible
          </div>
          <div className="mt-7 w-full">
            <Button
              type="button"
              dimension="lg"
              variant="danger"
              onClick={() => submitDeleteRequest(deleteBranch.code)}
              isLoading={deleteMutation.isPending}
            >
              Yes, Delete Branch
            </Button>
          </div>
          <div className="mt-5 w-full">
            <button
              type="button"
              onClick={() =>
                setDeleteBranch((prev: any) => ({ ...prev, isOpen: false }))
              }
              className="text-black text-center w-full"
            >
              Cancel
            </button>
          </div>
        </Modal>
      )}

      <EditBranch
        state={editModal}
        data={editData}
        handleModalClose={handleEditModal}
        refresh={refetch}
      />
      <AddBranch
        state={addModal}
        handleModalClose={handleAddModalClose}
        refresh={refetch}
      />

      <h1 className="font-bold text-xl lg:text-2xl mt-7 mb-4">Branch</h1>

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
            placeholder={"Search by branch name or code"}
            className=" w-full"
          />
        </div>
        {/* filter component starts from here */}
        <div className="col-span-2 w-full mb-3 lg:mb-0">
          <div className="flex justify-center items-center w-full h-full">
            <div className=" justify-between items-center text-gray-500 w-full lg:w-2/3 h-12 hidden lg:flex"></div>
            <div className="hidden lg:block bg-yelow-300 w-1/3 h-10"></div>
          </div>
        </div>

        <div className="inline-flex justify-end w-full lg:mt-0 relative text-sm ">
          {ACCESS_ROLES.admin_access.some((v) => user.roles.includes(v)) && (
            <Button
              variant="primary"
              dimension="lg"
              id="payment"
              className="w-1/2 md:w-1/3 lg:w-full inline-flex justify-center lg:max-w-[10rem] text-center px-4 sm:text-sm font-semibold focus:outline-none appearance-none text-white py-3.5 rounded-3xl border hover:cursor-pointer bg-primary-500"
              onClick={handleAddModalClose}
            >
              Add branch <PlusIcon className="ml-2 w-5 h-5" />
            </Button>
          )}
        </div>
      </div>
      <div>
        {isLoading ? (
          <div className="w-full h-full flex justify-center items-center">
            <PageLoader isOutlined={isLoading} />
          </div>
        ) : response ? (
          <Table>
            <TableHead textSize="xs">
              <TableHeadItem>CODE</TableHeadItem>
              <TableHeadItem>NAME</TableHeadItem>
              <TableHeadItem>MANAGER NAME</TableHeadItem>
              <TableHeadItem>MANAGER SCN</TableHeadItem>
              <TableHeadItem>ADDRESS</TableHeadItem>
              <TableHeadItem>STATUS</TableHeadItem>
              <TableHeadItem>ACTION</TableHeadItem>
            </TableHead>
            <TableBody isEmpty={!response?.items?.length} isLoading={isLoading}>
              {response?.items?.map((row: IBranch, idx: number) => (
                <TableRow>
                  <TableCell alignment="left">{row.code}</TableCell>
                  <TableCell alignment="left">{row.name}</TableCell>
                  <TableCell alignment="left">{row.manager_name}</TableCell>
                  <TableCell alignment="left">{row.manager_scn}</TableCell>
                  <TableCell alignment="left">{row.address}</TableCell>

                  <TableCell alignment="left">
                    <p
                      className={`py-2 px-3 w-fit  rounded-3xl ${classNames({
                        "bg-green-100 text-primary-500": row.active,
                        "bg-red-50 text-red-500": !row.active,
                      })}`}
                    >
                      {row.active ? "Active" : "Inactive"}
                    </p>
                  </TableCell>
                  <TableCell alignment="left">
                    <TableItemMenu>
                      <div className="px-1 py-1 ">
                        <div className="flex flex-col gap-1 items-start font-medium">
                          <button
                            type="button"
                            className="text-black hover:bg-gray-100 w-full text-left p-2"
                            onClick={() => handleEdit(Number(row.code))}
                          >
                            Edit
                          </button>
                          {ACCESS_ROLES.admin_access.some((v) =>
                            user.roles.includes(v),
                          ) && (
                            <button
                              type="button"
                              className="w-full text-left p-2 hover:bg-gray-100 text-red-500"
                              onClick={() => {
                                setDeleteBranch({
                                  isOpen: true,
                                  code: row.code,
                                  name: row.name,
                                });
                              }}
                            >
                              {deleteMutation.isPending ? (
                                <BtnLoader outlined={true} />
                              ) : (
                                "Delete"
                              )}
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
        ) : null}
      </div>
    </div>
  );
};

export default BranchList;
