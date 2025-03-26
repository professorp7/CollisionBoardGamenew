import { useState } from "react";
import CharacterList from "../components/characters/CharacterList";
import CharacterForm from "../components/characters/CharacterForm";
import { useAppContext } from "../contexts/AppContext";
import { Character } from "@shared/schema";

export default function CharacterPage() {
  const { characters, selectedCharacter, setSelectedCharacter, addCharacter, updateCharacter, deleteCharacter } = useAppContext();
  const [searchQuery, setSearchQuery] = useState("");
  
  // Filter characters based on search query
  const filteredCharacters = characters.filter(character => 
    character.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (character.tags && character.tags.toLowerCase().includes(searchQuery.toLowerCase()))
  );
  
  const handleCreateNewCharacter = () => {
    const emptyCharacter: Omit<Character, 'id'> = {
      name: "",
      hp: 10,
      speed: 30,
      ac: 10,
      initiative: 0,
      tags: "",
      abilities: []
    };
    setSelectedCharacter({ ...emptyCharacter, id: 0 } as Character);
  };
  
  const handleSaveCharacter = (character: Character) => {
    if (character.id === 0) {
      // New character
      const { id, ...characterData } = character;
      addCharacter(characterData);
    } else {
      // Update existing character
      updateCharacter(character);
    }
    
    setSelectedCharacter(null);
  };
  
  const handleDeleteCharacter = (id: number) => {
    if (selectedCharacter && selectedCharacter.id === id) {
      setSelectedCharacter(null);
    }
    deleteCharacter(id);
  };

  return (
    <div className="flex flex-col md:flex-row gap-6">
      <CharacterList 
        characters={filteredCharacters}
        selectedCharacterId={selectedCharacter?.id || null}
        onSelectCharacter={setSelectedCharacter}
        onCreateCharacter={handleCreateNewCharacter}
        onDeleteCharacter={handleDeleteCharacter}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />
      
      <CharacterForm 
        character={selectedCharacter}
        onSave={handleSaveCharacter}
        onCancel={() => setSelectedCharacter(null)}
      />
    </div>
  );
}
