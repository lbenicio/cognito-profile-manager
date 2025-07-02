import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getTranslations } from 'next-intl/server';
import { MarkdownRenderer } from '@/components/markdown-renderer';

export default async function PrivacyPolicyPage() {
  const t = await getTranslations('Privacy');

  return (
    <div className='container mx-auto p-4 md:p-8'>
      <Card>
        <CardHeader>
          <CardTitle className='text-3xl'>{t('title')}</CardTitle>
        </CardHeader>
        <CardContent>
          <MarkdownRenderer filePath='src/content/privacy.md' />
        </CardContent>
      </Card>
    </div>
  );
}
