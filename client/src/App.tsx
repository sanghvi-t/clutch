import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Pricing from "./pages/Pricing";
import Onboarding from "./pages/Onboarding";
import Dashboard from "./pages/Dashboard";
import Coach from "./pages/Coach";
import Training from "./pages/Training";
import Wellness from "./pages/Wellness";
import Profile from "./pages/Profile";
import Leaderboard from "./pages/Leaderboard";
import Community from "./pages/Community";
import Analytics from "./pages/Analytics";
import ContentLibrary from "./pages/ContentLibrary";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path={"/pricing"} component={Pricing} />
      <Route path={"/onboarding"} component={Onboarding} />
      <Route path={"/dashboard"} component={Dashboard} />
      <Route path={"/coach"} component={Coach} />
      <Route path={"/training"} component={Training} />
      <Route path={"/wellness"} component={Wellness} />
      <Route path={"/profile"} component={Profile} />
      <Route path={"/leaderboard"} component={Leaderboard} />
      <Route path={"/community"} component={Community} />
      <Route path={"/analytics"} component={Analytics} />
      <Route path={"/content-library"} component={ContentLibrary} />
      <Route path={"/404"} component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
