import { Character, Team } from "@shared/schema";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

interface TeamListProps {
  teams: Team[];
  characters: Character[];
  onSelectTeam: (team: Team) => void;
  onCreateTeam: () => void;
  onDeleteTeam: (id: number) => void;
}

export default function TeamList({
  teams,
  characters,
  onSelectTeam,
  onCreateTeam,
  onDeleteTeam
}: TeamListProps) {
  // Get character names for a team
  const getTeamMemberNames = (characterIds: number[]) => {
    return characterIds.map(id => {
      const character = characters.find(c => c.id === id);
      return character ? character.name : "Unknown";
    });
  };

  return (
    <Card className="w-full md:w-1/3 h-[calc(100vh-180px)] flex flex-col">
      <CardContent className="pt-5 flex flex-col h-full">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-heading font-bold">Your Teams</h2>
          <Button size="sm" onClick={onCreateTeam}>
            <i className="fas fa-plus mr-1"></i> New Team
          </Button>
        </div>

        <ScrollArea className="flex-grow">
          <div className="space-y-3">
            {teams.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>No teams found</p>
                <Button 
                  variant="link" 
                  onClick={onCreateTeam}
                  className="mt-2"
                >
                  Create your first team
                </Button>
              </div>
            ) : (
              teams.map(team => {
                const memberNames = getTeamMemberNames(team.characterIds);
                
                return (
                  <div
                    key={team.id}
                    className="p-3 border rounded-md hover:bg-gray-50 cursor-pointer transition"
                    onClick={() => onSelectTeam(team)}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium text-gray-900">{team.name}</h3>
                        <div className="text-xs text-gray-500 mt-1">
                          {team.characterIds.length} members
                        </div>
                      </div>
                      <div className="text-gray-400">
                        <button
                          className="hover:text-primary transition mr-1"
                          title="Edit team"
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectTeam(team);
                          }}
                        >
                          <i className="fas fa-edit"></i>
                        </button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <button
                              className="hover:text-destructive transition"
                              title="Delete team"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <i className="fas fa-trash"></i>
                            </button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Team</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete {team.name}? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                onClick={() => onDeleteTeam(team.id)}
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                    <div className="flex mt-2 flex-wrap">
                      {memberNames.map((name, index) => (
                        <div key={index} className="text-xs bg-gray-200 rounded-full px-2 py-0.5 mr-1 mb-1">
                          {name}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
