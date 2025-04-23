'use client';

import { Clock, Pause, Play, RotateCcw } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useConsultTimer } from '@/hooks/useConsultTimer';

export function ConsultTimer() {
  const { isRunning, time, startTimer, stopTimer, resetTimer } = useConsultTimer();

  return (
    <Card className="flex items-center gap-2 px-3 py-1">
      <Clock className="size-4 text-muted-foreground" />
      <span className="font-mono text-sm tabular-nums">{time}</span>
      <div className="flex gap-1">
        <Button
          variant="ghost"
          size="icon"
          className="size-6"
          onClick={isRunning ? stopTimer : startTimer}
        >
          {isRunning ? <Pause className="size-3" /> : <Play className="size-3" />}
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="size-6"
          onClick={resetTimer}
        >
          <RotateCcw className="size-3" />
        </Button>
      </div>
    </Card>
  );
}
