'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { format, parseISO, subDays, eachDayOfInterval } from 'date-fns';

interface ActivityHeatmapProps {
  data: {
    date: string;
    count: number;
  }[];
}

export function ActivityHeatmap({ data }: ActivityHeatmapProps) {
  // Create a map of date to count for quick lookup
  const dateCountMap = new Map(data.map(item => [item.date, item.count]));
  
  // Generate dates for the last 90 days
  const today = new Date();
  const startDate = subDays(today, 90);
  const dates = eachDayOfInterval({ start: startDate, end: today });
  
  // Group dates by week and day
  const weeks: Date[][] = [];
  let currentWeek: Date[] = [];
  
  dates.forEach((date, index) => {
    const dayOfWeek = date.getDay();
    
    // Start a new week on Sunday (0)
    if (dayOfWeek === 0 && currentWeek.length > 0) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
    
    currentWeek.push(date);
    
    // Push the last week
    if (index === dates.length - 1) {
      weeks.push(currentWeek);
    }
  });
  
  // Function to get color based on count
  const getColor = (count: number) => {
    if (count === 0) return 'bg-muted';
    if (count < 3) return 'bg-emerald-200 dark:bg-emerald-900';
    if (count < 6) return 'bg-emerald-300 dark:bg-emerald-800';
    if (count < 9) return 'bg-emerald-400 dark:bg-emerald-700';
    return 'bg-emerald-500 dark:bg-emerald-600';
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Activity Heatmap</CardTitle>
        <CardDescription>
          Your coding activity over the last 90 days
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-2">
          <div className="flex justify-end gap-1 text-xs text-muted-foreground">
            <div>Sun</div>
            <div>Mon</div>
            <div>Tue</div>
            <div>Wed</div>
            <div>Thu</div>
            <div>Fri</div>
            <div>Sat</div>
          </div>
          <div className="flex gap-2">
            {weeks.map((week, weekIndex) => (
              <div key={weekIndex} className="flex flex-col gap-1">
                {Array.from({ length: 7 }).map((_, dayIndex) => {
                  const date = week[dayIndex];
                  if (!date) return <div key={dayIndex} className="w-3 h-3" />;
                  
                  const dateStr = format(date, 'yyyy-MM-dd');
                  const count = dateCountMap.get(dateStr) || 0;
                  
                  return (
                    <div
                      key={dayIndex}
                      className={`w-3 h-3 rounded-sm ${getColor(count)}`}
                      title={`${format(date, 'MMM d, yyyy')}: ${count} activities`}
                    />
                  );
                })}
              </div>
            ))}
          </div>
          <div className="flex justify-end items-center gap-2 mt-2">
            <div className="text-xs text-muted-foreground">Less</div>
            <div className="flex gap-1">
              <div className="w-3 h-3 rounded-sm bg-muted" />
              <div className="w-3 h-3 rounded-sm bg-emerald-200 dark:bg-emerald-900" />
              <div className="w-3 h-3 rounded-sm bg-emerald-300 dark:bg-emerald-800" />
              <div className="w-3 h-3 rounded-sm bg-emerald-400 dark:bg-emerald-700" />
              <div className="w-3 h-3 rounded-sm bg-emerald-500 dark:bg-emerald-600" />
            </div>
            <div className="text-xs text-muted-foreground">More</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
