import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format } from "date-fns";

interface RollHistoryProps {
  rollHistory: Array<{
    id: string;
    formula: string;
    result: number;
    breakdown: string;
    timestamp: Date;
    name?: string;
  }>;
  onClearHistory: () => void;
}

export default function RollHistory({
  rollHistory,
  onClearHistory
}: RollHistoryProps) {
  const getTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) {
      return "Just now";
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes} min${minutes === 1 ? '' : 's'} ago`;
    } else {
      return format(date, "h:mm a");
    }
  };

  return (
    <Card>
      <CardContent className="pt-5">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-heading font-bold">Roll History</h2>
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-gray-400 hover:text-gray-600"
            onClick={onClearHistory}
            disabled={rollHistory.length === 0}
          >
            <i className="fas fa-trash"></i>
          </Button>
        </div>

        <ScrollArea className="max-h-[calc(100vh-240px)]">
          <div className="space-y-3">
            {rollHistory.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>No dice rolls yet</p>
                <p className="text-sm mt-1">Roll some dice to see history</p>
              </div>
            ) : (
              rollHistory.map(roll => {
                const isPrimary = roll.formula.includes("d20");
                
                return (
                  <div 
                    key={roll.id} 
                    className={`p-3 border-l-4 bg-gray-50 rounded-r-md ${
                      isPrimary ? 'border-primary' : 'border-secondary'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{roll.formula}</span>
                      <span className={`text-2xl font-mono font-bold ${
                        isPrimary ? 'text-primary' : 'text-secondary'
                      }`}>
                        {roll.result}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      <span>{getTimeAgo(roll.timestamp)}</span>
                      {roll.name && <span className="ml-2">{roll.name}</span>}
                    </div>
                    {roll.breakdown !== roll.result.toString() && (
                      <div className="text-xs text-gray-400 mt-1">
                        {roll.breakdown}
                      </div>
                    )}
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
