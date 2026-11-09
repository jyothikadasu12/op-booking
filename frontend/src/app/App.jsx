
import AppRouter from "./router";
import AppProviders from "./providers";
import { AuthProvider } from "../context/AuthContext";

function App() {
  return (
    <AppProviders>
      <AuthProvider>
        <AppRouter />
      </AuthProvider>
    </AppProviders>
  );
}

export default App;
