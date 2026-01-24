import {
  ITransactionDetails,
  ITransactions,
} from "@/api/interfaces/transaction";
import {
  getAdminTransactionDetails,
  getTransactionDetails,
} from "@/api/transaction";
import { ACCESS_ROLES } from "@/utils/constants";
import { useRequest } from "@/components/hooks/use-request";
import { NotifyError, NotifyWarning } from "@/components/toast/toast";
import PageLoader from "@/components/ui/page-loader";
import PageTitle from "@/components/ui/page-title";
import StampAndSealUpload from "@/components/ui/stamp-and-seal-upload";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeadItem,
  TableRow,
} from "@/components/ui/table";
import { TableItemMenu } from "@/components/ui/table-item-menu";
import PhotoContext from "@/context/photo-context";
import AuthContext from "@/context/auth-context";
import classNames from "classnames";
import { FunctionalComponent } from "preact";
import { useEffect, useState, useCallback } from "preact/hooks";
import { useNavigate, useSearchParams } from "react-router-dom";

const TransactionDetails: FunctionalComponent = () => {
  const { setPhotoInfo } = PhotoContext.useContainer();
  const { user } = AuthContext.useContainer();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const fetchDetails = useCallback(
    (data: { id: string }) => {
      const isAdmin = ACCESS_ROLES.admin_access.some((r) =>
        user?.roles?.includes(r),
      );
      if (isAdmin) {
        return getAdminTransactionDetails(data.id);
      }
      return getTransactionDetails(data);
    },
    [user],
  );

  const transactionDetailsRequest = useRequest<{ id: string }>(fetchDetails);

  const transactionDetails = async (val: string) => {
    const [response, _err] = await transactionDetailsRequest.makeRequest({
      id: val,
    });
    if (!_err) {
    } else if (_err && _err?.data) {
      NotifyError(_err?.data?.info);
      return;
    } else {
      NotifyError(_err?.info);
      return;
    }
  };

  useEffect(() => {
    if (searchParams.get("id")) {
      transactionDetails(searchParams.get("id") + "");
    } else navigate("/transaction");
  }, [searchParams.get("id")]);

  const detailsData =
    transactionDetailsRequest.response?.data ||
    transactionDetailsRequest.response;
  const detailsList = Array.isArray(detailsData)
    ? detailsData
    : detailsData
      ? [detailsData]
      : [];

  console.log("Transaction Details Request State:", {
    loading: transactionDetailsRequest.isLoading,
    error: transactionDetailsRequest.error,
    response: transactionDetailsRequest.response,
    detailsList,
  });

  return (
    <div className="px-4 mb-5">
      <PageTitle title="Transaction Details" />
      <h1 className="font-bold text-xl lg:text-2xl mt-7 mb-4">
        Transaction Detail
      </h1>

      <div className="lg:mt-10">
        {transactionDetailsRequest.isLoading ? (
          <div className="w-full h-full flex justify-center items-center">
            <PageLoader isOutlined={transactionDetailsRequest.isLoading} />
          </div>
        ) : transactionDetailsRequest.error ? (
          <div className="w-full flex justify-center items-center p-10 text-red-500">
            <p>
              Error loading details:{" "}
              {transactionDetailsRequest.error.message || "Unknown error"}
            </p>
          </div>
        ) : (
          <Table>
            <TableHead textSize="xs">
              <TableHeadItem>RECIPIENT NAME</TableHeadItem>
              <TableHeadItem>RECIPIENT EMAIL</TableHeadItem>
              <TableHeadItem>PAYMENT TYPE</TableHeadItem>
              <TableHeadItem>REFERENCE</TableHeadItem>
              <TableHeadItem>DATE</TableHeadItem>
              <TableHeadItem>AMOUNT</TableHeadItem>
              <TableHeadItem>YEAR</TableHeadItem>
              <TableHeadItem>STATUS</TableHeadItem>
              <TableHeadItem>ACTION</TableHeadItem>
            </TableHead>
            <TableBody>
              {detailsList.length > 0 ? (
                detailsList.map((row: ITransactionDetails, idx: number) => (
                  <TableRow key={idx}>
                    <TableCell alignment="left">
                      {row.recipient_name || row.payer_name}
                    </TableCell>
                    <TableCell alignment="left">
                      <p
                        title={row.email || row.payer_email}
                        className="max-w-[12rem] truncate font-medium"
                      >
                        {row.email || row.payer_email}
                      </p>
                    </TableCell>
                    <TableCell alignment="left">{row.type}</TableCell>
                    <TableCell alignment="left">{row.reference}</TableCell>
                    <TableCell alignment="left">{row.created_at}</TableCell>
                    <TableCell alignment="left">
                      <p className="font-bold text-black">
                        &#8358;{row.amount?.toLocaleString()}
                      </p>
                    </TableCell>
                    <TableCell alignment="left">{row.year || " "}</TableCell>
                    <TableCell alignment="left">
                      <span
                        className={classNames(
                          "px-3 py-1 rounded-full text-xs font-semibold",
                          {
                            "bg-green-100 text-green-800":
                              row.status?.toUpperCase() === "APPROVED",
                            "bg-yellow-100 text-yellow-800":
                              row.status?.toUpperCase() === "PENDING",
                            "bg-red-100 text-red-800":
                              row.status?.toUpperCase() !== "APPROVED" &&
                              row.status?.toUpperCase() !== "PENDING",
                          },
                        )}
                      >
                        {row.status || "UNKNOWN"}
                      </span>
                    </TableCell>
                    <TableCell alignment="left">
                      <TableItemMenu>
                        <div className="px-1 py-1 ">
                          <div className="flex flex-col gap-1 items-start font-medium">
                            <button
                              type="button"
                              className="hover:bg-gray-100 text-black w-full text-left p-3"
                              onClick={() => {
                                // CRITICAL: Rigorous check - only allow receipt viewing for APPROVED transactions
                                if (
                                  !row.status ||
                                  row.status.toUpperCase() !== "APPROVED"
                                ) {
                                  NotifyWarning(
                                    "Payment not approved yet. You can only download receipts for approved transactions.",
                                  );
                                  return; // Prevent any further execution
                                }

                                const enrichedRow = {
                                  ...row,
                                  recipient_name:
                                    row.recipient_name &&
                                    row.recipient_name !== "N/A"
                                      ? row.recipient_name
                                      : row.payer_name || "N/A",
                                  recipient_scn:
                                    row.recipient_scn &&
                                    row.recipient_scn !== "N/A"
                                      ? row.recipient_scn
                                      : (row as any).payer_scn || "N/A",
                                  branch:
                                    row.branch && row.branch !== "N/A"
                                      ? row.branch
                                      : "N/A",
                                  year_of_call:
                                    row.year_of_call &&
                                    String(row.year_of_call) !== "N/A" &&
                                    row.year_of_call !== 0
                                      ? row.year_of_call
                                      : "N/A",
                                  email:
                                    row.email && row.email !== ""
                                      ? row.email
                                      : row.payer_email || "",
                                  payment_gateway: row.payment_gateway || "",
                                };

                                setPhotoInfo(enrichedRow);
                                if (
                                  row.type?.toLocaleUpperCase() === "STAMP_SEAL"
                                ) {
                                  navigate("/payment/stampreceipt");
                                } else navigate("/payment/bpfreceipt");
                              }}
                            >
                              View receipt
                            </button>
                          </div>
                        </div>
                      </TableItemMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell alignment="center" colSpan={9}>
                    <div className="p-4 text-center text-gray-500">
                      No transaction details found.
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
};

export default TransactionDetails;
