
import { useState, useEffect, createContext, useContext, ReactNode } from "react";
import { 
  Auth, 
  User, 
  signInWithEmailLink, 
  isSignInWithEmailLink, 
  sendSignInLinkToEmail, 
  signOut as firebaseSignOut 
} from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";

interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  sendLoginLink: (email: string) => Promise<void>;
  completeSignIn: (email: string) => Promise<boolean>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setCurrentUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  // Check if the URL contains a sign-in link and handle it
  useEffect(() => {
    if (isSignInWithEmailLink(auth, window.location.href) && !currentUser) {
      // Get the email from localStorage
      const email = window.localStorage.getItem('emailForSignIn');
      if (email) {
        completeSignIn(email);
      } else {
        // Handle case where email isn't in localStorage
        toast({
          title: "Sign In Failed",
          description: "Could not find your email. Please try signing in again.",
          variant: "destructive",
        });
      }
    }
  }, []);

  const sendLoginLink = async (email: string) => {
    try {
      await sendSignInLinkToEmail(auth, email, {
        // URL you want to redirect to after sign-in
        url: window.location.href,
        handleCodeInApp: true,
      });
      
      // Save the email locally to complete the sign-in
      window.localStorage.setItem('emailForSignIn', email);
      
      toast({
        title: "Email Sent",
        description: "Check your email for a sign-in link",
      });
    } catch (error) {
      console.error("Error sending email link:", error);
      toast({
        title: "Error",
        description: "Could not send sign-in link. Please try again.",
        variant: "destructive",
      });
    }
  };

  const completeSignIn = async (email: string) => {
    try {
      await signInWithEmailLink(auth, email, window.location.href);
      
      // Clear email from storage
      window.localStorage.removeItem('emailForSignIn');
      
      // Remove the sign-in link from the URL
      if (window.history.replaceState) {
        window.history.replaceState({}, document.title, window.location.pathname);
      }
      
      toast({
        title: "Sign In Successful",
        description: "You're now logged in",
      });
      
      return true;
    } catch (error) {
      console.error("Error completing sign-in:", error);
      toast({
        title: "Sign In Failed",
        description: "Could not complete sign-in. Please try again.",
        variant: "destructive",
      });
      return false;
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
      toast({
        title: "Signed Out",
        description: "You've been successfully signed out",
      });
    } catch (error) {
      console.error("Error signing out:", error);
      toast({
        title: "Error",
        description: "Could not sign out. Please try again.",
        variant: "destructive",
      });
    }
  };

  const value = {
    currentUser,
    loading,
    sendLoginLink,
    completeSignIn,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
