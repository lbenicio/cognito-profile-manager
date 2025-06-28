import { getUser } from '@/lib/auth';
import { ContactForm } from '@/components/contact-form';
import { getTranslations, unstable_setRequestLocale } from 'next-intl/server';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';

export default async function ContactPage(props: {
  params: Promise<{ locale: string }>;
}) {
  const params = await props.params;
  unstable_setRequestLocale(params.locale);
  const user = await getUser();

  if (!user) {
    return (
      <div className='flex h-screen items-center justify-center'>
        <div className='space-y-4 text-center'>
          <h1 className='text-2xl font-bold'>Authentication Error</h1>
          <p className='text-muted-foreground'>
            Could not load user data. Please try logging out and signing in
            again.
          </p>
          <Button asChild>
            <a href='/api/v1/auth/logout'>
              <LogOut className='mr-2 h-4 w-4' />
              Log Out
            </a>
          </Button>
        </div>
      </div>
    );
  }

  const t = await getTranslations('Contact');
  const translations = {
    title: t('title'),
    description: t('description'),
    form: {
      nameLabel: t('form.nameLabel'),
      emailLabel: t('form.emailLabel'),
      categoryLabel: t('form.categoryLabel'),
      categoryPlaceholder: t('form.categoryPlaceholder'),
      messageLabel: t('form.messageLabel'),
      messagePlaceholder: t('form.messagePlaceholder'),
      submitButton: t('form.submitButton'),
      successTitle: t('form.successTitle'),
      successDescription: t('form.successDescription'),
      errorTitle: t('form.errorTitle'),
      errorDescription: t('form.errorDescription'),
      categoryRequired: t('form.categoryRequired'),
      messageRequired: t('form.messageRequired'),
      messageTooShort: t('form.messageTooShort'),
      categories: {
        general: t('form.categories.general'),
        billing: t('form.categories.billing'),
        technical: t('form.categories.technical'),
        feedback: t('form.categories.feedback'),
      },
    },
  };

  return (
    <div className='container mx-auto p-4 md:p-8'>
      <header className='mx-auto mb-8 max-w-2xl'>
        <h1 className='text-3xl font-bold tracking-tight'>
          {translations.title}
        </h1>
        <p className='mt-2 text-muted-foreground'>{translations.description}</p>
      </header>
      <ContactForm user={user} translations={translations.form} />
    </div>
  );
}
