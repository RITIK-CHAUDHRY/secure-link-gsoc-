
import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useAuth } from "@/hooks/useAuth";
import { getLinkByShortId, canAccessLink, LinkData } from "@/lib/linkService";
import { ShieldAlertIcon, LockIcon, AlertTriangleIcon, ArrowRightIcon } from "lucide-react";
import { DocumentData } from "firebase/firestore";

const RedirectPage = () => {
  const { shortId } = useParams<{ shortId: string }>();
  const [linkData, setLinkData] = useState<LinkData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [accessDeniedReason, setAccessDeniedReason] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const { currentUser, loading, sendLoginLink } = useAuth();

  useEffect(() => {
    const fetchLinkData = async () => {
      if (!shortId) {
        setError("Invalid link ID");
        setIsLoading(false);
        return;
      }

      try {
        const data = await getLinkByShortId(shortId);
        if (!data) {
          setError("This link does not exist or has been removed");
          setIsLoading(false);
          return;
        }

        // Cast the DocumentData to LinkData
        const typedData = data as LinkData;
        setLinkData(typedData);
        
        // Check access if user is already logged in
        if (currentUser && currentUser.email) {
          checkAccess(typedData, currentUser.email);
        }
      } catch (err) {
        console.error("Error fetching link:", err);
        setError("Failed to load link data");
      } finally {
        setIsLoading(false);
      }
    };

    if (!loading) {
      fetchLinkData();
    }
  }, [shortId, currentUser, loading]);

  const checkAccess = (data: LinkData, userEmail: string) => {
    const accessCheck = canAccessLink(data, userEmail);
    
    if (!accessCheck.canAccess) {
      setAccessDeniedReason(accessCheck.reason || "You are not authorized to access this link");
    } else {
      // Redirect to the original URL
      window.location.href = data.originalUrl;
    }
  };

  const handleSendLoginLink = async (e: React.FormEvent) => {
    e.preventDefault();
    await sendLoginLink(email);
  };

  if (isLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center justify-center">
              <AlertTriangleIcon className="h-8 w-8 text-yellow-500 mr-2" />
              <span>Link Not Found</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Alert variant="destructive">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
            <div className="mt-6 text-center">
              <Link to="/">
                <Button>Go to Home</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (accessDeniedReason) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center justify-center">
              <ShieldAlertIcon className="h-8 w-8 text-red-500 mr-2" />
              <span>Access Denied</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Alert variant="destructive" className="mb-4">
              <AlertTitle>Permission Denied</AlertTitle>
              <AlertDescription>{accessDeniedReason}</AlertDescription>
            </Alert>
            <p className="text-sm text-gray-500 mt-4">
              If you believe you should have access to this link, please contact the person who shared it with you.
            </p>
            <div className="mt-6 text-center">
              <Link to="/">
                <Button>Go to Home</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center justify-center">
              <LockIcon className="h-8 w-8 text-blue-700 mr-2" />
              <span>Authentication Required</span>
            </CardTitle>
            <CardDescription className="text-center">
              This is a secure link that requires authentication
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <p className="text-sm text-gray-600">
                To access this secure link, please sign in with your email address.
                We'll send you a magic link for secure authentication.
              </p>
            </div>
            
            <form onSubmit={handleSendLoginLink} className="space-y-4">
              <div>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                />
              </div>
              <Button
                type="submit"
                className="w-full bg-blue-700 hover:bg-blue-800"
              >
                Send Magic Link
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  // This is a fallback, should not normally be reached since we redirect on successful auth
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Processing your request</CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <p className="mb-4">You're authenticated. Redirecting you to the original URL...</p>
          <Button 
            onClick={() => window.location.href = linkData?.originalUrl}
            className="mt-2"
          >
            <ArrowRightIcon className="mr-2 h-4 w-4" />
            Click here if you're not redirected
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default RedirectPage;
