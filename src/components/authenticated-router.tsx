import { lazy } from "preact/compat";

// Lazy load heavy route components for better initial load time
const BranchList = lazy(() => import("@/routes/branch"));
const BranchAdminDetail = lazy(
  () => import("@/routes/branch/branch-admin-detail"),
);
const BranchAdminMemberProfile = lazy(
  () => import("@/routes/branch/admin-member-profile"),
);
const LazyBranchAdminMembers = lazy(
  () => import("@/routes/branch/admin-dashboard"),
);
const LazyBranchAdminHome = lazy(
  () => import("@/routes/branch/admin-dashboard-home"),
);
const LazyBranchAdminLayout = lazy(
  () => import("@/components/branch-admin/branch-admin-layout"),
);
const LazyBranchTransactions = lazy(
  () => import("@/routes/branch/branch-transactions"),
);
const Dashboard = lazy(() => import("@/routes/user-dashboard"));
const Lawyers = lazy(() => import("@/routes/lawyers"));
const BPFPayment = lazy(() => import("@/routes/payment/bpf-payment"));
const Payment = lazy(() => import("@/routes/payment/bpf-payment"));
const Profile = lazy(() => import("@/routes/profile"));
const DigitalLicense = lazy(() => import("@/routes/digital-license"));
const Certificates = lazy(() => import("@/routes/certificates"));
const BpfReceipt = lazy(() => import("@/routes/bpf-receipt"));
const Transaction = lazy(() => import("@/routes/transaction"));
const TransactionDetails = lazy(() => import("@/routes/transaction-details"));
const BranchDuesReceipt = lazy(() => import("@/routes/branch-dues-receipt"));
import {
  createBrowserRouter,
  Navigate,
  RouterProvider,
} from "react-router-dom";
import Root from "./auth-layout/root";
const StampReceipt = lazy(() => import("@/routes/stamp-seal-receipt"));
const LazyBranchDues = lazy(() => import("@/routes/payment/branch-dues"));
const LazyBranchDuesCallback = lazy(
  () => import("@/routes/payment/branch-dues-callback"),
);
const LazyBPFCallback = lazy(() => import("@/routes/payment/bpf-callback"));
const Notifications = lazy(() => import("@/routes/notifications"));

const LetterOfGoodStanding = lazy(
  () => import("@/routes/letterofgoodstanding"),
);
const VerifiedLawyers = lazy(() => import("@/routes/verified-lawyers"));
const VerifiedLawyerDetail = lazy(
  () => import("@/routes/verified-lawyers-detail"),
);
import PayBPF from "@/routes/PayBPF";
import BpfDashboard from "@/routes/BpfDashboard";

const MyTransaction = lazy(() => import("@/routes/my-transaction"));
const StampSealRequest = lazy(() => import("@/routes/stamp-seal-request"));
const StampSealRequestsDetail = lazy(
  () => import("@/routes/stamp-seal-request-detail"),
);
const UserManagement = lazy(
  () => import("@/routes/user-management/user-management"),
);
import AuthContext from "@/context/auth-context";
import { ACCESS_ROLES } from "@/utils/constants";
const AdminDashboard = lazy(() => import("@/routes/admin-dashboard"));
const UserDashboard = lazy(() => import("@/routes/user-dashboard"));
const AdminTransaction = lazy(() => import("@/routes/admin-transaction"));
const Hodim = lazy(() => import("@/routes/hodim"));
const OldUserTransaction = lazy(() => import("@/routes/old-user-transaction"));
const OldAdminTransaction = lazy(
  () => import("@/routes/old-admin-transaction"),
);
const OldBpfReceipt = lazy(() => import("@/routes/old-bpf-receipt"));
const EmailReceipt = lazy(() => import("@/routes/email-receipt"));
const StampSealUpload = lazy(() => import("@/routes/stamp-seal-upload"));
const Conference = lazy(() => import("@/routes/conference"));
const UserConferenceDashboard = lazy(
  () => import("./conference/user-conference-dashboard"),
);
const AdminConferenceDashboard = lazy(
  () => import("./conference/admin-conference-dashboard"),
);
const ConferenceEmailReceipt = lazy(
  () => import("./conference/conference-email-reciept"),
);

import { useMemo } from "preact/hooks";

