
'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/icons/Logo';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetTrigger } from '@/components/ui/sheet';
import { LogOut, Menu, User as UserIcon } from 'lucide-react';
import { getAuth, onAuthStateChanged, User } from 'firebase/auth';
import { useEffect, useState } from 'react';
import { app } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';


const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/submit-cat', label: 'Submit Cat' },
  { href: '/about', label: 'About' },
  { href: '/donate', label: 'Donate' },
];

export function Header() {
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const auth = getAuth(app);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, [auth]);

  const handleLogout = async () => {
    await auth.signOut();
    router.push('/');
  };

  const NavItems = () => (
    <>
      {navLinks.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className={cn(
            'text-sm font-medium transition-colors hover:text-primary',
            pathname === link.href ? 'text-primary' : 'text-muted-foreground'
          )}
        >
          {link.label}
        </Link>
      ))}
    </>
  );

  const AuthButtons = () => (
    <>
      {user ? (
        <>
          <Button variant="ghost" asChild>
            <Link href={`/profile/${user.uid}`}>
              <UserIcon className="mr-2" /> Profile
            </Link>
          </Button>
          <Button onClick={handleLogout}>
            <LogOut className="mr-2" /> Logout
          </Button>
        </>
      ) : (
        <>
          <Button asChild>
            <Link href="/login">Sign In</Link>
          </Button>
        </>
      )}
    </>
  );

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <div className="mr-8 flex items-center">
          <Link href="/" className="flex items-center gap-2">
            <Logo className="h-6 w-6 text-primary" />
            <span className="font-bold font-headline text-lg">Feline Finder</span>
          </Link>
        </div>
        <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
          <NavItems />
        </nav>
        <div className="flex flex-1 items-center justify-end space-x-4">
          <div className="hidden md:flex items-center space-x-2">
            <AuthButtons />
          </div>
          <div className="md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                  <span className="sr-only">Toggle Menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right">
                <SheetHeader>
                  <VisuallyHidden>
                    <SheetTitle>Main Menu</SheetTitle>
                    <SheetDescription>
                      Navigation links and authentication options for the Feline Finder application.
                    </SheetDescription>
                  </VisuallyHidden>
                </SheetHeader>
                <div className="grid gap-4 py-4">
                  <NavItems />
                   <div className="grid gap-2">
                     <AuthButtons />
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
