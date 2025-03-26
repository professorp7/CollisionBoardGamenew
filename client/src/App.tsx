import { Route, Switch } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { AppProvider } from "./contexts/AppContext";
import { AuthProvider } from "./hooks/use-auth";
import { ProtectedRoute } from "./lib/protected-route";
import AppLayout from "./components/layout/AppLayout";
import CharacterPage from "./pages/CharacterPage";
import TeamPage from "./pages/TeamPage";
import BattlePage from "./pages/BattlePage";
import DicePage from "./pages/DicePage";
import AuthPage from "./pages/auth-page";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <ProtectedRoute path="/" component={CharacterPage} />
      <ProtectedRoute path="/characters" component={CharacterPage} />
      <ProtectedRoute path="/teams" component={TeamPage} />
      <ProtectedRoute path="/battle" component={BattlePage} />
      <ProtectedRoute path="/dice" component={DicePage} />
      <Route path="/auth" component={AuthPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AppProvider>
          <AppLayout>
            <Router />
          </AppLayout>
          <Toaster />
        </AppProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
