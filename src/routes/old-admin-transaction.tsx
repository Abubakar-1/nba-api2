import {
  IMyOldTransactionResponse,
  IOldTransaction,
} from "@/api/interfaces/transaction";
import { getOldAdminTransaction } from "@/api/transaction";
import { useFetcher } from "@/components/hooks/use-fetcher";
import { NotifyError } from "@/components/toast/toast";
import Input from "@/components/ui/input";
import PageLoader from "@/components/ui/page-loader";
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
import PhotoContext from "@/context/photo-context";
import { MagnifyingGlassIcon } from "@heroicons/react/24/solid";
import classNames from "classnames";
import { debounce } from "lodash";
import { useEffect, useState } from "preact/hooks";
import { useNavigate } from "react-router-dom";
import { formatCreatedAtDate } from "@/utils/functions/string-functions";
import PageTitle from "@/components/ui/page-title";
import OldTransactionContext from "@/context/old-transaction-context";
import EditOldTransaction from "@/components/ui/edit-old-transaction";
import { getAllBranch } from "@/api/auth";
import { IBranch } from "@/api/interfaces/branch";

const OldAdminTransaction = () => {
  const { setOldReceiptInfo } = OldTransactionContext.useContainer();
  const navigate = useNavigate();

  const [isViewStatus, setIsViewStatus] = useState<boolean>(false);
  const [userId, setUserId] = useState<number>(0);
  const [searchValue, setSearchValue] = useState<string>("");
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
  const { response: branchData } = useFetcher<any, IBranch[]>(getAllBranch);

  const { isLoading, error, response, makeRequest } = useFetcher<
    {
      page: number;
      page_size: number;
      search: string;
    },
    IMyOldTransactionResponse
  >(getOldAdminTransaction, {
    page: pagination.page,
    page_size: pagination.page_size,
    search: filter.search,
  });

  const [editModal, setEditModal] = useState(false);
  const [editData, setEditData] = useState<any>();

  useEffect(() => {
    error && NotifyError(error?.name);
    if (response) {
      setPagination({
        page: response?.pagination.page ?? 1,
        page_size:
          response?.pagination.limit ?? response?.pagination.page_size ?? 50,
        total_rows:
          response?.pagination.total ?? response?.pagination.total_rows ?? 0,
        count: response?.items?.length ?? 0,
      });
    }
  }, [response, error?.message]);

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
    setSearchValue(searchValue);
  }, 1000);

  const handleEdit = (id: number) => {
    const data = response?.items.filter((el) => Number(el.id) === id)[0];
    setEditData(data);
    setEditModal(!editModal);
  };

  const handleEditModalClose = () => {
    setEditModal(!editModal);
  };

  return (
    <div className="px-4 mb-5">
      <PageTitle title="Old Admin Transactions" />
      <h1 className="font-bold text-xl lg:text-2xl mt-7 mb-4">
        Old Transaction
      </h1>
      <EditOldTransaction
        state={editModal}
        handleModalClose={handleEditModalClose}
        data={editData}
        branch={branchData}
        refresh={makeRequest}
      />
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
            placeholder={"Search by reference number"}
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
              <TableHeadItem>REFERENCE</TableHeadItem>
              <TableHeadItem>PAYER</TableHeadItem>
              <TableHeadItem>AMOUNT</TableHeadItem>
              <TableHeadItem>YEAR</TableHeadItem>
              <TableHeadItem>PAYMENT DATE</TableHeadItem>
              <TableHeadItem>STATUS</TableHeadItem>
              <TableHeadItem>ACTION</TableHeadItem>
            </TableHead>
            <TableBody>
              {response?.items.map((row: IOldTransaction, idx: number) => (
                <TableRow>
                  <TableCell alignment="left">{row.reference}</TableCell>
                  <TableCell alignment="left">{row.name}</TableCell>
                  <TableCell alignment="left">
                    {"₦" + row.amount.toLocaleString()}
                  </TableCell>
                  <TableCell alignment="left">{row.payment_year}</TableCell>
                  <TableCell alignment="left">{row.created_at}</TableCell>
                  <TableCell alignment="left">
                    <p className="py-2 px-3 w-fit bg-green-100 text-primary-500 rounded-3xl">
                      APPROVED
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
                              setOldReceiptInfo(row);
                              navigate("/payment/oldbpfreceipt");
                            }}
                          >
                            View receipt
                          </button>

                          <button
                            type="button"
                            className="hover:bg-gray-100 text-black w-full text-left p-3"
                            onClick={() => {
                              handleEdit(row.id);
                            }}
                          >
                            Update Info
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

export default OldAdminTransaction;
