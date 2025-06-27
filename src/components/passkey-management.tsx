
'use client';

import { useState, useEffect, useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { KeyRound, Loader2, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useTranslations } from 'next-intl';
import type { User } from '@/lib/auth';
import { deletePasskey } from '@/lib/passkey-actions';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { format } from 'date-fns';

interface PasskeyManagementProps {
    user: User;
}

export function PasskeyManagement({ user }: PasskeyManagementProps) {
    const { toast } = useToast();
    const t = useTranslations('Security.passkeys');
    const router = useRouter();
    const searchParams = useSearchParams();
    const [isPending, startTransition] = useTransition();

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
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => handleDeletePasskey(device.key)}
                                                            disabled={isDeleting === device.key || isPending}
                                                            aria-label={`Delete passkey ${device.name}`}
                                                        >
                                                            {isDeleting === device.key ? (
                                                                <Loader2 className="h-4 w-4 animate-spin" />
                                                            ) : (
                                                                <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                                                            )}
                                                        </Button>
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

                        <Button variant="outline" size="sm" onClick={handleAddPasskey} disabled={isAddingPasskey || isPending}>
                            {(isAddingPasskey || isPending) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {t('addButton')}
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
