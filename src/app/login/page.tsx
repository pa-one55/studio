
'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Logo } from '@/components/icons/Logo';
import { Separator } from '@/components/ui/separator';
import { getAuth, signInWithRedirect, GoogleAuthProvider, onAuthStateChanged, signInWithEmailAndPassword } from 'firebase/auth';
import { app } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

const formSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email' }),
  password: z.string().min(1, { message: 'Password is required' }),
});

type FormValues = z.infer<typeof formSchema>;

export default function LoginPage() {
  console.log("LoginPage: Component rendering...");
  const { toast } = useToast();
  const [isAuthLoading, setIsAuthLoading] = useState(true); // For the initial auth state check
  const [isSubmitting, setIsSubmitting] = useState(false); // For form submissions
  const router = useRouter();
  const auth = getAuth(app);
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
        email: '',
        password: '',
    }
  });
console.log("LoginPage: Form initialized with default values:", form.getValues());
  // This useEffect hook reliably checks the user's authentication state when the page loads.
  useEffect(() => {
    console.log("BROWSER LOG: LoginPage useEffect started. Setting up onAuthStateChanged listener...");
    
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      console.log("BROWSER LOG: LoginPage onAuthStateChanged triggered. User:", firebaseUser);

      if (firebaseUser) {
        // A user is already logged in.
        console.log("BROWSER LOG: User is already logged in. Redirecting to homepage...");
        toast({ title: 'Already Logged In', description: 'Redirecting you to the homepage.' });
        router.push('/');
      } else {
        // No user is logged in. Show the login page.
        console.log("BROWSER LOG: No user is signed in. Login page will be displayed.");
        setIsAuthLoading(false);
      }
    });

    // Cleanup function: remove the listener when the component unmounts.
    return () => {
      console.log("BROWSER LOG: Cleaning up LoginPage onAuthStateChanged listener.");
      unsubscribe();
    }
  }, [auth, router, toast]);


  const handleGoogleLogin = async () => {
    console.log("BROWSER LOG: handleGoogleLogin called.");
    setIsSubmitting(true);
    const provider = new GoogleAuthProvider();
    await signInWithRedirect(auth, provider);
    // After redirect, the onAuthStateChanged listener will handle the result.
  };
  
  const onEmailSubmit = async (values: FormValues) => {
    console.log("BROWSER LOG: onEmailSubmit called with values:", values);
    setIsSubmitting(true);
    try {
      await signInWithEmailAndPassword(auth, values.email, values.password);
      console.log("BROWSER LOG: Email login successful.");
      toast({
        title: 'Login Successful',
        description: 'Welcome back!',
      });
      // The onAuthStateChanged listener will handle the redirect.
    } catch (error: any) {
      console.error("BROWSER LOG: Email login error:", error);
      toast({
        variant: "destructive",
        title: 'Login Failed',
        description: error.code === 'auth/invalid-credential' 
            ? 'Invalid email or password. Please try again.'
            : 'An unexpected error occurred.',
      });
       setIsSubmitting(false);
    }
  };

  // Show a global loading spinner only for the initial auth check.
  if (isAuthLoading) {
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
          <CardTitle className="text-2xl font-headline">Login</CardTitle>
          <CardDescription>Welcome back! Sign in to your account.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
             <Button variant="outline" className="w-full" onClick={handleGoogleLogin} disabled={isSubmitting}>
               {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <svg className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512"><path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 126 23.4 172.9 61.9l-76.2 64.5C308.6 92.6 279.2 80 248 80c-73.2 0-133.2 59.9-133.2 133.2S174.8 386.4 248 386.4c77.9 0 119.5-56.2 123.4-86.4H248v-85.3h236.1c2.3 12.7 3.9 26.9 3.9 41.4z"></path></svg>}
              Login with Google
            </Button>

            <div className="flex items-center space-x-2">
              <Separator className="flex-1" />
              <span className="text-xs text-muted-foreground">OR LOGIN WITH EMAIL</span>
              <Separator className="flex-1" />
            </div>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onEmailSubmit)} className="space-y-4">
                    <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Email</FormLabel>
                                <FormControl>
                                    <Input type="email" placeholder="m@example.com" {...field} disabled={isSubmitting} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                             <FormItem>
                                <div className="flex items-center">
                                    <FormLabel>Password</FormLabel>
                                    <Link href="#" className="ml-auto inline-block text-sm underline">
                                    Forgot your password?
                                    </Link>
                                </div>
                                <FormControl>
                                    <Input type="password" {...field} disabled={isSubmitting}/>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <Button type="submit" className="w-full" disabled={isSubmitting}>
                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Login
                    </Button>
                </form>
            </Form>
          </div>
          <div className="mt-4 text-center text-sm">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="underline">
              Sign up
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
