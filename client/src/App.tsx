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

import Home from "@/pages/home";
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
import NotFound from "@/pages/not-found";

import type { User } from "@shared/schema";

function AppContent() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  useEffect(() => {
    const storedUser = localStorage.getItem("ssm-user");
    if (storedUser) {
      try {
        setCurrentUser(JSON.parse(storedUser));
      } catch {
        localStorage.removeItem("ssm-user");
      }
    }
    setIsLoading(false);
  }, []);

  const handleLogin = async (email: string, password: string) => {
    try {
      const response = await apiRequest("POST", "/api/auth/login", { email, password });
      const user = await response.json();
      setCurrentUser(user);
      localStorage.setItem("ssm-user", JSON.stringify(user));
      toast({ title: "Welcome back!" });
      setLocation("/");
    } catch (error) {
      toast({ title: "Invalid credentials", variant: "destructive" });
    }
  };

  const handleSignup = async (data: any) => {
    try {
      const response = await apiRequest("POST", "/api/auth/signup", {
        username: data.email,
        password: data.password,
        fullName: data.fullName,
        email: data.email,
        academicYear: data.academicYear,
        department: data.department,
        skillsToShare: data.skillsToShare,
        skillsToLearn: data.skillsToLearn,
        interests: data.interests,
      });
      const user = await response.json();
      setCurrentUser(user);
      localStorage.setItem("ssm-user", JSON.stringify(user));
      toast({ title: "Account created successfully!" });
      setLocation("/");
    } catch (error) {
      toast({ title: "Failed to create account", variant: "destructive" });
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem("ssm-user");
    toast({ title: "Logged out successfully" });
    setLocation("/");
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
            <Route path="/profile/:id?">
              <Profile currentUser={currentUser} />
            </Route>
            <Route>
              <NotFound />
            </Route>
          </Switch>
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
