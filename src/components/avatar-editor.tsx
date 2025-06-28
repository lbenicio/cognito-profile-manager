'use client';

import React, { useState, useRef } from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { UploadCloud, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import type { User as UserType } from '@/lib/auth';
import { getPresignedUploadUrl, updateUserAvatar } from '@/lib/avatar-actions';

interface AvatarEditorProps {
  user: UserType;
  onUpdate: (data: Partial<UserType>) => void;
  onClose: () => void;
}

export function AvatarEditor({ user, onUpdate, onClose }: AvatarEditorProps) {
  const t = useTranslations('Account.avatar');
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(user.picture);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.size > 2 * 1024 * 1024) {
        setError(t('fileTooLarge'));
        return;
      }
      if (
        !['image/jpeg', 'image/png', 'image/webp'].includes(selectedFile.type)
      ) {
        setError(t('invalidFileType'));
        return;
      }
      setError(null);
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setIsLoading(true);
    setError(null);

    try {
      const { presignedUrl, publicUrl } = await getPresignedUploadUrl({
        type: file.type,
        size: file.size,
      });

      const uploadResponse = await fetch(presignedUrl, {
        method: 'PUT',
        body: file,
        headers: {
          'Content-Type': file.type,
        },
      });

      if (!uploadResponse.ok) {
        throw new Error('Failed to upload image to storage.');
      }

      await updateUserAvatar(publicUrl);

      onUpdate({ picture: publicUrl });
      toast({
        title: t('successTitle'),
        description: t('successDescription'),
      });
      onClose();
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : t('genericError');
      setError(errorMessage);
      toast({
        variant: 'destructive',
        title: t('errorTitle'),
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className='flex flex-col items-center gap-6 p-4'>
      <div
        className='group relative h-40 w-40 cursor-pointer rounded-full'
        onClick={() => fileInputRef.current?.click()}
      >
        <Image
          src={preview || `https://placehold.co/160x160.png`}
          alt='Avatar preview'
          width={160}
          height={160}
          className='rounded-full object-cover'
        />
        <div className='absolute inset-0 flex flex-col items-center justify-center rounded-full bg-black/50 opacity-0 transition-opacity group-hover:opacity-100'>
          <UploadCloud className='h-8 w-8 text-white' />
          <p className='mt-1 text-sm text-white'>{t('changePhoto')}</p>
        </div>
      </div>
      <input
        type='file'
        ref={fileInputRef}
        onChange={handleFileChange}
        accept='image/png, image/jpeg, image/webp'
        className='hidden'
      />

      {error && <p className='text-sm text-destructive'>{error}</p>}

      <div className='flex gap-4'>
        <Button variant='outline' onClick={onClose} disabled={isLoading}>
          {t('cancel')}
        </Button>
        <Button onClick={handleUpload} disabled={!file || isLoading}>
          {isLoading && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
          {t('uploadAndSave')}
        </Button>
      </div>
    </div>
  );
}
