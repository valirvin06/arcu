import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { getTeamDotColor } from "@/lib/utils";
import { Lock } from "lucide-react";

// Define team standing type
interface TeamStanding {
  teamId: number;
  teamName: string;
  teamColor: string;
  totalPoints: number;
  goldCount: number;
  silverCount: number;
  bronzeCount: number;
  icon?: string | null;
}

interface ScoreboardProps {
  isAdmin?: boolean;
}

export default function Scoreboard({ isAdmin = false }: ScoreboardProps) {
  const { data: standings, isLoading } = useQuery<TeamStanding[]>({
    queryKey: ["/api/standings"],
    refetchInterval: 3000, // Auto-refresh every 3 seconds
  });
  
  // Query to check if results are published
  const { data: publicationStatus } = useQuery<{ published: boolean }>({
    queryKey: ["/api/results/published"],
    refetchInterval: 2000, // Auto-refresh every 2 seconds
  });
  
  // Always show standings - publication status only affects updates now
  // Admin role is not needed for this logic anymore as we always show standings
  const showStandings = true;

  if (isLoading) {
    return (
      <section className="mb-10">
        <Card>
          <CardHeader className="px-6 py-4 bg-gray-50 border-b border-gray-200">
            <CardTitle className="text-xl font-bold text-gray-800">Current Standings</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rank</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Team</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Points</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Gold</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Silver</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bronze</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {[...Array(5)].map((_, i) => (
                    <tr key={i} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        <Skeleton className="h-5 w-5" />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Skeleton className="h-8 w-8 rounded-full" />
                          <div className="ml-4">
                            <Skeleton className="h-5 w-32" />
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <Skeleton className="h-5 w-8" />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <Skeleton className="h-5 w-5" />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <Skeleton className="h-5 w-5" />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <Skeleton className="h-5 w-5" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </section>
    );
  }

  // Helper function to render the team dot
  const getTeamLogo = (color: string) => {
    return (
      <div className="flex-shrink-0 h-8 w-8 rounded-full bg-white border border-gray-200 overflow-hidden flex items-center justify-center">
        <div className={`h-6 w-6 rounded-full ${getTeamDotColor(color)}`}></div>
      </div>
    );
  };

  return (
    <section className="mb-10">
      <Card>
        <CardHeader className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <CardTitle className="text-xl font-bold text-gray-800">Current Standings</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {showStandings ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rank</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Team</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Points</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Gold</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Silver</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bronze</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {standings?.map((team, index) => (
                    <tr key={team.teamId} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {index > 0 && standings[index].totalPoints === standings[index-1].totalPoints 
                          ? standings.findIndex(s => s.totalPoints === team.totalPoints) + 1 
                          : index + 1}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {team.icon ? (
                            <div className="flex-shrink-0 h-8 w-8 rounded-full border border-gray-200 overflow-hidden">
                              <img src={team.icon} alt={`${team.teamName} logo`} className="h-full w-full object-cover" />
                            </div>
                          ) : (
                            getTeamLogo(team.teamColor)
                          )}
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{team.teamName}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-bold">{team.totalPoints}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div className="flex items-center">
                          <div className="w-5 h-5 rounded-full bg-yellow-400 flex items-center justify-center mr-1.5">
                            <span className="text-yellow-800 text-xs font-bold">G</span>
                          </div>
                          {team.goldCount}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div className="flex items-center">
                          <div className="w-5 h-5 rounded-full bg-gray-300 flex items-center justify-center mr-1.5">
                            <span className="text-gray-700 text-xs font-bold">S</span>
                          </div>
                          {team.silverCount}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div className="flex items-center">
                          <div className="w-5 h-5 rounded-full bg-amber-700 flex items-center justify-center mr-1.5">
                            <span className="text-amber-100 text-xs font-bold">B</span>
                          </div>
                          {team.bronzeCount}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Lock className="h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Results are currently hidden</h3>
              <p className="text-sm text-gray-500 max-w-md">
                The administrator has not yet published the current standings. Check back later when results are published.
              </p>
              {isAdmin && (
                <p className="text-sm text-blue-600 mt-4">
                  As an administrator, you can publish results in the Settings tab of the Admin Control Panel.
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  );
}
