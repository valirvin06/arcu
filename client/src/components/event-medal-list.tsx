import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Trash } from "lucide-react";

interface EventMedalListProps {
  eventId: number;
}

export function EventMedalList({ eventId }: EventMedalListProps) {
  const [eventResult, setEventResult] = useState<any>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Get teams data for displaying non-winners and no-entries
  const { data: teams } = useQuery({
    queryKey: ["/api/teams"],
  });
  
  // Fetch results for this event
  const { data, isLoading, refetch } = useQuery({
    queryKey: [`/api/events/${eventId}/results`],
    refetchInterval: 2000, // Auto-refresh every 2 seconds
  });
  
  // Set event results when data changes
  useEffect(() => {
    if (data) {
      setEventResult(data);
    }
  }, [data]);
  
  // Delete medal mutation
  const deleteResultMutation = useMutation({
    mutationFn: async ({ resultId }: { resultId: number }) => {
      return apiRequest("DELETE", `/api/results/${resultId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/events/${eventId}/results`] });
      queryClient.invalidateQueries({ queryKey: ["/api/standings"] });
      
      toast({
        title: "Medal Removed",
        description: "The medal has been removed successfully.",
        variant: "default",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to remove medal. Please try again.",
        variant: "destructive",
      });
    }
  });
  
  if (isLoading) {
    return <div className="text-sm text-gray-500">Loading...</div>;
  }
  
  return (
    <div className="space-y-2">
      {/* Gold Medal */}
      <div className="flex items-center justify-between bg-gray-50 p-2 rounded">
        <div className="flex items-center">
          <div className="w-4 h-4 rounded-full bg-yellow-400 mr-2"></div>
          <span className="font-medium text-sm">Gold</span>
        </div>
        <div>
          {eventResult?.gold ? (
            <div className="flex items-center">
              <div 
                className="w-3 h-3 rounded-full mr-1" 
                style={{ backgroundColor: eventResult.gold.teamColor }}
              ></div>
              <span className="text-sm mr-2">{eventResult.gold.teamName}</span>
              <Button
                size="sm"
                variant="outline"
                className="h-7 px-2 text-xs"
                onClick={() => {
                  const result = eventResult.results.find(
                    (r: any) => r.teamId === eventResult.gold.teamId && 
                              r.medal === "gold"
                  );
                  if (result) {
                    deleteResultMutation.mutate({ resultId: result.id });
                  }
                }}
              >
                <Trash className="h-3 w-3 mr-1" />
                Remove
              </Button>
            </div>
          ) : (
            <span className="text-gray-400 text-xs">Not assigned</span>
          )}
        </div>
      </div>
      
      {/* Silver Medal */}
      <div className="flex items-center justify-between bg-gray-50 p-2 rounded">
        <div className="flex items-center">
          <div className="w-4 h-4 rounded-full bg-gray-300 mr-2"></div>
          <span className="font-medium text-sm">Silver</span>
        </div>
        <div>
          {eventResult?.silver ? (
            <div className="flex items-center">
              <div 
                className="w-3 h-3 rounded-full mr-1" 
                style={{ backgroundColor: eventResult.silver.teamColor }}
              ></div>
              <span className="text-sm mr-2">{eventResult.silver.teamName}</span>
              <Button
                size="sm"
                variant="outline"
                className="h-7 px-2 text-xs"
                onClick={() => {
                  const result = eventResult.results.find(
                    (r: any) => r.teamId === eventResult.silver.teamId && 
                              r.medal === "silver"
                  );
                  if (result) {
                    deleteResultMutation.mutate({ resultId: result.id });
                  }
                }}
              >
                <Trash className="h-3 w-3 mr-1" />
                Remove
              </Button>
            </div>
          ) : (
            <span className="text-gray-400 text-xs">Not assigned</span>
          )}
        </div>
      </div>
      
      {/* Bronze Medal */}
      <div className="flex items-center justify-between bg-gray-50 p-2 rounded">
        <div className="flex items-center">
          <div className="w-4 h-4 rounded-full bg-amber-700 mr-2"></div>
          <span className="font-medium text-sm">Bronze</span>
        </div>
        <div>
          {eventResult?.bronze ? (
            <div className="flex items-center">
              <div 
                className="w-3 h-3 rounded-full mr-1" 
                style={{ backgroundColor: eventResult.bronze.teamColor }}
              ></div>
              <span className="text-sm mr-2">{eventResult.bronze.teamName}</span>
              <Button
                size="sm"
                variant="outline"
                className="h-7 px-2 text-xs"
                onClick={() => {
                  const result = eventResult.results.find(
                    (r: any) => r.teamId === eventResult.bronze.teamId && 
                              r.medal === "bronze"
                  );
                  if (result) {
                    deleteResultMutation.mutate({ resultId: result.id });
                  }
                }}
              >
                <Trash className="h-3 w-3 mr-1" />
                Remove
              </Button>
            </div>
          ) : (
            <span className="text-gray-400 text-xs">Not assigned</span>
          )}
        </div>
      </div>

      {/* Non-Winner and No Entry Results */}
      {eventResult?.results && eventResult.results.filter((r: any) => r.medal === "non_winner" || r.medal === "no_entry").length > 0 && (
        <div className="mt-4">
          <h5 className="text-sm font-medium mb-2">Other Participants</h5>
          <div className="space-y-2">
            {eventResult.results
              .filter((r: any) => r.medal === "non_winner" || r.medal === "no_entry")
              .map((result: any) => {
                const team = result.teamId ? teams?.find((t: any) => t.id === result.teamId) : null;
                if (!team) return null;
                
                return (
                  <div key={result.id} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                    <div className="flex items-center">
                      <div 
                        className="w-3 h-3 rounded-full mr-1" 
                        style={{ backgroundColor: team.color }}
                      ></div>
                      <span className="text-sm">{team.name}</span>
                      <span className="ml-2 text-xs text-gray-500">
                        ({result.medal === "non_winner" ? "Non-Winner" : "No Entry"})
                      </span>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 px-2 text-xs"
                      onClick={() => deleteResultMutation.mutate({ resultId: result.id })}
                    >
                      <Trash className="h-3 w-3 mr-1" />
                      Remove
                    </Button>
                  </div>
                );
              })}
          </div>
        </div>
      )}
    </div>
  );
}