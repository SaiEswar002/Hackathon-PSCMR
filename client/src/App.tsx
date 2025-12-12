import { useState, useEffect } from "react";
import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { TopNavbar } from "@/components/top-navbar";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { authService } from "@/lib/appwrite-services/auth.service";
import { usersService } from "@/lib/appwrite-services/users.service";

import Home from "@/pages/home";
import Landing from "@/pages/landing";
import Login from "@/pages/login";
import Signup from "@/pages/signup";
import Profile from "@/pages/profile";
import Network from "@/pages/network";
import Messages from "@/pages/messages";
import Projects from "@/pages/projects";
import Dashboard from "@/pages/dashboard";
import Events from "@/pages/events";
import Search from "@/pages/search";
import Groups from "@/pages/groups";
import AdminUsers from "@/pages/admin-users";
import NotFound from "@/pages/not-found";

import type { User } from "@shared/schema";

function AppContent() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  useEffect(() => {
    // Check for active Appwrite session on mount
    const checkSession = async () => {
      try {
        const appwriteUser = await authService.getCurrentUser();
        if (appwriteUser) {
          // Get full user profile from database
          const userProfile = await usersService.getUserByEmail(appwriteUser.email);
          if (userProfile) {
            setCurrentUser(userProfile);
          }
        }
      } catch (error) {
        console.log("No active session");
      } finally {
        setIsLoading(false);
      }
    };
    checkSession();
  }, []);

  const handleLogin = async (email: string, password: string) => {
    try {
      // Login with Appwrite
      await authService.login({ email, password });

      // Get user profile from database
      const userProfile = await usersService.getUserByEmail(email);
      if (userProfile) {
        setCurrentUser(userProfile);
        toast({ title: "Welcome back!" });
        setLocation("/");
      } else {
        throw new Error("User profile not found");
      }
    } catch (error) {
      console.error("Login error:", error);
      toast({ title: "Invalid credentials", variant: "destructive" });
    }
  };

  const handleSignup = async (data: any) => {
    try {
      // Create Appwrite Auth account
      const appwriteUser = await authService.signUp({
        email: data.email,
        password: data.password,
        fullName: data.fullName,
      });

      // Create user profile document in database
      const userProfile = await usersService.createUser({
        userId: appwriteUser.$id, // Link to Appwrite Auth account
        username: data.email,
        fullName: data.fullName,
        email: data.email,
        academicYear: data.academicYear,
        department: data.department,
        bio: null,
        avatarUrl: null,
        bannerUrl: null,
        skillsToShare: data.skillsToShare || [],
        skillsToLearn: data.skillsToLearn || [],
        interests: data.interests || [],
        portfolioLinks: [],
      } as any); // Type assertion for Appwrite-specific fields

      setCurrentUser(userProfile);
      toast({ title: "Account created successfully!" });
      setLocation("/");
    } catch (error: any) {
      console.error("Signup error:", error);
      const errorMessage = error?.message || "Failed to create account";
      toast({ title: errorMessage, variant: "destructive" });
    }
  };

  const handleLogout = async () => {
    try {
      await authService.logout();
      setCurrentUser(null);
      toast({ title: "Logged out successfully" });
      setLocation("/");
    } catch (error) {
      console.error("Logout error:", error);
      toast({ title: "Logged out", variant: "default" });
      setCurrentUser(null);
      setLocation("/");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center animate-pulse">
          <span className="text-primary-foreground font-bold text-xl">S</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Switch>
        <Route path="/login">
          <Login onLogin={handleLogin} />
        </Route>
        <Route path="/signup">
          <Signup onSignup={handleSignup} />
        </Route>
        <Route>
          {currentUser ? (
            <>
              <TopNavbar currentUser={currentUser} onLogout={handleLogout} />
              <Switch>
                <Route path="/">
                  <Home currentUser={currentUser} />
                </Route>
                <Route path="/network">
                  <Network currentUser={currentUser} />
                </Route>
                <Route path="/projects">
                  <Projects currentUser={currentUser} />
                </Route>
                <Route path="/messages">
                  <Messages currentUser={currentUser} />
                </Route>
                <Route path="/dashboard">
                  <Dashboard currentUser={currentUser} />
                </Route>
                <Route path="/events">
                  <Events currentUser={currentUser} />
                </Route>
                <Route path="/search">
                  <Search currentUser={currentUser} />
                </Route>
                <Route path="/groups">
                  <Groups currentUser={currentUser} />
                </Route>
                <Route path="/admin/users">
                  <AdminUsers />
                </Route>
                <Route path="/profile/:id?">
                  <Profile currentUser={currentUser} />
                </Route>
                <Route>
                  <NotFound />
                </Route>
              </Switch>
            </>
          ) : (
            <Route path="/">
              <Landing />
            </Route>
          )}
        </Route>
      </Switch>
      <Toaster />
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <AppContent />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
