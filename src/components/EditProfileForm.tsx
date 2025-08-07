
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
import { getAuth, onAuthStateChanged, User as AuthUser } from 'firebase/auth';
import { app } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { getUser } from '@/lib/firebase/firestore';
import { Separator } from './ui/separator';

const MAX_FILE_SIZE_MB = 1;

const formSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  photo: z.any().optional(),
  instagram: z.string().url({ message: 'Please enter a valid URL.' }).optional().or(z.literal('')),
  customPlatform: z.string().optional(),
  customUrl: z.string().url({ message: 'Please enter a valid URL.' }).optional().or(z.literal('')),
}).refine(data => (data.customPlatform && data.customUrl) || (!data.customPlatform && !data.customUrl), {
    message: "Both custom platform name and URL must be provided.",
    path: ["customPlatform"],
});

type FormValues = z.infer<typeof formSchema>;

export function EditProfileForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [isFormReady, setIsFormReady] = useState(false);

  const { toast } = useToast();
  const router = useRouter();
  const auth = getAuth(app);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      instagram: '',
      customPlatform: '',
      customUrl: '',
    },
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        const userProfile = await getUser(currentUser.uid);
        if (userProfile) {
          form.reset({
            name: userProfile.name,
            instagram: userProfile.socials?.instagram || '',
            customPlatform: userProfile.socials?.custom?.platform || '',
            customUrl: userProfile.socials?.custom?.url || '',
          });
          setPhotoPreview(userProfile.imageUrl);
          setIsFormReady(true);
        } else {
            router.push('/');
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
      if(file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
          form.setError('photo', { message: `Max file size is ${MAX_FILE_SIZE_MB}MB.` });
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
        imageUrl: photoPreview,
        socials: {
          instagram: values.instagram,
          custom: {
            platform: values.customPlatform || '',
            url: values.customUrl || '',
          },
        },
      });

      if (result.success) {
        toast({
          title: 'Profile Updated!',
          description: 'Your profile has been successfully updated.',
        });
        router.push(`/profile/${user.uid}`);
        router.refresh();
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
        
        <Separator />
        
        <h3 className="text-lg font-medium">Social Links</h3>

        <FormField
          control={form.control}
          name="instagram"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Instagram URL</FormLabel>
              <FormControl>
                <Input placeholder="https://instagram.com/yourhandle" {...field} disabled={isSubmitting} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div>
            <FormLabel>Custom Social Link</FormLabel>
            <FormDescription className="pb-2">
                Add one more link to any other social profile.
            </FormDescription>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="customPlatform"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs text-muted-foreground">Platform Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Facebook" {...field} disabled={isSubmitting} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="customUrl"
                  render={({ field }) => (
                    <FormItem>
                       <FormLabel className="text-xs text-muted-foreground">URL</FormLabel>
                      <FormControl>
                        <Input placeholder="https://facebook.com/yourhandle" {...field} disabled={isSubmitting} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
            </div>
        </div>
        
        <Button type="submit" disabled={isSubmitting || !isFormReady || !form.formState.isDirty} className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isSubmitting ? 'Saving Changes...' : 'Save Changes'}
        </Button>
      </form>
    </Form>
  );
}
