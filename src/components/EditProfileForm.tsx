
'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { updateUserAction } from '@/app/profile/edit/actions';
import Image from 'next/image';
import { Loader2, UploadCloud, User } from 'lucide-react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { app } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { getUser } from '@/lib/firebase/firestore';

const MAX_FILE_SIZE_MB = 1;

const formSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  photo: z.any().optional(),
  twitter: z.string().url().optional().or(z.literal('')),
  github: z.string().url().optional().or(z.literal('')),
  linkedin: z.string().url().optional().or(z.literal('')),
});

type FormValues = z.infer<typeof formSchema>;

export function EditProfileForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  const { toast } = useToast();
  const router = useRouter();
  const auth = getAuth(app);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      twitter: '',
      github: '',
      linkedin: '',
    },
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        const userProfile = await getUser(currentUser.uid);
        if (userProfile) {
          setUser(currentUser as any);
          form.reset({
            name: userProfile.name,
            twitter: userProfile.socials?.twitter || '',
            github: userProfile.socials?.github || '',
            linkedin: userProfile.socials?.linkedin || '',
          });
          setPhotoPreview(userProfile.imageUrl);
        } else {
            router.push('/'); // Should not happen for a logged in user
        }
      } else {
        router.push('/login');
        toast({
          variant: 'destructive',
          title: 'Unauthorized',
          description: 'Please log in to edit your profile.',
        });
      }
      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, [auth, router, toast, form]);

  const handlePhotoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const validation = formSchema.shape.photo.safeParse([file]);
      if (!validation.success) {
        form.setError('photo', { message: validation.error.errors[0].message });
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (values: FormValues) => {
    if (!user) {
      toast({ variant: 'destructive', title: 'Update Failed', description: 'You must be logged in.' });
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await updateUserAction({
        userId: user.uid,
        name: values.name,
        imageUrl: photoPreview, // Will be the new Data URI or the old URL
        socials: {
          twitter: values.twitter,
          github: values.github,
          linkedin: values.linkedin,
        },
      });

      if (result.success) {
        toast({
          title: 'Profile Updated!',
          description: 'Your profile has been successfully updated.',
        });
        router.push(`/profile/${user.uid}`);
        router.refresh(); // Tell Next.js to refresh the page data
      } else if (result.error) {
        toast({ variant: 'destructive', title: 'Update Failed', description: result.error });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Could not submit the form.';
      toast({ variant: 'destructive', title: 'An error occurred', description: errorMessage });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="photo"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Profile Photo</FormLabel>
              <FormControl>
                <div className="flex items-center justify-center w-full">
                  <label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer bg-card hover:bg-muted/50 transition-colors">
                    {photoPreview ? (
                      <Image src={photoPreview} alt="Preview" width={128} height={128} className="object-cover rounded-full h-32 w-32" data-ai-hint="person face" />
                    ) : (
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <UploadCloud className="w-8 h-8 mb-4 text-muted-foreground" />
                        <p className="mb-2 text-sm text-muted-foreground"><span className="font-semibold">Click to upload</span></p>
                        <p className="text-xs text-muted-foreground">PNG, JPG (MAX. {MAX_FILE_SIZE_MB}MB)</p>
                      </div>
                    )}
                    <Input id="dropzone-file" type="file" className="hidden"
                      accept="image/png, image/jpeg"
                      onChange={(e) => {
                        field.onChange(e.target.files);
                        handlePhotoChange(e);
                      }}
                      disabled={isSubmitting}
                    />
                  </label>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="Your Name" {...field} disabled={isSubmitting} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="twitter"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Twitter URL</FormLabel>
              <FormControl>
                <Input placeholder="https://twitter.com/yourhandle" {...field} disabled={isSubmitting} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="github"
          render={({ field }) => (
            <FormItem>
              <FormLabel>GitHub URL</FormLabel>
              <FormControl>
                <Input placeholder="https://github.com/yourhandle" {...field} disabled={isSubmitting} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="linkedin"
          render={({ field }) => (
            <FormItem>
              <FormLabel>LinkedIn URL</FormLabel>
              <FormControl>
                <Input placeholder="https://linkedin.com/in/yourhandle" {...field} disabled={isSubmitting} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <Button type="submit" disabled={isSubmitting || !user} className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isSubmitting ? 'Saving Changes...' : 'Save Changes'}
        </Button>
      </form>
    </Form>
  );
}
