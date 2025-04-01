import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { Link } from "wouter";
import { Loader2 } from "lucide-react";

interface HeaderProps {
  isAdmin: boolean;
  setIsAdmin: (isAdmin: boolean) => void;
}

export default function Header({ isAdmin, setIsAdmin }: HeaderProps) {
  const { user, isLoading, logoutMutation } = useAuth();
  
  const toggleAdminMode = () => {
    setIsAdmin(true);
  };

  const toggleViewMode = () => {
    setIsAdmin(false);
  };
  
  const handleLogout = () => {
    logoutMutation.mutate();
    setIsAdmin(false);
  };

  return (
    <header className="bg-[#2563eb] text-white shadow-md">
      <div className="container mx-auto px-4 py-4 flex flex-col md:flex-row justify-between items-center">
        <div className="flex items-center mb-4 md:mb-0">
          <Link href="/">
            <h1 className="text-2xl font-bold hover:text-blue-200 transition-colors cursor-pointer">
              2025 USTP Claveria ArCu Days Live Scores
            </h1>
          </Link>
        </div>
        <div className="flex space-x-4">
          {user ? (
            <>
              <div className="hidden md:flex items-center text-sm mr-2">
                <span>Logged in as Admin</span>
              </div>
              
              <Button
                variant={isAdmin ? "secondary" : "outline"}
                className={`
                  ${isAdmin 
                    ? "bg-[#2563eb] text-white border border-white hover:bg-blue-700" 
                    : "bg-white text-[#2563eb] hover:bg-gray-100"}
                `}
                onClick={toggleAdminMode}
                disabled={logoutMutation.isPending}
              >
                Admin Mode
              </Button>
              
              <Button
                variant={!isAdmin ? "secondary" : "outline"}
                className={`
                  ${!isAdmin 
                    ? "bg-[#2563eb] text-white border border-white hover:bg-blue-700" 
                    : "bg-white text-[#2563eb] hover:bg-gray-100"}
                `}
                onClick={toggleViewMode}
                disabled={logoutMutation.isPending}
              >
                View Mode
              </Button>
              
              <Button
                variant="destructive"
                onClick={handleLogout}
                disabled={logoutMutation.isPending}
              >
                {logoutMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Logging Out...
                  </>
                ) : (
                  "Logout"
                )}
              </Button>
            </>
          ) : (
            <Button
              variant="outline"
              className="bg-white text-[#2563eb] hover:bg-gray-100"
              asChild
            >
              <Link href="/auth">Admin Login</Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
