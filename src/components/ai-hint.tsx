'use client';

import { useState } from 'react';
import { Lightbulb } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { generateFormHint } from '@/ai/flows/form-hint-generator';
import { Skeleton } from './ui/skeleton';

export function AiHint({ fieldDescription }: { fieldDescription: string }) {
  const [hint, setHint] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const fetchHint = async () => {
    if (hint && !loading) return;
    setLoading(true);
    try {
      const result = await generateFormHint({ fieldDescription });
      setHint(result.hint);
    } catch (error) {
      console.error('Failed to generate hint:', error);
      setHint('Could not generate a hint at this time.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={(open) => {
      setIsOpen(open);
      if (open) {
        fetchHint();
      }
    }}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="h-6 w-6 ml-2 text-muted-foreground hover:text-primary focus-visible:ring-1">
          <Lightbulb className="h-4 w-4" />
          <span className="sr-only">Get Hint</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="grid gap-4">
          <div className="space-y-2">
            <h4 className="font-medium leading-none">Form Hint</h4>
            {loading ? (
              <div className="space-y-2 pt-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">{hint}</p>
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
