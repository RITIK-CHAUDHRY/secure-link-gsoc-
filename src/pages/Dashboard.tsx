
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { Navbar } from "@/components/Navbar";
import { getUserLinks } from "@/lib/linkService";
import { ClipboardIcon, CalendarIcon, UsersIcon, ArrowRightIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { DocumentData, Timestamp } from "firebase/firestore";

interface LinkDisplayData {
  shortId: string;
  originalUrl: string;
  createdAt: Timestamp;
  startTime?: Timestamp | null;
  expiryTime?: Timestamp | null;
  allowedEmails: string[];
}

const Dashboard = () => {
  const { currentUser, loading } = useAuth();
  const [links, setLinks] = useState<LinkDisplayData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const fetchLinks = async () => {
      if (!currentUser) return;
      
      try {
        setIsLoading(true);
        const userLinks = await getUserLinks(currentUser.uid);
        setLinks(userLinks as LinkDisplayData[]);
      } catch (error) {
        console.error("Error fetching links:", error);
        toast({
          title: "Error",
          description: "Could not load your links. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (currentUser) {
      fetchLinks();
    }
  }, [currentUser]);

  useEffect(() => {
    if (!loading && !currentUser) {
      navigate("/");
    }
  }, [currentUser, loading, navigate]);

  const copyToClipboard = (shortId: string) => {
    const linkUrl = `${window.location.origin}/r/${shortId}`;
    navigator.clipboard.writeText(linkUrl);
    toast({
      title: "Link copied",
      description: "The link has been copied to your clipboard",
    });
  };

  if (loading || !currentUser) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="pt-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Your Secure Links</h1>
            <p className="mt-1 text-gray-500">Manage all your secure shortened URLs</p>
          </div>
          <Button
            onClick={() => navigate("/create")}
            className="mt-4 sm:mt-0 bg-blue-700 hover:bg-blue-800"
          >
            Create New Link
          </Button>
        </div>

        {isLoading ? (
          <div className="flex justify-center my-12">
            <p>Loading your links...</p>
          </div>
        ) : links.length === 0 ? (
          <Card>
            <CardContent className="py-10">
              <div className="text-center">
                <h3 className="text-lg font-medium text-gray-900">No links yet</h3>
                <p className="mt-1 text-gray-500">
                  You haven't created any secure links yet.
                </p>
                <div className="mt-6">
                  <Button
                    onClick={() => navigate("/create")}
                    className="bg-blue-700 hover:bg-blue-800"
                  >
                    Create your first link
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {links.map((link) => (
              <Card key={link.shortId} className="overflow-hidden">
                <CardHeader className="pb-3">
                  <CardTitle className="truncate text-lg">{new URL(link.originalUrl).hostname}</CardTitle>
                  <CardDescription className="truncate">{link.originalUrl}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 pt-0">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center text-sm text-gray-500">
                      <CalendarIcon className="mr-1 h-4 w-4" />
                      <span>Created: {link.createdAt.toDate().toLocaleDateString()}</span>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => copyToClipboard(link.shortId)}
                    >
                      <ClipboardIcon className="h-4 w-4 mr-1" />
                      Copy
                    </Button>
                  </div>
                  
                  <div className="text-sm text-gray-500 flex items-center">
                    <UsersIcon className="mr-1 h-4 w-4" />
                    <span>{link.allowedEmails.length} authorized user(s)</span>
                  </div>
                  
                  {(link.startTime || link.expiryTime) && (
                    <div className="text-sm text-gray-500">
                      {link.startTime && (
                        <div>
                          Active from: {link.startTime.toDate().toLocaleDateString()}
                        </div>
                      )}
                      {link.expiryTime && (
                        <div>
                          Expires: {link.expiryTime.toDate().toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  )}
                  
                  <div className="pt-2">
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => window.open(`/r/${link.shortId}`, '_blank')}
                    >
                      <ArrowRightIcon className="mr-2 h-4 w-4" />
                      Visit Link
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
        
        {/* Placeholder for future features */}
        <div className="mt-16 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-medium text-blue-800">Coming soon</h3>
          <ul className="mt-4 space-y-2 text-blue-700">
            <li className="flex items-center">
              <span className="mr-2">•</span>
              Email notifications when your links are accessed
            </li>
            <li className="flex items-center">
              <span className="mr-2">•</span>
              Comprehensive access logs and analytics
            </li>
            <li className="flex items-center">
              <span className="mr-2">•</span>
              Edit and update existing links
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
