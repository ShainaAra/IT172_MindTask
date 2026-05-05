import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import { useAuth } from "./context/useAuth";
import { useTheme } from "./context/useTheme";
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