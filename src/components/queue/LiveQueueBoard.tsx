import { useState, useEffect } from 'react';
import { queueService } from '@/services/queueService';
import { Token } from '@/db';

interface LiveQueueBoardProps {
  department?: string;
  departments?: string[];
}

export function LiveQueueBoard({ department, departments }: LiveQueueBoardProps) {
  const [queues, setQueues] = useState<Record<string, { current: Token | null; next: Token | null }>>({});

  useEffect(() => {
    const updateQueues = () => {
      if (department) {
        const q = queueService.getCurrentQueue(department);
        setQueues({
          [department]: {
            current: q.find(t => t.status === 'called') || null,
            next: q.find(t => t.status === 'waiting') || null,
          },
        });
      } else if (departments) {
        const newQueues: Record<string, { current: Token | null; next: Token | null }> = {};
        departments.forEach(dept => {
          const q = queueService.getCurrentQueue(dept);
          newQueues[dept] = {
            current: q.find(t => t.status === 'called') || null,
            next: q.find(t => t.status === 'waiting') || null,
          };
        });
        setQueues(newQueues);
      }
    };

    updateQueues();
    const interval = setInterval(updateQueues, 5000);
    return () => clearInterval(interval);
  }, [department, departments]);

  const displayDepartments = department ? [department] : departments || [];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {displayDepartments.map((dept) => {
        const queue = queues[dept] || { current: null, next: null };
        return (
          <div
            key={dept}
            className="bg-white border rounded-lg shadow-sm overflow-hidden"
          >
            <div className="bg-slate-800 text-white p-3 text-center font-semibold">
              {dept}
            </div>
            <div className="p-4">
              <div className="text-center mb-4">
                <p className="text-sm text-muted-foreground mb-1">Now Serving</p>
                <p className="text-4xl font-bold text-blue-600">
                  {queue.current?.tokenNumber || '--'}
                </p>
              </div>
              <div className="text-center border-t pt-4">
                <p className="text-sm text-muted-foreground mb-1">Next</p>
                <p className="text-2xl font-semibold text-gray-600">
                  {queue.next?.tokenNumber || '--'}
                </p>
                {queue.next?.priority && (
                  <span className="text-xs text-red-500 font-medium">Priority</span>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}