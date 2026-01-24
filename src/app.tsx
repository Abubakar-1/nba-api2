import { FunctionalComponent, h, Fragment } from "preact";
import { lazy, Suspense } from "preact/compat";
import { useEffect } from "preact/hooks";
import { CircleLoader } from "@/components/ui/loader";
import AuthContext from "@/context/auth-context";
import { ToastContainer } from "react-toastify";
import { logger } from "./utils/logger";

const loadAuthenticatedApp = () => import("./components/authenticated-router");
const AuthenticatedApp = lazy(loadAuthenticatedApp);
const UnauthenticatedApp = lazy(
  () => import("./components/unauthenticated-router"),
);

// Toggle this to enable/disable maintenance mode for the entire app
const MAINTENANCE_MODE = false;

const App: FunctionalComponent = () => {
  // Handle maintenance mode redirect
  useEffect(() => {
    if (MAINTENANCE_MODE) {
      window.location.href = "/maintenance.html";
    }
  }, []);

  if (MAINTENANCE_MODE) {
    return null;
  }

  const { isAuthenticated, user } = AuthContext.useContainer();

  // pre-load the authenticated side in the background while the user's
  // filling out the login form.

  useEffect(() => {
    if (isAuthenticated) {
      loadAuthenticatedApp();
    }
  }, [isAuthenticated]);

  return (
    <>
      <Suspense fallback={<CircleLoader />}>
        <ToastContainer
          aria-label="toast-container"
          theme="colored"
          autoClose={false}
          hideProgressBar
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
        />
        <div className="router flex w-full">
          {isAuthenticated && user ? (
            <AuthenticatedApp />
          ) : (
            <UnauthenticatedApp />
          )}
        </div>
      </Suspense>
    </>
  );
};

export default App;
