import { useState, useEffect } from 'react';
import { queueService } from '@/services/queueService';
import { Token } from '@/db';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface DoctorQueuePanelProps {
  department: string;
  doctorId?: string;
}

export function DoctorQueuePanel({ department, doctorId }: DoctorQueuePanelProps) {
  const [currentToken, setCurrentToken] = useState<Token | null>(null);
  const [nextPatients, setNextPatients] = useState<Token[]>([]);
  const [isPaused, setIsPaused] = useState(false);

  const refresh = () => {
    const q = queueService.getCurrentQueue(department);
    const current = q.find(t => t.status === 'called' && (!doctorId || t.doctorId === doctorId));
    const next = q.filter(t => t.status === 'waiting' && (!doctorId || t.doctorId === doctorId)).slice(0, 5);
    setCurrentToken(current || null);
    setNextPatients(next);
  };

  useEffect(() => {
    refresh();
    const interval = setInterval(refresh, 3000);
    return () => clearInterval(interval);
  }, [department, doctorId]);

  const handleCallNext = () => {
    const called = queueService.callNextPatient(department, doctorId);
    if (called) refresh();
  };

  const handleComplete = () => {
    if (currentToken) {
      queueService.completeToken(currentToken.id);
      setCurrentToken(null);
      refresh();
    }
  };

  const handlePause = () => setIsPaused(!isPaused);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-lg">Queue - {department}</CardTitle>
          <Button
            variant={isPaused ? 'destructive' : 'outline'}
            size="sm"
            onClick={handlePause}
          >
            {isPaused ? 'Resume' : 'Pause'}
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Button onClick={handleCallNext} disabled={isPaused} className="flex-1">
              Call Next
            </Button>
          </div>

          {currentToken ? (
            <div className="text-center p-6 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-600 mb-1">Now Serving</p>
              <p className="text-5xl font-bold text-blue-700">{currentToken.tokenNumber}</p>
              {currentToken.priority && (
                <Badge variant="destructive" className="mt-2">Priority</Badge>
              )}
              <Button onClick={handleComplete} className="mt-4 w-full">
                Mark Complete
              </Button>
            </div>
          ) : (
            <div className="text-center p-6 bg-gray-50 rounded-lg">
              <p className="text-muted-foreground">No patient called</p>
              <Button onClick={handleCallNext} disabled={isPaused} className="mt-2">
                Call Next Patient
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Next Patients ({nextPatients.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {nextPatients.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">No patients waiting</p>
          ) : (
            <div className="space-y-2">
              {nextPatients.map((patient, idx) => (
                <div
                  key={patient.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <Badge variant="outline">{idx + 1}</Badge>
                    <span className="font-semibold">{patient.tokenNumber}</span>
                    {patient.priority && (
                      <Badge variant="destructive" className="text-xs">Priority</Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}