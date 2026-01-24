import { render } from "preact";
import { QueryClientProvider } from "@tanstack/react-query";
import App from "./app";
import "./assets/styles/index.css";
import AuthContext from "./context/auth-context";
import OldTransactionContext from "./context/old-transaction-context";
import PhotoContext from "./context/photo-context";
import { createQueryClient } from "./api/react-query";

// Create QueryClient instance
const queryClient = createQueryClient();

render(
  <QueryClientProvider client={queryClient}>
    <OldTransactionContext.Provider>
      <PhotoContext.Provider>
        <AuthContext.Provider>
          <App />
        </AuthContext.Provider>
      </PhotoContext.Provider>
    </OldTransactionContext.Provider>
  </QueryClientProvider>,
  document.getElementById("app") as HTMLElement
);
