import { useMemo } from 'react';
import type { ReadingHistory } from '@/types';

interface ProgressChartProps {
  readingHistory: ReadingHistory[];
}

export function ProgressChart({ readingHistory }: ProgressChartProps) {
  const chartData = useMemo(() => {
    // Get last 14 days
    const days = 14;
    const today = new Date();
    const data: { date: string; count: number; display: string }[] = [];

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);

      const nextDay = new Date(date);
      nextDay.setDate(nextDay.getDate() + 1);

      const count = readingHistory.filter((entry) => {
        const entryDate = new Date(entry.completed_at);
        return entryDate >= date && entryDate < nextDay;
      }).length;

      data.push({
        date: date.toISOString().split('T')[0],
        display: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        count,
      });
    }

    return data;
  }, [readingHistory]);

  const maxCount = Math.max(...chartData.map((d) => d.count), 1);

  return (
    <div className="space-y-4">
      <div className="flex items-end gap-1 h-48">
        {chartData.map((day, index) => (
          <div key={index} className="flex-1 flex flex-col items-center gap-1">
            <div className="flex-1 flex items-end w-full">
              <div
                className="w-full bg-primary rounded-t-sm transition-all hover:opacity-80"
                style={{
                  height: `${(day.count / maxCount) * 100}%`,
                  minHeight: day.count > 0 ? '4px' : '0',
                }}
                title={`${day.display}: ${day.count} article${day.count !== 1 ? 's' : ''}`}
              />
            </div>
            {index % 2 === 0 && (
              <div className="text-xs text-muted-foreground rotate-0 whitespace-nowrap">
                {day.display.split(' ')[1]}
              </div>
            )}
          </div>
        ))}
      </div>
      <div className="text-center text-sm text-muted-foreground">
        Articles read in the last 14 days
      </div>
    </div>
  );
}
