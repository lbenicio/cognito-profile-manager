export type MarkdownContentFile =
  | 'dashboard-widget.md'
  | 'privacy.md'
  | 'terms.md';

export interface MarkdownRendererProps {
  filePath: MarkdownContentFile;
}

export interface MarkdownWidgetProps extends MarkdownRendererProps {
  title: string;
}
