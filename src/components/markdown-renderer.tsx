import 'server-only';
import { promises as fs } from 'fs';
import path from 'path';
import { marked } from 'marked';
import { Logger } from '@/lib/logger';

const logger = new Logger('MARKDOWN-RENDERER');

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

export async function MarkdownRenderer({ filePath }: { filePath: string }) {
  const content = await getMarkdownContent(filePath);

  return (
    <div
      className='prose prose-lg dark:prose-invert max-w-none'
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
}
