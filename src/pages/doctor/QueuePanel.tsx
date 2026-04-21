import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { queueService } from '@/services/queueService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function QueuePanel() {
  const { user } = useAuth();
  const [department] = useState(user?.specialty || 'GENERAL');
  const [currentToken, setCurrentToken] = useState<any>(null);
  const [nextPatients, setNextPatients] = useState<any[]>([]);
  const [isPaused, setIsPaused] = useState(false);

  const refreshQueue = () => {
    const current = queueService.getCurrentQueue(department).find(t => t.status === 'called');
    const next = queueService.getNextPatients(department, 5);
    setCurrentToken(current);
    setNextPatients(next.filter(t => t.id !== current?.id));
  };

  useEffect(() => {
    refreshQueue();
    const interval = setInterval(refreshQueue, 5000);
    return () => clearInterval(interval);
  }, [department]);

  const handleCallNext = () => {
    const called = queueService.callNextPatient(department, user?.id);
    if (called) {
      setCurrentToken(called);
      refreshQueue();
    }
  };

  const handleComplete = () => {
    if (currentToken) {
      queueService.completeToken(currentToken.id);
      setCurrentToken(null);
      refreshQueue();
    }
  };

  const handlePauseQueue = () => {
    setIsPaused(!isPaused);
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Doctor Queue - {department}</CardTitle>
          <Button
            variant={isPaused ? 'destructive' : 'outline'}
            size="sm"
            onClick={handlePauseQueue}
          >
            {isPaused ? 'Resume Queue' : 'Pause Queue'}
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Button onClick={handleCallNext} disabled={isPaused} className="flex-1">
              Call Next Patient
            </Button>
          </div>

          {currentToken && (
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="pt-6 text-center">
                <p className="text-sm text-blue-600">Now Serving</p>
                <p className="text-5xl font-bold text-blue-700">{currentToken.tokenNumber}</p>
                {currentToken.priority && (
                  <Badge variant="destructive" className="mt-2">
                    Priority
                  </Badge>
                )}
                <Button onClick={handleComplete} className="mt-4 w-full" variant="default">
                  Mark Complete
                </Button>
              </CardContent>
            </Card>
          )}

          {!currentToken && (
            <Card className="bg-gray-50">
              <CardContent className="pt-6 text-center">
                <p className="text-muted-foreground">No patient currently being served</p>
                <Button onClick={handleCallNext} disabled={isPaused} className="mt-4">
                  Call Next
                </Button>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Next Patients</CardTitle>
        </CardHeader>
        <CardContent>
          {nextPatients.length === 0 ? (
            <p className="text-muted-foreground">No patients waiting</p>
          ) : (
            <div className="space-y-2">
              {nextPatients.map((patient, idx) => (
                <div
                  key={patient.id}
                  className="flex justify-between items-center p-3 rounded-lg bg-gray-50"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-bold">{patient.tokenNumber}</span>
                    {patient.priority && (
                      <Badge variant="destructive" className="text-xs">
                        Priority
                      </Badge>
                    )}
                  </div>
                  <Badge variant="outline">{idx + 1}</Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}