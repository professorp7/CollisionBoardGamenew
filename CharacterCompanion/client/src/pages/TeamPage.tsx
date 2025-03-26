import { useState } from "react";
import TeamList from "../components/teams/TeamList";
import TeamBuilder from "../components/teams/TeamBuilder";
import { useAppContext } from "../contexts/AppContext";
import { Team } from "@shared/schema";

export default function TeamPage() {
  const { teams, characters, selectedTeam, setSelectedTeam, addTeam, updateTeam, deleteTeam } = useAppContext();
  
  const handleCreateNewTeam = () => {
    const emptyTeam: Team = {
      id: 0,
      name: "",
      characterIds: []
    };
    setSelectedTeam(emptyTeam);
  };
  
  const handleSaveTeam = (team: Team) => {
    if (team.id === 0) {
      // New team
      const { id, ...teamData } = team;
      addTeam(teamData);
    } else {
      // Update existing team
      updateTeam(team);
    }
    
    setSelectedTeam(null);
  };
  
  const handleDeleteTeam = (id: number) => {
    if (selectedTeam && selectedTeam.id === id) {
      setSelectedTeam(null);
    }
    deleteTeam(id);
  };

  return (
    <div className="flex flex-col md:flex-row gap-6">
      <TeamList 
        teams={teams}
        characters={characters}
        onSelectTeam={setSelectedTeam}
        onCreateTeam={handleCreateNewTeam}
        onDeleteTeam={handleDeleteTeam}
      />
      
      <TeamBuilder 
        team={selectedTeam}
        allCharacters={characters}
        onSave={handleSaveTeam}
        onCancel={() => setSelectedTeam(null)}
      />
    </div>
  );
}
