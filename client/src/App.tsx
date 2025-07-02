import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Navbar } from "@/components/navigation/navbar";
import { PublicRoute, ProtectedRoute, AdminRoute, WorkerRoute } from "@/components/auth/route-guard";
import Landing from "@/pages/landing";
import Home from "@/pages/home";
import Profile from "@/pages/profile";
import AuthPage from "@/pages/auth";
import Services from "@/pages/services";
import About from "@/pages/about";
import PrivacyPolicy from "@/pages/privacy-policy";
import TermsOfService from "@/pages/terms-of-service";
import AdminDashboard from "@/pages/admin/dashboard";
import CRMDashboard from "@/pages/admin/crm";
import WorkerDashboard from "@/pages/worker/dashboard";
import WorkerAchievements from "@/pages/worker/achievements";
import Testing from "@/pages/testing";
// import FirebaseTesting from "@/pages/firebase-testing"; // Temporarily disabled for build
import Booking from "@/pages/booking";
import Tracking from "@/pages/tracking";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="flex-1">(
    <Switch>
      {!isAuthenticated ? (
        <>
          <Route path="/" component={Landing} />
          <Route path="/auth" component={AuthPage} />
          <Route path="/services" component={Services} />
          <Route path="/about" component={About} />
          <Route path="/privacy-policy" component={PrivacyPolicy} />
          <Route path="/terms-of-service" component={TermsOfService} />
        </>
      ) : (
        <>
          <Route path="/" component={Home} />
          <Route path="/profile" component={Profile} />
          <Route path="/booking" component={Booking} />
          <Route path="/tracking/:trackingId?" component={Tracking} />
          
          {/* Admin routes */}
          {(user?.role === 'admin_umum' || user?.role === 'admin_perusahaan') && (
            <>
              <Route path="/admin/dashboard" component={AdminDashboard} />
              <Route path="/admin/crm" component={CRMDashboard} />
            </>
          )}
          
          {/* Worker routes */}
          {user?.role === 'worker' && (
            <>
              <Route path="/worker/dashboard" component={WorkerDashboard} />
              <Route path="/worker/achievements" component={WorkerAchievements} />
            </>
          )}
          
          {/* Testing routes (available to all authenticated users) */}
          <Route path="/testing" component={Testing} />
          {/* <Route path="/firebase-testing" component={FirebaseTesting} /> */}
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
