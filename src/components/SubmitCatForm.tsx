
'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { handleSubmitCat } from '@/app/submit-cat/actions';
import Image from 'next/image';
import { Loader2, UploadCloud, MapPin, CheckCircle } from 'lucide-react';
import { getAuth, onAuthStateChanged, User } from 'firebase/auth';
import { app } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const formSchema = z.object({
  name: z.string().optional(),
  photo: z.any().refine(
    (files) => files?.length > 0, 'A photo of the cat is required.'
  ).refine(
    (files) => files?.[0]?.size <= 5_000_000, `Max file size is 5MB.`
  ).refine(
    (files) => ["image/jpeg", "image/png", "image/webp"].includes(files?.[0]?.type),
    "Only .jpg, .png and .webp formats are supported."
  ),
  catDescription: z.string().min(20, {
    message: 'Description must be at least 20 characters.',
  }).max(500, {
    message: 'Description cannot exceed 500 characters.',
  }),
  location: z.string().min(1, { message: "Location is required."}),
});

type FormValues = z.infer<typeof formSchema>;


export function SubmitCatForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [isFetchingLocation, setIsFetchingLocation] = useState(false);

  const { toast } = useToast();
  const router = useRouter();
  const auth = getAuth(app);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
      } else {
        router.push('/login');
         toast({
          variant: "destructive",
          title: 'Unauthorized',
          description: "Please log in to list a stray cat.",
        });
      }
      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, [auth, router, toast]);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      catDescription: '',
      location: '',
      name: '',
    },
  });
  
  const handlePhotoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGetLocation = () => {
    setIsFetchingLocation(true);
    setLocationError(null);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        form.setValue('location', `${latitude},${longitude}`, { shouldValidate: true });
        setIsFetchingLocation(false);
        toast({
            title: 'Location Captured!',
            description: 'Your current location has been successfully recorded.',
        })
      },
      (error) => {
        setLocationError(`Error: ${error.message}. Please enable location permissions in your browser or enter the location manually.`);
        setIsFetchingLocation(false);
      }
    );
  };

  const onSubmit = async (values: FormValues) => {
    if (!user) {
       toast({ variant: "destructive", title: 'Submission Failed', description: "You must be logged in to submit." });
       return;
    }

    setIsSubmitting(true);
    try {
      // In a real app, you would upload the image to Firebase Storage first
      // and get a URL. For now, we'll use a placeholder.
      const result = await handleSubmitCat({
        catDescription: values.catDescription,
        location: values.location,
        name: values.name,
        imageUrl: "https://placehold.co/600x400.png", // Placeholder
        listerId: user.uid,
      });

      if (result.success) {
        toast({
          title: 'Submission Successful!',
          description: 'Thank you for helping a stray cat. Your listing is now live.',
        });
        form.reset();
        setPhotoPreview(null);
        router.push('/');
      } else if (result.error) {
         toast({ variant: "destructive", title: 'Submission Failed', description: result.error });
      }
    } catch (error) {
      toast({ variant: "destructive", title: 'An error occurred', description: 'Could not submit the form. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  }
  
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
                <FormLabel>Cat Photo</FormLabel>
                <FormControl>
                    <div className="flex items-center justify-center w-full">
                        <label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer bg-card hover:bg-muted/50 transition-colors">
                            {photoPreview ? (
                                <Image src={photoPreview} alt="Preview" width={200} height={200} className="object-contain h-full p-4" data-ai-hint="cat" />
                            ) : (
                                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                    <UploadCloud className="w-8 h-8 mb-4 text-muted-foreground" />
                                    <p className="mb-2 text-sm text-muted-foreground"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                                    <p className="text-xs text-muted-foreground">PNG, JPG or WEBP (MAX. 5MB)</p>
                                </div>
                            )}
                             <Input id="dropzone-file" type="file" className="hidden" 
                                onChange={(e) => {
                                  field.onChange(e.target.files);
                                  handlePhotoChange(e);
                                }}
                                onBlur={field.onBlur}
                                name={field.name}
                                ref={field.ref}
                             />
                        </label>
                    </div>
                </FormControl>
                <FormDescription>A clear photo helps immensely in identifying the stray cat.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

           <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cat's Name (Optional)</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., Mittens" {...field} />
                </FormControl>
                <FormDescription>If you've given the stray cat a temporary name, enter it here.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="catDescription"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea placeholder="e.g., Small ginger tabby, very friendly, found near the park entrance." {...field} rows={4} />
                </FormControl>
                <FormDescription>Describe the cat's appearance, behavior, and any distinguishing features.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="location"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Location Found</FormLabel>
                <FormDescription>Click the button to automatically record the location where you found the cat.</FormDescription>
                <FormControl>
                    <Button type="button" variant="outline" className="w-full" onClick={handleGetLocation} disabled={isFetchingLocation}>
                        {isFetchingLocation ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                            <MapPin className="mr-2 h-4 w-4" />
                        )}
                        Get Current Location
                    </Button>
                </FormControl>
                {field.value && !isFetchingLocation && (
                    <div className="flex items-center p-3 text-sm text-emerald-600 bg-emerald-50 rounded-md">
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Location captured: {field.value}
                    </div>
                )}
                {locationError && (
                    <Alert variant="destructive" className="mt-2">
                        <AlertDescription>{locationError}</AlertDescription>
                    </Alert>
                )}
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" disabled={isSubmitting || !user} className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">
            {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Submit Cat Listing
          </Button>
        </form>
      </Form>
  );
}
