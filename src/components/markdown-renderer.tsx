import 'server-only';
import type { MarkdownRendererProps } from '@/types/content.types';
import { getMarkdownContent } from '@/lib/markdown';

export async function MarkdownRenderer({ filePath }: MarkdownRendererProps) {
  const content = await getMarkdownContent(filePath);

  return (
    <div
      className='prose prose-lg dark:prose-invert max-w-none'
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
}
