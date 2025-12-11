import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Home, Users, FolderKanban, MessageSquare, Search, Bell, LogOut, User, Settings } from "lucide-react";
import { ThemeToggle } from "./theme-toggle";
import type { User as UserType } from "@shared/schema";

interface TopNavbarProps {
  currentUser: UserType | null;
  onLogout: () => void;
}

const navLinks = [
  { href: "/", label: "Home", icon: Home },
  { href: "/network", label: "Network", icon: Users },
  { href: "/projects", label: "Projects", icon: FolderKanban },
  { href: "/messages", label: "Messages", icon: MessageSquare },
];

export function TopNavbar({ currentUser, onLogout }: TopNavbarProps) {
  const [location] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <header className="sticky top-0 z-50 h-16 bg-card border-b border-border">
      <div className="h-full max-w-7xl mx-auto px-4 flex items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2" data-testid="link-logo">
          <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-lg">S</span>
          </div>
          <span className="hidden sm:block text-lg font-semibold text-foreground">SSM</span>
        </Link>

        <div className="flex-1 max-w-md mx-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search skills, students, projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 rounded-full bg-muted border-0 focus-visible:ring-2 focus-visible:ring-primary"
              data-testid="input-search"
            />
          </div>
        </div>

        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = location === link.href;
            return (
              <Link key={link.href} href={link.href}>
                <Button
                  variant={isActive ? "secondary" : "ghost"}
                  size="sm"
                  className={`flex items-center gap-2 ${isActive ? "text-primary" : ""}`}
                  data-testid={`link-nav-${link.label.toLowerCase()}`}
                >
                  <Icon className="h-4 w-4" />
                  <span className="hidden lg:inline">{link.label}</span>
                </Button>
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          
          <Button variant="ghost" size="icon" data-testid="button-notifications">
            <Bell className="h-5 w-5" />
          </Button>

          {currentUser ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full p-0" data-testid="button-user-menu">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={currentUser.avatarUrl || undefined} alt={currentUser.fullName} />
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {currentUser.fullName.split(" ").map(n => n[0]).join("").toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem asChild>
                  <Link href="/profile" className="flex items-center gap-2" data-testid="link-profile">
                    <User className="h-4 w-4" />
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/dashboard" className="flex items-center gap-2" data-testid="link-dashboard">
                    <Settings className="h-4 w-4" />
                    Dashboard
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={onLogout} className="text-destructive" data-testid="button-logout">
                  <LogOut className="h-4 w-4 mr-2" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/login">
                <Button variant="ghost" size="sm" data-testid="link-login">
                  Log in
                </Button>
              </Link>
              <Link href="/signup">
                <Button size="sm" data-testid="link-signup">
                  Sign up
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
