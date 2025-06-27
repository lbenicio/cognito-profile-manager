'use client';

import { useState, useTransition } from 'react';
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { Save, Loader2 } from 'lucide-react';
import type { PublicProfilePreferences } from '@/lib/auth';
import { updatePublicProfilePreferences } from '@/lib/profile-settings-actions';

interface ProfileSettingsFormProps {
  initialPreferences: PublicProfilePreferences;
  onUpdate: (newPrefs: PublicProfilePreferences) => void;
}

export function ProfileSettingsForm({ initialPreferences, onUpdate }: ProfileSettingsFormProps) {
  const t = useTranslations('Profile.settings');
  const { toast } = useToast();
  const [prefs, setPrefs] = useState(initialPreferences);
  const [isPending, startTransition] = useTransition();

  const handleIsPublicChange = (value: boolean) => {
    setPrefs(current => ({ ...current, isPublic: value }));
  };

  const handleFieldChange = (field: keyof PublicProfilePreferences['publicFields'], value: boolean) => {
    setPrefs(current => ({
      ...current,
      publicFields: {
        ...current.publicFields,
        [field]: value,
      },
    }));
  };

  const handleSave = () => {
    startTransition(async () => {
      const result = await updatePublicProfilePreferences(prefs);
      if (result.success) {
        onUpdate(prefs);
        toast({
          title: t('successTitle'),
          description: t('successDescription'),
        });
      } else {
        toast({
          variant: 'destructive',
          title: t('errorTitle'),
          description: result.message,
        });
      }
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('title')}</CardTitle>
        <CardDescription>{t('description')}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-start justify-between">
          <div className="pr-4">
            <Label htmlFor="profile-visibility">{t('isPublicLabel')}</Label>
            <p className="text-sm text-muted-foreground">{t('isPublicDescription')}</p>
          </div>
          <Switch
            id="profile-visibility"
            checked={prefs.isPublic}
            onCheckedChange={handleIsPublicChange}
            disabled={isPending}
          />
        </div>
        
        <div className={`space-y-4 ${!prefs.isPublic ? 'opacity-50' : ''}`}>
            <Separator />
            <h4 className="font-semibold">{t('visibleFieldsTitle')}</h4>
            <div className="flex items-center justify-between">
                <Label htmlFor="show-picture">{t('showPictureLabel')}</Label>
                <Switch
                    id="show-picture"
                    checked={prefs.publicFields.picture}
                    onCheckedChange={(value) => handleFieldChange('picture', value)}
                    disabled={isPending || !prefs.isPublic}
                />
            </div>
            <div className="flex items-center justify-between">
                <Label htmlFor="show-banner">{t('showBannerLabel')}</Label>
                <Switch
                    id="show-banner"
                    checked={prefs.publicFields.banner}
                    onCheckedChange={(value) => handleFieldChange('banner', value)}
                    disabled={isPending || !prefs.isPublic}
                />
            </div>
            <div className="flex items-center justify-between">
                <Label htmlFor="show-name">{t('showNameLabel')}</Label>
                <Switch
                    id="show-name"
                    checked={prefs.publicFields.name}
                    onCheckedChange={(value) => handleFieldChange('name', value)}
                    disabled={isPending || !prefs.isPublic}
                />
            </div>
             <div className="flex items-center justify-between">
                <Label htmlFor="show-groups">{t('showGroupsLabel')}</Label>
                <Switch
                    id="show-groups"
                    checked={prefs.publicFields.groups}
                    onCheckedChange={(value) => handleFieldChange('groups', value)}
                    disabled={isPending || !prefs.isPublic}
                />
            </div>
            <div className="flex items-center justify-between">
                <Label htmlFor="show-aboutme">{t('showAboutMeLabel')}</Label>
                <Switch
                    id="show-aboutme"
                    checked={prefs.publicFields.aboutMe}
                    onCheckedChange={(value) => handleFieldChange('aboutMe', value)}
                    disabled={isPending || !prefs.isPublic}
                />
            </div>
            <div className="flex items-center justify-between">
                <Label htmlFor="show-email">{t('showEmailLabel')}</Label>
                <Switch
                    id="show-email"
                    checked={prefs.publicFields.email}
                    onCheckedChange={(value) => handleFieldChange('email', value)}
                    disabled={isPending || !prefs.isPublic}
                />
            </div>
            <div className="flex items-center justify-between">
                <Label htmlFor="show-website">{t('showWebsiteLabel')}</Label>
                <Switch
                    id="show-website"
                    checked={prefs.publicFields.website}
                    onCheckedChange={(value) => handleFieldChange('website', value)}
                    disabled={isPending || !prefs.isPublic}
                />
            </div>
            <div className="flex items-center justify-between">
                <Label htmlFor="show-phone">{t('showPhoneLabel')}</Label>
                <Switch
                    id="show-phone"
                    checked={prefs.publicFields.phone_number}
                    onCheckedChange={(value) => handleFieldChange('phone_number', value)}
                    disabled={isPending || !prefs.isPublic}
                />
            </div>
            <div className="flex items-center justify-between">
                <Label htmlFor="show-gender">{t('showGenderLabel')}</Label>
                <Switch
                    id="show-gender"
                    checked={prefs.publicFields.gender}
                    onCheckedChange={(value) => handleFieldChange('gender', value)}
                    disabled={isPending || !prefs.isPublic}
                />
            </div>
            <div className="flex items-center justify-between">
                <Label htmlFor="show-zoneinfo">{t('showZoneinfoLabel')}</Label>
                <Switch
                    id="show-zoneinfo"
                    checked={prefs.publicFields.zoneinfo}
                    onCheckedChange={(value) => handleFieldChange('zoneinfo', value)}
                    disabled={isPending || !prefs.isPublic}
                />
            </div>
             <div className="flex items-center justify-between">
                <Label htmlFor="show-locale">{t('showLocaleLabel')}</Label>
                <Switch
                    id="show-locale"
                    checked={prefs.publicFields.locale}
                    onCheckedChange={(value) => handleFieldChange('locale', value)}
                    disabled={isPending || !prefs.isPublic}
                />
            </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={handleSave} disabled={isPending}>
          {isPending ? <Loader2 className="animate-spin" /> : <Save />}
          <span className="ml-2">{t('saveButton')}</span>
        </Button>
      </CardFooter>
    </Card>
  );
}
