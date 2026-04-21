import { useState, useEffect } from 'react';
import { queueService } from '@/services/queueService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface WaitEstimatorProps {
  tokenId: string;
}

export function WaitEstimator({ tokenId }: WaitEstimatorProps) {
  const [eta, setEta] = useState(0);

  useEffect(() => {
    const updateEta = () => {
      const wait = queueService.getEstimatedWait(tokenId);
      setEta(wait);
    };

    updateEta();
    const interval = setInterval(updateEta, 30000);
    return () => clearInterval(interval);
  }, [tokenId]);

  return (
    <Card className="bg-yellow-50 border-yellow-200">
      <CardHeader className="py-3">
        <CardTitle className="text-sm text-yellow-800">Estimated Wait Time</CardTitle>
      </CardHeader>
      <CardContent className="py-2">
        <p className="text-2xl font-bold text-yellow-700">
          {eta > 0 ? `${eta} min` : 'Now'}
        </p>
      </CardContent>
    </Card>
  );
}