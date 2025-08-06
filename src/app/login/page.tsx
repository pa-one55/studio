
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Logo } from '@/components/icons/Logo';
import { getAuth, signInWithRedirect, GoogleAuthProvider, onAuthStateChanged, getRedirectResult, UserCredential } from 'firebase/auth';
import { app } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { addUser, getUser } from '@/lib/firebase/firestore';

export default function LoginPage() {
  console.log("LoginPage: Component rendering...");
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const auth = getAuth(app);
  
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      console.log("BROWSER LOG: onAuthStateChanged triggered. User:", firebaseUser);

      if (firebaseUser) {
        // A user is logged in. This could be from a fresh redirect or an existing session.
        setIsLoading(true); // Show loader while we check the database.
        console.log("BROWSER LOG: User detected with UID:", firebaseUser.uid);
        
        try {
          const existingUser = await getUser(firebaseUser.uid);

          if (!existingUser) {
            // This is a new user, create their document in Firestore.
            console.log("BROWSER LOG: New user. Creating Firestore document...");
            await addUser({
              id: firebaseUser.uid,
              name: firebaseUser.displayName || 'Anonymous User',
              email: firebaseUser.email || '',
              imageUrl: firebaseUser.photoURL || 'https://placehold.co/128x128.png',
              friends: [],
              socials: {},
            });
            console.log("BROWSER LOG: User document created successfully.");
            toast({
              title: 'Sign Up Successful',
              description: 'Welcome! Your account has been created.',
            });
          } else {
            // This user already exists in Firestore.
            console.log("BROWSER LOG: Existing user found. Not creating a new document.");
             toast({
              title: 'Welcome Back!',
              description: 'You are already signed in.',
            });
          }
          
          // Redirect to the homepage.
          console.log("BROWSER LOG: Redirecting to homepage...");
          router.push('/');

        } catch (error) {
          console.error("BROWSER LOG: Error during database operation:", error);
          toast({ variant: "destructive", title: 'Error', description: 'Failed to set up your account.' });
          setIsLoading(false); // Stop loading on error
        }

      } else {
        // No user is logged in. Check for a redirect result from Google.
        getRedirectResult(auth).then((result) => {
          if (result) {
            // The onAuthStateChanged listener above will handle the user creation and redirect.
            console.log("BROWSER LOG: Google redirect result processed.");
            setIsLoading(true); // Keep loading as onAuthStateChanged will re-trigger with user
          } else {
            // This was a normal page load, not a redirect.
             console.log("BROWSER LOG: No user is signed in. Ready for registration attempt.");
             setIsLoading(false);
          }
        }).catch((error) => {
          console.error("BROWSER LOG: Google sign-up redirect error:", error);
          toast({
            variant: "destructive",
            title: 'Sign In Failed',
            description: 'Could not sign in with Google. Please try again.',
          });
          setIsLoading(false);
        });
      }
    });

    // Cleanup function: remove the listener when the component unmounts.
    return () => {
      console.log("BROWSER LOG: Cleaning up onAuthStateChanged listener.");
      unsubscribe();
    };
  }, [auth, router, toast]);

  const handleGoogleLogin = async () => {
    console.log("BROWSER LOG: handleGoogleLogin called.");
    setIsLoading(true);
    const provider = new GoogleAuthProvider();
    await signInWithRedirect(auth, provider);
    // After redirect, the logic in useEffect will handle the result.
  };

  // Show a global loading spinner.
  if (isLoading) {
    return (
        <div className="flex items-center justify-center min-h-[calc(100vh-12rem)]">
            <Loader2 className="h-16 w-16 animate-spin text-primary" />
            <span className="sr-only">Loading...</span>
        </div>
    )
  }

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-12rem)] py-12 px-4">
      <Card className="mx-auto max-w-sm w-full">
        <CardHeader className="text-center">
          <Logo className="h-10 w-10 mx-auto text-primary mb-2" />
          <CardTitle className="text-2xl font-headline">Get Started</CardTitle>
          <CardDescription>Continue with Google to sign in or create an account.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="outline" className="w-full" onClick={handleGoogleLogin} disabled={isLoading}>
           {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <svg className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512"><path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 126 23.4 172.9 61.9l-76.2 64.5C308.6 92.6 279.2 80 248 80c-73.2 0-133.2 59.9-133.2 133.2S174.8 386.4 248 386.4c77.9 0 119.5-56.2 123.4-86.4H248v-85.3h236.1c2.3 12.7 3.9 26.9 3.9 41.4z"></path></svg>}
            Continue with Google
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
