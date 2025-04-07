import { db } from "@/lib/firebase";
import { 
  collection, 
  addDoc, 
  getDoc, 
  doc, 
  query, 
  where, 
  getDocs, 
  DocumentData,
  Timestamp 
} from "firebase/firestore";
import { nanoid } from "nanoid";

export interface LinkData {
  originalUrl: string;
  shortId: string;
  creatorUid: string;
  creatorEmail: string;
  allowedEmails: string[];
  createdAt: Timestamp;
  startTime?: Timestamp | null;
  expiryTime?: Timestamp | null;
}

export async function createShortLink(
  originalUrl: string, 
  creatorUid: string,
  creatorEmail: string,
  allowedEmails: string[],
  startTime?: Date | null,
  expiryTime?: Date | null
): Promise<string> {
  try {
    const shortId = nanoid(8);
    
    const linkData: LinkData = {
      originalUrl,
      shortId,
      creatorUid,
      creatorEmail,
      allowedEmails,
      createdAt: Timestamp.now(),
      startTime: startTime ? Timestamp.fromDate(startTime) : null,
      expiryTime: expiryTime ? Timestamp.fromDate(expiryTime) : null,
    };
    
    await addDoc(collection(db, "shortLinks"), linkData);
    
    return shortId;
  } catch (error) {
    console.error("Error creating short link:", error);
    throw error;
  }
}

export async function getLinkByShortId(shortId: string): Promise<LinkData | null> {
  try {
    const q = query(collection(db, "shortLinks"), where("shortId", "==", shortId));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      return null;
    }
    
    return querySnapshot.docs[0].data() as LinkData;
  } catch (error) {
    console.error("Error getting link:", error);
    throw error;
  }
}

export function canAccessLink(linkData: LinkData, userEmail: string): { 
  canAccess: boolean; 
  reason?: string;
} {
  if (!linkData.allowedEmails.includes(userEmail)) {
    return { canAccess: false, reason: "Your email is not authorized to access this link" };
  }
  
  const now = Timestamp.now();
  
  if (linkData.startTime && linkData.startTime.toMillis() > now.toMillis()) {
    return { 
      canAccess: false, 
      reason: `This link is not active yet. It will become available on ${linkData.startTime.toDate().toLocaleString()}` 
    };
  }
  
  if (linkData.expiryTime && linkData.expiryTime.toMillis() < now.toMillis()) {
    return { 
      canAccess: false, 
      reason: `This link has expired on ${linkData.expiryTime.toDate().toLocaleString()}` 
    };
  }
  
  return { canAccess: true };
}

export async function getUserLinks(userId: string): Promise<LinkData[]> {
  try {
    const q = query(collection(db, "shortLinks"), where("creatorUid", "==", userId));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => doc.data() as LinkData);
  } catch (error) {
    console.error("Error getting user links:", error);
    throw error;
  }
}
