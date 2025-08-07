
'use client';

import { useEffect, useState } from 'react';
import { getAuth, onAuthStateChanged, User } from 'firebase/auth';
import { app } from '@/lib/firebase';
import type { Cat } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, Loader2 } from 'lucide-react';
import Link from 'next/link';
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
} from "@/components/ui/alert-dialog"
import { deleteCatAction } from '@/app/cat/actions';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

interface CatProfileActionsProps {
  cat: Cat;
}

export function CatProfileActions({ cat }: CatProfileActionsProps) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const auth = getAuth(app);
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, [auth]);

  const isOwner = currentUser?.uid === cat.listerId;

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteCatAction(cat.id);
      toast({
        title: 'Listing Deleted',
        description: `The listing for "${cat.name || 'Unnamed Cat'}" has been removed.`,
      });
      router.push('/');
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Deletion Failed',
        description: 'Could not delete the cat listing. Please try again.',
      });
      setIsDeleting(false);
    }
  };

  if (!isOwner) {
    return null;
  }

  return (
    <div className="flex items-center gap-2">
      <Button asChild variant="outline" size="sm">
        <Link href="/coming-soon">
          <Edit className="mr-2 h-4 w-4" /> Edit
        </Link>
      </Button>

      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="destructive" size="sm">
            <Trash2 className="mr-2 h-4 w-4" /> Delete
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              listing for "{cat.name || 'Unnamed Cat'}" and remove its data from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={isDeleting}>
              {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
