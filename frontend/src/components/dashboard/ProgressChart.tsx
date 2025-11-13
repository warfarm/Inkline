import type { ReadingHistory } from '@/types';

interface ProgressChartProps {
  readingHistory: ReadingHistory[];
}

export function ProgressChart({ readingHistory }: ProgressChartProps) {
  // Get last 14 days of reading activity
  const getLast14Days = () => {
    const days = [];
    const today = new Date();

    for (let i = 13; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      days.push(date);
    }

    return days;
  };

  const last14Days = getLast14Days();

  // Count articles completed per day
  const activityByDay = last14Days.map(day => {
    const count = readingHistory.filter(entry => {
      if (!entry.completed_at) return false;
      const entryDate = new Date(entry.completed_at);
      entryDate.setHours(0, 0, 0, 0);
      return entryDate.getTime() === day.getTime();
    }).length;

    return { date: day, count };
  });

  const maxCount = Math.max(...activityByDay.map(d => d.count), 1);

  return (
    <div className="space-y-3">
      <div className="flex items-end justify-between gap-2 h-32">
        {activityByDay.map((day, index) => {
          const height = (day.count / maxCount) * 100;
          const isToday = day.date.toDateString() === new Date().toDateString();

          return (
            <div key={index} className="flex-1 flex flex-col items-center gap-1">
              <div className="flex-1 flex items-end w-full">
                <div
                  className={`w-full rounded-t transition-all ${
                    day.count > 0
                      ? isToday
                        ? 'bg-primary'
                        : 'bg-primary/70 hover:bg-primary'
                      : 'bg-muted'
                  }`}
                  style={{ height: day.count > 0 ? `${Math.max(height, 8)}%` : '8%' }}
                  title={`${day.count} article${day.count !== 1 ? 's' : ''} on ${day.date.toLocaleDateString()}`}
                />
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex justify-between text-xs text-muted-foreground">
        <span>{last14Days[0].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
        <span>Last 14 days</span>
        <span>{last14Days[13].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
      </div>
    </div>
  );
}
