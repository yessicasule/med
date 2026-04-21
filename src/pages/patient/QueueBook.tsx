import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { queueService } from '@/services/queueService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const departments = ['GENERAL', 'CARDIOLOGY', 'ENT', 'ORTHO', 'DENTAL', 'DERMATOLOGY', 'NEUROLOGY', 'PEDIATRICS'];

export default function QueueBook() {
  const { user } = useAuth();
  const [department, setDepartment] = useState('GENERAL');
  const [token, setToken] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleGenerate = () => {
    setLoading(true);
    try {
      const newToken = queueService.generateToken(user?.id, department);
      setToken(newToken);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Book Queue Token</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Select Department</Label>
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

          <Button onClick={handleGenerate} disabled={loading} className="w-full">
            {loading ? 'Generating...' : 'Generate Token'}
          </Button>

          {token && (
            <Card className="bg-green-50 border-green-200">
              <CardContent className="pt-6 text-center">
                <p className="text-sm text-green-600">Your Token Number</p>
                <p className="text-4xl font-bold text-green-700">{token.tokenNumber}</p>
                <p className="text-muted-foreground mt-2">
                  Estimated wait: {token.estimatedWait} minutes
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Department: {token.department}
                </p>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  );
}