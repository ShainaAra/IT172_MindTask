import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import { useAuth } from "./context/useAuth";
import { useTheme } from "./context/useTheme";
import GlobalStyles from "./styles/GlobalStyles";
import AuthPage from "./pages/AuthPage";
import Dashboard from "./pages/Dashboard";

/**
 * Component: AppInner
 * Description: Inner app component that has access to auth and theme contexts.
 * Renders either the Dashboard (if user is logged in) or AuthPage (if not).
 * Also injects global styles that depend on current theme mode.
 * 
 * @returns {JSX.Element} Either Dashboard or AuthPage with global styles
 */
function AppInner() {
  // Get authentication state (user object or null)
  const { user } = useAuth();
  // Get current theme mode (dark/light) for global styles
  const { dark } = useTheme();

  return (
    <>
      {/* Global styles that update based on dark/light mode */}
      <GlobalStyles dark={dark} />
      {/* Conditional rendering: Dashboard for logged-in users, AuthPage for guests */}
      {user ? <Dashboard /> : <AuthPage />}
    </>
  );
}

/**
 * Component: App
 * Description: Root application component that provides theme and auth context
 * to all child components. Wraps AppInner with both providers in correct order.
 * ThemeProvider must be outer so AuthProvider can access theme if needed.
 * 
 * @returns {JSX.Element} App with theme and auth context providers
 */
export default function App() {
  return (
    // Theme provider must wrap AuthProvider to ensure theme is available
    <ThemeProvider>
      <AuthProvider>
        <AppInner />
      </AuthProvider>
    </ThemeProvider>
  );
}