import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import PushNotifications from "@/components/notifications/push-notifications";
import Landing from "@/pages/landing";
import Home from "@/pages/home";
import AdminDashboard from "@/pages/admin/dashboard";
import WorkerDashboard from "@/pages/worker/dashboard";
import Testing from "@/pages/testing";
import Booking from "@/pages/booking";
import Tracking from "@/pages/tracking";
import NotFound from "@/pages/not-found";

function Router() {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-stone">
        <div className="text-center">
          <div className="w-12 h-12 bg-primary rounded-lg mx-auto mb-4 animate-pulse"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <Switch>
      {!isAuthenticated ? (
        <Route path="/" component={Landing} />
      ) : (
        <>
          <Route path="/" component={Home} />
          <Route path="/booking" component={Booking} />
          <Route path="/tracking/:trackingId?" component={Tracking} />
          
          {/* Admin routes */}
          {(user?.role === 'admin_umum' || user?.role === 'admin_perusahaan') && (
            <Route path="/admin/dashboard" component={AdminDashboard} />
          )}
          
          {/* Worker routes */}
          {user?.role === 'worker' && (
            <Route path="/worker/dashboard" component={WorkerDashboard} />
          )}
          
          {/* Testing route (available to all authenticated users) */}
          <Route path="/testing" component={Testing} />
        </>
      )}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <PushNotifications />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
