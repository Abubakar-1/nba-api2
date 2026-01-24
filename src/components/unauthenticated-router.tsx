import {
  createBrowserRouter,
  Navigate,
  RouterProvider,
} from "react-router-dom";
import Root from "./unauth-layout/root";
import Login from "@/routes/login-sign-up";
import SignUp from "@/routes/sign-up";
import ResetPassword from "@/routes/reset-password";
import TwoFactorAuth from "@/routes/two-factor-auth";
import Hodim from "@/routes/hodim";
import EmailReceipt from "@/routes/email-receipt";
import ConferenceEmailReceipt from "./conference/conference-email-reciept";

const router = createBrowserRouter([
  {
    path: "/",

    element: <Root />,
    children: [
      {
        path: "/",
        element: <SignUp />,
      },
      {
        path: "/signup",
        element: <SignUp />,
      },
      {
        path: "/login",
        element: <Login />,
      },
      {
        path: "/verify-otp",
        element: <TwoFactorAuth />,
      },
      {
        path: "/passwordreset",
        element: <ResetPassword />,
      },
      {
        path: "*",
        element: <Navigate to="/" />,
      },
      {
        path: "/emailreceipt",
        element: <EmailReceipt />,
      },
      {
        path: "/hodim7",
        element: <Hodim />,
      },
      {
        path: "/conference/emailreceipt",
        element: <ConferenceEmailReceipt />,
      },
    ],
  },
]);

function UnauthenticatedRouter() {
  return <RouterProvider router={router} />;
}

export default UnauthenticatedRouter;
