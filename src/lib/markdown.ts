import 'server-only';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { marked } from 'marked';
import { Logger } from '@/lib/logger';
import type { MarkdownContentFile } from '@/types/content.types';

const logger = new Logger('MARKDOWN');
const contentDirectory = path.join(process.cwd(), 'src', 'content');

export async function getMarkdownContent(
  fileName: MarkdownContentFile
): Promise<string> {
  try {
    const fullPath = path.join(contentDirectory, fileName);
    const fileContents = await fs.readFile(fullPath, 'utf8');
    return await marked.parse(fileContents);
  } catch (error) {
    logger.error('Error reading markdown file:', error);
    return '<p>Could not load content.</p>';
  }
}
