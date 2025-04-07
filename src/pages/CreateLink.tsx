
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/hooks/useAuth";
import { Navbar } from "@/components/Navbar";
import { createShortLink } from "@/lib/linkService";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeftIcon } from "lucide-react";

const CreateLink = () => {
  const [url, setUrl] = useState("");
  const [allowedEmails, setAllowedEmails] = useState("");
  const [enableTimeRestriction, setEnableTimeRestriction] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [newLinkId, setNewLinkId] = useState<string | null>(null);
  
  const { currentUser, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (!loading && !currentUser) {
      navigate("/");
    }
  }, [currentUser, loading, navigate]);

  const handleCreateLink = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentUser) {
      toast({
        title: "Authentication Required",
        description: "You must be logged in to create links",
        variant: "destructive",
      });
      return;
    }
    
    // Basic URL validation
    try {
      new URL(url);
    } catch (error) {
      toast({
        title: "Invalid URL",
        description: "Please enter a valid URL including http:// or https://",
        variant: "destructive",
      });
      return;
    }
    
    // Parse emails
    const emailList = allowedEmails
      .split(/[\s,;]+/)
      .map(email => email.trim())
      .filter(email => email.length > 0);
    
    if (emailList.length === 0) {
      toast({
        title: "No Emails Provided",
        description: "Please provide at least one authorized email address",
        variant: "destructive",
      });
      return;
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const invalidEmails = emailList.filter(email => !emailRegex.test(email));
    
    if (invalidEmails.length > 0) {
      toast({
        title: "Invalid Email Addresses",
        description: `The following emails are invalid: ${invalidEmails.join(", ")}`,
        variant: "destructive",
      });
      return;
    }
    
    try {
      setIsCreating(true);
      
      let startDateTime = null;
      let expiryDateTime = null;
      
      if (enableTimeRestriction) {
        if (startDate) {
          startDateTime = new Date(startDate);
        }
        
        if (expiryDate) {
          expiryDateTime = new Date(expiryDate);
        }
        
        // Validate dates
        if (startDateTime && expiryDateTime && startDateTime > expiryDateTime) {
          toast({
            title: "Invalid Date Range",
            description: "Start date must be before expiry date",
            variant: "destructive",
          });
          setIsCreating(false);
          return;
        }
      }
      
      const shortId = await createShortLink(
        url,
        currentUser.uid,
        currentUser.email!,
        emailList,
        startDateTime,
        expiryDateTime
      );
      
      setNewLinkId(shortId);
      
      toast({
        title: "Link Created Successfully",
        description: "Your secure short link has been created",
      });
    } catch (error) {
      console.error("Error creating link:", error);
      toast({
        title: "Error",
        description: "Could not create link. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };
  
  const copyToClipboard = () => {
    if (!newLinkId) return;
    
    const linkUrl = `${window.location.origin}/r/${newLinkId}`;
    navigator.clipboard.writeText(linkUrl);
    
    toast({
      title: "Link copied",
      description: "The link has been copied to your clipboard",
    });
  };
  
  const createNewLink = () => {
    setUrl("");
    setAllowedEmails("");
    setEnableTimeRestriction(false);
    setStartDate("");
    setExpiryDate("");
    setNewLinkId(null);
  };

  if (loading || !currentUser) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="pt-24 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto">
        <Button
          variant="ghost"
          className="mb-6 flex items-center"
          onClick={() => navigate("/dashboard")}
        >
          <ArrowLeftIcon className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>
        
        {newLinkId ? (
          <Card>
            <CardHeader>
              <CardTitle>Link Created Successfully</CardTitle>
              <CardDescription>
                Your secure link is ready to share with authorized users
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-green-50 border border-green-200 rounded-md">
                <p className="text-green-800 font-medium">Link created!</p>
                <p className="text-green-700 mt-1">
                  Only users with authorized email addresses will be able to access this link.
                </p>
              </div>
              
              <div>
                <Label>Your secure link</Label>
                <div className="flex mt-1.5">
                  <Input
                    readOnly
                    value={`${window.location.origin}/r/${newLinkId}`}
                    className="flex-1"
                  />
                  <Button 
                    className="ml-2"
                    onClick={copyToClipboard}
                  >
                    Copy
                  </Button>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={() => navigate("/dashboard")}>
                Go to Dashboard
              </Button>
              <Button onClick={createNewLink}>
                Create Another Link
              </Button>
            </CardFooter>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Create a Secure Link</CardTitle>
              <CardDescription>
                Create a shortened URL with access control
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateLink} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="url">Original URL</Label>
                  <Input
                    id="url"
                    type="url"
                    placeholder="https://example.com/your-long-url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="allowedEmails">
                    Authorized Email Addresses
                  </Label>
                  <Textarea
                    id="allowedEmails"
                    placeholder="Enter email addresses separated by commas or new lines"
                    value={allowedEmails}
                    onChange={(e) => setAllowedEmails(e.target.value)}
                    rows={3}
                    required
                  />
                  <p className="text-sm text-gray-500">
                    Only users with these email addresses will be able to access the link
                  </p>
                </div>
                
                <Separator />
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="timeRestriction">Enable Time Restrictions</Label>
                    <Switch
                      id="timeRestriction"
                      checked={enableTimeRestriction}
                      onCheckedChange={setEnableTimeRestriction}
                    />
                  </div>
                  
                  {enableTimeRestriction && (
                    <div className="grid gap-4 pt-2">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="startDate">Start Date (Optional)</Label>
                          <Input
                            id="startDate"
                            type="datetime-local"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="expiryDate">Expiry Date (Optional)</Label>
                          <Input
                            id="expiryDate"
                            type="datetime-local"
                            value={expiryDate}
                            onChange={(e) => setExpiryDate(e.target.value)}
                          />
                        </div>
                      </div>
                      <p className="text-sm text-gray-500">
                        Leave blank for no time restrictions
                      </p>
                    </div>
                  )}
                </div>
                
                <Button
                  type="submit"
                  className="w-full bg-blue-700 hover:bg-blue-800"
                  disabled={isCreating}
                >
                  {isCreating ? "Creating..." : "Create Secure Link"}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default CreateLink;
