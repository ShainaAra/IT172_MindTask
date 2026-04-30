import { AuthProvider, useAuth } from "./context/AuthContext";
import { ThemeProvider, useTheme } from "./context/ThemeContext";
import GlobalStyles from "./styles/GlobalStyles";
import AuthPage from "./pages/AuthPage";
import Dashboard from "./pages/Dashboard";

function AppInner() {
  const { user } = useAuth();
  const { dark } = useTheme();

  return (
    <>
      <GlobalStyles dark={dark} />
      {user ? <Dashboard /> : <AuthPage />}
    </>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppInner />
      </AuthProvider>
    </ThemeProvider>
  );
}
