import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { queueService } from '@/services/queueService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const departments = ['GENERAL', 'CARDIOLOGY', 'ENT', 'ORTHO', 'DENTAL', 'DERMATOLOGY', 'NEUROLOGY', 'PEDIATRICS'];

export default function QueueStatus() {
  const { user } = useAuth();
  const [selectedDept, setSelectedDept] = useState('GENERAL');
  const [queue, setQueue] = useState<any[]>([]);
  const [myTokens, setMyTokens] = useState<any[]>([]);

  const refreshQueue = () => {
    const q = queueService.getCurrentQueue(selectedDept);
    setQueue(q);
  };

  useEffect(() => {
    refreshQueue();
    const interval = setInterval(refreshQueue, 5000);
    return () => clearInterval(interval);
  }, [selectedDept]);

  useEffect(() => {
    if (user?.id) {
      const tokens = queueService.getPatientTokens(user.id);
      setMyTokens(tokens);
    }
  }, [user?.id]);

  const handleCancel = (tokenId: string) => {
    queueService.cancelToken(tokenId);
    refreshQueue();
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      waiting: 'default',
      called: 'secondary',
      completed: 'outline',
      cancelled: 'destructive',
    };
    return <Badge variant={variants[status] || 'outline'}>{status}</Badge>;
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>My Queue Tokens</CardTitle>
        </CardHeader>
        <CardContent>
          {myTokens.length === 0 ? (
            <p className="text-muted-foreground">No tokens yet. Book a token first.</p>
          ) : (
            <div className="space-y-4">
              {myTokens.map((token) => (
                <Card key={token.id} className="bg-gray-50">
                  <CardContent className="pt-4 flex justify-between items-center">
                    <div>
                      <p className="text-2xl font-bold">{token.tokenNumber}</p>
                      <p className="text-sm text-muted-foreground">
                        {token.department} - {token.status}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        ETA: {token.estimatedWait} mins
                      </p>
                    </div>
                    {token.status === 'waiting' && (
                      <Button variant="destructive" size="sm" onClick={() => handleCancel(token.id)}>
                        Cancel
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Live Queue</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2 overflow-x-auto pb-2">
            {departments.map((dept) => (
              <Button
                key={dept}
                variant={selectedDept === dept ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedDept(dept)}
              >
                {dept}
              </Button>
            ))}
          </div>

          <div className="space-y-2">
            {queue.length === 0 ? (
              <p className="text-muted-foreground">No patients in queue</p>
            ) : (
              queue.map((token, idx) => (
                <div
                  key={token.id}
                  className={`flex justify-between items-center p-3 rounded-lg ${
                    idx === 0 ? 'bg-blue-50 border border-blue-200' : 'bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-bold">{token.tokenNumber}</span>
                    {token.priority && (
                      <Badge variant="destructive" className="text-xs">
                        Priority
                      </Badge>
                    )}
                  </div>
                  {getStatusBadge(token.status)}
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}