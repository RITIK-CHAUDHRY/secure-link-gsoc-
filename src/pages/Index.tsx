
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { Navbar } from "@/components/Navbar";
import { LockIcon, ShieldIcon, UsersIcon, ClockIcon } from "lucide-react";

const Index = () => {
  const [email, setEmail] = useState("");
  const { currentUser, sendLoginLink, loading } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    await sendLoginLink(email);
  };

  if (currentUser) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="pt-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="text-center">
            <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl sm:tracking-tight lg:text-6xl">
              Secure URL Shortener
            </h1>
            <p className="mt-5 max-w-xl mx-auto text-xl text-gray-500">
              Create short links with access control that only authorized users can access.
            </p>
            <div className="mt-8 flex justify-center">
              <Button 
                onClick={() => navigate("/create")} 
                size="lg" 
                className="bg-blue-700 hover:bg-blue-800"
              >
                Create a Secure Link
              </Button>
            </div>
          </div>

          <div className="mt-20">
            <h2 className="text-3xl font-extrabold text-center text-gray-900">
              How It Works
            </h2>
            <div className="mt-12 grid gap-8 md:grid-cols-3">
              <Card>
                <CardHeader>
                  <UsersIcon className="h-8 w-8 text-blue-700 mb-2" />
                  <CardTitle>Restricted Access</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    Only specific email addresses that you authorize can access your shared links.
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <ClockIcon className="h-8 w-8 text-blue-700 mb-2" />
                  <CardTitle>Time-Based Controls</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    Set when your links become active and when they expire for temporary access.
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <ShieldIcon className="h-8 w-8 text-blue-700 mb-2" />
                  <CardTitle>Secure Authentication</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    Email-based authentication ensures only verified users can access protected links.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <LockIcon className="h-16 w-16 text-blue-700" />
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          SecureLink
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Secure URL shortener with access control
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <Card>
          <CardHeader>
            <CardTitle>Sign in with email</CardTitle>
            <CardDescription>
              We'll send you a magic link to log in securely.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <Input
                  id="email"
                  type="email"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  className="block w-full"
                />
              </div>
              <Button
                type="submit"
                className="w-full bg-blue-700 hover:bg-blue-800"
                disabled={loading}
              >
                {loading ? "Processing..." : "Send magic link"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Index;
