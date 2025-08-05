import { CatCard } from '@/components/CatCard';
import { CatFilters } from '@/components/CatFilters';
import { getAllCats } from '@/lib/firebase/firestore';
import type { Cat } from '@/lib/types';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { PlusCircle } from 'lucide-react';
import { Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

async function CatList() {
  const cats: Cat[] = await getAllCats();

  return (
    <>
      {cats.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {cats.map((cat) => (
            <CatCard key={cat.id} cat={cat} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 border-2 border-dashed rounded-lg">
          <p className="text-muted-foreground">No cats found matching your criteria.</p>
          <p className="text-sm text-muted-foreground mt-2">Try adjusting your filters or checking back later.</p>
        </div>
      )}
    </>
  );
}

function CatListSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {[...Array(8)].map((_, i) => (
        <div key={i} className="flex flex-col space-y-3">
          <Skeleton className="h-[225px] w-full rounded-xl" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-[250px]" />
            <Skeleton className="h-4 w-[200px]" />
          </div>
        </div>
      ))}
    </div>
  )
}


export default function Home() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-4xl font-headline font-bold text-primary">Found Cats Near You</h1>
          <p className="text-muted-foreground mt-2">Browse cats that have been recently found in your area.</p>
        </div>
        <Button asChild className="bg-accent hover:bg-accent/90 text-accent-foreground">
          <Link href="/submit-cat">
            <PlusCircle className="mr-2 h-5 w-5" />
            List a cat
          </Link>
        </Button>
      </div>

      <div className="mb-8">
        <CatFilters />
      </div>

      <Suspense fallback={<CatListSkeleton />}>
        <CatList />
      </Suspense>
    </div>
  );
}
