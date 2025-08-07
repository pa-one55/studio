
'use client';

import { useEffect, useState } from 'react';
import { getAuth, onAuthStateChanged, User as AuthUser } from 'firebase/auth';
import { app } from '@/lib/firebase';
import { getUser, getCatsByUser, getFriends } from '@/lib/firebase/firestore';
import type { User, Cat } from '@/lib/types';
import { notFound, useRouter } from 'next/navigation';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { CatCard } from '@/components/CatCard';
import { Instagram, Link as LinkIcon, UserPlus, Check, Loader2, Users, Edit } from 'lucide-react';
import { addFriend, removeFriend } from '../actions';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';


export default function UserProfilePage({ params }: { params: { userId: string } }) {
  const [user, setUser] = useState<User | null>(null);
  const [userCats, setUserCats] = useState<Cat[]>([]);
  const [friends, setFriends] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [isFriend, setIsFriend] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdatingFriend, setIsUpdatingFriend] = useState(false);
  
  const [userId, setUserId] = useState('');

  const auth = getAuth(app);
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    Promise.resolve(params).then(p => {
      setUserId(p.userId);
    });
  }, [params]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, [auth]);

  useEffect(() => {
    async function fetchData() {
      if (!userId) return;
      
      setIsLoading(true);
      try {
        const userProfile = await getUser(userId);
        if (!userProfile) {
          notFound();
          return;
        }
        setUser(userProfile);
        
        const [cats, friendList] = await Promise.all([
          getCatsByUser(userId),
          getFriends(userProfile.friends || [])
        ]);

        setUserCats(cats);
        setFriends(friendList);

        if (currentUser) {
          const currentUserProfile = await getUser(currentUser.uid);
          setIsFriend(currentUserProfile?.friends?.includes(userId) ?? false);
        }
      } catch (error) {
        console.error("Failed to fetch user data:", error);
        toast({ variant: 'destructive', title: 'Error', description: 'Failed to load profile data.' });
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchData();
  }, [userId, currentUser, toast]);

  const handleFriendAction = async () => {
    if (!currentUser) {
      toast({ variant: 'destructive', title: 'You must be logged in.' });
      router.push('/login');
      return;
    }
    setIsUpdatingFriend(true);
    try {
      if (isFriend) {
        await removeFriend(currentUser.uid, userId);
        toast({ title: 'Friend Removed' });
        setIsFriend(false);
      } else {
        await addFriend(currentUser.uid, userId);
        toast({ title: 'Friend Added!' });
        setIsFriend(true);
      }
       const userProfile = await getUser(userId);
       if(userProfile) {
         const friendList = await getFriends(userProfile.friends || []);
         setFriends(friendList);
       }
    } catch (error) {
      toast({ variant: 'destructive', title: 'Something went wrong.', description: 'Could not update friend list.' });
      setIsFriend(!isFriend);
    } finally {
      setIsUpdatingFriend(false);
    }
  };

  if (isLoading) {
    return (
        <div className="flex items-center justify-center min-h-[calc(100vh-12rem)]">
            <Loader2 className="h-16 w-16 animate-spin text-primary" />
        </div>
    );
  }

  if (!user) {
    return notFound();
  }

  const isOwnProfile = currentUser?.uid === user.id;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 flex flex-col gap-8">
          <Card>
            <CardHeader className="items-center text-center">
              <div className="relative w-32 h-32">
                <Image
                  src={user.imageUrl || 'https://placehold.co/128x128.png'}
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
                {user.socials?.instagram && (
                  <Button asChild variant="outline" size="icon">
                    <Link href={user.socials.instagram} target="_blank" rel="noopener noreferrer">
                      <Instagram />
                      <span className="sr-only">Instagram</span>
                    </Link>
                  </Button>
                )}
                {user.socials?.custom?.url && (
                  <Button asChild variant="outline" size="icon">
                    <Link href={user.socials.custom.url} target="_blank" rel="noopener noreferrer" title={user.socials.custom.platform}>
                      <LinkIcon />
                      <span className="sr-only">{user.socials.custom.platform}</span>
                    </Link>
                  </Button>
                )}
              </div>
              {isOwnProfile && (
                <Button asChild variant="outline">
                  <Link href="/profile/edit">
                    <Edit className="mr-2" /> Edit Profile
                  </Link>
                </Button>
              )}
              {!isOwnProfile && currentUser && (
                <Button onClick={handleFriendAction} disabled={isUpdatingFriend} variant={isFriend ? 'secondary' : 'default'}>
                  {isUpdatingFriend ? (
                    <Loader2 className="mr-2 animate-spin" />
                  ) : isFriend ? (
                    <>
                      <Check className="mr-2" /> Friends
                    </>
                  ) : (
                    <>
                      <UserPlus className="mr-2" /> Add Friend
                    </>
                  )}
                </Button>
              )}
            </CardContent>
          </Card>
           
          {friends.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 font-headline">
                  <Users />
                  Friends
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-4 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {friends.map(friend => (
                    <Link key={friend.id} href={`/profile/${friend.id}`} title={friend.name}>
                       <Avatar>
                          <AvatarImage src={friend.imageUrl} alt={friend.name} />
                          <AvatarFallback>{friend.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

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
