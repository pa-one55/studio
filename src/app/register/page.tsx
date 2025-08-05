
'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Logo } from '@/components/icons/Logo';
import { Separator } from '@/components/ui/separator';
import { getAuth, signInWithRedirect, GoogleAuthProvider, getRedirectResult, type UserCredential } from 'firebase/auth';
import { app } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { addUser, getUser } from '@/lib/firebase/firestore';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  // --- EXPLANATION OF HOOKS ---
  // 1. `useToast`: A function to show pop-up notifications to the user.
  // 2. `useState`: Manages the loading state to show/hide a spinner.
  // 3. `getAuth`: The core Firebase authentication object. Essential.
  // 4. `useRouter`: Used to redirect the user to another page.
  console.log("RegisterPage: Component rendering.");
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true); // Start as true to check for redirect
  const auth = getAuth(app);
  const router = useRouter();

  // `useEffect` runs after the page loads. It's perfect for checking the result
  // of the Google Sign-In redirect without blocking the page from showing up.
  useEffect(() => {
    const processRedirectResult = async () => {
      console.log("RegisterPage: useEffect started. Checking for Google redirect result...");
      try {
        const result: UserCredential | null = await getRedirectResult(auth);
        
        // This is the most important part. `result` will only have a value
        // if the user has just been redirected back from a successful Google Sign-In.
        if (result) {
          console.log("RegisterPage: Google sign-up redirect successful.", result.user);
          const firebaseUser = result.user;
          
          // Check if we have already created a document for this user in our database.
          const existingUser = await getUser(firebaseUser.uid);
          
          if (!existingUser) {
            // If the user is new, create a document for them in the 'users' collection.
            console.log("RegisterPage: New user detected. Creating user document in Firestore...");
            await addUser({
              id: firebaseUser.uid,
              name: firebaseUser.displayName || 'Anonymous User',
              email: firebaseUser.email || '',
              imageUrl: firebaseUser.photoURL || 'https://placehold.co/128x128.png',
              friends: [],
              socials: {},
            });
            console.log("RegisterPage: User document created successfully.");
            toast({
              title: 'Sign Up Successful',
              description: 'Welcome! Your account has been created.',
            });
          } else {
            // If they already exist, just welcome them back.
            console.log("RegisterPage: Existing user detected. Not creating a new document.");
            toast({
              title: 'Welcome Back!',
              description: 'You have successfully signed in.',
            });
          }
          // After everything is done, redirect to the homepage.
          console.log("RegisterPage: Redirecting to homepage...");
          router.push('/');
        } else {
            // If `result` is null, it means the user just loaded the page normally,
            // without coming from a Google redirect. So, we stop loading.
            console.log("RegisterPage: No redirect result found. Displaying registration options.");
            setIsLoading(false);
        }
      } catch (error: any) {
        // If there was any error during the process, show it in a toast.
        console.error("RegisterPage: Error during Google sign-up redirect processing:", error);
        toast({
          variant: "destructive",
          title: 'Sign Up Failed',
          description: error.message,
        });
        setIsLoading(false);
      }
    };
    
    // Call the function we just defined.
    processRedirectResult();
  }, [auth, toast, router]); // These are dependencies. The effect re-runs if they change (they won't).

  // This function is called when the user clicks the "Sign up with Google" button.
  const handleGoogleSignUp = async () => {
    console.log("RegisterPage: 'Sign up with Google' button clicked.");
    setIsLoading(true); // Show the loading spinner
    const provider = new GoogleAuthProvider();
    // This will redirect the user to Google's sign-in page.
    await signInWithRedirect(auth, provider);
  };

  // While we are checking for the redirect result, show a loading spinner.
  if (isLoading) {
    return (
        <div className="flex items-center justify-center min-h-[calc(100vh-12rem)]">
            <Loader2 className="h-16 w-16 animate-spin text-primary" />
            <span className="sr-only">Loading...</span>
        </div>
    )
  }

  // If not loading, show the actual page content.
  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-12rem)] py-12 px-4">
      <Card className="mx-auto max-w-sm w-full">
        <CardHeader className="text-center">
          <Logo className="h-10 w-10 mx-auto text-primary mb-2" />
          <CardTitle className="text-2xl font-headline">Create an Account</CardTitle>
          <CardDescription>Sign up to start finding and reporting cats.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <Button variant="outline" className="w-full" onClick={handleGoogleSignUp} disabled={isLoading}>
               {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <svg className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512"><path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 126 23.4 172.9 61.9l-76.2 64.5C308.6 92.6 279.2 80 248 80c-73.2 0-133.2 59.9-133.2 133.2S174.8 386.4 248 386.4c77.9 0 119.5-56.2 123.4-86.4H248v-85.3h236.1c2.3 12.7 3.9 26.9 3.9 41.4z"></path></svg>}
              Sign up with Google
            </Button>
            
            <div className="flex items-center space-x-2">
              <Separator className="flex-1" />
              <span className="text-xs text-muted-foreground">OR</span>
              <Separator className="flex-1" />
            </div>

             <Button asChild>
                <Link href="/register-email">Sign up with Email</Link>
            </Button>
          </div>
          <div className="mt-4 text-center text-sm">
            Already have an account?{' '}
            <Link href="/login" className="underline">
              Login
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
