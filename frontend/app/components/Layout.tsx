import type { ReactNode } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { BookText, Home, LogOut, Settings, User } from "lucide-react";
import { useEffect, useState } from "react";
import Button from "./Button";
import AccountModal from "./AccountModal";
import { fetchUserProfile, logoutUser } from "../services/account";

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  
  // Helper function to get cookie by name
  const getCookie = (name: string): string | null => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
    return null;
  };
  
  useEffect(() => {
    const checkAuth = async () => {
      setIsLoading(true);
      const sessionCookie = getCookie("thoughtful_session");
      
      if (sessionCookie) {
        try {
          const response = await fetchUserProfile();
          if (response.state === false) {
            setUser(null);
          } else {
            setUser(response.user?.username || null);
          }
        } catch (error) {
          console.error("Error fetching user profile:", error);
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setIsLoading(false);
    };
    
    checkAuth();
  }, [location]);
  
  const isActive = (path: string) => location.pathname === path;
  
  const handleLogout = async () => {
    try {
      await logoutUser();
      // Clear the cookie by setting it to expire
      document.cookie = "thoughtful_session=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      setUser(null);
      navigate("/");
    } catch (error) {
      console.error("Error logging out:", error);
      // Still clear locally even if server request fails
      document.cookie = "thoughtful_session=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      setUser(null);
      navigate("/");
    }
  };

  const handleAccountDeleted = () => {
    // Clear the cookie by setting it to expire
    document.cookie = "thoughtful_session=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    setUser(null);
    navigate("/");
  };
  
  return (
    <div className="min-h-screen bg-[var(--color-bg-primary)]">
      {/* Navigation */}
      <nav className="sticky top-0 z-40 bg-[var(--color-bg-secondary)]/80 backdrop-blur-lg border-b border-[var(--color-border)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2 group">
              <div className="w-8 h-8 bg-gradient-to-br from-[var(--color-accent)] to-[var(--color-accent-light)] rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                <span className="text-white font-bold text-lg">T</span>
              </div>
              <span className="text-xl font-bold text-[var(--color-text-primary)] group-hover:text-[var(--color-accent)] transition-colors">
                Thoughtful
              </span>
            </Link>
            
            {/* Nav Links */}
            <div className="flex items-center space-x-2">
              <Link
                to="/"
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
                  isActive("/")
                    ? "bg-[var(--color-bg-elevated)] text-[var(--color-text-primary)]"
                    : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-tertiary)]"
                }`}
              >
                <Home className="w-4 h-4" />
                <span className="font-medium hidden sm:inline">Home</span>
              </Link>
              <Link
                to="/notebook"
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
                  isActive("/notebook")
                    ? "bg-[var(--color-bg-elevated)] text-[var(--color-text-primary)]"
                    : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-tertiary)]"
                }`}
              >
                <BookText className="w-4 h-4" />
                <span className="font-medium hidden sm:inline">Notebook</span>
              </Link>
              
              {/* Auth Buttons */}
              {user ? (
                <div className="flex items-center space-x-2 ml-2 pl-2 border-l border-[var(--color-border)]">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-[var(--color-accent)] rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-sm text-[var(--color-text-secondary)] hidden sm:inline">
                      {user}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsAccountModalOpen(true)}
                    className="flex items-center space-x-1"
                  >
                    <Settings className="w-4 h-4" />
                    <span className="hidden sm:inline">Account</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleLogout}
                    className="flex items-center space-x-1"
                  >
                    <LogOut className="w-4 h-4" />
                    <span className="hidden sm:inline">Logout</span>
                  </Button>
                </div>
              ) : (
                <div className="flex items-center space-x-2 ml-2 pl-2 border-l border-[var(--color-border)]">
                  <Link to="/login">
                    <Button variant="ghost" size="sm" disabled={isLoading}>
                      Sign In
                    </Button>
                  </Link>
                  <Link to="/register">
                    <Button variant="primary" size="sm" disabled={isLoading}>
                      Sign Up
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>
      
      {/* Main Content */}
      <main>{children}</main>

      {/* Account Modal */}
      {user && (
        <AccountModal
          isOpen={isAccountModalOpen}
          onClose={() => setIsAccountModalOpen(false)}
          username={user}
          onAccountDeleted={handleAccountDeleted}
        />
      )}
    </div>
  );
}
