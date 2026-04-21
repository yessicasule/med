import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Token } from '@/db';

interface TokenCardProps {
  token: Token;
  showStatus?: boolean;
  onCancel?: (id: string) => void;
}

export function TokenCard({ token, showStatus = true, onCancel }: TokenCardProps) {
  const statusColors: Record<string, string> = {
    waiting: 'bg-yellow-100 text-yellow-800',
    called: 'bg-blue-100 text-blue-800',
    completed: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
    paused: 'bg-gray-100 text-gray-800',
  };

  return (
    <Card className={`${token.priority ? 'border-red-300 bg-red-50' : 'bg-white'}`}>
      <CardContent className="pt-4 flex justify-between items-center">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold">{token.tokenNumber}</span>
            {token.priority && (
              <Badge variant="destructive" className="text-xs">
                Priority
              </Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground">{token.department}</p>
          {showStatus && (
            <Badge className={`mt-2 ${statusColors[token.status]}`}>
              {token.status}
            </Badge>
          )}
          <p className="text-xs text-muted-foreground mt-1">
            ETA: {token.estimatedWait} mins
          </p>
        </div>
        {onCancel && token.status === 'waiting' && (
          <button
            onClick={() => onCancel(token.id)}
            className="text-red-500 hover:text-red-700 text-sm"
          >
            Cancel
          </button>
        )}
      </CardContent>
    </Card>
  );
}