function AuthenticatedRouter() {
  const { user, conferenceStatus } = AuthContext.useContainer();

  const router = useMemo(() => {
    const isConferenceAdmin =
      (user?.roles || []).includes("CONFERENCE_ADMIN") ||
      //  (user?.roles || []).includes("BAR_SERVICES") ||
      (user?.roles || []).includes("BRANCH_ADMIN") ||
      (user?.roles || []).includes("SUPER_ADMIN") ||
      (user?.roles || []).includes("ADMIN");

    const routes = [
      {
        path: "/dashboard",
        allowed: true,
        element: <Root />,
        children: [
          {
            index: true,
            path: "",
            element: ACCESS_ROLES.admin_dashboard.some((v: string) =>
              (user?.roles || []).includes(v),
            ) ? (
              <AdminDashboard />
            ) : (
              <UserDashboard />
            ),
          },
        ],
      },
      {
        path: "/conference",
        allowed: ACCESS_ROLES.conference_access.some((v: string) =>
          (user?.roles || []).includes(v),
        ),
        element: <Root />,
        children: [
          {
            index: true,
            path: "",
            element: isConferenceAdmin ? (
              <AdminConferenceDashboard />
            ) : (
              <UserConferenceDashboard />
            ),
          },
        ],
      },
      {
        path: "/reg/conference",
        element: <Root />,
        allowed:
          !(user?.roles || []).includes("SUPER_ADMIN") &&
          !conferenceStatus?.entry?.is_paid,
        children: [
          {
            index: true,
            path: "",
            element: <Conference />,
          },
        ],
      },
      {
        path: "/payment",
        allowed: ACCESS_ROLES.payment.some((v: string) =>
          (user?.roles || []).includes(v),
        ),
        element: <Root />,
        children: [
          {
            index: true,
            path: "/payment",
            element: <Dashboard />,
          },
          { path: "bpfreceipt", element: <BpfReceipt /> },
          { path: "oldbpfreceipt", element: <OldBpfReceipt /> },
          { path: "stampreceipt", element: <StampReceipt /> },
          { path: "branchduesreceipt", element: <BranchDuesReceipt /> },
          { path: "bpf", element: <Transaction /> },
          { path: "bpf/pay", element: <Transaction /> },
          { path: "sealandstamp", element: <Transaction /> },
          { path: "sealandstamp/pay", element: <Transaction /> },
          { path: "backlog", element: <Transaction /> },
          { path: "backlog/pay", element: <Transaction /> },
          { path: "backlog/pay", element: <Transaction /> },
          { path: "branchdues", element: <LazyBranchDues /> },
          { path: "branchdues", element: <LazyBranchDues /> },
          { path: "branch-dues/callback", element: <LazyBranchDuesCallback /> },
          { path: "bpf/callback", element: <LazyBPFCallback /> },
        ],
      },
      {
        path: "/transaction",
        allowed:
          ACCESS_ROLES.admin_transaction.some((v: string) =>
            (user?.roles || []).includes(v),
          ) ||
          ACCESS_ROLES.user_transaction.some((v: string) =>
            (user?.roles || []).includes(v),
          ),
        element: <Root />,
        children: [
          {
            index: true,
            path: "",
            element: ACCESS_ROLES.admin_transaction.some((v: string) =>
              (user?.roles || []).includes(v),
            ) ? (
              <AdminTransaction />
            ) : (
              <Transaction />
            ),
          },
          { path: "details", element: <TransactionDetails /> },
        ],
      },
      {
        path: "/my/transaction",
        allowed: ACCESS_ROLES.payment.some((v: string) =>
          (user?.roles || []).includes(v),
        ),
        element: <Root />,
        children: [{ index: true, path: "", element: <MyTransaction /> }],
      },
      {
        path: "/my/old/transaction",
        allowed:
          ACCESS_ROLES.user_dashboard.some((v: string) =>
            (user?.roles || []).includes(v),
          ) ||
          ACCESS_ROLES.admin_dashboard.some((v: string) =>
            (user?.roles || []).includes(v),
          ),
        element: <Root />,
        children: [
          {
            index: true,
            path: "",
            element: ACCESS_ROLES.admin_dashboard.some((v: string) =>
              (user?.roles || []).includes(v),
            ) ? (
              <OldAdminTransaction />
            ) : (
              <OldUserTransaction />
            ),
          },
        ],
      },
      {
        path: "/branch/admin",
        element: <LazyBranchAdminLayout />,
        allowed:
          (user?.roles || []).includes("BRANCH_ADMIN") ||
          (user?.roles || []).includes("SUPER_ADMIN") ||
          (user?.roles || []).includes("BRANCH_SERVICES") || //remove later
          (user?.roles || []).includes("ADMIN"),
        children: [
          { index: true, element: <Navigate to="home" replace /> },
          { path: "home", element: <LazyBranchAdminHome /> },
          { path: "members", element: <LazyBranchAdminMembers /> },
          { path: "member/:id", element: <BranchAdminMemberProfile /> },
          { path: "profile", element: <BranchAdminDetail /> },
          { path: "transactions", element: <LazyBranchTransactions /> },
        ],
      },
      {
        path: "/branch",
        allowed: ACCESS_ROLES.branch.some((v: string) =>
          (user?.roles || []).includes(v),
        ),
        element: <Root />,
        children: [
          { index: true, path: "", element: <BranchList /> },
          { path: "admin-detail", element: <BranchAdminDetail /> },
        ],
      },
      {
        path: "/lawyers",
        allowed: ACCESS_ROLES.lawyer.some((v: string) =>
          (user?.roles || []).includes(v),
        ),
        element: <Root />,
        children: [{ index: true, path: "", element: <Lawyers /> }],
      },
      {
        path: "/verifiedlawyers",
        allowed: ACCESS_ROLES.verified_lawyer.some((v: string) =>
          (user?.roles || []).includes(v),
        ),
        element: <Root />,
        children: [
          { index: true, path: "", element: <VerifiedLawyers /> },
          { path: ":nbaId", element: <VerifiedLawyerDetail /> },
        ],
      },
      {
        path: "/stampseal/upload",
        allowed: ACCESS_ROLES.user_access.some((v: string) =>
          (user?.roles || []).includes(v),
        ),
        element: <Root />,
        children: [{ index: true, path: "", element: <StampSealUpload /> }],
      },
      {
        path: "/stampseal/doc",
        allowed: ACCESS_ROLES.doc_request.some((v: string) =>
          (user?.roles || []).includes(v),
        ),
        element: <Root />,
        children: [
          { index: true, path: "", element: <StampSealRequest /> },
          { path: ":id", element: <StampSealRequestsDetail /> },
        ],
      },
      {
        path: "/usermanagement",
        allowed: ACCESS_ROLES.user_management.some((v: string) =>
          (user?.roles || []).includes(v),
        ),
        element: <Root />,
        children: [{ index: true, path: "", element: <UserManagement /> }],
      },
      {
        path: "/profile",
        allowed: ACCESS_ROLES.profile.some((v: string) =>
          (user?.roles || []).includes(v),
        ),
        element: <Root />,
        children: [{ index: true, path: "", element: <Profile /> }],
      },
      {
        path: "/digital-license",
        allowed: ACCESS_ROLES.digital_center.some((v: string) =>
          (user?.roles || []).includes(v),
        ),
        element: <Root />,
        children: [{ index: true, path: "", element: <DigitalLicense /> }],
      },
      {
        path: "/certificates",
        allowed: ACCESS_ROLES.digital_center.some((v: string) =>
          (user?.roles || []).includes(v),
        ),
        element: <Root />,
        children: [{ index: true, path: "", element: <Certificates /> }],
      },
      {
        path: "/letterofgoodstanding",
        allowed: ACCESS_ROLES.digital_center.some((v: string) =>
          (user?.roles || []).includes(v),
        ),
        element: <Root />,
        children: [
          { index: true, path: "", element: <LetterOfGoodStanding /> },
        ],
      },
      {
        path: "/notifications",
        allowed: true,
        element: <Root />,
        children: [{ index: true, path: "", element: <Notifications /> }],
      },
      {
        path: "/conference/emailreceipt",
        element: <Root />,
        allowed: true,
        children: [
          { index: true, path: "", element: <ConferenceEmailReceipt /> },
        ],
      },
      {
        path: "*",
        allowed: true,
        element: <Root />,
        children: [
          {
            index: true,
            path: "*",
            element: <Navigate to="/dashboard" replace />,
          },
        ],
      },
    ];

    return createBrowserRouter(routes.filter((v) => v.allowed));
  }, [user?.roles, conferenceStatus?.entry?.is_paid]);

  return <RouterProvider router={router} />;
}

export default AuthenticatedRouter;
