import { AppearanceSettings } from '@/components/appearance-settings';

export default function SettingsPage() {
  return (
    <div className="container mx-auto p-4 md:p-8 space-y-6">
        <header>
            <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
            <p className="text-muted-foreground">
                Manage your account and appearance settings.
            </p>
        </header>
        <div className="max-w-3xl">
            <AppearanceSettings />
        </div>
    </div>
  );
}
