'use client';

import { useTransition } from 'react';
import { Link } from '@/navigation';
import { User, LogOut, Settings, LayoutDashboard } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from './theme-toggle';
import { LanguageSwitcher } from './language-switcher';
import { useTranslations } from 'next-intl';
import { logout } from '@/lib/auth-actions';
import type { User as UserType } from '@/lib/auth';

export function Header({ user }: { user: UserType | null }) {
  const t = useTranslations('Header');
  const [isPending, startTransition] = useTransition();

  const handleLogout = () => {
    startTransition(() => {
      logout();
    });
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-card shadow-sm">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-8">
        <Link href="/" className="flex items-center gap-2">
          <LayoutDashboard className="h-6 w-6 text-primary" />
          <span className="text-xl font-bold">{t('title')}</span>
        </Link>

        {user && (
            <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
                <Link href="/" className="text-foreground transition-colors hover:text-primary">{t('home')}</Link>
            </nav>
        )}
        
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <LanguageSwitcher />
          {user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src="https://placehold.co/128x128.png" alt={user.name} data-ai-hint="profile picture" />
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
                <DropdownMenuItem asChild>
                  <Link href="/profile">
                    <User className="mr-2 h-4 w-4" />
                    <span>{t('userMenu.profile')}</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/settings">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>{t('userMenu.settings')}</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={handleLogout} disabled={isPending} className="cursor-pointer">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>{t('userMenu.logout')}</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </header>
  );
}
