import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAppContext } from "../../contexts/AppContext";
import { useAuth } from "@/hooks/use-auth";
import { LogOut, Save, Settings, User } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export function Header() {
  const { characters, teams } = useAppContext();
  const { user, logoutMutation } = useAuth();
  const { toast } = useToast();
  
  const handleSaveAll = () => {
    // Data is already saved through context effects,
    // so this is just a confirmation for the user
    toast({
      title: "Data Saved",
      description: `Saved ${characters.length} characters and ${teams.length} teams.`,
    });
  };

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const getInitials = (username: string) => {
    return username.substring(0, 2).toUpperCase();
  };
  
  return (
    <header className="flex items-center justify-between py-4 mb-6">
      <h1 className="text-3xl font-heading font-bold text-primary">Battle Companion</h1>
      <div className="flex items-center gap-3">
        <Button 
          variant="secondary" 
          className="gap-2"
          onClick={handleSaveAll}
        >
          <Save className="h-4 w-4" />
          Save All
        </Button>
        
        {user && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="rounded-full h-10 w-10 p-0">
                <Avatar>
                  <AvatarFallback>{getInitials(user.username)}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem className="gap-2">
                <User className="h-4 w-4" />
                <span>{user.username}</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="gap-2">
                <Settings className="h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuItem 
                className="gap-2 text-destructive"
                onClick={handleLogout}
                disabled={logoutMutation.isPending}
              >
                <LogOut className="h-4 w-4" />
                <span>{logoutMutation.isPending ? "Logging out..." : "Logout"}</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </header>
  );
}
