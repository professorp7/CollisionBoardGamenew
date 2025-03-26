
import { useState, useEffect } from "react";
import { Character } from "@shared/schema";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";

interface CommunityCharactersProps {
  onCharacterClick: (character: Character) => void;
}

export default function CommunityCharacters({ onCharacterClick }: CommunityCharactersProps) {
  const [characters, setCharacters] = useState<(Character & { creatorName: string })[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetch("/api/characters?public=true")
      .then(res => res.json())
      .then(data => setCharacters(data))
      .catch(console.error);
  }, []);

  const filteredCharacters = characters.filter(char => 
    char.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    char.tags?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Card className="w-full h-[calc(100vh-180px)]">
      <CardContent className="p-4">
        <div className="mb-4">
          <Input
            placeholder="Search community characters..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <ScrollArea className="h-[calc(100vh-260px)]">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCharacters.map(character => (
              <Card key={character.id} className="p-4 hover:bg-accent cursor-pointer" onClick={() => onCharacterClick(character)}>
                <h3 className="font-bold">{character.name}</h3>
                <p className="text-sm text-muted-foreground">Created by: {character.creatorName}</p>
                <p className="text-sm">HP: {character.hp} | AC: {character.ac}</p>
                {character.tags && <p className="text-sm text-muted-foreground mt-2">Tags: {character.tags}</p>}
              </Card>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
