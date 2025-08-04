import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin } from 'lucide-react';
import type { Cat } from '@/lib/types';

interface CatCardProps {
  cat: Cat;
}

export function CatCard({ cat }: CatCardProps) {
  return (
    <Card className="flex flex-col h-full overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
      <CardHeader className="p-0">
        <Link href={`/${cat.id}`} className="block">
          <div className="aspect-video overflow-hidden">
            <Image
              src={cat.imageUrl}
              alt={cat.name || 'Found cat'}
              width={600}
              height={400}
              className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
              data-ai-hint="cat"
            />
          </div>
        </Link>
      </CardHeader>
      <CardContent className="p-4 flex-grow">
        <CardTitle className="text-xl font-headline mb-2">
            <Link href={`/${cat.id}`} className="hover:text-primary transition-colors">{cat.name || 'Unnamed Cat'}</Link>
        </CardTitle>
        <p className="text-sm text-muted-foreground line-clamp-3">{cat.description}</p>
      </CardContent>
      <CardFooter className="p-4 pt-0 flex flex-col items-start gap-4">
        <div className="flex items-center text-sm text-muted-foreground">
          <MapPin className="h-4 w-4 mr-2 shrink-0" />
          <span>{cat.location}</span>
        </div>
        <Button asChild className="w-full" variant="outline">
          <Link href={`/${cat.id}`}>View Details</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
