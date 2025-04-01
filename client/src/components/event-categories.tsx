import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  getCategoryBgClass, 
  getCategoryTextClass,
  getMedalClass,
  formatMedalName,
  getTeamDotColor
} from "@/lib/utils";
import { apiRequest } from "@/lib/queryClient";
import { MEDAL_OPTIONS, TEAM_COLORS } from "@/lib/constants";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ChevronDown,
  ChevronUp,
  Trash2
} from "lucide-react";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { EventMedalList } from "@/components/event-medal-list";

interface EventCategoriesProps {
  isAdmin: boolean;
}

export default function EventCategories({ isAdmin }: EventCategoriesProps) {
  // Define types for API responses
  type CategoryWithEvents = {
    category: {
      id: number;
      name: string;
      color: string;
    };
    events: {
      id: number;
      name: string;
      categoryId: number;
    }[];
  };
  
  type TeamData = {
    id: number;
    name: string;
    color: string;
  };
  
  type EventResultData = {
    eventId: number;
    eventName: string;
    gold?: { teamId: number; teamName: string; teamColor: string };
    silver?: { teamId: number; teamName: string; teamColor: string };
    bronze?: { teamId: number; teamName: string; teamColor: string };
    results: {
      id: number;
      teamId: number;
      eventId: number;
      medal: string;
      points: number;
    }[];
  };
  
  const { data: categoriesWithEvents, isLoading } = useQuery<CategoryWithEvents[]>({
    queryKey: ["/api/categories"],
  });
  
  const { data: teams } = useQuery<TeamData[]>({
    queryKey: ["/api/teams"],
  });
  
  // Query to check if results are published
  const { data: publicationStatus } = useQuery<{ published: boolean }>({
    queryKey: ["/api/results/published"],
  });
  
  const [expandedCategories, setExpandedCategories] = useState<Record<number, boolean>>({});
  const [expandedEvents, setExpandedEvents] = useState<Record<number, boolean>>({});
  const [selectedMedals, setSelectedMedals] = useState<Record<string, string>>({});
  const [eventResults, setEventResults] = useState<Record<number, EventResultData>>({});
  
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  // Fetch event results when needed
  useEffect(() => {
    if (!categoriesWithEvents || !expandedCategories) return;
    
    async function fetchEventResults() {
      if (!categoriesWithEvents) return;
      for (const { events } of categoriesWithEvents) {
        for (const event of events) {
          try {
            const response = await fetch(`/api/events/${event.id}/results`);
            if (response.ok) {
              const data = await response.json();
              setEventResults(prev => ({
                ...prev,
                [event.id]: data
              }));
            }
          } catch (error) {
            console.error(`Failed to fetch results for event ${event.id}:`, error);
          }
        }
      }
    }
    
    fetchEventResults();
  }, [categoriesWithEvents, expandedCategories]);
  
  const updateScoreMutation = useMutation({
    mutationFn: async ({ teamId, eventId, medal }: { teamId: number; eventId: number; medal: string }) => {
      return apiRequest("POST", "/api/results/update", { teamId, eventId, medal });
    },
    onSuccess: async (data) => {
      const result = await data.json();
      queryClient.invalidateQueries({ queryKey: ["/api/standings"] });
      queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
      
      // Update local event results state with the updated data
      if (result.eventResults) {
        setEventResults(prev => ({
          ...prev,
          [result.eventResults.eventId]: result.eventResults
        }));
      }
      
      toast({
        title: "Score Updated",
        description: "The score has been updated successfully.",
        variant: "default",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update score. Please try again.",
        variant: "destructive",
      });
    }
  });
  
  // Delete result/medal mutation
  const deleteResultMutation = useMutation({
    mutationFn: async ({ resultId }: { resultId: number }) => {
      return apiRequest("DELETE", `/api/results/${resultId}`);
    },
    onSuccess: async (data) => {
      const result = await data.json();
      queryClient.invalidateQueries({ queryKey: ["/api/standings"] });
      queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
      
      // Update local event results state with the updated data
      if (result.eventId) {
        // Reload the event results to update the UI
        try {
          const response = await fetch(`/api/events/${result.eventId}/results`);
          if (response.ok) {
            const updatedEventResults = await response.json();
            setEventResults(prev => ({
              ...prev,
              [result.eventId]: updatedEventResults
            }));
          }
        } catch (error) {
          console.error("Failed to refresh event results:", error);
        }
      }
      
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
  
  const toggleCategory = (categoryId: number) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }));
  };
  
  const toggleEvent = (eventId: number) => {
    setExpandedEvents(prev => ({
      ...prev,
      [eventId]: !prev[eventId]
    }));
  };
  
  const handleMedalChange = (eventId: number, teamId: number | undefined, value: string) => {
    if (teamId === undefined) return;
    
    setSelectedMedals(prev => ({
      ...prev,
      [`${eventId}-${teamId}`]: value
    }));
  };
  
  const handleUpdateScore = (eventId: number, teamId: number) => {
    const medal = selectedMedals[`${eventId}-${teamId}`];
    if (!medal) return;
    
    updateScoreMutation.mutate({ teamId, eventId, medal });
  };
  
  // Handle deleting a result/medal
  const handleDeleteResult = (resultId: number) => {
    if (window.confirm("Are you sure you want to remove this medal? This action cannot be undone.")) {
      deleteResultMutation.mutate({ resultId });
    }
  };
  
  if (isLoading) {
    return (
      <section className="mb-10">
        <h2 className="text-2xl font-bold mb-6">Event Categories</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="px-6 py-4">
                <div className="flex justify-between items-center">
                  <Skeleton className="h-6 w-36" />
                  <Skeleton className="h-5 w-5 rounded-full" />
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {[...Array(3)].map((_, j) => (
                    <div key={j} className="space-y-2">
                      <Skeleton className="h-5 w-44" />
                      <Skeleton className="h-6 w-full" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    );
  }
  
  return (
    <section className="mb-10">
      <h2 className="text-2xl font-bold mb-6">Event Categories</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categoriesWithEvents?.map(({ category, events }) => (
          <Card key={category.id} className="overflow-hidden">
            <CardHeader 
              className={`px-6 py-4 ${getCategoryBgClass(category.color)} border-b border-gray-200 cursor-pointer`}
              onClick={() => toggleCategory(category.id)}
            >
              <div className="flex justify-between items-center">
                <CardTitle className={`text-lg font-bold ${getCategoryTextClass(category.color)}`}>
                  {category.name}
                </CardTitle>
                {expandedCategories[category.id] ? (
                  <ChevronUp className={`w-5 h-5 ${getCategoryTextClass(category.color)}`} />
                ) : (
                  <ChevronDown className={`w-5 h-5 ${getCategoryTextClass(category.color)}`} />
                )}
              </div>
            </CardHeader>
            
            {(expandedCategories[category.id] || expandedCategories[category.id] === undefined) && (
              <CardContent className="p-6">
                <ul className="space-y-4">
                  {events.map(event => {
                    const eventResult = eventResults[event.id];
                    
                    return (
                      <li key={event.id} className="event-item">
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-medium">{event.name}</span>
                          
                          {isAdmin ? (
                            <div className="admin-controls">
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => toggleEvent(event.id)}
                                className="px-3 py-1 h-8 text-xs"
                              >
                                {expandedEvents[event.id] ? 'Hide Details' : 'View Details'}
                              </Button>
                            </div>
                          ) : (
                            <div className="medal-display flex items-center space-x-2">
                              {(publicationStatus?.published || isAdmin) ? (
                                <>
                                  {eventResult?.gold && (
                                    <span className={`text-xs px-2 py-1 rounded ${getMedalClass('gold')}`}>
                                      {eventResult.gold.teamName}
                                    </span>
                                  )}
                                  {eventResult?.silver && (
                                    <span className={`text-xs px-2 py-1 rounded ${getMedalClass('silver')}`}>
                                      {eventResult.silver.teamName}
                                    </span>
                                  )}
                                  {eventResult?.bronze && (
                                    <span className={`text-xs px-2 py-1 rounded ${getMedalClass('bronze')}`}>
                                      {eventResult.bronze.teamName}
                                    </span>
                                  )}
                                </>
                              ) : (
                                <span className="text-xs text-gray-500 italic">Results pending publication</span>
                              )}
                            </div>
                          )}
                        </div>
                        
                        {isAdmin && expandedEvents[event.id] && teams && (
                          <div className="admin-view">
                            <div className="bg-gray-50 rounded-md p-3">
                              <EventMedalList eventId={event.id} />
                              <div className="text-xs text-gray-500 mt-3 italic">
                                To update medals, please use the Admin Panel above
                              </div>
                            </div>
                          </div>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </CardContent>
            )}
          </Card>
        ))}
      </div>
    </section>
  );
}
