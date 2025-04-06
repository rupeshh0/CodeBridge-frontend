'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface TaskCardProps {
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  onStart: () => void;
}

export function TaskCard({ title, description, difficulty, onStart }: TaskCardProps) {
  const difficultyColor = {
    easy: 'bg-green-100 text-green-800',
    medium: 'bg-yellow-100 text-yellow-800',
    hard: 'bg-red-100 text-red-800',
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>{title}</CardTitle>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${difficultyColor[difficulty]}`}>
            {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
          </span>
        </div>
        <CardDescription>Coding Challenge</CardDescription>
      </CardHeader>
      <CardContent>
        <p>{description}</p>
      </CardContent>
      <CardFooter>
        <Button onClick={onStart} className="w-full">Start Challenge</Button>
      </CardFooter>
    </Card>
  );
}
