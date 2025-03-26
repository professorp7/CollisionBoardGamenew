import { Character } from "@shared/schema";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

interface CharacterListProps {
  characters: Character[];
  selectedCharacterId: number | null;
  onSelectCharacter: (character: Character) => void;
  onCreateCharacter: () => void;
  onDeleteCharacter: (id: number) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export default function CharacterList({
  characters,
  selectedCharacterId,
  onSelectCharacter,
  onCreateCharacter,
  onDeleteCharacter,
  searchQuery,
  onSearchChange
}: CharacterListProps) {
  return (
    <Card className="w-full md:w-1/3 h-[calc(100vh-180px)] flex flex-col">
      <CardContent className="pt-5 flex flex-col h-full">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-heading font-bold">Character List</h2>
          <Button size="sm" onClick={onCreateCharacter}>
            <i className="fas fa-plus mr-1"></i> New
          </Button>
        </div>

        <div className="mb-4">
          <div className="relative">
            <Input
              type="text"
              placeholder="Search characters..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
            />
            <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
          </div>
        </div>

        <ScrollArea className="flex-grow">
          <div className="space-y-3">
            {characters.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>No characters found</p>
                <Button 
                  variant="link" 
                  onClick={onCreateCharacter}
                  className="mt-2"
                >
                  Create your first character
                </Button>
              </div>
            ) : (
              characters.map((character) => (
                <div
                  key={character.id}
                  className={`p-3 border rounded-md hover:bg-gray-50 cursor-pointer transition flex justify-between items-center ${
                    selectedCharacterId === character.id ? 'border-primary' : ''
                  }`}
                  onClick={() => onSelectCharacter(character)}
                >
                  <div>
                    <h3 className="font-medium text-gray-900">{character.name}</h3>
                    <div className="text-xs text-gray-500 mt-1">
                      <span className="mr-2">HP: {character.hp}</span>
                      <span>AC: {character.ac}</span>
                    </div>
                  </div>
                  <div className="text-gray-400">
                    <button
                      className="hover:text-primary transition mr-1"
                      title="Edit"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectCharacter(character);
                      }}
                    >
                      <i className="fas fa-edit"></i>
                    </button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <button
                          className="hover:text-destructive transition"
                          title="Delete"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <i className="fas fa-trash"></i>
                        </button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Character</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete {character.name}? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            onClick={() => onDeleteCharacter(character.id)}
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
