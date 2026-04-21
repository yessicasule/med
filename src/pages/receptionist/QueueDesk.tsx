import { useState, useEffect } from 'react';
import { queueService, DepartmentStats } from '@/services/queueService';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const departments = ['GENERAL', 'CARDIOLOGY', 'ENT', 'ORTHO', 'DENTAL', 'DERMATOLOGY', 'NEUROLOGY', 'PEDIATRICS'];

export default function QueueDesk() {
  const [department, setDepartment] = useState('GENERAL');
  const [patientName, setPatientName] = useState('');
  const [priority, setPriority] = useState(false);
  const [lastToken, setLastToken] = useState<any>(null);
  const [departmentStats, setDepartmentStats] = useState<DepartmentStats[]>([]);
  const [queue, setQueue] = useState<any[]>([]);

  useEffect(() => {
    const stats = queueService.departmentStats();
    setDepartmentStats(stats);
  }, []);

  useEffect(() => {
    const q = queueService.getCurrentQueue(department);
    setQueue(q);
    const interval = setInterval(() => {
      setQueue(queueService.getCurrentQueue(department));
    }, 5000);
    return () => clearInterval(interval);
  }, [department]);

  const handleGenerateToken = () => {
    const token = queueService.generateToken(
      patientName || undefined,
      department,
      undefined,
      priority
    );
    setLastToken(token);
    setPatientName('');
    setPriority(false);
    const stats = queueService.departmentStats();
    setDepartmentStats(stats);
  };

  const handlePrintSlip = () => {
    if (lastToken) {
      const printContent = `
        <div style="text-align:center;padding:20px;font-family:Arial;">
          <h2>MediQueue Token</h2>
          <h1 style="font-size:48px;">${lastToken.tokenNumber}</h1>
          <p>Department: ${lastToken.department}</p>
          <p>Priority: ${lastToken.priority ? 'Yes' : 'No'}</p>
          <p>ETA: ${lastToken.estimatedWait} mins</p>
        </div>
      `;
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(printContent);
        printWindow.document.close();
        printWindow.print();
      }
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Generate Token</CardTitle>
          <CardDescription>Create new queue tokens for patients</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Department</Label>
              <Select value={department} onValueChange={setDepartment}>
                <SelectTrigger>
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((dept) => (
                    <SelectItem key={dept} value={dept}>
                      {dept}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Patient Name (Optional)</Label>
              <Input
                placeholder="Enter patient name"
                value={patientName}
                onChange={(e) => setPatientName(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="priority"
              checked={priority}
              onChange={(e) => setPriority(e.target.checked)}
              className="w-4 h-4"
            />
            <Label htmlFor="priority" className="text-sm font-normal">
              Emergency / Priority Token
            </Label>
          </div>

          <div className="flex gap-2">
            <Button onClick={handleGenerateToken} className="flex-1">
              Generate Token
            </Button>
            {lastToken && (
              <Button onClick={handlePrintSlip} variant="outline">
                Print Slip
              </Button>
            )}
          </div>

          {lastToken && (
            <Card className="bg-green-50 border-green-200">
              <CardContent className="pt-6 text-center">
                <p className="text-sm text-green-600">Token Generated</p>
                <p className="text-4xl font-bold text-green-700">{lastToken.tokenNumber}</p>
                <div className="flex justify-center gap-2 mt-2">
                  <Badge variant={priority ? 'destructive' : 'outline'}>
                    {priority ? 'Priority' : 'Regular'}
                  </Badge>
                  <Badge variant="outline">{lastToken.department}</Badge>
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Live Queue Display</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Select value={department} onValueChange={setDepartment}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select department" />
            </SelectTrigger>
            <SelectContent>
              {departments.map((dept) => (
                <SelectItem key={dept} value={dept}>
                  {dept}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-muted-foreground">Now Serving</p>
            <p className="text-4xl font-bold">
              {queue.find(t => t.status === 'called')?.tokenNumber || '--'}
            </p>
          </div>

          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-muted-foreground">Waiting</p>
            <p className="text-4xl font-bold">
              {queue.filter(t => t.status === 'waiting').length}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Department Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {departmentStats.map((stat) => (
              <Card key={stat.department} className="bg-gray-50">
                <CardContent className="pt-4 text-center">
                  <p className="text-xs text-muted-foreground">{stat.department}</p>
                  <p className="text-2xl font-bold">{stat.waiting}</p>
                  <p className="text-xs text-muted-foreground">waiting</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}