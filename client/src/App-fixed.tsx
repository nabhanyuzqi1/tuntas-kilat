import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Navbar } from "@/components/navigation/navbar";
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
import Booking from "@/pages/booking";
import Tracking from "@/pages/tracking";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="flex-1">
        <Switch>
          <Route path="/auth" component={AuthPage} />
          <Route path="/about" component={About} />
          <Route path="/privacy" component={PrivacyPolicy} />
          <Route path="/terms" component={TermsOfService} />
          <Route path="/services" component={Services} />
          <Route path="/profile" component={Profile} />
          <Route path="/booking" component={Booking} />
          <Route path="/tracking" component={Tracking} />
          <Route path="/admin" component={AdminDashboard} />
          <Route path="/admin/crm" component={CRMDashboard} />
          <Route path="/worker" component={WorkerDashboard} />
          <Route path="/worker/achievements" component={WorkerAchievements} />
          <Route path="/testing" component={Testing} />
          <Route path="/" component={Home} />
          <Route component={NotFound} />
        </Switch>
      </main>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Router />
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;