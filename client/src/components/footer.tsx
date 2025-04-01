import { useState, useEffect } from "react";
import { formatDate } from "@/lib/utils";

export default function Footer() {
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  // Update when data changes
  useEffect(() => {
    const updateTimestamp = () => {
      setLastUpdated(new Date());
    };

    // Listen for events that would trigger a timestamp update
    window.addEventListener("storage-updated", updateTimestamp);

    return () => {
      window.removeEventListener("storage-updated", updateTimestamp);
    };
  }, []);

  return (
    <footer className="bg-gray-800 text-white py-6">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <p className="text-sm">Live Competition Scoring System</p>
            <p className="text-xs text-gray-400">Last Updated: <span id="lastUpdated">{formatDate(lastUpdated)}</span></p>
          </div>
          <div>
            <p className="text-xs text-gray-400">© {new Date().getFullYear()} All Rights Reserved</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
