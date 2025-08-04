'use client';

import { useState } from 'react';
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
import { Loader2, UploadCloud, MapPin, LocateFixed } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

const formSchema = z.object({
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
  locationDescription: z.string().min(10, {
    message: 'Location description must be at least 10 characters.',
  }).max(200, {
    message: 'Location description cannot exceed 200 characters.',
  }),
  lat: z.coerce.number().min(-90, 'Invalid latitude').max(90, 'Invalid latitude'),
  lng: z.coerce.number().min(-180, 'Invalid longitude').max(180, 'Invalid longitude'),
});

type FormValues = z.infer<typeof formSchema>;

const fileToDataUri = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export function SubmitCatForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [duplicateCheckResult, setDuplicateCheckResult] = useState<{isDuplicate: boolean; duplicateExplanation: string} | null>(null);
  const [isDuplicateDialogOpen, setIsDuplicateDialogOpen] = useState(false);
  
  const { toast } = useToast();
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      catDescription: '',
      locationDescription: '',
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

  const handleGetCurrentLocation = () => {
    setIsGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        form.setValue('lat', parseFloat(latitude.toFixed(6)));
        form.setValue('lng', parseFloat(longitude.toFixed(6)));
        toast({
          title: 'Location Fetched',
          description: 'Your current location has been filled in.',
        });
        setIsGettingLocation(false);
      },
      (error) => {
        console.error("Geolocation error:", error);
        toast({
          variant: "destructive",
          title: 'Location Error',
          description: 'Could not get your location. Please enter it manually.',
        });
        setIsGettingLocation(false);
      },
      {
        enableHighAccuracy: true,
      }
    );
  };

  const processSubmit = async (values: FormValues, force: boolean = false) => {
    setIsSubmitting(true);
    try {
      const photoDataUri = await fileToDataUri(values.photo[0]);
      // In a real app, you would pass lat/lng to handleSubmitCat
      const result = await handleSubmitCat({
        photoDataUri,
        catDescription: values.catDescription,
        locationDescription: `${values.locationDescription} (at ${values.lat}, ${values.lng})`,
      }, force);

      if (result.isDuplicate && !force) {
        setDuplicateCheckResult(result);
        setIsDuplicateDialogOpen(true);
      } else if (result.success) {
        toast({
          title: 'Submission Successful!',
          description: 'Thank you for helping a cat in need. Your listing is now live.',
        });
        form.reset();
        setPhotoPreview(null);
      } else if (result.error) {
         toast({ variant: "destructive", title: 'Submission Failed', description: result.error });
      }
    } catch (error) {
      toast({ variant: "destructive", title: 'An error occurred', description: 'Could not submit the form. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  }

  const onSubmit = async (values: FormValues) => {
    await processSubmit(values, false);
  };
  
  const handleForceSubmit = async () => {
    setIsDuplicateDialogOpen(false);
    const values = form.getValues();
    await processSubmit(values, true);
  };

  return (
    <>
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
                                <Image src={photoPreview} alt="Preview" width={200} height={200} className="object-contain h-full p-4" />
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
                <FormDescription>A clear photo helps immensely in identifying the cat.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="catDescription"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cat Description</FormLabel>
                <FormControl>
                  <Textarea placeholder="e.g., Small ginger tabby, very friendly, has a blue collar but no tag." {...field} rows={4} />
                </FormControl>
                <FormDescription>Describe the cat's appearance, behavior, and any distinguishing features.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="locationDescription"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Location Description</FormLabel>
                <FormControl>
                  <Textarea placeholder="e.g., Found near the playground at Central Park, around 5 PM." {...field} rows={2} />
                </FormControl>
                <FormDescription>Be as specific as possible about where and when you found the cat.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="space-y-4">
            <div className="flex justify-between items-center">
                <FormLabel>Found Location Coordinates</FormLabel>
                 <Button type="button" variant="outline" size="sm" onClick={handleGetCurrentLocation} disabled={isGettingLocation}>
                    {isGettingLocation ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <LocateFixed className="mr-2 h-4 w-4" />}
                    Use My Location
                </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                  control={form.control}
                  name="lat"
                  render={({ field }) => (
                  <FormItem>
                      <FormLabel>Latitude</FormLabel>
                      <FormControl>
                      <div className="relative">
                          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input type="number" placeholder="e.g., 34.0522" {...field} className="pl-10" />
                      </div>
                      </FormControl>
                      <FormMessage />
                  </FormItem>
                  )}
              />
              <FormField
                  control={form.control}
                  name="lng"
                  render={({ field }) => (
                  <FormItem>
                      <FormLabel>Longitude</FormLabel>
                      <FormControl>
                      <div className="relative">
                          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input type="number" placeholder="e.g., -118.2437" {...field} className="pl-10" />
                      </div>
                      </FormControl>
                      <FormMessage />
                  </FormItem>
                  )}
              />
            </div>
            <FormDescription>
                You can get coordinates from Google Maps, or use your current location.
            </FormDescription>
          </div>

          <Button type="submit" disabled={isSubmitting} className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">
            {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Check for Duplicates & Submit
          </Button>
        </form>
      </Form>
      
      <AlertDialog open={isDuplicateDialogOpen} onOpenChange={setIsDuplicateDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Potential Duplicate Found</AlertDialogTitle>
            <AlertDialogDescription>
              Our AI check suggests this might be a duplicate of an existing listing:
              <blockquote className="mt-2 p-4 bg-muted rounded-lg border-l-4 border-accent">
                {duplicateCheckResult?.duplicateExplanation}
              </blockquote>
              Are you sure you want to create a new post?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSubmitting}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleForceSubmit} disabled={isSubmitting} className="bg-accent hover:bg-accent/90 text-accent-foreground">
              {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Post Anyway
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
