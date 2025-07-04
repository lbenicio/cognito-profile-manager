import 'server-only';
import { promises as fs } from 'fs';
import path from 'path';
import { marked } from 'marked';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText } from 'lucide-react';
import { Logger } from '@/lib/logger';

const logger = new Logger('MARKDOWN-WIDGET');

async function getMarkdownContent(filePath: string): Promise<string> {
  try {
    const fullPath = path.join(process.cwd(), filePath);
    const fileContents = await fs.readFile(fullPath, 'utf8');
    const htmlContent = await marked.parse(fileContents);
    return htmlContent;
  } catch (error) {
    logger.error('Error reading markdown file:', error);
    return '<p>Could not load content.</p>';
  }
}

export async function MarkdownWidget({
  filePath,
  title,
}: {
  filePath: string;
  title: string;
}) {
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
