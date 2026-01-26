import { IUsers, IUsersResponse } from "@/api/interfaces/users";
import { changeLawyerStatus } from "@/api/lawyers";
import { getAdminUsers } from "@/api/users";
import { useFetcher } from "@/components/hooks/use-fetcher";
import { useRequest } from "@/components/hooks/use-request";
import { NotifyError, NotifySuccess } from "@/components/toast/toast";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import PageLoader from "@/components/ui/page-loader";
import PageTitle from "@/components/ui/page-title";
import { Pagination } from "@/components/ui/pagination";
import SearchHistory from "@/components/ui/search-history";
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
import { CheckCircleIcon, XCircleIcon } from "@heroicons/react/24/outline";
import { MagnifyingGlassIcon, PlusIcon } from "@heroicons/react/24/solid";
import classNames from "classnames";
import { debounce } from "lodash";
import { useEffect, useState } from "preact/hooks";
import AddUser from "./add-user";
import EditAdmin from "./edit-admin";

const UserManagement = () => {
  const [addModalIsOpen, setAddModalIsOpen] = useState();
  const [editModal, setEditModal] = useState(false);
  const [editData, setEditData] = useState<IUsers>();
  const [addModal, setAddModal] = useState(false);
  const [searchValue, setSearchValue] = useState<string>("");
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 50,
    total_rows: 10,
    count: 10,
  });
  const [paginationState, setPaginationState] = useState<any>();
  const [suspendAdmin, setSuspendAdmin] = useState<{
    isOpen: boolean;
    name: string;
    email: string;
    status: boolean;
    id: number;
  }>();

  const [filter, setFilter] = useState({
    status: "",
    isActive: false,
    search: "",
  });

  const { isLoading, error, response, makeRequest } = useFetcher<
    {
      page: number;
      limit: number;
      search: string;
    },
    IUsersResponse
  >(getAdminUsers, {
    page: pagination.page,
    limit: pagination.limit,
    search: filter.search,
  });

  const adminStatusRequest = useRequest<{ isActive: boolean; id: number }>(
    changeLawyerStatus,
  );

  async function submitIsActiveRequest(isActive: boolean, id: number) {
    const body = { isActive, id };
    const [response, _err] = await adminStatusRequest.makeRequest(body);
    if (!_err) {
      NotifySuccess("Status successfully updated");
      setSuspendAdmin(undefined);
      makeRequest();
    } else if (_err && _err?.data) {
      NotifyError(_err?.data?.info);

      return;
    } else {
      NotifyError(_err?.info);
      return;
    }
  }

  useEffect(() => {
    if (error) NotifyError(error?.name || "Failed to fetch users");
  }, [error]);

  useEffect(() => {
    if (response?.pagination) {
      const total =
        response.pagination.total ?? response.pagination.total_rows ?? 0;
      const limit = response.pagination.limit ?? 50;
      const currentPage = response.pagination.page ?? 1;

      if (total !== pagination.total_rows || currentPage !== pagination.page) {
        setPagination((prev) => {
          if (prev.total_rows === total && prev.page === currentPage)
            return prev;

          return {
            page: currentPage,
            limit,
            total_rows: total,
            count: response.users?.length ?? 0,
          };
        });
      }
    }
  }, [response]);

  useEffect(() => {
    setPaginationState({
      ...pagination,
      page_size: pagination.limit, // Add page_size for Pagination component
      status: filter.search,
    });
  }, [pagination]);

  function changePage(p: number, s: string) {
    setPagination((v) => ({ ...v, page: p }));
    setFilter((f) => ({ ...f, status: s }));
  }

  function changeSize(s: number) {
    setPagination((v) => ({ ...v, limit: s, page: 1 }));
  }

  function searchTransaction(searchValue: string) {
    setFilter((f) => ({ ...f, search: searchValue }));
  }
  const handleKeypress = debounce((searchValue: string) => {
    searchTransaction(searchValue);
    setSearchValue(searchValue);
  }, 1000);

  const handleAddModalClose = () => {
    setAddModal(!addModal);
  };

  const handleEditModalClose = () => {
    setEditModal(!editModal);
  };

  const handleEdit = (id: number) => {
    const data = response?.users?.filter((el) => Number(el.id) === id)[0];
    setEditData(data);
    setEditModal(!editModal);
  };

  return (
    <div className="px-4 mb-5">
      <PageTitle title="User Management" />
      <h1 className="font-bold text-xl lg:text-2xl mt-7 mb-4">Admin Users</h1>

      <AddUser
        state={addModal}
        handleModalClose={handleAddModalClose}
        refresh={makeRequest}
      />
      <EditAdmin
        state={editModal}
        handleModalClose={handleEditModalClose}
        data={editData}
        refresh={makeRequest}
      />
      {suspendAdmin && (
        <Modal
          isOpen={suspendAdmin.isOpen}
          showCloseIcon={suspendAdmin?.isOpen}
          onClose={() =>
            setSuspendAdmin((prev: any) => ({ ...prev, isOpen: false }))
          }
        >
          <h1 className="font-bold text-lg lg:text-2xl">
            {suspendAdmin.status ? (
              <span className="inline-flex items-center">
                <CheckCircleIcon className="p-2 w-10 h-10 mr-4 rounded-full  bg-green-50 text-primary-500" />
                Activate admin
              </span>
            ) : (
              <span className="inline-flex items-center">
                <XCircleIcon
                  className="p-2 w-10 h-10 mr-4 rounded-full bg-[#FFF8EC] text-[#FFB545]
"
                />
                Suspend admin
              </span>
            )}
          </h1>
          <p className="mt-5 text-sm">
            Are you sure you want to{" "}
            {suspendAdmin.status ? "Activate" : "Suspend"} admin with the
            following details?
          </p>
          <div className="mt-3 text-sm">
            <div className="flex flex-row gap-2">
              <p>Name:</p>
              <span className="font-semibold text-black">
                {suspendAdmin.name}{" "}
              </span>
            </div>
            <div className="flex flex-row gap-2">
              <p>Email:</p>
              <span className="font-semibold text-black">
                {suspendAdmin.email}
              </span>
            </div>
          </div>
          {!suspendAdmin.status && (
            <div className="text-sm mt-7 mb-4">
              <span className="text-red-500 font-medium">Note:</span> This
              action is reversible and admin can be reinstated
            </div>
          )}
          <div className="mt-7 w-full">
            <Button
              type="button"
              dimension="lg"
              variant={suspendAdmin.status ? "primary" : "secondary"}
              onClick={() =>
                submitIsActiveRequest(suspendAdmin.status, suspendAdmin.id)
              }
              isLoading={adminStatusRequest.isLoading}
            >
              Yes, {suspendAdmin.status ? "Activate" : "Suspend"}
            </Button>
          </div>
          <div className="mt-5 w-full">
            <button
              type="button"
              onClick={() =>
                setSuspendAdmin((prev: any) => ({ ...prev, isOpen: false }))
              }
              className="text-black text-center w-full"
            >
              Cancel
            </button>
          </div>
        </Modal>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-5 w-full lg:mt-14 mb-5">
        <div className="col-span-2 w-full mb-3 lg:mb-0">
          <Input
            id="search"
            dimension="lg"
            variant="primary"
            value={searchValue}
            onChange={(e) => {
              handleKeypress(e.currentTarget.value);
            }}
            rightSlot={() => (
              <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 cursor-pointer" />
            )}
            type="text"
            placeholder={"Search by full name"}
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
          <Button
            variant="primary"
            dimension="lg"
            id="payment"
            className="w-full md:w-full inline-flex justify-center lg:w-full lg:max-w-[10rem] text-center px-4 sm:text-sm font-semibold focus:outline-none appearance-none text-white py-3.5 rounded-3xl border hover:cursor-pointer bg-primary-500"
            onClick={handleAddModalClose}
          >
            Add Admin <PlusIcon className="ml-2 w-5 h-5" />
          </Button>
        </div>
      </div>
      <div className="mb-2">
        <SearchHistory
          search={filter.search}
          payment_type=""
          from_date=""
          to_date=""
          clearPaymentType={() => {}}
          clearDate={() => {}}
          clearSearch={() => {
            setFilter((f) => ({ ...f, search: "" }));
            setSearchValue("");
          }}
        />
      </div>
      <div>
        {isLoading ? (
          <div className="w-full h-full flex justify-center items-center">
            <PageLoader isOutlined={isLoading} />
          </div>
        ) : response ? (
          <Table>
            <TableHead textSize="xs">
              {/* <TableHeadItem>ID</TableHeadItem> */}
              <TableHeadItem>FULL NAME</TableHeadItem>
              <TableHeadItem>EMAIL</TableHeadItem>
              <TableHeadItem>PHONE</TableHeadItem>
              <TableHeadItem>ROLE</TableHeadItem>
              <TableHeadItem>STATUS</TableHeadItem>
              <TableHeadItem>ACTION</TableHeadItem>
            </TableHead>

            <TableBody>
              {response?.users?.map((row: IUsers, idx: number) => (
                <TableRow>
                  {/* <TableCell alignment="left">{row.id}</TableCell> */}
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
                      </p>
                    </div>
                  </TableCell>
                  <TableCell alignment="left">{row.email}</TableCell>
                  <TableCell alignment="left">{row.phone}</TableCell>
                  <TableCell alignment="left">{row.roles?.[0]?.name}</TableCell>
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
                          {/* <button
                            type="button"
                            className="hover:bg-gray-100 text-black w-full text-left p-3"
                            onClick={() => {
                              setUserId(row.id);
                              handleViewLawyerModal();
                            }}
                          >
                            View info
                          </button> */}
                          <button
                            type="button"
                            className="hover:bg-gray-100 text-black w-full text-left p-3"
                            onClick={() => handleEdit(row.id)}
                          >
                            Edit
                          </button>

                          <button
                            type="button"
                            className={`w-full text-left p-3 ${classNames({
                              "hover:bg-gray-100 text-primary-500":
                                !row.enabled,
                              "hover:bg-gray-100 text-red-500": row.enabled,
                            })}`}
                            onClick={() => {
                              setSuspendAdmin({
                                isOpen: true,
                                status: !row.enabled,
                                id: row.id,
                                name:
                                  row.first_name +
                                  " " +
                                  row.last_name +
                                  " " +
                                  row.middle_name,
                                email: row.email,
                              });
                            }}
                          >
                            {row.enabled ? "Suspend Admin" : "Activate Admin"}
                          </button>
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

export default UserManagement;
