import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { MEDAL_OPTIONS } from "@/lib/constants";
import { useToast } from "@/hooks/use-toast";
import { EventMedalList } from "./event-medal-list";


import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  AlertCircle, 
  CheckCircle2, 
  Upload, 
  Trash, 
  PlusCircle,
  Send,
  Image
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

export default function AdminPanel() {
  const [selectedEvent, setSelectedEvent] = useState<string>("");
  const [selectedTeam, setSelectedTeam] = useState<string>("");
  const [selectedMedal, setSelectedMedal] = useState<string>("");
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [validationMessage, setValidationMessage] = useState<string | null>(null);
  const [selectedTeamForIcon, setSelectedTeamForIcon] = useState<number | null>(null);
  const [iconData, setIconData] = useState<string>("");
  const [newEventName, setNewEventName] = useState<string>("");
  const [newEventCategory, setNewEventCategory] = useState<string>("");
  
  // Bulk update state
  const [selectedBulkEvent, setSelectedBulkEvent] = useState<string>("");
  const [selectedBulkMedal, setSelectedBulkMedal] = useState<string>("");
  const [selectedTeams, setSelectedTeams] = useState<number[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  
  // Get categories with events
  const { data: categoriesWithEvents } = useQuery({
    queryKey: ["/api/categories"],
  });
  
  // Get all teams
  const { data: teams } = useQuery({
    queryKey: ["/api/teams"],
  });
  
  // Query to check if results are published
  const { data: publicationStatus } = useQuery<{ published: boolean }>({
    queryKey: ["/api/results/published"],
    refetchInterval: 2000, // Auto-refresh every 2 seconds
  });
  
  // We'll use this state variable for the Medal Management Tab
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");
  
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const updateScoreMutation = useMutation({
    mutationFn: async ({ teamId, eventId, medal }: { teamId: number; eventId: number; medal: string }) => {
      return apiRequest("POST", "/api/results/update", { teamId, eventId, medal });
    },
    onSuccess: async (data) => {
      const result = await data.json();
      queryClient.invalidateQueries({ queryKey: ["/api/standings"] });
      queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
      
      setUpdateSuccess(true);
      setTimeout(() => setUpdateSuccess(false), 3000);
      
      toast({
        title: "Score Updated",
        description: "The score has been updated successfully.",
        variant: "default",
      });
      
      // Clear validation message if there was one
      setValidationMessage(null);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update score. Please try again.",
        variant: "destructive",
      });
      
      if (error.message && error.message.includes("already assigned")) {
        setValidationMessage(error.message);
      }
    }
  });
  
  // Team icon update mutation
  const updateTeamIconMutation = useMutation({
    mutationFn: async ({ teamId, icon }: { teamId: number; icon: string }) => {
      return apiRequest("POST", `/api/teams/${teamId}/icon`, { icon });
    },
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: ["/api/teams"] });
      setIconData("");
      setSelectedTeamForIcon(null);
      
      toast({
        title: "Team Icon Updated",
        description: "The team icon has been updated successfully.",
        variant: "default",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update team icon. Please try again.",
        variant: "destructive",
      });
    }
  });
  
  // Add new event mutation
  const addEventMutation = useMutation({
    mutationFn: async ({ name, categoryId }: { name: string; categoryId: number }) => {
      return apiRequest("POST", "/api/events", { name, categoryId });
    },
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
      setNewEventName("");
      setNewEventCategory("");
      
      toast({
        title: "Event Added",
        description: "The new event has been added successfully.",
        variant: "default",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add new event. Please try again.",
        variant: "destructive",
      });
    }
  });
  
  // Delete medal/result mutation
  const deleteResultMutation = useMutation({
    mutationFn: async ({ resultId }: { resultId: number }) => {
      return apiRequest("DELETE", `/api/results/${resultId}`);
    },
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: ["/api/standings"] });
      queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
      
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
  
  // Publish results toggle mutation
  const publishResultsMutation = useMutation({
    mutationFn: async ({ publish }: { publish: boolean }) => {
      return apiRequest("POST", "/api/results/publish", { publish });
    },
    onSuccess: async (data) => {
      // Invalidate the publication status query to refresh it
      queryClient.invalidateQueries({ queryKey: ["/api/results/published"] });
      
      const newState = !(publicationStatus?.published ?? false);
      toast({
        title: newState ? "Results Published" : "Results Hidden",
        description: newState ? "Results are now visible to all viewers." : "Results are now hidden from viewers.",
        variant: "default",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update publication status. Please try again.",
        variant: "destructive",
      });
    }
  });
  
  const handleUpdateScore = () => {
    if (!selectedEvent || !selectedTeam || !selectedMedal) {
      toast({
        title: "Incomplete Form",
        description: "Please select an event, team, and medal before updating the score.",
        variant: "destructive",
      });
      return;
    }
    
    // Parse IDs from the selected values
    const eventId = parseInt(selectedEvent);
    const teamId = parseInt(selectedTeam);
    
    // Validate that the medal allocation is allowed
    if (["gold", "silver", "bronze"].includes(selectedMedal)) {
      // Check if this medal is already allocated to another team for this event
      const event = categoriesWithEvents
        ?.flatMap(({ events }) => events)
        .find(e => e.id === eventId);
      
      if (event) {
        // Get the event results to check existing medals
        queryClient.fetchQuery({
          queryKey: [`/api/events/${eventId}/results`],
        }).then((eventResults: any) => {
          let canUpdate = true;
          let message = null;
          
          if (selectedMedal === "gold" && eventResults.gold && eventResults.gold.teamId !== teamId) {
            canUpdate = false;
            message = `Gold medal is already assigned to ${eventResults.gold.teamName} for this event`;
          } else if (selectedMedal === "silver" && eventResults.silver && eventResults.silver.teamId !== teamId) {
            canUpdate = false;
            message = `Silver medal is already assigned to ${eventResults.silver.teamName} for this event`;
          } else if (selectedMedal === "bronze" && eventResults.bronze && eventResults.bronze.teamId !== teamId) {
            canUpdate = false;
            message = `Bronze medal is already assigned to ${eventResults.bronze.teamName} for this event`;
          }
          
          if (!canUpdate) {
            setValidationMessage(message);
            toast({
              title: "Validation Error",
              description: message,
              variant: "destructive",
            });
            return;
          }
          
          // If we get here, the update is allowed
          updateScoreMutation.mutate({ teamId, eventId, medal: selectedMedal });
        });
      } else {
        updateScoreMutation.mutate({ teamId, eventId, medal: selectedMedal });
      }
    } else {
      // Non-medal updates don't need validation
      updateScoreMutation.mutate({ teamId, eventId, medal: selectedMedal });
    }
  };
  
  // Function to handle team icon upload
  const handleIconUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setIconData(event.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };
  
  // Function to handle icon submit
  const handleIconSubmit = () => {
    if (!selectedTeamForIcon || !iconData) {
      toast({
        title: "Missing Data",
        description: "Please select a team and upload an icon image.",
        variant: "destructive",
      });
      return;
    }
    
    updateTeamIconMutation.mutate(
      { teamId: selectedTeamForIcon, icon: iconData },
      {
        onSuccess: () => {
          // Make sure to invalidate the standings and teams queries to refresh the icons everywhere
          queryClient.invalidateQueries({ queryKey: ["/api/standings"] });
          queryClient.invalidateQueries({ queryKey: ["/api/teams"] });
          
          toast({
            title: "Icon Updated",
            description: "Team icon has been successfully updated and should appear in the scoreboard.",
          });
        }
      }
    );
  };
  
  // Function to add a new event
  const handleAddEvent = () => {
    if (!newEventName || !newEventCategory) {
      toast({
        title: "Missing Data",
        description: "Please provide an event name and select a category.",
        variant: "destructive",
      });
      return;
    }
    
    const categoryId = parseInt(newEventCategory);
    addEventMutation.mutate({ name: newEventName, categoryId });
  };
  
  // Function to toggle publishing of results
  const handlePublishToggle = () => {
    const newPublishState = !(publicationStatus?.published ?? false);
    publishResultsMutation.mutate({ publish: newPublishState });
    // No need to set local state, the query will refresh
  };

  return (
    <section className="bg-white rounded-lg shadow-md overflow-hidden mb-10">
      <CardHeader className="px-6 py-4 bg-gray-50 border-b border-gray-200">
        <CardTitle className="text-xl font-bold text-gray-800">Admin Control Panel</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <Tabs defaultValue="score" className="mb-6">
          <TabsList className="mb-4">
            <TabsTrigger value="score">Score Management</TabsTrigger>
            <TabsTrigger value="medals">Medal Management</TabsTrigger>
            <TabsTrigger value="teams">Team Icons</TabsTrigger>
            <TabsTrigger value="events">Add Events</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>
          
          {/* Score Management Tab */}
          <TabsContent value="score">
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-4">Quick Score Update</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Select Event</label>
                  <Select value={selectedEvent} onValueChange={setSelectedEvent}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select an event" />
                    </SelectTrigger>
                    <SelectContent>
                      {categoriesWithEvents?.map(({ category, events }) => (
                        <SelectGroup key={category.id}>
                          <SelectLabel>{category.name}</SelectLabel>
                          {events.map(event => (
                            <SelectItem key={event.id} value={event.id.toString()}>
                              {event.name}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Select Team</label>
                  <Select value={selectedTeam} onValueChange={setSelectedTeam}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select a team" />
                    </SelectTrigger>
                    <SelectContent>
                      {teams?.map(team => (
                        <SelectItem key={team.id} value={team.id.toString()}>
                          {team.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Select Medal</label>
                  <Select value={selectedMedal} onValueChange={setSelectedMedal}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select a medal" />
                    </SelectTrigger>
                    <SelectContent>
                      {MEDAL_OPTIONS.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="mt-4 flex items-center">
                <Button 
                  onClick={handleUpdateScore}
                  disabled={!selectedEvent || !selectedTeam || !selectedMedal || updateScoreMutation.isPending}
                  className="px-4 py-2 bg-[#2563eb] text-white rounded-md hover:bg-blue-700"
                >
                  {updateScoreMutation.isPending ? "Updating..." : "Update Score"}
                </Button>
                
                {updateSuccess && (
                  <div className="flex items-center ml-4 text-sm font-medium text-green-600">
                    <CheckCircle2 className="h-4 w-4 mr-1" />
                    Score updated successfully!
                  </div>
                )}
              </div>
            </div>
            

            
            <div className="mt-8">
              <h3 className="text-lg font-semibold mb-4">Medal Validation</h3>
              <div className="bg-gray-50 rounded-md p-4">
                <p className="text-sm text-gray-600 mb-2">
                  The system will automatically validate that only one Gold, one Silver, and one Bronze medal can be awarded per event.
                </p>
                
                {validationMessage && (
                  <Alert variant="destructive" className="mt-2 text-sm">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Validation Error</AlertTitle>
                    <AlertDescription>{validationMessage}</AlertDescription>
                  </Alert>
                )}
              </div>
            </div>
          </TabsContent>
          
          {/* Medal Management Tab */}
          <TabsContent value="medals">
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-4">Manage Team Medals</h3>
              
              <p className="text-sm text-gray-600 mb-4">
                This panel allows you to view and remove medals assigned to teams across all events. 
                To assign medals, use the Score Management tab.
              </p>

              {/* Bulk Medal Update Section */}
              <div className="bg-gray-50 p-4 rounded-md mb-8 border">
                <h4 className="font-medium text-gray-800 mb-3">Bulk Medal Update</h4>
                <p className="text-sm text-gray-600 mb-4">
                  Quickly assign Non-Winner or No Entry status to multiple teams at once.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Select Event</label>
                    <Select value={selectedBulkEvent} onValueChange={setSelectedBulkEvent}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select an event" />
                      </SelectTrigger>
                      <SelectContent>
                        {categoriesWithEvents?.map(({ category, events }) => (
                          <SelectGroup key={category.id}>
                            <SelectLabel>{category.name}</SelectLabel>
                            {events.map(event => (
                              <SelectItem key={event.id} value={event.id.toString()}>
                                {event.name}
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Select Medal Type</label>
                    <Select value={selectedBulkMedal} onValueChange={setSelectedBulkMedal}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select medal type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="non_winner">Non-Winner (1 point)</SelectItem>
                        <SelectItem value="no_entry">No Entry (0 points)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-end">
                    <Button 
                      onClick={() => {
                        if (!selectedBulkEvent || !selectedBulkMedal || selectedTeams.length === 0) {
                          toast({
                            title: "Incomplete Form",
                            description: "Please select an event, medal type, and at least one team",
                            variant: "destructive",
                          });
                          return;
                        }

                        // Confirm before proceeding
                        if (window.confirm(`Are you sure you want to assign ${selectedBulkMedal === 'non_winner' ? 'Non-Winner' : 'No Entry'} status to ${selectedTeams.length} teams?`)) {
                          // Create a promise array to track all mutations
                          const updatePromises = selectedTeams.map(teamId => {
                            return updateScoreMutation.mutateAsync({ 
                              teamId, 
                              eventId: parseInt(selectedBulkEvent), 
                              medal: selectedBulkMedal 
                            });
                          });
                          
                          // Execute all updates and provide feedback when complete
                          Promise.all(updatePromises)
                            .then(() => {
                              toast({
                                title: "Bulk Update Complete",
                                description: `Successfully updated ${selectedTeams.length} teams`,
                                variant: "default",
                              });
                              // Reset selections
                              setSelectedTeams([]);
                              setSelectAll(false);
                            })
                            .catch(error => {
                              toast({
                                title: "Error",
                                description: "One or more updates failed. Please try again.",
                                variant: "destructive",
                              });
                            });
                        }
                      }}
                      disabled={!selectedBulkEvent || !selectedBulkMedal || selectedTeams.length === 0 || updateScoreMutation.isPending}
                      className="w-full"
                    >
                      {updateScoreMutation.isPending ? "Updating..." : "Apply to Selected Teams"}
                    </Button>
                  </div>
                </div>
                
                <div className="mt-4">
                  <div className="flex justify-between items-center mb-3">
                    <h5 className="text-sm font-medium text-gray-700">Select Teams</h5>
                    <div className="flex items-center space-x-2">
                      <Switch 
                        id="select-all"
                        checked={selectAll} 
                        onCheckedChange={(checked) => {
                          setSelectAll(checked);
                          if (checked && teams) {
                            setSelectedTeams(teams.map(team => team.id));
                          } else {
                            setSelectedTeams([]);
                          }
                        }}
                      />
                      <Label htmlFor="select-all">Select All</Label>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 mt-2">
                    {teams?.map(team => (
                      <div 
                        key={team.id} 
                        className={`border rounded-md p-2 flex items-center space-x-2 cursor-pointer hover:bg-gray-50 ${
                          selectedTeams.includes(team.id) ? 'bg-blue-50 border-blue-200' : ''
                        }`}
                        onClick={() => {
                          setSelectedTeams(prev => 
                            prev.includes(team.id) 
                              ? prev.filter(id => id !== team.id)
                              : [...prev, team.id]
                          );
                        }}
                      >
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: team.color }}></div>
                        <span className="text-sm">{team.name}</span>
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-2 text-xs text-gray-500">
                    {selectedTeams.length} teams selected
                  </div>
                </div>
              </div>
              
              <div className="space-y-8">
                {categoriesWithEvents?.map(({ category, events }) => (
                  <div key={category.id} className="border rounded-md overflow-hidden">
                    <div className="bg-gray-50 p-3 border-b">
                      <h4 className="font-medium text-gray-800">{category.name}</h4>
                    </div>
                    <div className="p-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {events.map(event => (
                          <div key={event.id} className="border rounded-md p-3">
                            <h5 className="font-medium text-gray-700 mb-3">{event.name}</h5>
                            {/* We use the EventMedalList component here to avoid hook issues */}
                            <EventMedalList eventId={event.id} />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>
          
          {/* Team Icons Tab */}
          <TabsContent value="teams">
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-4">Team Icon Management</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Select Team</label>
                  <Select value={selectedTeamForIcon?.toString() || ""} onValueChange={(value) => setSelectedTeamForIcon(parseInt(value))}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select a team" />
                    </SelectTrigger>
                    <SelectContent>
                      {teams?.map(team => (
                        <SelectItem key={team.id} value={team.id.toString()}>
                          {team.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Upload Icon Image</label>
                  <div className="flex items-center gap-2">
                    <Input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleIconUpload}
                      className="flex-1"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Recommended square image (PNG or JPG)</p>
                </div>
              </div>
              
              {iconData && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Preview</h4>
                  <div className="w-16 h-16 rounded-full overflow-hidden border border-gray-200">
                    <img src={iconData} alt="Icon preview" className="w-full h-full object-cover" />
                  </div>
                </div>
              )}
              
              <div className="mt-4">
                <Button
                  onClick={handleIconSubmit}
                  disabled={!selectedTeamForIcon || !iconData || updateTeamIconMutation.isPending}
                  className="px-4 py-2 bg-[#2563eb] text-white rounded-md hover:bg-blue-700"
                >
                  {updateTeamIconMutation.isPending ? "Uploading..." : "Upload Icon"}
                </Button>
              </div>
            </div>
          </TabsContent>
          
          {/* Add Events Tab */}
          <TabsContent value="events">
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-4">Add New Event</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Event Name</label>
                  <Input 
                    type="text" 
                    value={newEventName} 
                    onChange={(e) => setNewEventName(e.target.value)}
                    placeholder="Enter event name"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Select Category</label>
                  <Select value={newEventCategory} onValueChange={setNewEventCategory}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categoriesWithEvents?.map(({ category }) => (
                        <SelectItem key={category.id} value={category.id.toString()}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="mt-4">
                <Button
                  onClick={handleAddEvent}
                  disabled={!newEventName || !newEventCategory || addEventMutation.isPending}
                  className="px-4 py-2 bg-[#2563eb] text-white rounded-md hover:bg-blue-700"
                >
                  {addEventMutation.isPending ? "Adding..." : "Add Event"}
                </Button>
              </div>
            </div>
          </TabsContent>
          
          {/* Settings Tab */}
          <TabsContent value="settings">
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-4">Publication Control</h3>
              <div className="bg-gray-50 p-4 rounded-md">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-gray-800">Publish Updates to Viewers</h4>
                    <p className="text-xs text-gray-600 mt-1">
                      <strong>Important:</strong> Viewers will always see the latest published scores. When you update scores and this setting is OFF, 
                      viewers will continue to see the previous scores until you click "Publish Updates."
                    </p>
                    <p className="text-xs text-gray-600 mt-2">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 mr-1">
                        ON:
                      </span>
                      Every update is instantly visible to everyone
                    </p>
                    <p className="text-xs text-gray-600 mt-1">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 mr-1">
                        OFF:
                      </span>
                      Updates are held until you manually publish them 
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-4">
                    <div className="flex items-center">
                      <Switch 
                        id="publish-mode" 
                        checked={publicationStatus?.published ?? false} 
                        onCheckedChange={handlePublishToggle}
                      />
                      <Label htmlFor="publish-mode" className="ml-2">
                        {publicationStatus?.published ? 'Auto-publish ON' : 'Auto-publish OFF'}
                      </Label>
                    </div>
                    
                    <Button
                      onClick={handlePublishToggle}
                      variant={publicationStatus?.published ? "destructive" : "default"}
                      className="w-full px-4 py-2 text-sm font-medium"
                      size="lg"
                    >
                      {publicationStatus?.published ? 'Disable Auto-publishing' : 'Publish All Updates'}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </section>
  );
}
