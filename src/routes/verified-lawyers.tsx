import {
  IVerifiedLawyers,
  IVerifiedLawyersResponse,
} from "@/api/interfaces/verified-lawyer-list";
import { getVerifiedList } from "@/api/verified-lawyers-list";
import {
  useVerifiedLawyersQuery,
  usePrefetchVerifiedLawyers,
} from "@/components/hooks/use-verified-lawyers-query";
import { useQueryClient } from "@tanstack/react-query";
import { NotifyError } from "@/components/toast/toast";
import Input from "@/components/ui/input";
import Button from "@/components/ui/button";
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
import { MagnifyingGlassIcon } from "@heroicons/react/24/solid";
import { debounce } from "lodash";
import { useEffect, useState } from "preact/hooks";
import { useNavigate } from "react-router-dom";

const VerifiedLawyers = () => {
  const navigate = useNavigate();
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

  const {
    data: verifiedData,
    isLoading,
    error,
  } = useVerifiedLawyersQuery({
    page: pagination.page,
    // page_size: pagination.page_size,
    search: filter.search,
  });

  const prefetchVerified = usePrefetchVerifiedLawyers();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (error)
      NotifyError(
        (error as any)?.message ||
          (error as any)?.name ||
          "Failed to fetch verified lawyers",
      );
  }, [error]);

  useEffect(() => {
    if (verifiedData?.pagination) {
      const total =
        verifiedData.pagination.total ??
        verifiedData.pagination.total_rows ??
        0;
      const pageSize =
        verifiedData.pagination.limit ??
        verifiedData.pagination.page_size ??
        20;

      if (
        total !== pagination.total_rows ||
        verifiedData.pagination.page !== pagination.page
      ) {
        setPagination((prev) => {
          if (
            prev.total_rows === total &&
            prev.page === verifiedData.pagination.page
          )
            return prev;

          return {
            page: verifiedData.pagination.page ?? 1,
            page_size: pageSize,
            total_rows: total,
            count: verifiedData.items?.length ?? 0,
          };
        });
      }
    }
  }, [verifiedData]);

  useEffect(() => {
    setPaginationState({
      ...pagination,
      status: filter.search,
    });
  }, [pagination]);

  // Prefetch next page
  useEffect(() => {
    if (!verifiedData) return;
    const nextPage = (verifiedData.pagination.page ?? 1) + 1;
    const totalPages = Math.ceil(
      (verifiedData.pagination.total_rows ?? 0) /
        (verifiedData.pagination.page_size ?? 1),
    );
    if (nextPage <= totalPages) {
      prefetchVerified({
        page: nextPage,
        // page_size: verifiedData.pagination.page_size,
        search: filter.search,
      }).catch(() => {});
    }
  }, [verifiedData, filter, prefetchVerified]);

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

  return (
    <div className="px-4 mb-5">
      <PageTitle title="Verified Lawyers" />
      <h1 className="font-bold text-xl lg:text-2xl mt-7 mb-4">
        Verified NIN List
      </h1>

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
            placeholder={"Search by full name or enrollment number"}
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
        ) : verifiedData ? (
          <Table>
            <TableHead textSize="xs">
              <TableHeadItem>NBA ID</TableHeadItem>
              <TableHeadItem>NAME</TableHeadItem>
              <TableHeadItem>GOVT. NAME</TableHeadItem>
              <TableHeadItem>GOVT. PHONE</TableHeadItem>
              <TableHeadItem>GOVT. DATE OF BIRTH</TableHeadItem>
              <TableHeadItem>ENROLLMENT NUMBER</TableHeadItem>
              <TableHeadItem>YEAR OF CALL</TableHeadItem>
              <TableHeadItem last>ACTION</TableHeadItem>
            </TableHead>
            <TableBody>
              {verifiedData?.items.map((row: IVerifiedLawyers, idx: number) => (
                <TableRow key={idx}>
                  <TableCell alignment="left">{row.nba_id}</TableCell>
                  <TableCell alignment="left">
                    <p title={row.fullName} className="max-w-[17rem] truncate">
                      {row.fullName}
                    </p>
                  </TableCell>
                  <TableCell alignment="left">
                    <p
                      title={
                        row.g_lname + " " + row.g_fname + " " + row.g_mname
                      }
                      className="max-w-[17rem] truncate"
                    >
                      {row.g_lname + " " + row.g_fname + " " + row.g_mname}
                    </p>
                  </TableCell>
                  <TableCell alignment="left">{row.g_phone}</TableCell>
                  <TableCell alignment="left">{row.g_dob}</TableCell>
                  <TableCell alignment="left">{row.scn}</TableCell>
                  <TableCell alignment="left">{row.year_of_call}</TableCell>
                  <TableCell alignment="left" last>
                    <Button
                      variant="primary"
                      dimension="sm"
                      onClick={() => navigate(`/verifiedlawyers/${row.nba_id}`)}
                      className="text-xs px-3 py-1"
                    >
                      View Details
                    </Button>
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

export default VerifiedLawyers;
