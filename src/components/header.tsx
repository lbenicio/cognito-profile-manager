'use client';

import { useTransition } from 'react';
import { Link } from '@/navigation';
import { LogOut, Settings, LayoutDashboard, Menu, Shield, Contact, CircleUserRound } from 'lucide-react';
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
import { logout } from '@/lib/auth-actions';
import type { User as UserType } from '@/lib/auth';
import { Separator } from '@/components/ui/separator';

type HeaderTranslations = {
  title: string;
  userMenu: {
    profile: string;
    settings: string;
    logout: string;
    adminDashboard: string;
    account: string;
  };
  mobileMenuTitle: string;
  mobileMenuTrigger: string;
  language: string;
};

export function Header({ user, translations: t }: { user: UserType | null, translations: HeaderTranslations }) {
  const [isPending, startTransition] = useTransition();

  const handleLogout = () => {
    startTransition(() => {
      logout();
    });
  };

  const adminDashboardUrl = process.env.NEXT_PUBLIC_ADMIN_DASHBOARD_URL || '#';
  const currentLanguage = user?.preferences?.language || 'en';

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-card shadow-sm">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-8">
        {/* Left side: App Logo and Title */}
        <Link href="/" className="flex items-center gap-2 text-xl font-bold">
          <LayoutDashboard className="h-6 w-6 text-primary" />
          <span className="hidden sm:inline-block">{t.title}</span>
        </Link>
        
        {/* Right side: Controls */}
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <LanguageSwitcher 
            languageLabel={t.language}
            currentLanguage={currentLanguage}
          />
          {user && (
            <>
              {/* Desktop: User Avatar Dropdown */}
              <div className="hidden md:block">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={user.picture || ''} alt={user.name} data-ai-hint="profile picture" />
                        <AvatarFallback>{user.name ? user.name.split(' ').map(n => n[0]).join('') : 'U'}</AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{user.name}</p>
                        <p className="text-xs leading-none text-muted-foreground">
                          {user.email}
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {user.isAdmin && (
                      <DropdownMenuItem asChild>
                        <a href={adminDashboardUrl} target="_blank" rel="noopener noreferrer">
                          <Shield className="mr-2 h-4 w-4" />
                          <span>{t.userMenu.adminDashboard}</span>
                        </a>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem asChild>
                      <Link href="/profile">
                        <Contact className="mr-2 h-4 w-4" />
                        <span>{t.userMenu.profile}</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/account">
                        <CircleUserRound className="mr-2 h-4 w-4" />
                        <span>{t.userMenu.account}</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/settings">
                        <Settings className="mr-2 h-4 w-4" />
                        <span>{t.userMenu.settings}</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onSelect={handleLogout} disabled={isPending} className="cursor-pointer">
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>{t.userMenu.logout}</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Mobile: Hamburger Menu Sheet */}
              <div className="md:hidden">
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <Menu className="h-6 w-6" />
                      <span className="sr-only">{t.mobileMenuTrigger}</span>
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="right" className="p-0 flex flex-col">
                    <SheetHeader className="p-4 border-b">
                      <SheetTitle className="text-left">
                         <SheetClose asChild>
                           <Link
                              href="/"
                              className="flex items-center gap-2 text-lg font-semibold"
                            >
                              <LayoutDashboard className="h-6 w-6 text-primary" />
                              <span>{t.title}</span>
                            </Link>
                         </SheetClose>
                      </SheetTitle>
                    </SheetHeader>
                    <div className="p-4">
                        <div className="flex items-center gap-3">
                           <Avatar className="h-12 w-12">
                              <AvatarImage src={user.picture || ''} alt={user.name} data-ai-hint="profile picture" />
                              <AvatarFallback>{user.name ? user.name.split(' ').map(n => n[0]).join('') : 'U'}</AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col space-y-1">
                                <p className="text-sm font-medium leading-none">{user.name}</p>
                                <p className="text-xs leading-none text-muted-foreground">
                                {user.email}
                                </p>
                            </div>
                        </div>
                    </div>
                    <Separator/>
                    <nav className="flex-1 overflow-y-auto p-4 grid gap-1 text-base">
                      {user.isAdmin && (
                        <SheetClose asChild>
                            <a href={adminDashboardUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary">
                                <Shield className="h-5 w-5"/> {t.userMenu.adminDashboard}
                            </a>
                        </SheetClose>
                      )}
                      <SheetClose asChild>
                          <Link href="/profile" className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary">
                            <Contact className="h-5 w-5" />{t.userMenu.profile}
                          </Link>
                      </SheetClose>
                      <SheetClose asChild>
                          <Link href="/account" className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary">
                            <CircleUserRound className="h-5 w-5" />{t.userMenu.account}
                          </Link>
                      </SheetClose>
                      <SheetClose asChild>
                          <Link href="/settings" className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary">
                            <Settings className="h-5 w-5" />{t.userMenu.settings}
                          </Link>
                      </SheetClose>
                    </nav>
                    <div className="mt-auto p-4 border-t">
                      <SheetClose asChild>
                        <Button onClick={handleLogout} disabled={isPending} variant="outline" className="w-full justify-start cursor-pointer">
                          <LogOut className="mr-3 h-4 w-4" />
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
