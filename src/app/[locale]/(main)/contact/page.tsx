import { getUser } from '@/lib/auth';
import { ContactForm } from '@/components/contact-form';
import { getTranslations, unstable_setRequestLocale } from 'next-intl/server';

export default async function ContactPage({params: {locale}}: {params: {locale: string}}) {
  unstable_setRequestLocale(locale);
  const user = await getUser();

  if (!user) {
    return (
        <div className="flex items-center justify-center h-screen">
            <div className="text-center">
                <h1 className="text-2xl font-bold">Authentication Error</h1>
                <p className="text-muted-foreground">Could not load user data. Please try logging out and signing in again.</p>
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
        }
    }
  };

  return (
      <div className="container mx-auto p-4 md:p-8">
        <header className="mb-8 max-w-2xl mx-auto">
            <h1 className="text-3xl font-bold tracking-tight">{translations.title}</h1>
            <p className="text-muted-foreground mt-2">
                {translations.description}
            </p>
        </header>
        <ContactForm user={user} translations={translations.form} />
      </div>
  );
}
