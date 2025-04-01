import { useState, useEffect } from "react";
import Header from "@/components/header";
import Scoreboard from "@/components/scoreboard";
import EventCategories from "@/components/event-categories";
import AdminPanel from "@/components/admin-panel";
import Footer from "@/components/footer";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

export default function Home() {
  const [isAdmin, setIsAdmin] = useState(false);
  const { user } = useAuth();
  
  // Update admin status when user login state changes
  useEffect(() => {
    if (user) {
      setIsAdmin(true);
    } else {
      setIsAdmin(false);
    }
  }, [user]);
  
  // Dispatch an event when data is updated to update last updated timestamp
  useEffect(() => {
    const dispatchUpdateEvent = () => {
      window.dispatchEvent(new Event("storage-updated"));
    };
    
    // Set up a mock event for demonstration
    const interval = setInterval(() => {
      if (Math.random() > 0.7) {
        dispatchUpdateEvent();
      }
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);
  
  return (
    <div className="min-h-screen flex flex-col bg-gray-100 text-gray-800">
      <Header isAdmin={isAdmin} setIsAdmin={setIsAdmin} />
      
      <main className="container mx-auto px-4 py-8 flex-1">
        {isAdmin && (
          <Alert className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-6 rounded-md">
            <AlertTriangle className="h-5 w-5 text-yellow-500" />
            <AlertDescription className="ml-2 text-sm">
              <strong>Admin Mode Active:</strong> You can update scores in this mode. Changes will be reflected live for all viewers.
            </AlertDescription>
          </Alert>
        )}
        
        <Scoreboard isAdmin={isAdmin} />
        
        {isAdmin && <AdminPanel />}
        
        <EventCategories isAdmin={isAdmin} />
      </main>
      
      <Footer />
    </div>
  );
}
