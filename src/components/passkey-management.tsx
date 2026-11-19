'use client';

import type { PasskeyManagementProps } from '@/types/components.types';
import { useState, useEffect, useTransition } from 'react';
import { useSearchParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { KeyRound, Loader2, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useTranslations } from 'next-intl';
import { deletePasskey } from '@/actions/passkey.action';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { format } from 'date-fns';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { cn } from '@/lib/utils';

export function PasskeyManagement({ user }: PasskeyManagementProps) {
  const { toast } = useToast();
  const t = useTranslations('Security.passkeys');
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [isAddingPasskey, setIsAddingPasskey] = useState<boolean>(false);
  const [deletingKey, setDeletingKey] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState<boolean>(false);

  useEffect(() => {
    setIsMounted(true);
    const result = searchParams.get('result');
    const error = searchParams.get('error');
    const errorDescription = searchParams.get('error_description');

    if (error || result) {
      // Clean the URL to prevent the toast from re-appearing on refresh.
      const currentPath = window.location.pathname;
      window.history.replaceState(null, '', currentPath);

      if (error) {
        toast({
          variant: 'destructive',
          title: t('error.title'),
          description: errorDescription || t('error.generic'),
        });
      }

      if (result === 'success') {
        toast({
          title: t('success.title'),
          description: t('success.description'),
        });
        router.refresh();
      }
    }
  }, [searchParams, router, t, toast]);

  const handleAddPasskey = (): void => {
    setIsAddingPasskey(true);
    window.location.href = '/api/v1/auth/passkey/start';
  };

  const handleDeletePasskey = (key: string): void => {
    setDeletingKey(key);
    startTransition(async () => {
      const result = await deletePasskey(key);
      if (result.success) {
        toast({
          title: t('deleteSuccessTitle'),
          description: t('deleteSuccessDescription'),
        });
        router.refresh();
      } else {
        toast({
          variant: 'destructive',
          title: t('deleteErrorTitle'),
          description: result.message,
        });
      }
      setDeletingKey(null);
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('title')}</CardTitle>
        <CardDescription>{t('description')}</CardDescription>
      </CardHeader>
      <CardContent className='space-y-6'>
        <div className='flex items-start gap-3'>
          <KeyRound className='text-muted-foreground mt-1 h-5 w-5 shrink-0' />
          <div className='w-full space-y-4'>
            {user.devices && user.devices.length > 0 ? (
              <div className='space-y-4'>
                <p className='text-sm text-green-700 dark:text-green-400'>
                  {t('statusEnabled')}
                </p>
                <div className='relative'>
                  {isPending && (
                    <div className='bg-card/80 absolute inset-0 z-10 flex items-center justify-center rounded-md backdrop-blur-xs'>
                      <div className='text-muted-foreground flex items-center gap-2'>
                        <Loader2 className='h-5 w-5 animate-spin' />
                        <span>{t('updatingList')}</span>
                      </div>
                    </div>
                  )}
                  <div className='rounded-md border'>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>{t('table.name')}</TableHead>
                          <TableHead>{t('table.addedOn')}</TableHead>
                          <TableHead className='text-right'>
                            {t('table.actions')}
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {user.devices.map((device) => (
                          <TableRow
                            key={device.key}
                            className={cn(
                              'transition-opacity',
                              isPending &&
                                deletingKey === device.key &&
                                'opacity-50'
                            )}
                          >
                            <TableCell className='font-medium'>
                              <div className='flex items-center gap-2'>
                                <KeyRound className='text-muted-foreground h-4 w-4' />
                                <span>{device.name}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              {isMounted && device.createDate
                                ? format(new Date(device.createDate), 'PPP')
                                : '...'}
                            </TableCell>
                            <TableCell className='text-right'>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button
                                    variant='ghost'
                                    size='icon'
                                    disabled={isPending}
                                    aria-label={`Delete passkey ${device.name}`}
                                  >
                                    <Trash2 className='text-muted-foreground hover:text-destructive h-4 w-4' />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>
                                      {t('deleteDialog.title')}
                                    </AlertDialogTitle>
                                    <AlertDialogDescription>
                                      {t('deleteDialog.description', {
                                        deviceName: device.name,
                                      })}
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel
                                      disabled={
                                        isPending && deletingKey === device.key
                                      }
                                    >
                                      {t('deleteDialog.cancel')}
                                    </AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() =>
                                        handleDeletePasskey(device.key)
                                      }
                                      disabled={isPending}
                                    >
                                      {isPending &&
                                        deletingKey === device.key && (
                                          <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                                        )}
                                      {t('deleteDialog.confirm')}
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </div>
            ) : (
              <p className='text-muted-foreground text-sm'>
                {t('statusDisabled')}
              </p>
            )}

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant='outline' size='sm' disabled={isPending}>
                  {t('addButton')}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>
                    {t('addPasskeyDialog.title')}
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    {t('addPasskeyDialog.description')}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel disabled={isAddingPasskey}>
                    {t('addPasskeyDialog.cancel')}
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleAddPasskey}
                    disabled={isAddingPasskey}
                  >
                    {isAddingPasskey && (
                      <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                    )}
                    {t('addPasskeyDialog.continue')}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
