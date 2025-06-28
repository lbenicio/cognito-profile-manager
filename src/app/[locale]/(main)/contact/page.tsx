import { getUser } from '@/lib/auth';
import { ContactForm } from '@/components/contact-form';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';
import { localLogout } from '@/lib/auth-actions';

export default async function ContactPage(props: {
  params: Promise<{ locale: string }>;
}) {
  const params = await props.params;
  setRequestLocale(params.locale);
  const user = await getUser();
  const t = await getTranslations();

  if (!user) {
    return (
      <div className='flex h-screen items-center justify-center'>
        <div className='space-y-4 text-center'>
          <h1 className='text-2xl font-bold'>Authentication Error</h1>
          <p className='text-muted-foreground'>
            Could not load user data. Please try logging out and signing in
            again.
          </p>
          <form action={localLogout}>
            <Button type='submit'>
              <LogOut className='mr-2 h-4 w-4' />
              {t('Header.userMenu.logout')}
            </Button>
          </form>
        </div>
      </div>
    );
  }

  const translations = {
    title: t('Contact.title'),
    description: t('Contact.description'),
    form: {
      nameLabel: t('Contact.form.nameLabel'),
      emailLabel: t('Contact.form.emailLabel'),
      categoryLabel: t('Contact.form.categoryLabel'),
      categoryPlaceholder: t('Contact.form.categoryPlaceholder'),
      messageLabel: t('Contact.form.messageLabel'),
      messagePlaceholder: t('Contact.form.messagePlaceholder'),
      submitButton: t('Contact.form.submitButton'),
      successTitle: t('Contact.form.successTitle'),
      successDescription: t('Contact.form.successDescription'),
      errorTitle: t('Contact.form.errorTitle'),
      errorDescription: t('Contact.form.errorDescription'),
      categoryRequired: t('Contact.form.categoryRequired'),
      messageRequired: t('Contact.form.messageRequired'),
      messageTooShort: t('Contact.form.messageTooShort'),
      categories: {
        general: t('Contact.form.categories.general'),
        billing: t('Contact.form.categories.billing'),
        technical: t('Contact.form.categories.technical'),
        feedback: t('Contact.form.categories.feedback'),
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
