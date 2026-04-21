import { useState, useEffect } from 'react';
import { queueService, QueueStats, DepartmentStats } from '@/services/queueService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function Analytics() {
  const [stats, setStats] = useState<QueueStats | null>(null);
  const [deptStats, setDeptStats] = useState<DepartmentStats[]>([]);
  const [tokensPerDay, setTokensPerDay] = useState<Record<string, number>>({});
  const [peakHours, setPeakHours] = useState<{ hour: number; count: number }[]>([]);

  useEffect(() => {
    setStats(queueService.stats());
    setDeptStats(queueService.departmentStats());
    setTokensPerDay(queueService.tokensPerDay());
    setPeakHours(queueService.peakHours());
  }, []);

  const refresh = () => {
    setStats(queueService.stats());
    setDeptStats(queueService.departmentStats());
    setTokensPerDay(queueService.tokensPerDay());
    setPeakHours(queueService.peakHours());
  };

  useEffect(() => {
    const interval = setInterval(refresh, 10000);
    return () => clearInterval(interval);
  }, []);

  if (!stats) return <div>Loading...</div>;

  return (
    <div className="container mx-auto py-6 space-y-6">
      <h1 className="text-2xl font-bold">Queue Analytics</h1>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-4 text-center">
            <p className="text-sm text-muted-foreground">Total Tokens</p>
            <p className="text-3xl font-bold">{stats.total}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 text-center">
            <p className="text-sm text-muted-foreground">Waiting</p>
            <p className="text-3xl font-bold text-yellow-600">{stats.waiting}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 text-center">
            <p className="text-sm text-muted-foreground">Called</p>
            <p className="text-3xl font-bold text-blue-600">{stats.called}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 text-center">
            <p className="text-sm text-muted-foreground">Completed</p>
            <p className="text-3xl font-bold text-green-600">{stats.completed}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 text-center">
            <p className="text-sm text-muted-foreground">Cancelled</p>
            <p className="text-3xl font-bold text-red-600">{stats.cancelled}</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="departments">
        <TabsList>
          <TabsTrigger value="departments">Department Load</TabsTrigger>
          <TabsTrigger value="peak">Peak Hours</TabsTrigger>
          <TabsTrigger value="daily">Daily Tokens</TabsTrigger>
        </TabsList>

        <TabsContent value="departments">
          <Card>
            <CardHeader>
              <CardTitle>Department Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {deptStats.map((dept) => (
                  <div key={dept.department} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-bold">{dept.department}</p>
                      <p className="text-sm text-muted-foreground">
                        Avg wait: {dept.avgWaitTime} mins
                      </p>
                    </div>
                    <div className="flex gap-4 text-center">
                      <div>
                        <p className="text-xl font-bold text-yellow-600">{dept.waiting}</p>
                        <p className="text-xs text-muted-foreground">waiting</p>
                      </div>
                      <div>
                        <p className="text-xl font-bold text-blue-600">{dept.called}</p>
                        <p className="text-xs text-muted-foreground">called</p>
                      </div>
                      <div>
                        <p className="text-xl font-bold text-green-600">{dept.completed}</p>
                        <p className="text-xs text-muted-foreground">completed</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="peak">
          <Card>
            <CardHeader>
              <CardTitle>Peak Hours Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {peakHours.slice(0, 8).map((p) => (
                  <div key={p.hour} className="text-center p-4 bg-gray-50 rounded-lg">
                    <p className="text-lg font-bold">
                      {p.hour.toString().padStart(2, '0')}:00
                    </p>
                    <p className="text-2xl font-bold text-blue-600">{p.count}</p>
                    <p className="text-xs text-muted-foreground">tokens</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="daily">
          <Card>
            <CardHeader>
              <CardTitle>Tokens Per Day</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {Object.entries(tokensPerDay)
                  .sort(([a], [b]) => b.localeCompare(a))
                  .slice(0, 10)
                  .map(([date, count]) => (
                    <div
                      key={date}
                      className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
                    >
                      <p className="font-medium">{date}</p>
                      <Badge variant="outline">{count} tokens</Badge>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}