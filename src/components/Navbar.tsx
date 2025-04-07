
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { LockIcon } from "lucide-react";

export function Navbar() {
  const { currentUser, signOut } = useAuth();

  return (
    <nav className="bg-white border-b border-gray-200 fixed w-full z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link to="/" className="flex items-center">
                <LockIcon className="h-8 w-8 text-blue-700" />
                <span className="ml-2 text-xl font-bold text-gray-900">SecureLink</span>
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Link 
                to="/" 
                className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300"
              >
                Home
              </Link>
              {currentUser && (
                <>
                  <Link 
                    to="/create" 
                    className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  >
                    Create Link
                  </Link>
                  <Link 
                    to="/dashboard" 
                    className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  >
                    Dashboard
                  </Link>
                </>
              )}
            </div>
          </div>
          <div className="flex items-center">
            {currentUser ? (
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-500">{currentUser.email}</span>
                <Button 
                  variant="outline" 
                  onClick={signOut}
                >
                  Sign Out
                </Button>
              </div>
            ) : (
              <Link to="/">
                <Button>Sign In</Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
