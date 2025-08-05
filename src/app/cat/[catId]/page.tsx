
import { getCat, getUser } from '@/lib/firebase/firestore';
import type { Cat, User } from '@/lib/types';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { MapPin, ExternalLink, Calendar, User as UserIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { format } from 'date-fns';

export default async function CatProfilePage({ params }: { params: { catId: string } }) {
  const cat: Cat | null = await getCat(params.catId);

  if (!cat) {
    notFound();
  }
  
  const lister: User | null = await getUser(cat.listerId);
  const googleMapsUrl = `https://www.google.com/maps?q=${cat.location}`;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
        <div className="aspect-video md:aspect-square">
          <Image
            src={cat.imageUrl}
            alt={cat.name || 'Found cat'}
            width={800}
            height={800}
            className="rounded-lg object-cover w-full h-full shadow-lg"
            data-ai-hint="cat"
          />
        </div>
        
        <div>
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                  <div>
                    <h1 className="text-4xl font-bold font-headline text-primary">{cat.name || 'Unnamed Cat'}</h1>
                  </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                    <h2 className="text-lg font-semibold mb-2 font-headline">Details</h2>
                     <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <div>
                                <p className="font-semibold">Listed On</p>
                                <p className="text-muted-foreground">{format(new Date(cat.listedDate), "PPP")}</p>
                            </div>
                        </div>
                        {lister && (
                          <div className="flex items-center gap-2">
                              <UserIcon className="h-4 w-4 text-muted-foreground" />
                              <div>
                                  <p className="font-semibold">Listed By</p>
                                  <Link href={`/profile/${lister.id}`} className="text-muted-foreground hover:text-primary underline">
                                      {lister.name}
                                  </Link>
                              </div>
                          </div>
                        )}
                    </div>
                </div>

                <div>
                    <h2 className="text-lg font-semibold mb-2 font-headline">Description</h2>
                    <p className="text-muted-foreground">{cat.description}</p>
                </div>

                <div>
                     <h2 className="text-lg font-semibold mb-2 font-headline">Last Known Location</h2>
                      <Button asChild className="w-full">
                        <a href={googleMapsUrl} target="_blank" rel="noopener noreferrer">
                            <MapPin className="mr-2" /> View on Google Maps
                        </a>
                      </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
