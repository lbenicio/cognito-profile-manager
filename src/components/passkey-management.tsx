
'use client';

import { useState, useEffect, useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { KeyRound, Loader2, TestTube2, Trash2, Copy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useTranslations } from 'next-intl';
import type { User } from '@/lib/auth';
import { deletePasskey } from '@/lib/passkey-actions';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
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
import { listCognitoPasskeys } from '@/lib/passkey-admin-actions';
import { Separator } from './ui/separator';

interface PasskeyManagementProps {
    user: User;
}

export function PasskeyManagement({ user }: PasskeyManagementProps) {
    const { toast } = useToast();
    const t = useTranslations('Security.passkeys');
    const router = useRouter();
    const searchParams = useSearchParams();
    const [isPending, startTransition] = useTransition();
    const [isTesting, startTestTransition] = useTransition();

    const [isAddingPasskey, setIsAddingPasskey] = useState(false);
    const [isDeleting, setIsDeleting] = useState<string | null>(null);
    const [isMounted, setIsMounted] = useState(false);

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
    
    const handleAddPasskey = () => {
        setIsAddingPasskey(true);
        window.location.href = '/api/v1/auth/passkey/start';
    };

    const handleDeletePasskey = (key: string) => {
        startTransition(async () => {
            setIsDeleting(key);
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
            setIsDeleting(null);
        });
    };

    const handleTestListPasskeys = () => {
        startTestTransition(async () => {
            const result = await listCognitoPasskeys(user.username);
            if (result.success && result.data) {
                const formattedData = JSON.stringify(result.data, null, 2);

                const copyToClipboard = () => {
                    navigator.clipboard.writeText(formattedData);
                    toast({
                        title: "Copied!",
                        description: "Passkey data has been copied to clipboard.",
                    });
                };

                toast({
                    title: "Passkey Credentials Found",
                    description: (
                        <div className="w-full mt-2">
                             <p className="text-sm text-muted-foreground mb-2">
                                Found {result.data?.length || 0} passkeys for user <span className="font-mono text-foreground">{user.username}</span>.
                            </p>
                            <div className="w-full max-w-full rounded-md bg-muted p-2">
                                <pre className="text-xs overflow-x-auto max-h-60">
                                    <code>{formattedData}</code>
                                </pre>
                            </div>
                            <Button onClick={copyToClipboard} size="sm" className="mt-4 w-full">
                                <Copy className="mr-2 h-4 w-4" />
                                Copy JSON
                            </Button>
                        </div>
                    ),
                });
            } else {
                 toast({
                    variant: 'destructive',
                    title: 'Dev Test Failed',
                    description: result.message,
                });
            }
        });
    };

    return (
         <Card>
            <CardHeader>
                <CardTitle>{t('title')}</CardTitle>
                <CardDescription>
                    {t('description')}
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="flex items-start gap-3">
                    <KeyRound className="w-5 h-5 text-muted-foreground mt-1 flex-shrink-0" />
                    <div className="w-full space-y-4">
                        {user.devices && user.devices.length > 0 ? (
                            <div className="space-y-4">
                                <p className="text-sm text-green-700 dark:text-green-400">{t('statusEnabled')}</p>
                                <div className="rounded-md border">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>{t('table.name')}</TableHead>
                                                <TableHead>{t('table.addedOn')}</TableHead>
                                                <TableHead className="text-right">{t('table.actions')}</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {user.devices.map((device) => (
                                                <TableRow key={device.key}>
                                                    <TableCell className="font-medium">
                                                        <div className="flex items-center gap-2">
                                                            <KeyRound className="h-4 w-4 text-muted-foreground" />
                                                            <span>{device.name}</span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        {isMounted && device.createDate ? format(new Date(device.createDate), "PPP") : '...'}
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <AlertDialog>
                                                            <AlertDialogTrigger asChild>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    disabled={isDeleting === device.key || isPending}
                                                                    aria-label={`Delete passkey ${device.name}`}
                                                                >
                                                                    {isDeleting === device.key ? (
                                                                        <Loader2 className="h-4 w-4 animate-spin" />
                                                                    ) : (
                                                                        <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                                                                    )}
                                                                </Button>
                                                            </AlertDialogTrigger>
                                                            <AlertDialogContent>
                                                                <AlertDialogHeader>
                                                                    <AlertDialogTitle>{t('deleteDialog.title')}</AlertDialogTitle>
                                                                    <AlertDialogDescription>
                                                                        {t('deleteDialog.description', { deviceName: device.name })}
                                                                    </AlertDialogDescription>
                                                                </AlertDialogHeader>
                                                                <AlertDialogFooter>
                                                                    <AlertDialogCancel>{t('deleteDialog.cancel')}</AlertDialogCancel>
                                                                    <AlertDialogAction onClick={() => handleDeletePasskey(device.key)}>
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
                        ) : (
                            <p className="text-sm text-muted-foreground">{t('statusDisabled')}</p>
                        )}

                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="outline" size="sm" disabled={isAddingPasskey || isPending}>
                                    {(isAddingPasskey || isPending) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    {t('addButton')}
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>{t('addPasskeyDialog.title')}</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        {t('addPasskeyDialog.description')}
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>{t('addPasskeyDialog.cancel')}</AlertDialogCancel>
                                    <AlertDialogAction onClick={handleAddPasskey}>
                                        {t('addPasskeyDialog.continue')}
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </div>
                </div>
            </CardContent>
            {process.env.NODE_ENV === 'development' && user.isAdmin && (
                <CardFooter className="flex-col items-start gap-4 !pt-0">
                    <Separator className="mb-4" />
                    <h4 className="text-sm font-semibold">Developer Tools</h4>
                     <p className="text-xs text-muted-foreground -mt-2">
                        This button tests the admin API for listing passkeys. It requires the correct IAM permissions on the server.
                     </p>
                    <Button variant="outline" size="sm" onClick={handleTestListPasskeys} disabled={isTesting}>
                        {isTesting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <TestTube2 className="mr-2 h-4 w-4" />}
                        Test List Passkeys (Admin)
                    </Button>
                </CardFooter>
            )}
        </Card>
    );
}
