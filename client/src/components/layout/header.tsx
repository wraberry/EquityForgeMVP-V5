import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { 
  Menu, 
  X, 
  User, 
  Settings, 
  LogOut, 
  Briefcase, 
  MessageCircle, 
  Plus,
  Building,
  Search
} from "lucide-react";

export default function Header() {
  const { user, isAuthenticated } = useAuth();
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    window.location.href = "/api/logout";
  };

  const handleLogin = () => {
    window.location.href = "/user-type-selection";
  };

  const isActive = (path: string) => location === path;

  const isTalent = user?.userType === "talent";
  const isOrganization = user?.userType === "organization";

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/">
              <h1 className="text-2xl font-bold text-primary cursor-pointer">
                EquityForge.io
              </h1>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            {!isAuthenticated && (
              <a 
                href="https://www.equityforge.io/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center text-gray-700 hover:text-primary transition-colors duration-200"
              >
                About
              </a>
            )}
            
            {isAuthenticated && (
              <>
                <Link href="/opportunities">
                  <a className={`flex items-center text-gray-700 hover:text-primary transition-colors duration-200 ${
                    isActive("/opportunities") ? "text-primary font-medium" : ""
                  }`}>
                    <Search className="w-4 h-4 mr-2" />
                    Find Opportunities
                  </a>
                </Link>
                
                {isOrganization && (
                  <Link href="/post-opportunity">
                    <a className={`flex items-center text-gray-700 hover:text-primary transition-colors duration-200 ${
                      isActive("/post-opportunity") ? "text-primary font-medium" : ""
                    }`}>
                      <Plus className="w-4 h-4 mr-2" />
                      Post Opportunity
                    </a>
                  </Link>
                )}
                
                <Link href="/messages">
                  <a className={`flex items-center text-gray-700 hover:text-primary transition-colors duration-200 ${
                    isActive("/messages") ? "text-primary font-medium" : ""
                  }`}>
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Messages
                  </a>
                </Link>
              </>
            )}
          </nav>

          {/* Auth Section */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                    <Avatar>
                      <AvatarImage src={user?.profileImageUrl || undefined} />
                      <AvatarFallback>
                        {user?.firstName?.[0]}{user?.lastName?.[0]}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <div className="flex items-center justify-start gap-2 p-2">
                    <div className="flex flex-col space-y-1 leading-none">
                      <p className="font-medium">{user?.firstName} {user?.lastName}</p>
                      <p className="w-[200px] truncate text-sm text-muted-foreground">
                        {user?.email}
                      </p>
                      <div className="flex items-center gap-1">
                        <Badge variant="outline" className="text-xs">
                          {isTalent && <User className="w-3 h-3 mr-1" />}
                          {isOrganization && <Building className="w-3 h-3 mr-1" />}
                          {isTalent ? "Talent" : "Organization"}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/">
                      <div className="flex items-center">
                        <Briefcase className="mr-2 h-4 w-4" />
                        Dashboard
                      </div>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/profile">
                      <div className="flex items-center">
                        <User className="mr-2 h-4 w-4" />
                        Profile
                      </div>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Button variant="ghost" onClick={handleLogin}>
                  Sign In
                </Button>
                <Button onClick={handleLogin}>
                  Get Started
                </Button>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200">
            {!isAuthenticated && (
              <nav className="flex flex-col space-y-4">
                <a 
                  href="https://www.equityforge.io/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center text-gray-700 hover:text-primary transition-colors duration-200"
                >
                  About
                </a>
                <div className="flex flex-col space-y-2 pt-4 border-t border-gray-200">
                  <Button variant="ghost" onClick={handleLogin} className="justify-start">
                    Sign In
                  </Button>
                  <Button onClick={handleLogin} className="justify-start">
                    Get Started
                  </Button>
                </div>
              </nav>
            )}
            
            {isAuthenticated ? (
              <nav className="flex flex-col space-y-4">
                <Link href="/opportunities">
                  <a className={`flex items-center text-gray-700 hover:text-primary transition-colors duration-200 ${
                    isActive("/opportunities") ? "text-primary font-medium" : ""
                  }`}>
                    <Search className="w-4 h-4 mr-2" />
                    Find Opportunities
                  </a>
                </Link>
                
                {isOrganization && (
                  <Link href="/post-opportunity">
                    <a className={`flex items-center text-gray-700 hover:text-primary transition-colors duration-200 ${
                      isActive("/post-opportunity") ? "text-primary font-medium" : ""
                    }`}>
                      <Plus className="w-4 h-4 mr-2" />
                      Post Opportunity
                    </a>
                  </Link>
                )}
                
                <Link href="/messages">
                  <a className={`flex items-center text-gray-700 hover:text-primary transition-colors duration-200 ${
                    isActive("/messages") ? "text-primary font-medium" : ""
                  }`}>
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Messages
                  </a>
                </Link>

                <div className="flex flex-col space-y-2 pt-4 border-t border-gray-200">
                  <div className="flex items-center space-x-3 py-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user?.profileImageUrl || undefined} />
                      <AvatarFallback className="text-xs">
                        {user?.firstName?.[0]}{user?.lastName?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">{user?.firstName} {user?.lastName}</p>
                      <Badge variant="outline" className="text-xs">
                        {isTalent && <User className="w-3 h-3 mr-1" />}
                        {isOrganization && <Building className="w-3 h-3 mr-1" />}
                        {isTalent ? "Talent" : "Organization"}
                      </Badge>
                    </div>
                  </div>
                  
                  <Link href="/">
                    <a className="flex items-center text-gray-700 hover:text-primary transition-colors duration-200 py-2">
                      <Briefcase className="w-4 h-4 mr-2" />
                      Dashboard
                    </a>
                  </Link>
                  
                  <Link href="/profile">
                    <a className="flex items-center text-gray-700 hover:text-primary transition-colors duration-200 py-2">
                      <User className="w-4 h-4 mr-2" />
                      Profile
                    </a>
                  </Link>
                  
                  <Button 
                    variant="ghost" 
                    onClick={handleLogout}
                    className="justify-start px-0 text-gray-700 hover:text-primary"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Log out
                  </Button>
                </div>
              </nav>
            ) : (
              <div className="flex flex-col space-y-2">
                <Button variant="ghost" onClick={handleLogin} className="justify-start">
                  Sign In
                </Button>
                <Button onClick={handleLogin} className="justify-start">
                  Get Started
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
