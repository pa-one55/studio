import { MOCK_USERS, MOCK_CATS } from '@/lib/data';
import type { User, Cat } from '@/lib/types';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { CatCard } from '@/components/CatCard';
import { Twitter, Github, Linkedin, UserPlus } from 'lucide-react';

export function generateStaticParams() {
  return MOCK_USERS.map((user) => ({
    userId: user.id,
  }));
}

export default function UserProfilePage({ params }: { params: { userId: string } }) {
  const user: User | undefined = MOCK_USERS.find((u) => u.id === params.userId);

  if (!user) {
    notFound();
  }

  const userCats: Cat[] = MOCK_CATS.filter((cat) => cat.listerId === user.id);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <Card>
            <CardHeader className="items-center text-center">
              <div className="relative w-32 h-32">
                 <Image
                    src={user.imageUrl}
                    alt={user.name}
                    width={128}
                    height={128}
                    className="rounded-full object-cover shadow-lg"
                    data-ai-hint="person face"
                />
              </div>
              <CardTitle className="text-2xl font-bold font-headline mt-4">{user.name}</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
               <div className="flex justify-center gap-2">
                {user.socials.twitter && (
                    <Button asChild variant="outline" size="icon">
                        <Link href={user.socials.twitter} target="_blank" rel="noopener noreferrer">
                            <Twitter />
                            <span className="sr-only">Twitter</span>
                        </Link>
                    </Button>
                )}
                {user.socials.github && (
                    <Button asChild variant="outline" size="icon">
                        <Link href={user.socials.github} target="_blank" rel="noopener noreferrer">
                            <Github />
                            <span className="sr-only">GitHub</span>
                        </Link>
                    </Button>
                )}
                {user.socials.linkedin && (
                    <Button asChild variant="outline" size="icon">
                        <Link href={user.socials.linkedin} target="_blank" rel="noopener noreferrer">
                            <Linkedin />
                            <span className="sr-only">LinkedIn</span>
                        </Link>
                    </Button>
                )}
               </div>
                <Button className="w-full">
                    <UserPlus className="mr-2" />
                    Add as Friend
                </Button>
            </CardContent>
          </Card>
        </div>
        <div className="lg:col-span-2">
          <h2 className="text-3xl font-bold font-headline mb-6 text-primary">{user.name}'s Listings</h2>
            {userCats.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {userCats.map((cat) => (
                        <CatCard key={cat.id} cat={cat} />
                    ))}
                </div>
            ) : (
                <div className="text-center py-16 border-2 border-dashed rounded-lg">
                    <p className="text-muted-foreground">{user.name} hasn't listed any cats yet.</p>
                </div>
            )}
        </div>
      </div>
    </div>
  );
}
