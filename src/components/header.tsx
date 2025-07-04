'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  LogOut,
  Settings,
  LayoutDashboard,
  Menu,
  Shield,
  Contact,
  CircleUserRound,
  ShieldCheck,
  Loader2,
  Bell,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from '@/components/ui/sheet';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from './theme-toggle';
import { LanguageSwitcher } from './language-switcher';
import type { User as UserType } from '@/types/user/user.types';
import { Separator } from '@/components/ui/separator';
import { useTransition } from 'react';
import { useToast } from '@/hooks/use-toast';
import { localLogout } from '@/actions/auth.action';
import { Badge } from '@/components/ui/badge';

type HeaderTranslations = {
  title: string;
  userMenu: {
    profile: string;
    settings: string;
    logout: string;
    adminDashboard: string;
    account: string;
    security: string;
    messages: string;
  };
  mobileMenuTitle: string;
  mobileMenuTrigger: string;
  language: string;
};

export function Header({
  user,
  translations: t,
}: {
  user: UserType | null;
  translations: HeaderTranslations;
}) {
  const adminDashboardUrl = process.env.NEXT_PUBLIC_ADMIN_DASHBOARD_URL || '#';
  const currentLanguage = user?.preferences?.language || 'en';
  const [isLoggingOut, startTransition] = useTransition();
  const { toast } = useToast();

  const handleLogout = () => {
    startTransition(() => {
      // This is a local logout. It clears the session and redirects to /login.
      // It does not perform a full OIDC single-logout.
      localLogout();
    });
  };

  return (
    <header className='bg-card sticky top-0 z-50 w-full border-b shadow-xs'>
      <div className='container mx-auto flex h-16 items-center justify-between px-4 md:px-8'>
        {/* Left side: App Logo and Title */}
        <Link href='/' className='flex items-center gap-2 text-xl font-bold'>
          <LayoutDashboard className='text-primary h-6 w-6' />
          <span className='hidden sm:inline-block'>{t.title}</span>
        </Link>

        {/* Right side: Controls */}
        <div className='flex items-center gap-2'>
          <ThemeToggle />
          <LanguageSwitcher
            languageLabel={t.language}
            currentLanguage={currentLanguage}
          />
          {user && (
            <>
              {/* Desktop: User Avatar Dropdown */}
              <div className='hidden items-center gap-2 md:flex'>
                <Link href='/messages' className='relative'>
                  <Button variant='ghost' size='icon'>
                    <Bell className='h-5 w-5' />
                    {user.messages.length > 0 && (
                      <Badge
                        variant='destructive'
                        className='absolute -top-1 -right-1 h-5 w-5 justify-center rounded-full p-0 text-xs'
                      >
                        {user.messages.length}
                      </Badge>
                    )}
                    <span className='sr-only'>{t.userMenu.messages}</span>
                  </Button>
                </Link>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant='ghost'
                      className='relative h-10 w-10 rounded-full'
                    >
                      <Avatar className='h-10 w-10'>
                        <AvatarImage
                          src={user.picture || ''}
                          alt={user.name}
                          data-ai-hint='profile picture'
                        />
                        <AvatarFallback>
                          {user.name
                            ? user.name
                                .split(' ')
                                .map((n) => n[0])
                                .join('')
                            : 'U'}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className='w-56' align='end' forceMount>
                    <DropdownMenuLabel className='font-normal'>
                      <div className='flex flex-col space-y-1'>
                        <p className='text-sm leading-none font-medium'>
                          {user.name}
                        </p>
                        <p className='text-muted-foreground text-xs leading-none'>
                          {user.email}
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {user.isAdmin && (
                      <DropdownMenuItem asChild>
                        <a
                          href={adminDashboardUrl}
                          target='_blank'
                          rel='noopener noreferrer'
                        >
                          <Shield className='mr-2 h-4 w-4' />
                          <span>{t.userMenu.adminDashboard}</span>
                        </a>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem asChild>
                      <Link href='/profile'>
                        <Contact className='mr-2 h-4 w-4' />
                        <span>{t.userMenu.profile}</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href='/account'>
                        <CircleUserRound className='mr-2 h-4 w-4' />
                        <span>{t.userMenu.account}</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href='/security'>
                        <ShieldCheck className='mr-2 h-4 w-4' />
                        <span>{t.userMenu.security}</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href='/settings'>
                        <Settings className='mr-2 h-4 w-4' />
                        <span>{t.userMenu.settings}</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={handleLogout}
                      disabled={isLoggingOut}
                      className='cursor-pointer'
                    >
                      {isLoggingOut ? (
                        <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                      ) : (
                        <LogOut className='mr-2 h-4 w-4' />
                      )}
                      <span>{t.userMenu.logout}</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Mobile: Hamburger Menu Sheet */}
              <div className='md:hidden'>
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant='ghost' size='icon'>
                      <Menu className='h-6 w-6' />
                      <span className='sr-only'>{t.mobileMenuTrigger}</span>
                    </Button>
                  </SheetTrigger>
                  <SheetContent side='right' className='flex flex-col p-0'>
                    <SheetHeader className='border-b p-4'>
                      <SheetTitle className='text-left'>
                        <SheetClose asChild>
                          <Link
                            href='/'
                            className='flex items-center gap-2 text-lg font-semibold'
                          >
                            <LayoutDashboard className='text-primary h-6 w-6' />
                            <span>{t.title}</span>
                          </Link>
                        </SheetClose>
                      </SheetTitle>
                    </SheetHeader>
                    <div className='p-4'>
                      <div className='flex items-center gap-3'>
                        <Avatar className='h-12 w-12'>
                          <AvatarImage
                            src={user.picture || ''}
                            alt={user.name}
                            data-ai-hint='profile picture'
                          />
                          <AvatarFallback>
                            {user.name
                              ? user.name
                                  .split(' ')
                                  .map((n) => n[0])
                                  .join('')
                              : 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div className='flex flex-col space-y-1'>
                          <p className='text-sm leading-none font-medium'>
                            {user.name}
                          </p>
                          <p className='text-muted-foreground text-xs leading-none'>
                            {user.email}
                          </p>
                        </div>
                      </div>
                    </div>
                    <Separator />
                    <nav className='grid flex-1 gap-1 overflow-y-auto p-4 text-base'>
                      {user.isAdmin && (
                        <SheetClose asChild>
                          <a
                            href={adminDashboardUrl}
                            target='_blank'
                            rel='noopener noreferrer'
                            className='text-muted-foreground hover:text-primary flex items-center gap-3 rounded-lg px-3 py-2 transition-all'
                          >
                            <Shield className='h-5 w-5' />{' '}
                            {t.userMenu.adminDashboard}
                          </a>
                        </SheetClose>
                      )}
                      <SheetClose asChild>
                        <Link
                          href='/messages'
                          className='text-muted-foreground hover:text-primary relative flex items-center gap-3 rounded-lg px-3 py-2 transition-all'
                        >
                          <Bell className='h-5 w-5' />
                          {t.userMenu.messages}
                          {user.messages.length > 0 && (
                            <Badge variant='destructive' className='ml-auto'>
                              {user.messages.length}
                            </Badge>
                          )}
                        </Link>
                      </SheetClose>
                      <SheetClose asChild>
                        <Link
                          href='/profile'
                          className='text-muted-foreground hover:text-primary flex items-center gap-3 rounded-lg px-3 py-2 transition-all'
                        >
                          <Contact className='h-5 w-5' />
                          {t.userMenu.profile}
                        </Link>
                      </SheetClose>
                      <SheetClose asChild>
                        <Link
                          href='/account'
                          className='text-muted-foreground hover:text-primary flex items-center gap-3 rounded-lg px-3 py-2 transition-all'
                        >
                          <CircleUserRound className='h-5 w-5' />
                          {t.userMenu.account}
                        </Link>
                      </SheetClose>
                      <SheetClose asChild>
                        <Link
                          href='/security'
                          className='text-muted-foreground hover:text-primary flex items-center gap-3 rounded-lg px-3 py-2 transition-all'
                        >
                          <ShieldCheck className='h-5 w-5' />
                          {t.userMenu.security}
                        </Link>
                      </SheetClose>
                      <SheetClose asChild>
                        <Link
                          href='/settings'
                          className='text-muted-foreground hover:text-primary flex items-center gap-3 rounded-lg px-3 py-2 transition-all'
                        >
                          <Settings className='h-5 w-5' />
                          {t.userMenu.settings}
                        </Link>
                      </SheetClose>
                    </nav>
                    <div className='mt-auto border-t p-4'>
                      <SheetClose asChild>
                        <Button
                          variant='outline'
                          className='w-full cursor-pointer justify-start'
                          onClick={handleLogout}
                          disabled={isLoggingOut}
                        >
                          {isLoggingOut ? (
                            <Loader2 className='mr-3 h-4 w-4 animate-spin' />
                          ) : (
                            <LogOut className='mr-3 h-4 w-4' />
                          )}
                          <span>{t.userMenu.logout}</span>
                        </Button>
                      </SheetClose>
                    </div>
                  </SheetContent>
                </Sheet>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
