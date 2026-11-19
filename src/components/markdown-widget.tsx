import 'server-only';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText } from 'lucide-react';
import { getMarkdownContent } from '@/lib/markdown';
import type { MarkdownWidgetProps } from '@/types/content.types';

export async function MarkdownWidget({ filePath, title }: MarkdownWidgetProps) {
  const content = await getMarkdownContent(filePath);

  return (
    <Card>
      <CardHeader>
        <CardTitle className='flex items-center gap-2'>
          <FileText className='text-primary' />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent
        className='prose prose-sm dark:prose-invert max-w-none'
        dangerouslySetInnerHTML={{ __html: content }}
      />
    </Card>
  );
}
