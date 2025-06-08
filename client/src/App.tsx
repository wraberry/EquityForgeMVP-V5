import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import Landing from "@/pages/landing";
import Home from "@/pages/home";
import Profile from "@/pages/profile";
import Opportunities from "@/pages/opportunities";
import PostOpportunity from "@/pages/post-opportunity";
import Messages from "@/pages/messages";
import UserTypeSelection from "@/pages/user-type-selection";
import Signup from "@/pages/signup";
import Signin from "@/pages/signin";
import NotFound from "@/pages/not-found";

function Router() {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <Switch>
      {/* Public routes */}
      <Route path="/signup" component={Signup} />
      <Route path="/signin" component={Signin} />
      
      {/* User type selection route - accessible when authenticated but no userType */}
      <Route path="/user-type-selection" component={UserTypeSelection} />
      
      {!isAuthenticated ? (
        <Route path="/" component={Landing} />
      ) : !(user as any)?.userType ? (
        <Route path="/" component={UserTypeSelection} />
      ) : (
        <>
          <Route path="/" component={Home} />
          <Route path="/profile" component={Profile} />
          <Route path="/opportunities" component={Opportunities} />
          <Route path="/post-opportunity" component={PostOpportunity} />
          <Route path="/messages" component={Messages} />
        </>
      )}
      
      {/* 404 fallback */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
